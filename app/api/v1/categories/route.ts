import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        const categories = await prisma.category.findMany({
            orderBy: { name: 'asc' },
        });
        return NextResponse.json(categories);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, target, enabled, color } = body;
        const category = await prisma.category.create({
            data: { name, target, enabled: enabled ?? true, color },
        });
        return NextResponse.json(category, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, ...data } = body;
        if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

        // Get current category to check for name change
        const currentCategory = await prisma.category.findUnique({
            where: { id: String(id) },
        });

        if (!currentCategory) {
            return NextResponse.json({ error: 'Category not found' }, { status: 404 });
        }

        const category = await prisma.category.update({
            where: { id: String(id) },
            data,
        });

        // If name changed, update all associated logs
        if (data.name && data.name !== currentCategory.name) {
            await prisma.log.updateMany({
                where: { category: currentCategory.name },
                data: { category: data.name },
            });
        }

        return NextResponse.json(category);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });
        await prisma.category.delete({
            where: { id: String(id) },
        });
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
