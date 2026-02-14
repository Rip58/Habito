import { prisma } from '../lib/prisma';

async function checkEvents() {
    try {
        console.log('🔍 Verificando eventos en la base de datos...\n');

        // Contar categorías
        const categoryCount = await prisma.category.count();
        console.log(`📁 Total de categorías: ${categoryCount}`);

        if (categoryCount > 0) {
            const categories = await prisma.category.findMany({
                orderBy: { name: 'asc' }
            });
            console.log('\nCategorías encontradas:');
            categories.forEach(cat => {
                console.log(`  - ${cat.name} (${cat.color}) - Target: ${cat.target} - ${cat.enabled ? '✅ Activa' : '❌ Inactiva'}`);
            });
        }

        // Contar logs/eventos
        const logCount = await prisma.log.count();
        console.log(`\n📝 Total de eventos (logs): ${logCount}`);

        if (logCount > 0) {
            const logs = await prisma.log.findMany({
                orderBy: { dateObj: 'desc' },
                take: 10
            });
            console.log('\nÚltimos 10 eventos:');
            logs.forEach(log => {
                console.log(`  - ${log.timestamp} | ${log.eventName} (${log.category}) - Intensidad: ${log.intensity} - Estado: ${log.status}`);
            });

            // Estadísticas por categoría
            const logsByCategory = await prisma.log.groupBy({
                by: ['category'],
                _count: {
                    category: true
                },
                orderBy: {
                    _count: {
                        category: 'desc'
                    }
                }
            });

            console.log('\n📊 Eventos por categoría:');
            logsByCategory.forEach(stat => {
                console.log(`  - ${stat.category}: ${stat._count.category} eventos`);
            });
        } else {
            console.log('\n⚠️  No hay eventos registrados en la base de datos.');
        }

    } catch (error) {
        console.error('❌ Error al consultar la base de datos:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkEvents();
