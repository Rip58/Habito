"use client";
import React, { useCallback, useEffect, useState } from 'react';
import { Category, TimerSession } from '../types';
import { api } from '../lib/api';
import { FocusTimer } from '../components/FocusTimer';
import { TimerSessionCard } from '../components/TimerSessionCard';
import { Modal } from '../components/Modal';
import { Sec } from '../components/v6/Sec';
import { Box } from '../components/v6/Button';
import { toPaletteHex } from '../components/v6/nav';

interface FocusProps {
    categories: Category[];
    onCategoriesChange?: () => void;
}

const parseTargetSeconds = (target?: string): number | null => {
    if (!target) return null;
    const t = target.toLowerCase();
    const hours = t.match(/(\d+(?:[.,]\d+)?)\s*(?:h\b|horas?)/);
    const minutes = t.match(/(\d+(?:[.,]\d+)?)\s*(?:m\b|min|minutos?)/);
    if (!hours && !minutes) return null;
    const num = (m: RegExpMatchArray | null) => (m ? parseFloat(m[1].replace(',', '.')) : 0);
    const seconds = num(hours) * 3600 + num(minutes) * 60;
    return seconds > 0 ? seconds : null;
};

const formatTotal = (sec: number) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    return h > 0 ? `${h}h ${String(m).padStart(2, '0')}m` : `${m}m`;
};

const isToday = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
};

export const Focus: React.FC<FocusProps> = ({ categories, onCategoriesChange }) => {
    const [sessions, setSessions] = useState<TimerSession[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [pendingDelete, setPendingDelete] = useState<TimerSession | null>(null);

    const fetchSessions = useCallback(async () => {
        try {
            setSessions(await api.timerSessions.getAll());
        } catch (err) {
            console.error('Failed to fetch sessions:', err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { fetchSessions(); }, [fetchSessions]);

    const todaySessions = sessions.filter(s => isToday(s.startedAt));
    const totalsByCategory = todaySessions.reduce((acc, s) => {
        acc[s.categoryId] = (acc[s.categoryId] || 0) + s.durationSec;
        return acc;
    }, {} as Record<string, number>);
    const totalToday = todaySessions.reduce((acc, s) => acc + s.durationSec, 0);

    const confirmDelete = async () => {
        if (!pendingDelete?.id) return;
        await api.timerSessions.delete(pendingDelete.id);
        setPendingDelete(null);
        fetchSessions();
    };

    return (
        <div className="mx-auto w-full max-w-3xl px-3.5 pb-32 md:px-8 md:pb-12">
            <Sec accent="var(--v6-green)" title="cronómetro" comment="// tiempo dedicado a un hábito">
                <FocusTimer
                    categories={categories}
                    onSessionComplete={fetchSessions}
                    onCategoriesChange={onCategoriesChange}
                />
            </Sec>

            <Sec
                accent="var(--v6-amber)"
                title="tiempo"
                right="hoy"
                comment="// acumulado del día frente a la meta"
            >
                {categories.filter(c => totalsByCategory[c.id] > 0).length === 0 ? (
                    <p className="text-11 text-subtle">{'// sin tiempo registrado hoy'}</p>
                ) : (
                    <div className="flex flex-col gap-2.5">
                        {categories.filter(c => totalsByCategory[c.id] > 0).map(cat => {
                            const seconds = totalsByCategory[cat.id];
                            const target = parseTargetSeconds(cat.target);
                            const pct = target ? Math.min(100, Math.round((seconds / target) * 100)) : 100;
                            const color = toPaletteHex(cat.color);
                            return (
                                <div key={cat.id} className="flex flex-col gap-1.5">
                                    <div className="flex items-baseline gap-2 text-12">
                                        <span style={{ color }}>{cat.name.toLowerCase()}</span>
                                        <span className="ml-auto font-bold text-foreground">{formatTotal(seconds)}</span>
                                        <span className="w-11 text-right text-10 tracking-[.3px] text-subtle">{cat.target}</span>
                                    </div>
                                    <div className="v6-track">
                                        <span className="v6-fill" style={{ width: `${pct}%`, ['--v6-fill' as string]: color }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </Sec>

            <Sec
                accent="var(--v6-violet)"
                title="sesiones"
                right={todaySessions.length > 0 ? `${todaySessions.length} · ${formatTotal(totalToday)}` : undefined}
                comment="// sesiones guardadas hoy"
            >
                {isLoading ? (
                    <p className="text-11 text-subtle">{'// cargando…'}</p>
                ) : todaySessions.length === 0 ? (
                    <p className="text-11 text-subtle">{'// inicia el cronómetro para registrar tiempo'}</p>
                ) : (
                    <div className="flex flex-col gap-1.5">
                        {todaySessions.map(session => (
                            <TimerSessionCard
                                key={session.id}
                                session={session}
                                categories={categories}
                                onDelete={fetchSessions}
                                onRequestDelete={setPendingDelete}
                            />
                        ))}
                    </div>
                )}
            </Sec>

            <Modal
                isOpen={pendingDelete !== null}
                onClose={() => setPendingDelete(null)}
                title="borrar sesión"
                comment="// esta acción no se puede deshacer"
                destructive
            >
                <div className="flex items-center gap-2">
                    <Box accent="var(--v6-red)" onClick={confirmDelete} className="flex-1">borrar</Box>
                    <Box accent="var(--v6-dim)" onClick={() => setPendingDelete(null)} className="w-28">cancelar</Box>
                </div>
            </Modal>
        </div>
    );
};
