import React, { useMemo, useState } from 'react';
import { ActivityLog, Category } from '../types';
import { DiffRow } from './v6/DiffRow';
import { Cmd } from './v6/Button';
import { toPaletteHex } from './v6/nav';

interface LogTableProps {
    logs: ActivityLog[];
    categories?: Category[];
    onEdit?: (log: ActivityLog) => void;
    onDelete?: (id: string) => void;
}

// La sección dice "últimos registros": pintar los 196 de golpe es scroll
// infinito y mucho DOM para nada.
const PAGE = 20;

export const LogTable: React.FC<LogTableProps> = ({ logs, categories = [], onEdit, onDelete }) => {
    const [order, setOrder] = useState<'newest' | 'oldest'>('newest');
    const [expanded, setExpanded] = useState<string | null>(null);
    const [showAll, setShowAll] = useState(false);

    const rows = useMemo(() => {
        const sorted = [...logs].sort((a, b) => {
            const at = a.dateObj?.getTime() ?? 0;
            const bt = b.dateObj?.getTime() ?? 0;
            return order === 'newest' ? bt - at : at - bt;
        });
        return sorted.map(log => {
            const category = categories.find(c => c.id === log.categoryId);
            const name = category?.name ?? log.category;
            const fallback = `Sesión de ${name}`;
            return {
                log,
                color: toPaletteHex(category?.color),
                name,
                note: log.eventName && log.eventName !== fallback ? log.eventName : null,
                date: log.dateObj
                    ? log.dateObj.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }).replace('.', '')
                    : '--',
            };
        });
    }, [logs, categories, order]);

    if (rows.length === 0) {
        return <p className="text-11 text-subtle">{'// sin registros todavía'}</p>;
    }

    const visible = showAll ? rows : rows.slice(0, PAGE);
    const hidden = rows.length - visible.length;

    return (
        <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-4">
                <Cmd
                    accent="var(--v6-blue)"
                    onClick={() => setOrder(o => (o === 'newest' ? 'oldest' : 'newest'))}
                >
                    {order === 'newest' ? 'recientes' : 'antiguos'}
                </Cmd>
                <span className="ml-auto text-11 text-subtle">{rows.length} en total</span>
            </div>

            {visible.map(({ log, color, name, note, date }) => {
                const id = String(log.id);
                const open = expanded === id;
                return (
                    <div key={id} className="flex flex-col">
                        <DiffRow color={color}>
                            <span className="w-11 shrink-0 text-10 tracking-[.3px] text-subtle">{date}</span>
                            <button
                                onClick={() => note && setExpanded(open ? null : id)}
                                className="min-w-0 flex-1 truncate text-left text-12 text-foreground"
                            >
                                {note ?? name}
                            </button>
                            <span className="flex shrink-0 items-center gap-2">
                                {onEdit && <Cmd accent="var(--v6-blue)" onClick={() => onEdit(log)}>e</Cmd>}
                                {onDelete && log.id !== undefined && (
                                    <Cmd accent="var(--v6-red)" onClick={() => onDelete(String(log.id))}>x</Cmd>
                                )}
                            </span>
                        </DiffRow>
                        {open && note && (
                            <p className="whitespace-pre-wrap px-2 py-1.5 pl-6 text-11 text-muted">{note}</p>
                        )}
                    </div>
                );
            })}

            {hidden > 0 && (
                <div className="flex min-h-[44px] items-center">
                    <Cmd accent="var(--v6-blue)" onClick={() => setShowAll(true)}>ver {hidden} más</Cmd>
                </div>
            )}
            {showAll && rows.length > PAGE && (
                <div className="flex min-h-[44px] items-center">
                    <Cmd accent="var(--v6-dim)" onClick={() => setShowAll(false)}>ver menos</Cmd>
                </div>
            )}
        </div>
    );
};
