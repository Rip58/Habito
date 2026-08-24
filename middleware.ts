import { NextResponse, type NextRequest } from 'next/server';
import { SESSION_COOKIE, isValidSession } from './lib/auth';

// Todo /api/v1/* exige sesión, salvo el propio endpoint de autenticación.
export async function middleware(request: NextRequest) {
    if (request.nextUrl.pathname.startsWith('/api/v1/auth')) {
        return NextResponse.next();
    }
    if (await isValidSession(request.cookies.get(SESSION_COOKIE)?.value)) {
        return NextResponse.next();
    }
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
}

export const config = {
    matcher: ['/api/v1/:path*'],
};
