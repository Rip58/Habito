
import { PrismaClient } from '@prisma/client';
import 'dotenv/config'; // Force load .env file

const prisma = new PrismaClient();

async function main() {
    console.log('🔍 Checking Database Connection...');
    console.log(`📌 URL: ${process.env.DATABASE_URL ? 'Matches .env' : 'MISSING'}`);

    try {
        console.log('Attempting to query "Category" table...');
        const count = await prisma.category.count();
        console.log(`✅ Success! Found ${count} categories.`);
        console.log('Database is properly initialized.');
    } catch (e: any) {
        console.error('❌ Database Query Failed!');
        if (e.message.includes('does not exist')) {
            console.error('CAUSE: default.Category table does not exist.');
            console.error('SOLUTION: Run "npx prisma db push" to create tables.');
        } else {
            console.error('CAUSE:', e.message);
        }
        process.exit(1);
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
