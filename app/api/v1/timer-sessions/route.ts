import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const categoryId = searchParams.get('categoryId');

        let where: any = {};
        if (categoryId && categoryId !== 'all') {
            where.categoryId = categoryId;
        }

        const sessions = await prisma.timerSession.findMany({
            where,
            orderBy: { startedAt: 'desc' },
        });

        return NextResponse.json(sessions);
    } catch (error: any) {
        console.error('Failed to fetch timer sessions:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { categoryId, category, startedAt, endedAt, durationSec, note } = body;

        let finalCategoryId = categoryId;

        // Ensure we have a valid category ID if possible
        if (!finalCategoryId && category) {
            const cat = await prisma.category.findUnique({ where: { name: category } });
            if (cat) finalCategoryId = cat.id;
        }

        const session = await prisma.timerSession.create({
            data: {
                categoryId: finalCategoryId || 'unknown',
                category: category || 'General',
                startedAt: new Date(startedAt),
                endedAt: new Date(endedAt),
                durationSec,
                note,
            },
        });

        return NextResponse.json(session, { status: 201 });
    } catch (error: any) {
        console.error('Failed to create timer session:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, ...data } = body;

        if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

        if (data.startedAt) data.startedAt = new Date(data.startedAt);
        if (data.endedAt) data.endedAt = new Date(data.endedAt);

        const session = await prisma.timerSession.update({
            where: { id: String(id) },
            data,
        });

        return NextResponse.json(session);
    } catch (error: any) {
        console.error('Failed to update timer session:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

        await prisma.timerSession.delete({
            where: { id: String(id) },
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Failed to delete timer session:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
