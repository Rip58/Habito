import Dexie, { Table } from 'dexie';

export interface Log {
    id?: number;
    timestamp: string; // Keep as string for now to match UI, but better as Date
    dateObj: Date;     // For querying
    eventName: string;
    category: string;
    intensity: number;
    status: 'COMPLETED' | 'PENDING' | 'FAILED';
}

export interface CategoryDB {
    id?: number;
    name: string;
    target: string;
    enabled: boolean;
    color: string;
}

export class HabitoDatabase extends Dexie {
    logs!: Table<Log>;
    categories!: Table<CategoryDB>;

    constructor() {
        super('HabitoDatabase');
        this.version(1).stores({
            logs: '++id, dateObj, category, status', // Indexes
            categories: '++id, name, enabled'
        });
    }
}

export const db = new HabitoDatabase();

// Helper to seed data if empty
export const seedDatabase = async () => {
    const catCount = await db.categories.count();
    if (catCount === 0) {
        await db.categories.bulkAdd([
            { name: 'Programación Diaria', target: '3 horas', enabled: true, color: '#10b981' },
            { name: 'Ejercicio', target: '45 min', enabled: true, color: '#f59e0b' },
            { name: 'Lectura', target: '1 sesión', enabled: true, color: '#6366f1' },
        ]);
    }

    const logCount = await db.logs.count();
    if (logCount === 0) {
        // Log seeding removed to start empty
    }
};
