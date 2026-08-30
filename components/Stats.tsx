import React, { useMemo } from 'react';
import { ActivityLog } from '../types';

const dayKey = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

interface StatsProps {
    logs: ActivityLog[];
    /** `all` o el id/nombre de un hábito. */
    filter: string;
}

export const Stats: React.FC<StatsProps> = ({ logs, filter }) => {
    const { current, record, total, days } = useMemo(() => {
        const filtered = filter === 'all'
            ? logs
            : logs.filter(l => l.categoryId === filter || l.category === filter);

        const keys = Array.from(new Set(
            filtered.filter(l => l.dateObj).map(l => dayKey(l.dateObj!)),
        )).sort();

        const dates = keys.map(k => {
            const [y, m, d] = k.split('-').map(Number);
            return new Date(y, m - 1, d);
        });

        let record = 0;
        let run = 0;
        let previous: Date | null = null;
        dates.forEach(date => {
            const diff = previous
                ? Math.round((date.getTime() - previous.getTime()) / 86_400_000)
                : null;
            run = diff === 1 ? run + 1 : 1;
            if (run > record) record = run;
            previous = date;
        });

        // Racha actual: cuenta hacia atrás desde hoy. Ayer también vale — el día
        // no ha terminado todavía.
        const set = new Set(keys);
        const today = new Date();
        let cursor = new Date(today);
        let current = 0;
        if (!set.has(dayKey(cursor))) cursor.setDate(cursor.getDate() - 1);
        while (set.has(dayKey(cursor))) {
            current += 1;
            cursor.setDate(cursor.getDate() - 1);
        }

        const startOfYear = new Date(today.getFullYear(), 0, 1);
        const days = Math.floor((today.getTime() - startOfYear.getTime()) / 86_400_000) + 1;

        return { current, record, total: filtered.length, days };
    }, [logs, filter]);

    const rows = [
        { label: 'actual', value: current, unit: 'días', accent: 'var(--v6-amber)' },
        { label: 'récord', value: record, unit: 'días', accent: 'var(--v6-fg)' },
        { label: 'registros', value: total, unit: `en ${days} días`, accent: 'var(--v6-fg)' },
    ];

    return (
        <div className="flex flex-col gap-1.5">
            {rows.map(row => (
                <div key={row.label} className="flex items-baseline gap-2">
                    <span className="w-20 shrink-0 text-10 uppercase tracking-[.3px] text-subtle">{row.label}</span>
                    <span className="text-14 font-bold tabular-nums" style={{ color: row.accent }}>{row.value}</span>
                    <span className="text-11 text-subtle">{row.unit}</span>
                </div>
            ))}
        </div>
    );
};
