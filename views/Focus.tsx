import React, { useState, useEffect } from 'react';
import { Category, TimerSession } from '../types';
import { FocusTimer } from '../components/FocusTimer';
import { TimerSessionCard } from '../components/TimerSessionCard';
import { api } from '../lib/api';
import { Clock } from 'lucide-react';

interface FocusProps {
    categories: Category[];
    onCategoriesChange?: () => void;
}

export const Focus: React.FC<FocusProps> = ({ categories, onCategoriesChange }) => {
    const [sessions, setSessions] = useState<TimerSession[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filterCategoryId, setFilterCategoryId] = useState<string>('all');

    const fetchSessions = async () => {
        try {
            const data = await api.timerSessions.getAll();
            setSessions(data);
        } catch (error) {
            console.error('Failed to fetch sessions:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchSessions();
    }, []);

    // Calcula tiempo total por categoría
    const totalsByCategory = sessions.reduce((acc, session) => {
        acc[session.categoryId] = (acc[session.categoryId] || 0) + session.durationSec;
        return acc;
    }, {} as Record<string, number>);

    // Filter sessions for history
    const filteredSessions = filterCategoryId === 'all'
        ? sessions
        : sessions.filter(s => s.categoryId === filterCategoryId);

    return (
        <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-24">
            <header className="flex flex-col gap-4 mb-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground mb-2">Focus Mode</h1>
                    <p className="text-muted-foreground">Concéntrate en tus tareas y registra el tiempo dedicado.</p>
                </div>
            </header>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Panel Izquierdo: Timer */}
                <div className="flex-1 space-y-8">
                    <FocusTimer categories={categories} onSessionComplete={fetchSessions} onCategoriesChange={onCategoriesChange} />

                    {/* Resumen de Tiempos Totales */}
                    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                            <Clock size={18} className="text-primary" /> Tiempo Invertido
                        </h3>

                        <div className="space-y-3">
                            {categories.filter(c => totalsByCategory[c.id] > 0).map(cat => {
                                const totalSec = totalsByCategory[cat.id];
                                const h = Math.floor(totalSec / 3600);
                                const m = Math.floor((totalSec % 3600) / 60);
                                const timeStr = h > 0 ? `${h}h ${m} m` : `${m} m`;

                                return (
                                    <div key={cat.id} className="flex items-center justify-between p-3 rounded-xl bg-background border border-border/50">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full flex items-center justify-center border border-border/40" style={{ backgroundColor: `${cat.color} 15` }}>
                                                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }}></div>
                                            </div>
                                            <span className="font-medium text-foreground text-sm">{cat.name}</span>
                                        </div>
                                        <span className="font-mono text-sm font-semibold text-muted-foreground">{timeStr}</span>
                                    </div>
                                );
                            })}

                            {Object.keys(totalsByCategory).length === 0 && !isLoading && (
                                <p className="text-sm text-muted-foreground text-center py-4 italic">Aún no hay tiempo registrado.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Panel Derecho: Historial */}
                <div className="flex-1 lg:max-w-md">
                    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm h-full max-h-[800px] flex flex-col">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 shrink-0">
                            <h3 className="font-semibold text-foreground">Historial de Sesiones</h3>
                            <select
                                value={filterCategoryId}
                                onChange={(e) => setFilterCategoryId(e.target.value)}
                                className="bg-background border border-border rounded-lg px-3 py-1.5 text-sm text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none cursor-pointer"
                            >
                                <option value="all">Todas las actividades</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex-1 overflow-y-auto pr-2 -mr-2">
                            {isLoading ? (
                                <div className="text-center py-8 text-muted-foreground text-sm">Cargando...</div>
                            ) : filteredSessions.length > 0 ? (
                                <div className="space-y-1">
                                    {filteredSessions.map(session => (
                                        <TimerSessionCard
                                            key={session.id}
                                            session={session}
                                            categories={categories}
                                            onDelete={fetchSessions}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 flex flex-col items-center justify-center">
                                    <div className="w-16 h-16 rounded-full bg-border/20 flex items-center justify-center mb-4">
                                        <Clock size={24} className="text-muted-foreground opacity-50" />
                                    </div>
                                    <p className="text-muted-foreground font-medium text-sm">Sin sesiones {filterCategoryId !== 'all' ? 'para esta actividad' : 'registradas'}</p>
                                    <p className="text-xs text-muted-foreground mt-1 text-balance">
                                        {filterCategoryId !== 'all' ? 'Inicia un cronómetro con esta actividad.' : 'Inicia el cronómetro para comenzar a registrar tu tiempo de foco.'}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
