import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
    try {
        const versionPath = path.join(process.cwd(), 'public', 'version.json');

        if (!fs.existsSync(versionPath)) {
            return NextResponse.json({ error: 'Version file not found' }, { status: 404 });
        }

        const versionData = fs.readFileSync(versionPath, 'utf-8');
        const version = JSON.parse(versionData);

        return NextResponse.json(version);
    } catch (error) {
        console.error('Error reading version:', error);
        return NextResponse.json({ error: 'Failed to read version' }, { status: 500 });
    }
}
