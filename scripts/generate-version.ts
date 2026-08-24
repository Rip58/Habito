import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Identificador único POR DESPLIEGUE.
//
// Antes era `base64(fecha ISO).substring(0, 12)`, que son los primeros 9 bytes
// de la cadena: "2026-08-2". Es decir, cambiaba una vez al día, no una vez por
// build — dos despliegues el mismo día compartían identificador y la
// comprobación de actualizaciones no detectaba nada.
function buildId(): string {
    const deployment = process.env.VERCEL_DEPLOYMENT_ID?.replace(/^dpl_/, '');
    if (deployment) return deployment.slice(0, 12);
    const sha = process.env.VERCEL_GIT_COMMIT_SHA;
    if (sha) return sha.slice(0, 12);
    return crypto.randomBytes(6).toString('hex');
}

const version = {
    buildId: buildId(),
    commit: (process.env.VERCEL_GIT_COMMIT_SHA ?? '').slice(0, 7),
    buildDate: new Date().toISOString(),
};

const target = path.join(__dirname, '..', 'public', 'version.json');
fs.mkdirSync(path.dirname(target), { recursive: true });
fs.writeFileSync(target, `${JSON.stringify(version, null, 2)}\n`);

console.log(`✅ version.json — build ${version.buildId}${version.commit ? ` · commit ${version.commit}` : ' · local'} · ${version.buildDate}`);
