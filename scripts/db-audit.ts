
import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

const prisma = new PrismaClient();

async function main() {
    console.log('🔍 Starting Database Audit...');

    // 1. Check Categories
    console.log('\n📊 Fetching Categories...');
    const categories = await prisma.category.findMany();
    console.log(`✅ Found ${categories.length} categories:`);
    categories.forEach(c => console.log(` - [${c.id}] ${c.name} (Target: ${c.target})`));

    // 2. Check Logs
    console.log('\n📊 Fetching Logs...');
    const logs = await prisma.log.findMany({ take: 5, orderBy: { createdAt: 'desc' } });
    console.log(`ℹ️ Found ${logs.length} logs (showing last 5):`);
    logs.forEach(l => console.log(` - [${l.id}] ${l.eventName} (${l.status}) - CatID: ${l.categoryId}`));

    // 3. Test Log Creation (if categories exist)
    if (categories.length > 0) {
        console.log('\n🧪 Attempting to create a TEST log entry...');
        try {
            const testLog = await prisma.log.create({
                data: {
                    timestamp: new Date().toLocaleString(),
                    dateObj: new Date(),
                    eventName: 'Test Log from Audit Script',
                    category: categories[0].name,
                    categoryId: categories[0].id,
                    intensity: 5,
                    status: 'COMPLETED'
                }
            });
            console.log('✅ Log creation SUCCESS:', testLog.id);
            // Cleanup
            await prisma.log.delete({ where: { id: testLog.id } });
            console.log('🧹 Test log deleted.');
        } catch (e: any) {
            console.error('❌ Log creation FAILED:', e.message);
        }
    } else {
        console.log('⚠️ Skipping log creation test (no categories found).');
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
