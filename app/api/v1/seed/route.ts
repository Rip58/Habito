import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
    try {
        const catCount = await prisma.category.count();
        if (catCount === 0) {
            await prisma.category.createMany({
                data: [
                    { name: 'Programación Diaria', target: '3 horas', enabled: true, color: '#10b981' },
                    { name: 'Ejercicio', target: '45 min', enabled: true, color: '#f59e0b' },
                    { name: 'Lectura', target: '1 sesión', enabled: true, color: '#6366f1' },
                ],
            });
            return NextResponse.json({ seeded: true, count: 3 }, { status: 201 });
        }
        return NextResponse.json({ seeded: false, message: 'Categories already exist' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
