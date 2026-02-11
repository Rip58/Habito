import type { VercelRequest, VercelResponse } from '@vercel/node';
import fs from 'fs';
import path from 'path';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // In production (Vercel), read from the deployed public directory
        // In development, read from the local public directory
        const versionPath = path.join(process.cwd(), 'public', 'version.json');

        if (!fs.existsSync(versionPath)) {
            return res.status(404).json({ error: 'Version file not found' });
        }

        const versionData = fs.readFileSync(versionPath, 'utf-8');
        const version = JSON.parse(versionData);

        res.status(200).json(version);
    } catch (error) {
        console.error('Error reading version:', error);
        res.status(500).json({ error: 'Failed to read version' });
    }
}
