import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import 'dotenv/config';

const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('🌱 Seeding database...');

    // Seed Categories
    const categories = await prisma.category.createMany({
        data: [
            {
                name: 'Programación Diaria',
                target: '3 horas',
                enabled: true,
                color: '#10b981',
            },
            {
                name: 'Ejercicio',
                target: '45 min',
                enabled: true,
                color: '#f59e0b',
            },
            {
                name: 'Lectura',
                target: '1 sesión',
                enabled: true,
                color: '#6366f1',
            },
            {
                name: 'Meditación',
                target: '20 min',
                enabled: true,
                color: '#8b5cf6',
            },
            {
                name: 'Estudio',
                target: '2 horas',
                enabled: true,
                color: '#ec4899',
            },
        ],
        skipDuplicates: true,
    });

    console.log(`✅ Created ${categories.count} categories`);

    // Optional: Add sample logs
    const programmingCategory = await prisma.category.findUnique({
        where: { name: 'Programación Diaria' },
    });

    if (programmingCategory) {
        const today = new Date();
        const sampleLog = await prisma.log.create({
            data: {
                timestamp: today.toISOString(),
                dateObj: today,
                eventName: 'Programación Diaria',
                category: programmingCategory.name,
                categoryId: programmingCategory.id,
                intensity: 8,
                status: 'COMPLETED',
            },
        });

        console.log(`✅ Created sample log: ${sampleLog.id}`);
    }

    console.log('🎉 Seeding completed!');
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await pool.end();
        await prisma.$disconnect();
    });
