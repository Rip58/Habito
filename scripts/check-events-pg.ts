import 'dotenv/config';
import pkg from 'pg';
const { Client } = pkg;

async function checkEvents() {
    const client = new Client({
        connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('🔍 Verificando eventos en la base de datos...\n');

        // Contar categorías
        const categoryResult = await client.query('SELECT COUNT(*) FROM categories');
        const categoryCount = parseInt(categoryResult.rows[0].count);
        console.log(`📁 Total de categorías: ${categoryCount}`);

        if (categoryCount > 0) {
            const categories = await client.query('SELECT * FROM categories ORDER BY name ASC');
            console.log('\nCategorías encontradas:');
            categories.rows.forEach(cat => {
                console.log(`  - ${cat.name} (${cat.color}) - Target: ${cat.target} - ${cat.enabled ? '✅ Activa' : '❌ Inactiva'}`);
            });
        }

        // Contar logs/eventos
        const logResult = await client.query('SELECT COUNT(*) FROM logs');
        const logCount = parseInt(logResult.rows[0].count);
        console.log(`\n📝 Total de eventos (logs): ${logCount}`);

        if (logCount > 0) {
            const logs = await client.query('SELECT * FROM logs ORDER BY "dateObj" DESC LIMIT 10');
            console.log('\nÚltimos 10 eventos:');
            logs.rows.forEach(log => {
                console.log(`  - ${log.timestamp} | ${log.eventName} (${log.category}) - Intensidad: ${log.intensity} - Estado: ${log.status}`);
            });

            // Estadísticas por categoría
            const stats = await client.query(`
        SELECT category, COUNT(*) as count 
        FROM logs 
        GROUP BY category 
        ORDER BY count DESC
      `);

            console.log('\n📊 Eventos por categoría:');
            stats.rows.forEach(stat => {
                console.log(`  - ${stat.category}: ${stat.count} eventos`);
            });
        } else {
            console.log('\n⚠️  No hay eventos registrados en la base de datos.');
        }

    } catch (error) {
        console.error('❌ Error al consultar la base de datos:', error);
    } finally {
        await client.end();
    }
}

checkEvents();
