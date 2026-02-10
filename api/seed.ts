import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../lib/prisma';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

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
            return res.status(201).json({ seeded: true, count: 3 });
        }
        return res.status(200).json({ seeded: false, message: 'Categories already exist' });
    } catch (error: any) {
        console.error('Seed Error:', error);
        return res.status(500).json({ error: error.message });
    }
}
