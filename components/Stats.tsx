"use client";
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityLog, Category } from '../types';
import { Select } from './v6/Select';
import { toPaletteHex } from './v6/nav';

const NUM_KEY = 'habito_ratio_num';
const DEN_KEY = 'habito_ratio_den';

const dayKey = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const stored = (key: string) =>
    (typeof window !== 'undefined' ? localStorage.getItem(key) : null) ?? '';

interface StatsProps {
    logs: ActivityLog[];
    categories: Category[];
}

export const Stats: React.FC<StatsProps> = ({ logs, categories }) => {
    const [numId, setNumId] = useState(() => stored(NUM_KEY));
    const [denId, setDenId] = useState(() => stored(DEN_KEY));

    // Primera vez: compara los dos primeros hábitos que haya.
    useEffect(() => {
        if (categories.length < 2) return;
        setNumId(prev => (prev && categories.some(c => c.id === prev) ? prev : categories[0].id));
        setDenId(prev => (prev && categories.some(c => c.id === prev) ? prev : categories[1].id));
    }, [categories]);

    useEffect(() => { if (numId) localStorage.setItem(NUM_KEY, numId); }, [numId]);
    useEffect(() => { if (denId) localStorage.setItem(DEN_KEY, denId); }, [denId]);

    const { current, record, total, days } = useMemo(() => {
        const keys = Array.from(new Set(
            logs.filter(l => l.dateObj).map(l => dayKey(l.dateObj!)),
        )).sort();

        const dates = keys.map(k => {
            const [y, m, d] = k.split('-').map(Number);
            return new Date(y, m - 1, d);
        });

        let record = 0;
        let run = 0;
        let previous: Date | null = null;
        dates.forEach(date => {
            const diff = previous ? Math.round((date.getTime() - previous.getTime()) / 86_400_000) : null;
            run = diff === 1 ? run + 1 : 1;
            if (run > record) record = run;
            previous = date;
        });

        // Racha actual: hacia atrás desde hoy. Ayer también cuenta, el día no
        // ha terminado.
        const set = new Set(keys);
        const today = new Date();
        const cursor = new Date(today);
        let current = 0;
        if (!set.has(dayKey(cursor))) cursor.setDate(cursor.getDate() - 1);
        while (set.has(dayKey(cursor))) {
            current += 1;
            cursor.setDate(cursor.getDate() - 1);
        }

        const startOfYear = new Date(today.getFullYear(), 0, 1);
        const days = Math.floor((today.getTime() - startOfYear.getTime()) / 86_400_000) + 1;

        return { current, record, total: logs.length, days };
    }, [logs]);

    const countFor = (id: string) =>
        logs.filter(l => l.categoryId === id || l.category === id).length;

    const numCount = numId ? countFor(numId) : 0;
    const denCount = denId ? countFor(denId) : 0;
    const percent = denCount === 0 ? 0 : Math.round((numCount / denCount) * 100);

    const options = categories.map(c => ({
        value: c.id,
        label: c.name.toLowerCase(),
        dot: toPaletteHex(c.color),
    }));

    const rows = [
        { label: 'actual', value: current, unit: 'días', accent: 'var(--v6-amber)' },
        { label: 'récord', value: record, unit: 'días', accent: 'var(--v6-fg)' },
        { label: 'registros', value: total, unit: `en ${days} días`, accent: 'var(--v6-fg)' },
    ];

    return (
        <div className="flex flex-col gap-3.5">
            <div className="flex flex-col gap-1.5">
                {rows.map(row => (
                    <div key={row.label} className="flex items-baseline gap-2">
                        <span className="w-20 shrink-0 text-10 uppercase tracking-[.3px] text-subtle">{row.label}</span>
                        <span className="text-14 font-bold tabular-nums" style={{ color: row.accent }}>{row.value}</span>
                        <span className="text-11 text-subtle">{row.unit}</span>
                    </div>
                ))}
            </div>

            {categories.length >= 2 && (
                <div className="flex flex-col gap-2 border-t border-border pt-3">
                    <div className="flex items-baseline gap-2">
                        <span className="text-10 uppercase tracking-[.3px] text-subtle">comparar</span>
                        <span className="ml-auto text-14 font-bold tabular-nums text-blue">{percent}%</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <Select className="min-w-0 flex-1" value={numId} onChange={setNumId} options={options} />
                        <span className="shrink-0 text-12 text-subtle">/</span>
                        <Select className="min-w-0 flex-1" value={denId} onChange={setDenId} options={options} />
                    </div>

                    <p className="text-11 text-subtle">
                        {`// ${numCount} frente a ${denCount} registros`}
                    </p>
                </div>
            )}
        </div>
    );
};
