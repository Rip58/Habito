import React, { useState } from 'react';
import { TimerSession, Category } from '../types';
import { api } from '../lib/api';
import { DiffRow } from './v6/DiffRow';
import { Cmd } from './v6/Button';
import { toPaletteHex } from './v6/nav';

interface TimerSessionCardProps {
    session: TimerSession;
    categories: Category[];
    onDelete: () => void;
    onRequestDelete: (session: TimerSession) => void;
}

const formatDuration = (sec: number) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    if (h > 0) return `${h}h ${String(m).padStart(2, '0')}m`;
    if (m > 0) return `${m}m`;
    return `${sec}s`;
};

export const TimerSessionCard: React.FC<TimerSessionCardProps> = ({ session, categories, onRequestDelete }) => {
    const [open, setOpen] = useState(false);
    const color = toPaletteHex(categories.find(c => c.id === session.categoryId)?.color);
    const started = new Date(session.startedAt);
    const time = started.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

    return (
        <div className="flex flex-col">
            <DiffRow color={color}>
                <span className="w-10 shrink-0 text-10 tracking-[.3px] text-subtle">{time}</span>
                <button
                    onClick={() => session.note && setOpen(o => !o)}
                    className="min-w-0 flex-1 truncate text-left text-12 text-foreground"
                >
                    {session.note ?? session.category}
                </button>
                <span className="shrink-0 text-12 font-bold text-foreground">{formatDuration(session.durationSec)}</span>
                <Cmd accent="var(--v6-red)" onClick={() => onRequestDelete(session)}>x</Cmd>
            </DiffRow>
            {open && session.note && (
                <p className="whitespace-pre-wrap px-2 py-1.5 pl-6 text-11 text-muted">{session.note}</p>
            )}
        </div>
    );
};

export const deleteSession = (id: string) => api.timerSessions.delete(id);
