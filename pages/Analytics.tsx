import React, { useState } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, Tooltip, BarChart, Bar } from 'recharts';
import { Heatmap } from '../components/Heatmap';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { HeatmapDay } from '../types';
import { ArrowUpRight, TrendingUp, AlertTriangle, Clock, Zap, Flame, CalendarCheck } from 'lucide-react';

export const Analytics: React.FC = () => {
    const [filterCategory, setFilterCategory] = useState<string>('all');

    // Fetch categories
    const dbCategories = useLiveQuery(() => db.categories.toArray());
    const categories = (dbCategories?.map(c => ({ ...c, id: String(c.id) }))) || [];

    // Helper to get local YYYY-MM-DD
    const getLocalDateKey = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // Calculate statistics based on selected category
    const stats = useLiveQuery(async() => {
        let logs = await db.logs.toArray();

        // Filter by category if not 'all'
        if (filterCategory !== 'all') {
            logs = logs.filter(log => log.category === filterCategory);
        }

        // Total events
        const total = logs.length;

        // Calculate days elapsed this year
        const now = new Date();
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        const daysElapsed = Math.floor((now.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24)) + 1;

        // Day counts and unique dates
        const dayCounts = new Map<string, number>();
        const uniqueDates = new Set<string>();

        logs.forEach(log => {
            if (log.dateObj) {
                const key = getLocalDateKey(log.dateObj);
                dayCounts.set(key, (dayCounts.get(key) || 0) + 1);
                uniqueDates.add(key);
            }
        });

        // Find top day
        let maxDay = '-';
        let maxCount = 0;

        for (const [day, count] of dayCounts.entries()) {
            if (count > maxCount) {
                maxCount = count;
                const [y, m, d] = day.split('-');
                const dateObj = new Date(Number(y), Number(m) - 1, Number(d));
                maxDay = dateObj.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
            }
        }

        // Calculate Streak
        const todayKey = getLocalDateKey(new Date());
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayKey = getLocalDateKey(yesterday);

        let streak = 0;

        if (!uniqueDates.has(todayKey) && !uniqueDates.has(yesterdayKey)) {
            streak = 0;
        } else {
            let currentCheckDate = new Date();
            if (!uniqueDates.has(todayKey)) {
                currentCheckDate = yesterday;
            }

            while (true) {
                const dateKey = getLocalDateKey(currentCheckDate);
                if (uniqueDates.has(dateKey)) {
                    streak++;
                    currentCheckDate.setDate(currentCheckDate.getDate() - 1);
                } else {
                    break;
                }
            }
        }

        return { total, maxDay, maxCount, streak, daysElapsed };
    }, [filterCategory]) || { total: 0, maxDay: '-', maxCount: 0, streak: 0, daysElapsed: 1 };

    // Generate heatmap data from real logs
    const data: HeatmapDay[] = useLiveQuery(async() => {
        let allLogs = await db.logs.toArray();

        // Filter by category if not 'all'
        if (filterCategory !== 'all') {
            allLogs = allLogs.filter(log => log.category === filterCategory);
        }

        const daysMap = new Map<string, number>();
        allLogs.forEach(log => {
            if (log.dateObj) {
                const dateKey = getLocalDateKey(log.dateObj);
                daysMap.set(dateKey, (daysMap.get(dateKey) || 0) + 1);
            }
        });

        const days: HeatmapDay[] = [];
        const today = new Date();
        for (let i = 364; i >= 0; i--) {
            const d = new Date();
            d.setDate(today.getDate() - i);
            const dateStr = getLocalDateKey(d);
            const count = daysMap.get(dateStr) || 0;
            let level: 0 | 1 | 2 | 3 | 4 = 0;
            if (count > 0) level = 1;
            if (count > 3) level = 2;
            if (count > 7) level = 3;
            if (count > 10) level = 4;
            days.push({ date: dateStr, count, level });
        }
        return days;
    }, [filterCategory]) || [];

    // Mock data for charts (can be enhanced later with real data)
    const weeklyData = [
        { name: 'Lun', current: 40, prev: 24 },
        { name: 'Mar', current: 30, prev: 13 },
        { name: 'Mié', current: 55, prev: 40 },
        { name: 'Jue', current: 45, prev: 35 },
        { name: 'Vie', current: 20, prev: 15 },
        { name: 'Sáb', current: 10, prev: 5 },
        { name: 'Dom', current: 5, prev: 2 },
    ];

    const monthlyData = [
        { name: 'Jul', sessions: 200 },
        { name: 'Ago', sessions: 350 },
        { name: 'Sep', sessions: 400 },
        { name: 'Oct', sessions: 600 },
    ];

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-4 animate-in fade-in duration-500">
            <header className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center mb-8">
                <h1 className="text-2xl font-bold text-white">Análisis Detallado</h1>
                <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                    <button className="whitespace-nowrap bg-primary/10 text-primary px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary/20 transition-colors">Últimos 12 Meses</button>
                    <button className="whitespace-nowrap bg-primary text-bg-dark font-bold px-4 py-2 rounded-lg text-sm hover:opacity-90 transition-opacity">Exportar Reporte</button>
                </div>
            </header>

            {/* Top Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                {/* Total Events */}
                <div className="flex items-center gap-4 p-4 rounded-xl bg-bg-card hover:bg-white/5 transition-all cursor-pointer group/stat border border-white/5 hover:border-primary/30">
                    <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0 group-hover/stat:scale-110 transition-transform">
                        <Zap className="text-primary" size={22} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">Total</p>
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold text-text-primary tabular-nums">{stats.total}</span>
                        </div>
                        <p className="text-[10px] text-text-muted mt-0.5">
                            {stats.total} eventos / {stats.daysElapsed} días
                        </p>
                    </div>
                </div>

                {/* Current Streak */}
                <div className="flex items-center gap-4 p-4 rounded-xl bg-bg-card hover:bg-white/5 transition-all cursor-pointer group/stat border border-white/5 hover:border-orange-500/30">
                    <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center shrink-0 group-hover/stat:scale-110 transition-transform">
                        <Flame className="text-orange-500" size={22} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">Racha</p>
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold text-text-primary tabular-nums">{stats.streak}</span>
                            <span className="text-sm font-medium text-text-muted">días</span>
                        </div>
                        <p className="text-[10px] text-text-muted mt-0.5">Mantén el ritmo</p>
                    </div>
                </div>

                {/* Top Day */}
                <div className="flex items-center gap-4 p-4 rounded-xl bg-bg-card hover:bg-white/5 transition-all cursor-pointer group/stat border border-white/5 hover:border-accent/30">
                    <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center shrink-0 group-hover/stat:scale-110 transition-transform">
                        <CalendarCheck className="text-accent" size={22} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">Día Top</p>
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold text-text-primary">{stats.maxDay}</span>
                        </div>
                        <p className="text-[10px] text-text-muted mt-0.5">{stats.maxCount} activaciones</p>
                    </div>
                </div>
            </div>

            {/* Category Filter - Moved above Heatmap */}
            <div className="flex items-center gap-3 bg-bg-card p-4 rounded-xl border border-white/10">
                <label className="text-sm font-semibold text-text-muted">Filtrar por categoría:</label>
                <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-primary transition-colors"
                >
                    <option value="all">Todas las Categorías</option>
                    {categories.filter(c => c.enabled).map(cat => (
                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                </select>
            </div>

            <Heatmap data={data} title="Intensidad Anual" />

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-bg-card p-6 rounded-xl border border-white/5 shadow-sm">
                            <div className="mb-6">
                                <h3 className="font-bold text-white text-md">Semana a Semana</h3>
                                <p className="text-xs text-text-muted">Comparando actuales vs 7 días previos</p>
                            </div>
                            <div className="h-48">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={weeklyData}>
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                                        <Tooltip contentStyle={{ backgroundColor: '#111c16', border: '1px solid #ffffff10' }} cursor={{ fill: 'transparent' }} />
                                        <Bar dataKey="prev" fill="#334155" radius={[2, 2, 0, 0]} />
                                        <Bar dataKey="current" fill="#30e87a" radius={[2, 2, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="bg-bg-card p-6 rounded-xl border border-white/5 shadow-sm">
                            <div className="mb-6">
                                <h3 className="font-bold text-white text-md">Tendencia Mensual</h3>
                                <p className="text-xs text-text-muted">Sesiones activas por mes</p>
                            </div>
                            <div className="h-48">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={monthlyData}>
                                        <defs>
                                            <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#30e87a" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#30e87a" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                                        <Tooltip contentStyle={{ backgroundColor: '#111c16', border: '1px solid #ffffff10' }} />
                                        <Area type="monotone" dataKey="sessions" stroke="#30e87a" fillOpacity={1} fill="url(#colorSessions)" strokeWidth={3} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Smart Insights Sidebar */}
                <div className="lg:col-span-1">
                    <div className="bg-bg-card rounded-xl border border-white/5 shadow-sm overflow-hidden h-full flex flex-col">
                        <div className="p-6 border-b border-white/5">
                            <div className="flex items-center gap-2 mb-1">
                                <TrendingUp className="text-primary" size={20} />
                                <h3 className="font-bold text-white">Insights Inteligentes</h3>
                            </div>
                            <p className="text-xs text-text-muted">Observaciones generadas por IA</p>
                        </div>
                        <div className="p-6 space-y-6 flex-1">
                            <div className="flex gap-4">
                                <div className="mt-1 w-8 h-8 rounded bg-primary/10 flex items-center justify-center shrink-0">
                                    <ArrowUpRight className="text-primary" size={16} />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-white mb-1">Crecimiento Mensual</h4>
                                    <p className="text-xs text-text-muted leading-relaxed">Tu actividad general incrementó en un <span className="text-primary font-bold">15%</span> comparado al mes anterior.</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="mt-1 w-8 h-8 rounded bg-blue-500/10 flex items-center justify-center shrink-0">
                                    <Clock className="text-blue-500" size={16} />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-white mb-1">Pico de Productividad</h4>
                                    <p className="text-xs text-text-muted leading-relaxed">La mayoría de eventos ocurren entre <span className="text-white">9:00 AM - 11:30 AM</span>.</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="mt-1 w-8 h-8 rounded bg-yellow-500/10 flex items-center justify-center shrink-0">
                                    <AlertTriangle className="text-yellow-500" size={16} />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-white mb-1">Anomalía de Error</h4>
                                    <p className="text-xs text-text-muted leading-relaxed">Detectado un <span className="text-yellow-500">pico del 4%</span> en errores de API los miércoles.</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 border-t border-white/5">
                            <button className="w-full py-3 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold transition-colors">
                                VER REPORTE COMPLETO
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};