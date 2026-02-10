import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../lib/prisma';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        switch (req.method) {
            case 'GET': {
                const { category } = req.query;
                const where = category && category !== 'all'
                    ? { category: String(category) }
                    : {};
                const logs = await prisma.log.findMany({
                    where,
                    orderBy: { dateObj: 'desc' },
                });
                return res.status(200).json(logs);
            }

            case 'POST': {
                const { timestamp, dateObj, eventName, category, intensity, status } = req.body;
                const log = await prisma.log.create({
                    data: {
                        timestamp,
                        dateObj: new Date(dateObj),
                        eventName,
                        category,
                        intensity: intensity || 1,
                        status: status || 'COMPLETED',
                    },
                });
                return res.status(201).json(log);
            }

            case 'PUT': {
                const { id, ...data } = req.body;
                if (!id) return res.status(400).json({ error: 'id is required' });
                if (data.dateObj) data.dateObj = new Date(data.dateObj);
                const log = await prisma.log.update({
                    where: { id: String(id) },
                    data,
                });
                return res.status(200).json(log);
            }

            case 'DELETE': {
                const { id } = req.query;
                if (!id) return res.status(400).json({ error: 'id is required' });
                await prisma.log.delete({
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
