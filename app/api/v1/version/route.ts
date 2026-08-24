import { NextResponse } from 'next/server';
import version from '@/public/version.json';

// El valor se hornea en el bundle al compilar.
//
// Antes se leía del disco con readFileSync(process.cwd()/public/version.json).
// En serverless el directorio public/ se sube al CDN como estático y no viaja
// dentro de la función, así que esa lectura fallaba en producción.
export async function GET() {
    return NextResponse.json(version, {
        headers: { 'Cache-Control': 'no-store, max-age=0' },
    });
}
