"use client";
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityLog, Category, HeatmapDay } from '../types';
import { api } from '../lib/api';
import { Heatmap } from '../components/Heatmap';
import { LogTable } from '../components/LogTable';
import { Stats } from '../components/Stats';
import { Modal } from '../components/Modal';
import { Sec } from '../components/v6/Sec';
import { Box, Cmd } from '../components/v6/Button';
import { DiffRow } from '../components/v6/DiffRow';
import { Select } from '../components/v6/Select';
import { Label, inputClass } from '../components/v6/Field';
import { toPaletteHex } from '../components/v6/nav';

interface OverviewProps {
    categories?: Category[];
    onCategoriesChange?: () => void;
}

type Range = '1M' | '3M' | '12M';
const RANGES: { id: Range; label: string }[] = [
    { id: '1M', label: '1m' },
    { id: '3M', label: '3m' },
    { id: '12M', label: '1a' },
];

const dayKey = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const Overview: React.FC<OverviewProps> = ({ categories = [] }) => {
    const [logs, setLogs] = useState<ActivityLog[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [range, setRange] = useState<Range>('3M');

    const [logModalOpen, setLogModalOpen] = useState(false);
    const [editingLogId, setEditingLogId] = useState<string | null>(null);
    const [count, setCount] = useState(1);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [note, setNote] = useState('');
    const [selectedDate, setSelectedDate] = useState(() => dayKey(new Date()));
    const [viewingDate, setViewingDate] = useState<string | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const fetchLogs = useCallback(async () => {
        try {
            const data = await api.logs.getAll();
            setLogs(data.map(log => ({ ...log, dateObj: new Date(log.dateObj) })));
            setError(null);
        } catch (err) {
            console.error('Failed to fetch logs:', err);
            setError('no se pudieron cargar los registros');
        }
    }, []);

    useEffect(() => { fetchLogs(); }, [fetchLogs]);

    const enabled = categories.filter(c => c.enabled);

    // Un solo recorrido de los logs y un solo rango de fechas para TODAS las
    // categorías, memorizado.
    const heatmapByCategory = useMemo(() => {
        const counts = new Map<string, Map<string, number>>();
        logs.forEach(log => {
            if (!log.dateObj) return;
            const key = dayKey(log.dateObj);
            for (const id of [log.categoryId, log.category]) {
                if (!id) continue;
                let days = counts.get(id);
                if (!days) { days = new Map(); counts.set(id, days); }
                days.set(key, (days.get(key) || 0) + 1);
            }
        });

        const today = new Date();
        let end = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
        let start: Date;
        switch (range) {
            case '1M': start = new Date(end); start.setUTCDate(start.getUTCDate() - 30); break;
            case '3M': start = new Date(end); start.setUTCDate(start.getUTCDate() - 90); break;
            default:
                start = new Date(Date.UTC(today.getFullYear(), 0, 1));
                end = new Date(Date.UTC(today.getFullYear(), 11, 31));
                break;
        }

        const keys: string[] = [];
        const cursor = new Date(start);
        while (cursor <= end) {
            keys.push(`${cursor.getUTCFullYear()}-${String(cursor.getUTCMonth() + 1).padStart(2, '0')}-${String(cursor.getUTCDate()).padStart(2, '0')}`);
            cursor.setUTCDate(cursor.getUTCDate() + 1);
        }

        const out = new Map<string, HeatmapDay[]>();
        categories.forEach(cat => {
            const days = counts.get(cat.id) ?? counts.get(cat.name) ?? new Map<string, number>();
            out.set(cat.id, keys.map(date => {
                const c = days.get(date) || 0;
                return { date, count: c, level: (c === 0 ? 0 : c >= 4 ? 4 : c) as 0 | 1 | 2 | 3 | 4 };
            }));
        });
        return out;
    }, [logs, categories, range]);

    const todayKey = dayKey(new Date());
    const doneToday = useMemo(() => {
        const set = new Set<string>();
        logs.forEach(log => {
            if (log.dateObj && dayKey(log.dateObj) === todayKey) {
                if (log.categoryId) set.add(log.categoryId);
                if (log.category) set.add(log.category);
            }
        });
        return set;
    }, [logs, todayKey]);

    const doneCount = enabled.filter(c => doneToday.has(c.id) || doneToday.has(c.name)).length;

    const dayLogs = logs.filter(log => viewingDate && log.dateObj && dayKey(log.dateObj) === viewingDate);

    const openLogModal = (categoryId?: string, date?: string) => {
        setEditingLogId(null);
        setSelectedCategory(categoryId ?? enabled[0]?.id ?? '');
        setSelectedDate(date ?? todayKey);
        setNote('');
        setCount(1);
        setLogModalOpen(true);
    };

    const handleEditLog = (log: ActivityLog) => {
        if (!log.id) return;
        setViewingDate(null);
        setEditingLogId(String(log.id));
        if (log.dateObj) setSelectedDate(dayKey(log.dateObj));
        setSelectedCategory(log.categoryId || categories.find(c => c.name === log.category)?.id || '');
        setNote(log.eventName.replace(`Sesión de ${log.category}`, '').trim());
        setCount(1);
        setLogModalOpen(true);
    };

    const handleSaveLog = async () => {
        try {
            const categoryId = selectedCategory || enabled[0]?.id || '';
            const category = categories.find(c => c.id === categoryId);
            const name = category?.name ?? 'General';
            const [y, m, d] = selectedDate.split('-').map(Number);
            const now = new Date();
            const when = new Date(y, m - 1, d, now.getHours(), now.getMinutes());

            const payload = {
                timestamp: when.toLocaleString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }),
                dateObj: when.toISOString(),
                eventName: note || `Sesión de ${name}`,
                category: name,
                categoryId,
                intensity: 1,
                status: 'COMPLETED' as const,
            };

            if (editingLogId) {
                await api.logs.update(editingLogId, payload);
            } else {
                // El contador crea N registros: el mapa y las cifras cuentan
                // filas, no un campo `intensity` que no lee nadie.
                await Promise.all(Array.from({ length: Math.max(1, count) }, () => api.logs.create(payload)));
            }

            setLogModalOpen(false);
            setEditingLogId(null);
            setNote('');
            setCount(1);
            fetchLogs();
        } catch (err) {
            console.error('Save failed:', err);
            setError('no se pudo guardar el registro');
        }
    };

    const confirmDelete = async () => {
        if (!deleteId) return;
        await api.logs.delete(deleteId);
        setDeleteId(null);
        fetchLogs();
    };

    return (
        <div className="mx-auto w-full max-w-5xl px-3.5 pb-32 md:px-8 md:pb-12">

            {error && (
                <div role="alert" className="mt-[22px] flex items-center gap-2 rounded border px-2 py-1.5 text-11"
                    style={{ borderColor: 'var(--v6-red)', background: 'rgba(232,83,110,0.1)', color: 'var(--v6-red)' }}>
                    <span className="flex-1">{error}</span>
                    <button onClick={() => setError(null)} aria-label="Descartar">[x]</button>
                </div>
            )}

            <Sec
                accent="var(--v6-green)"
                title="hoy"
                right={`${doneCount}/${enabled.length}`}
                comment={`// ${doneCount} de ${enabled.length} hábitos completados`}
            >
                {enabled.length === 0 ? (
                    <p className="text-11 text-subtle">{'// crea un hábito en ajustes'}</p>
                ) : (
                    <div className="flex flex-col gap-1.5">
                        {enabled.map(cat => {
                            const done = doneToday.has(cat.id) || doneToday.has(cat.name);
                            const color = toPaletteHex(cat.color);
                            return (
                                <DiffRow
                                    key={cat.id}
                                    color={done ? color : 'var(--v6-dim)'}
                                    sign={done ? '+' : '·'}
                                    tinted={done}
                                    /* Altura fija: si no, las filas con [marcar] miden 54px
                                       y las que solo dicen "hecho" 28px. */
                                    className="min-h-[54px]"
                                >
                                    <span className="min-w-[44px] flex-1 truncate text-12" style={{ color: done ? 'var(--v6-fg)' : 'var(--v6-dim2)' }}>
                                        {cat.name.toLowerCase()}
                                    </span>
                                    {done ? (
                                        <span className="text-10 uppercase tracking-[.3px] text-subtle">hecho</span>
                                    ) : (
                                        <span className="flex min-h-[44px] items-center">
                                            <Cmd strong onClick={() => openLogModal(cat.id)}>marcar</Cmd>
                                        </span>
                                    )}
                                </DiffRow>
                            );
                        })}
                    </div>
                )}
            </Sec>

            <Sec accent="var(--v6-amber)" title="racha" comment="// días consecutivos con al menos un registro">
                <Stats logs={logs} filter="all" />
            </Sec>

            <Sec
                accent="var(--v6-blue)"
                title="mapa"
                comment="// un mapa por hábito"
                right={
                    <span className="flex gap-1">
                        {RANGES.map(r => (
                            <Cmd
                                key={r.id}
                                accent={range === r.id ? 'var(--v6-blue)' : 'var(--v6-dim)'}
                                strong={range === r.id}
                                onClick={() => setRange(r.id)}
                            >{r.label}</Cmd>
                        ))}
                    </span>
                }
            >
                {enabled.length === 0 ? (
                    <p className="text-11 text-subtle">{'// sin hábitos que mostrar'}</p>
                ) : (
                    <div className="flex flex-col gap-3.5">
                        {enabled.map(cat => {
                            const color = toPaletteHex(cat.color);
                            const data = heatmapByCategory.get(cat.id) ?? [];
                            const active = data.filter(d => d.count > 0).length;
                            return (
                                <div key={cat.id} className="flex flex-col gap-1.5">
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-12 font-bold" style={{ color }}>{cat.name.toLowerCase()}</span>
                                        <span className="ml-auto text-10 uppercase tracking-[.3px] text-subtle">{active} días</span>
                                    </div>
                                    <Heatmap data={data} color={color} onDayClick={setViewingDate} />
                                </div>
                            );
                        })}
                    </div>
                )}
            </Sec>

            <Sec
                accent="var(--v6-violet)"
                title="actividad"
                right={<Cmd strong onClick={() => openLogModal()}>+ registrar</Cmd>}
                comment="// últimos registros"
            >
                <LogTable logs={logs} categories={categories} onEdit={handleEditLog} onDelete={setDeleteId} />
            </Sec>

            {/* ── Detalle del día ─────────────────────────────── */}
            <Modal
                isOpen={viewingDate !== null}
                onClose={() => setViewingDate(null)}
                title={viewingDate ?? 'día'}
                comment={`// ${dayLogs.length} ${dayLogs.length === 1 ? 'registro' : 'registros'}`}
            >
                {dayLogs.length > 0 ? (
                    <div className="flex flex-col gap-1.5">
                        {dayLogs.map(log => {
                            const color = toPaletteHex(categories.find(c => c.id === log.categoryId)?.color);
                            return (
                                <DiffRow key={log.id} color={color}>
                                    <span className="min-w-0 flex-1 truncate text-12">{log.eventName}</span>
                                    <span className="flex shrink-0 items-center gap-4">
                                        <Cmd accent="var(--v6-blue)" onClick={() => handleEditLog(log)}>editar</Cmd>
                                        <Cmd accent="var(--v6-red)" onClick={() => log.id && setDeleteId(String(log.id))}>borrar</Cmd>
                                    </span>
                                </DiffRow>
                            );
                        })}
                    </div>
                ) : (
                    <div className="flex flex-col gap-2">
                        <p className="text-11 text-subtle">{'// sin actividad este día'}</p>
                        <Cmd strong onClick={() => { const d = viewingDate; setViewingDate(null); openLogModal(undefined, d ?? undefined); }}>
                            registrar aquí
                        </Cmd>
                    </div>
                )}
            </Modal>

            {/* ── Registrar / editar ──────────────────────────── */}
            <Modal
                isOpen={logModalOpen}
                onClose={() => setLogModalOpen(false)}
                title={editingLogId ? 'editar registro' : 'registrar'}
                comment="// añade uno o varios registros de un hábito"
            >
                <Select
                    label="hábito"
                    value={selectedCategory}
                    onChange={setSelectedCategory}
                    options={enabled.map(c => ({ value: c.id, label: c.name.toLowerCase(), dot: toPaletteHex(c.color) }))}
                    placeholder="sin hábitos"
                />

                <div className="flex flex-col gap-1">
                    <Label htmlFor="log-fecha">fecha</Label>
                    <input id="log-fecha" type="date" value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className={`${inputClass} min-h-[44px] [&::-webkit-calendar-picker-indicator]:opacity-50 [&::-webkit-calendar-picker-indicator]:invert`} />
                </div>

                {!editingLogId && (
                    <div className="flex flex-col gap-1">
                        <Label right={count === 1 ? '// 1 registro' : `// ${count} registros`}>veces</Label>
                        <div className="flex items-center gap-2">
                            <Box accent="var(--v6-dim)" onClick={() => setCount(c => Math.max(1, c - 1))} aria-label="Menos" className="w-11">−</Box>
                            <div className="flex h-11 flex-1 items-center justify-center rounded border border-border bg-surface text-14 font-bold text-green tabular-nums">
                                {count}
                            </div>
                            <Box accent="var(--v6-dim)" onClick={() => setCount(c => c + 1)} aria-label="Más" className="w-11">+</Box>
                        </div>
                    </div>
                )}

                <div className="flex flex-col gap-1">
                    <Label htmlFor="log-nota" right="opcional">nota</Label>
                    <textarea id="log-nota" rows={3} value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="¿algo que recordar?"
                        className={`${inputClass} resize-none placeholder:text-subtle`} />
                </div>

                <div className="flex items-center gap-4">
                    <Box onClick={handleSaveLog} className="flex-1">{editingLogId ? 'guardar' : 'registrar'}</Box>
                    <Cmd accent="var(--v6-dim)" onClick={() => setLogModalOpen(false)}>cancelar</Cmd>
                </div>
            </Modal>

            {/* ── Confirmar borrado ───────────────────────────── */}
            <Modal
                isOpen={deleteId !== null}
                onClose={() => setDeleteId(null)}
                title="borrar registro"
                comment="// esta acción no se puede deshacer"
                destructive
            >
                <div className="flex items-center gap-2">
                    <Box accent="var(--v6-red)" onClick={confirmDelete} className="flex-1">borrar</Box>
                    <Box accent="var(--v6-dim)" onClick={() => setDeleteId(null)} className="w-28">cancelar</Box>
                </div>
            </Modal>
        </div>
    );
};
