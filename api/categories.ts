import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../lib/prisma';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        switch (req.method) {
            case 'GET': {
                const categories = await prisma.category.findMany({
                    orderBy: { name: 'asc' },
                });
                return res.status(200).json(categories);
            }

            case 'POST': {
                const { name, target, enabled, color } = req.body;
                const category = await prisma.category.create({
                    data: { name, target, enabled: enabled ?? true, color },
                });
                return res.status(201).json(category);
            }

            case 'PUT': {
                const { id, ...data } = req.body;
                if (!id) return res.status(400).json({ error: 'id is required' });
                const category = await prisma.category.update({
                    where: { id: String(id) },
                    data,
                });
                return res.status(200).json(category);
            }

            case 'DELETE': {
                const { id } = req.query;
                if (!id) return res.status(400).json({ error: 'id is required' });
                await prisma.category.delete({
                    where: { id: String(id) },
                });
                return res.status(200).json({ success: true });
            }

            default:
                res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
                return res.status(405).end(`Method ${req.method} Not Allowed`);
        }
    } catch (error: any) {
        console.error('API Error:', error);
        return res.status(500).json({ error: error.message });
    }
}
