import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { SESSION_COOKIE, createSession, hashPin, isValidSession, verifyPin } from '@/lib/auth';

const PIN_KEY = 'auth.pin';
const LOCK_KEY = 'auth.failures';
const MAX_ATTEMPTS = 5;
const LOCK_MS = 15 * 60 * 1000;

// El PIN vive hasheado en la tabla settings. En el primer arranque se siembra
// desde APP_PIN (o 0001) para no dejar la app inaccesible tras el despliegue.
async function storedPinHash(): Promise<string> {
    const row = await prisma.setting.findUnique({ where: { key: PIN_KEY } });
    if (row) return row.value;
    const hash = await hashPin(process.env.APP_PIN || '0001');
    await prisma.setting.upsert({
        where: { key: PIN_KEY },
        create: { key: PIN_KEY, value: hash },
        update: {},
    });
    return hash;
}

async function lockState(): Promise<{ count: number; until: number }> {
    const row = await prisma.setting.findUnique({ where: { key: LOCK_KEY } });
    if (!row) return { count: 0, until: 0 };
    try {
        const parsed = JSON.parse(row.value);
        return { count: Number(parsed.count) || 0, until: Number(parsed.until) || 0 };
    } catch {
        return { count: 0, until: 0 };
    }
}

async function writeLockState(count: number, until: number): Promise<void> {
    const value = JSON.stringify({ count, until });
    await prisma.setting.upsert({
        where: { key: LOCK_KEY },
        create: { key: LOCK_KEY, value },
        update: { value },
    });
}

function authorized(request: NextRequest): Promise<boolean> {
    return isValidSession(request.cookies.get(SESSION_COOKIE)?.value);
}

// ¿Hay sesión válida? Lo consulta la app al arrancar.
export async function GET(request: NextRequest) {
    return NextResponse.json({ authenticated: await authorized(request) });
}

// Entrar.
export async function POST(request: NextRequest) {
    try {
        const body = await request.json().catch(() => ({}));
        const pin = body?.pin;
        if (typeof pin !== 'string' || !/^\d{4}$/.test(pin)) {
            return NextResponse.json({ error: 'El PIN debe tener 4 dígitos' }, { status: 400 });
        }

        const lock = await lockState();
        if (lock.until > Date.now()) {
            const minutes = Math.ceil((lock.until - Date.now()) / 60_000);
            return NextResponse.json(
                { error: `Demasiados intentos. Prueba de nuevo en ${minutes} min.` },
                { status: 429 },
            );
        }

        if (!(await verifyPin(pin, await storedPinHash()))) {
            const count = lock.count + 1;
            await writeLockState(count >= MAX_ATTEMPTS ? 0 : count, count >= MAX_ATTEMPTS ? Date.now() + LOCK_MS : 0);
            return NextResponse.json({ error: 'PIN incorrecto' }, { status: 401 });
        }

        await writeLockState(0, 0);
        const session = await createSession();
        const response = NextResponse.json({ ok: true });
        response.cookies.set(SESSION_COOKIE, session.value, {
            httpOnly: true,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
            path: '/',
            maxAge: session.maxAge,
        });
        return response;
    } catch (error) {
        console.error('Auth POST failed:', error);
        return NextResponse.json({ error: 'No se pudo iniciar sesión' }, { status: 500 });
    }
}

// Cambiar el PIN. Exige el actual aunque ya haya sesión.
export async function PUT(request: NextRequest) {
    try {
        if (!(await authorized(request))) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }
        const body = await request.json().catch(() => ({}));
        const { currentPin, newPin } = body ?? {};
        if (typeof newPin !== 'string' || !/^\d{4}$/.test(newPin)) {
            return NextResponse.json({ error: 'El PIN nuevo debe tener 4 dígitos' }, { status: 400 });
        }
        if (!(await verifyPin(String(currentPin ?? ''), await storedPinHash()))) {
            return NextResponse.json({ error: 'El PIN actual no es correcto' }, { status: 401 });
        }
        const hash = await hashPin(newPin);
        await prisma.setting.update({ where: { key: PIN_KEY }, data: { value: hash } });
        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error('Auth PUT failed:', error);
        return NextResponse.json({ error: 'No se pudo cambiar el PIN' }, { status: 500 });
    }
}

// Salir.
export async function DELETE() {
    const response = NextResponse.json({ ok: true });
    response.cookies.set(SESSION_COOKIE, '', { httpOnly: true, path: '/', maxAge: 0 });
    return response;
}
