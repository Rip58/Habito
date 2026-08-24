// Autenticación de servidor: hash del PIN + cookie de sesión firmada.
// Usa solo Web Crypto para que funcione igual en el middleware (Edge) y en
// los route handlers (Node).

const ITERATIONS = 100_000;
const SESSION_DAYS = 30;

export const SESSION_COOKIE = 'habito_session';

const enc = new TextEncoder();

function b64url(input: ArrayBuffer | Uint8Array): string {
    const bytes = input instanceof Uint8Array ? input : new Uint8Array(input);
    let bin = '';
    for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function unb64url(value: string): Uint8Array {
    const b64 = value.replace(/-/g, '+').replace(/_/g, '/');
    const bin = atob(b64 + '='.repeat((4 - (b64.length % 4)) % 4));
    return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

// Comparación en tiempo constante sobre cadenas de la misma longitud.
function safeEqual(a: string, b: string): boolean {
    if (a.length !== b.length) return false;
    let diff = 0;
    for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
    return diff === 0;
}

// AUTH_SECRET es lo correcto. Si no está, caemos a DATABASE_URL para no dejar
// la app inaccesible en un despliegue existente: también es un valor secreto y
// estable, aunque conviene definir AUTH_SECRET aparte.
function secretMaterial(): string {
    const value = process.env.AUTH_SECRET || process.env.DATABASE_URL;
    if (!value) throw new Error('Falta AUTH_SECRET (o DATABASE_URL) para firmar la sesión');
    return value;
}

// ── PIN ──────────────────────────────────────────────────────────

async function derive(pin: string, salt: Uint8Array): Promise<ArrayBuffer> {
    const key = await crypto.subtle.importKey('raw', enc.encode(pin), 'PBKDF2', false, ['deriveBits']);
    return crypto.subtle.deriveBits(
        { name: 'PBKDF2', salt: salt as unknown as BufferSource, iterations: ITERATIONS, hash: 'SHA-256' },
        key,
        256,
    );
}

export async function hashPin(pin: string): Promise<string> {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const bits = await derive(pin, salt);
    return `pbkdf2$${ITERATIONS}$${b64url(salt)}$${b64url(bits)}`;
}

export async function verifyPin(pin: string, stored: string): Promise<boolean> {
    const [scheme, iterations, salt, hash] = stored.split('$');
    if (scheme !== 'pbkdf2' || Number(iterations) !== ITERATIONS || !salt || !hash) return false;
    const bits = await derive(pin, unb64url(salt));
    return safeEqual(b64url(bits), hash);
}

// ── Sesión ───────────────────────────────────────────────────────

async function hmacKey(): Promise<CryptoKey> {
    return crypto.subtle.importKey(
        'raw',
        enc.encode(secretMaterial()),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign', 'verify'],
    );
}

export async function createSession(): Promise<{ value: string; maxAge: number }> {
    const expiresAt = Date.now() + SESSION_DAYS * 86_400_000;
    const signature = await crypto.subtle.sign('HMAC', await hmacKey(), enc.encode(String(expiresAt)));
    return { value: `${expiresAt}.${b64url(signature)}`, maxAge: SESSION_DAYS * 86_400 };
}

export async function isValidSession(value: string | undefined): Promise<boolean> {
    if (!value) return false;
    const [expiresAt, signature] = value.split('.');
    const expiry = Number(expiresAt);
    if (!Number.isFinite(expiry) || expiry <= Date.now() || !signature) return false;
    try {
        return await crypto.subtle.verify(
            'HMAC',
            await hmacKey(),
            unb64url(signature) as unknown as BufferSource,
            enc.encode(expiresAt),
        );
    } catch {
        return false;
    }
}
