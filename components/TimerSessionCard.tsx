import React, { useState } from 'react';
import { TimerSession, Category } from '../types';
import { MessageSquare, Trash2, ChevronDown } from 'lucide-react';
import { api } from '../lib/api';

interface TimerSessionCardProps {
    session: TimerSession;
    categories: Category[];
    onDelete: () => void;
}

export const TimerSessionCard: React.FC<TimerSessionCardProps> = ({ session, categories, onDelete }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const formatDuration = (sec: number) => {
        const h = Math.floor(sec / 3600);
        const m = Math.floor((sec % 3600) / 60);
        const parts = [];
        if (h > 0) parts.push(`${h}h`);
        if (m > 0) parts.push(`${m}m`);
        if (h === 0 && m === 0) parts.push(`${sec}s`);
        return parts.join(' ');
    };

    const handleDelete = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!session.id) return;
        if (confirm('¿Seguro que quieres borrar esta sesión?')) {
            await api.timerSessions.delete(session.id);
            onDelete();
        }
    };

    const startDate = new Date(session.startedAt);
    const dateStr = startDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
    const timeStr = startDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

    const categoryColor = categories.find(c => c.id === session.categoryId)?.color || '#64748b';
    const hasNote = !!session.note;

    return (
        <div className="border-b border-border/40 last:border-b-0 group">
            <div
                className={`flex items-center justify-between p-3 rounded-xl transition-colors ${hasNote ? 'cursor-pointer hover:bg-muted/50' : ''} ${isExpanded ? 'bg-muted/30' : ''}`}
                onClick={() => hasNote && setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center border border-border/40 shrink-0" style={{ backgroundColor: `${categoryColor}15` }}>
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: categoryColor }}></div>
                    </div>

                    <div>
                        <div className="flex items-center gap-2">
                            <h4 className="font-medium text-foreground text-sm">{session.category}</h4>
                            {hasNote && <MessageSquare size={12} className="text-muted-foreground opacity-50" />}
                        </div>
                        <p className="text-xs text-muted-foreground">{dateStr} • {timeStr}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-semibold text-foreground">
                        {formatDuration(session.durationSec)}
                    </span>

                    <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={handleDelete}
                            className="p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded-lg transition-colors"
                            title="Borrar sesión"
                        >
                            <Trash2 size={14} />
                        </button>
                        {hasNote && (
                            <div className="p-1.5 text-muted-foreground">
                                <ChevronDown size={14} className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {isExpanded && hasNote && (
                <div className="px-14 pb-4 pt-1 animate-in slide-in-from-top-2 duration-200">
                    <div className="text-sm text-muted-foreground bg-muted/40 p-3 rounded-lg border border-border/50 italic">
                        {session.note}
                    </div>
                </div>
            )}
        </div>
    );
};
