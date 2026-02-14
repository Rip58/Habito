import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
    const categoryName = 'Programación Diaria';

    console.log(`Deleting events for category: ${categoryName}...`);
    const deletedLogs = await prisma.log.deleteMany({
        where: {
            category: categoryName,
        },
    });
    console.log(`Deleted ${deletedLogs.count} logs.`);

    console.log(`Deleting category: ${categoryName}...`);
    try {
        const deletedCategory = await prisma.category.delete({
            where: {
                name: categoryName,
            },
        });
        console.log(`Deleted category: ${deletedCategory.name}`);
    } catch (error) {
        console.log(`Category ${categoryName} not found or already deleted.`);
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
