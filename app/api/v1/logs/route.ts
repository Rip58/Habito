import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const categoryId = searchParams.get('categoryId');
        const category = searchParams.get('category'); // Fallback

        let where: any = {};
        if (categoryId && categoryId !== 'all') {
            where.categoryId = categoryId;
        } else if (category && category !== 'all') {
            where.category = category;
        }
        const logs = await prisma.log.findMany({
            where,
            orderBy: { dateObj: 'desc' },
        });
        return NextResponse.json(logs);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { timestamp, dateObj, eventName, category, categoryId, intensity, status } = body;

        // Ensure categoryId is provided if available, or lookup by name if not?
        // Let's assume frontend sends categoryId. If only name sent, we might need lookup but frontend should be updated.
        // For robustness, let's try to lookup categoryId if not provided but category name is.
        let finalCategoryId = categoryId;

        if (!finalCategoryId && category) {
            const cat = await prisma.category.findUnique({ where: { name: category } });
            if (cat) finalCategoryId = cat.id;
        }

        const log = await prisma.log.create({
            data: {
                timestamp,
                dateObj: new Date(dateObj),
                eventName,
                category,
                categoryId: finalCategoryId,
                intensity: intensity || 1,
                status: status || 'COMPLETED',
            },
        });
        return NextResponse.json(log, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, ...data } = body;
        if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });
        if (data.dateObj) data.dateObj = new Date(data.dateObj);

        // If updating category name but not ID, try to find ID
        if (data.category && !data.categoryId) {
            const cat = await prisma.category.findUnique({ where: { name: data.category } });
            if (cat) data.categoryId = cat.id;
        }

        const log = await prisma.log.update({
            where: { id: String(id) },
            data,
        });
        return NextResponse.json(log);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });
        await prisma.log.delete({
            where: { id: String(id) },
        });
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
