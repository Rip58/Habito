import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface VersionInfo {
    buildHash: string;
    buildDate: string;
    deployNumber: number;
}

function generateVersion(): VersionInfo {
    const now = new Date();

    // Generate a unique hash based on timestamp
    const buildHash = Buffer.from(now.toISOString()).toString('base64').substring(0, 12);

    // Format build date
    const buildDate = now.toISOString();

    // For deploy number, we'll use a simple counter
    // In production, Vercel will generate a new build each time
    const deployNumber = parseInt(process.env.VERCEL_DEPLOYMENT_ID?.substring(0, 8) || Date.now().toString().substring(0, 8), 16) % 10000;

    return {
        buildHash,
        buildDate,
        deployNumber
    };
}

function main() {
    const versionInfo = generateVersion();

    // Write to public directory so it's accessible via HTTP
    const publicDir = path.join(__dirname, '..', 'public');

    // Create public directory if it doesn't exist
    if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
    }

    const versionPath = path.join(publicDir, 'version.json');

    fs.writeFileSync(versionPath, JSON.stringify(versionInfo, null, 2));

    console.log('✅ Version file generated:');
    console.log(`   Build Hash: ${versionInfo.buildHash}`);
    console.log(`   Build Date: ${versionInfo.buildDate}`);
    console.log(`   Deploy #${versionInfo.deployNumber}`);
}

main();
