import React, { useState } from 'react';
import { SummaryCards } from '../components/SummaryCards';
import { Heatmap } from '../components/Heatmap';
import { LogTable } from '../components/LogTable';
import { CheckCircle, Calendar, Plus, Info } from 'lucide-react';
import { Modal } from '../components/Modal';
import { Category, HeatmapDay, ActivityLog } from '../types';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { Edit2, Trash2, X } from 'lucide-react';

interface OverviewProps {
    categories?: Category[];
}

export const Overview: React.FC<OverviewProps> = ({ categories = [] }) => {
    // Fetch logs from DB
    const logs = useLiveQuery(() => db.logs.toArray()) || [];

    const [filterCategory, setFilterCategory] = useState<string>('all');
    const [heatmapTimeRange, setHeatmapTimeRange] = useState<'1M' | '3M' | '6M' | '12M'>('12M');
    const [isHeatmapFullscreen, setIsHeatmapFullscreen] = useState(false);
    const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

    // Generate heatmap data from real logs
    const heatmapData: HeatmapDay[] = useLiveQuery(async () => {
        let allLogs = await db.logs.toArray();
        if (filterCategory !== 'all') {
            allLogs = allLogs.filter(log => log.category === filterCategory);
        }

        const daysMap = new Map<string, number>();

        // Group by date (YYYY-MM-DD local)
        allLogs.forEach(log => {
            if (log.dateObj) {
                // Use local date logic
                const year = log.dateObj.getFullYear();
                const month = String(log.dateObj.getMonth() + 1).padStart(2, '0');
                const day = String(log.dateObj.getDate()).padStart(2, '0');
                const dateKey = `${year}-${month}-${day}`;

                daysMap.set(dateKey, (daysMap.get(dateKey) || 0) + 1);
            }
        });

        // Calculate date range based on time filter
        const currentYear = new Date().getFullYear();
        const today = new Date();
        let start: Date;
        let end: Date = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));

        switch (heatmapTimeRange) {
            case '1M':
                start = new Date(end);
                start.setUTCDate(start.getUTCDate() - 30);
                break;
            case '3M':
                start = new Date(end);
                start.setUTCDate(start.getUTCDate() - 90);
                break;
            case '6M':
                start = new Date(end);
                start.setUTCDate(start.getUTCDate() - 180);
                break;
            case '12M':
            default:
                start = new Date(Date.UTC(currentYear, 0, 1));
                end = new Date(Date.UTC(currentYear, 11, 31));
                break;
        }

        const days: HeatmapDay[] = [];
        const loopDate = new Date(start);
        while (loopDate <= end) {
            // Use UTC methods to generate the string to match the loop, 
            // but we need to match the keys in daysMap which are local YYYY-MM-DD.
            // Wait, the previous logic for daysMap used LOCAL date.
            // To ensure 1-1 mapping, we should probably stick to one standard.
            // The previous user edit used local date: log.dateObj.getFullYear()...

            // So we should generate our loop using local date construction to match keys.
            // But 'currentYear' is local.

            const yearStr = loopDate.getUTCFullYear();
            const monthStr = String(loopDate.getUTCMonth() + 1).padStart(2, '0');
            const dayStr = String(loopDate.getUTCDate()).padStart(2, '0');
            const dateStr = `${yearStr}-${monthStr}-${dayStr}`;

            // Note: daysMap keys are generated from local time:
            // const dateKey = `${year}-${month}-${day}`;
            // If the user is in UTC+1, '2026-01-01' local might correspond to different UTC?
            // Actually, if we just want "YYYY-MM-DD" matching, we should be consistent.

            // Let's rely on the date string itself.
            // If the user saves a log at 2026-01-01 10:00 local time, the key is 2026-01-01.
            // Our loop generates 2026-01-01. They match string-wise.

            const count = daysMap.get(dateStr) || 0;

            let level: 0 | 1 | 2 | 3 | 4 = 0;
            if (count > 0) level = 1;
            if (count > 3) level = 2;
            if (count > 7) level = 3;
            if (count > 10) level = 4;

            days.push({ date: dateStr, count, level });
            loopDate.setUTCDate(loopDate.getUTCDate() + 1);
        }
        return days;
    }, [filterCategory, heatmapTimeRange]) || []; // Re-run when filterCategory or timeRange changes

    // Calculate weekly stats
    const weeklyStats = useLiveQuery(async () => {
        const now = new Date();
        const dayOfWeek = now.getDay(); // 0 (Sun) to 6 (Sat)
        const diffToMonday = (dayOfWeek + 6) % 7; // Days since Monday

        const monday = new Date(now);
        monday.setDate(now.getDate() - diffToMonday);
        monday.setHours(0, 0, 0, 0);

        const logs = await db.logs.where('dateObj').aboveOrEqual(monday).toArray();

        // Count unique days with activity this week
        const activeDays = new Set<string>();
        logs.forEach(log => {
            const d = log.dateObj;
            if (d) {
                const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
                activeDays.add(key);
            }
        });

        const count = activeDays.size;
        const goal = 7; // Or configurable
        const percentage = Math.round((count / goal) * 100);

        return { count, goal, percentage };
    }, []) || { count: 0, goal: 7, percentage: 0 };


    const [isLogModalOpen, setIsLogModalOpen] = useState(false);
    const [count, setCount] = useState(1); // Used for repetition count in modal
    const [selectedCategory, setSelectedCategory] = useState('');
    const [note, setNote] = useState('');

    // Fix: Initialize selectedDate with local YYYY-MM-DD
    const getTodayStr = () => {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    };

    const [selectedDate, setSelectedDate] = useState(getTodayStr());
    const [viewingDate, setViewingDate] = useState<string | null>(null);
    const [editingLogId, setEditingLogId] = useState<number | null>(null);

    // Logs for the selected viewing date
    const selectedDayLogs = logs.filter(log => {
        if (!viewingDate || !log.dateObj) return false;
        const d = log.dateObj;
        const logDateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        return logDateStr === viewingDate;
    });

    const handleDayClick = (date: string) => {
        setViewingDate(date);
    };

    const handleDeleteLog = (id: number) => {
        setDeleteConfirmId(id);
    };

    const confirmDelete = async () => {
        if (deleteConfirmId !== null) {
            await db.logs.delete(deleteConfirmId);
            setDeleteConfirmId(null);
        }
    };

    const cancelDelete = () => {
        setDeleteConfirmId(null);
    };

    const handleEditLog = (log: ActivityLog) => {
        if (!log.id) return;
        setViewingDate(null); // Close detail modal
        setEditingLogId(log.id);

        // Pre-fill form
        if (log.dateObj) {
            const d = log.dateObj;
            setSelectedDate(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
        }
        setSelectedCategory(log.category);
        setNote(log.eventName.replace(`Sesión de ${log.category}`, '').trim()); // Try to extract note if possible, otherwise it might just be the event name
        // Count extraction is elusive without storing it explicitly, defaulting to 1 or deriving from intensity if logic was strict
        setCount(1);

        setIsLogModalOpen(true);
    };

    const handleAddLog = async () => {
        if (!selectedCategory && categories.length > 0) setSelectedCategory(categories[0].name);

        const categoryToUse = selectedCategory || (categories.length > 0 ? categories[0].name : 'General');

        const [year, month, day] = selectedDate.split('-').map(Number);
        const now = new Date();
        // Create date object preserving selected date but current time
        const newDateObj = new Date(year, month - 1, day, now.getHours(), now.getMinutes());

        const logData = {
            timestamp: newDateObj.toLocaleString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }),
            dateObj: newDateObj,
            eventName: note || `Sesión de ${categoryToUse}`,
            category: categoryToUse,
            intensity: 50 + (count * 10), // Dummy intensity logic
            status: 'COMPLETED'
        };

        if (editingLogId) {
            await db.logs.update(editingLogId, { ...logData, status: 'COMPLETED' as const });
        } else {
            await db.logs.add({ ...logData, status: 'COMPLETED' } as any);
        }

        setIsLogModalOpen(false);
        setNote('');
        setCount(1);
        setEditingLogId(null);
        setSelectedDate(getTodayStr());
    };

    const currentYear = new Date().getFullYear();
    const dateRange = `1 Ene, ${currentYear} - 31 Dic, ${currentYear}`;

    // Calculate breakdown based on logs and categories
    const totalLogs = logs.length;
    const categoryStats = categories.map(cat => {
        const catLogs = logs.filter(log => log.category === cat.name).length;
        const percentage = totalLogs > 0 ? Math.round((catLogs / totalLogs) * 100) : 0;
        return { ...cat, percentage };
    }).sort((a, b) => b.percentage - a.percentage);

    const activeCategories = categoryStats.filter(c => c.enabled);

    const selectedCategoryColor = categories.find(c => c.name === filterCategory)?.color;

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-4 animate-in fade-in duration-500">
            {/* Enhanced Header with Gradient Background */}
            <div className="relative overflow-hidden bg-gradient-to-br from-bg-card via-bg-card to-primary/5 rounded-2xl border border-white/10 p-6 md:p-8 shadow-xl">
                {/* Decorative Background Elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-10 animate-pulse-slow"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/10 rounded-full blur-3xl -z-10 animate-pulse-slow" style={{ animationDelay: '1s' }}></div>

                {/* Header Content */}
                <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    {/* Title Section */}
                    <div className="space-y-2">
                        <h1 className="text-3xl md:text-4xl font-bold text-text-primary tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/80">
                            Resumen de Actividad
                        </h1>
                        <p className="text-text-muted text-sm md:text-base flex items-center gap-2">
                            <span className="inline-block w-2 h-2 bg-primary rounded-full animate-pulse"></span>
                            Bienvenido de nuevo.
                        </p>
                    </div>

                    {/* Actions Section */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                        {/* Date Range Badge (Desktop) */}
                        <div className="hidden lg:flex items-center bg-white/5 backdrop-blur-sm rounded-xl px-4 py-2.5 gap-2 border border-white/10 hover:border-primary/30 transition-all">
                            <Calendar size={16} className="text-primary" />
                            <span className="text-sm font-semibold text-text-primary">{dateRange}</span>
                        </div>

                        {/* Category Filter - Enhanced */}
                        <select
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-2.5 text-sm text-text-primary font-semibold focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none hover:border-primary/30 transition-all cursor-pointer"
                        >
                            <option value="all" className="bg-bg-dark">Todas las Categorías</option>
                            {categories.filter(c => c.enabled).map(c => (
                                <option key={c.id} value={c.name} className="bg-bg-dark">{c.name}</option>
                            ))}
                        </select>

                        {/* Register Button - Enhanced */}
                        <button
                            onClick={() => {
                                setEditingLogId(null);
                                setSelectedDate(getTodayStr());
                                setNote('');
                                setCount(1);
                                setIsLogModalOpen(true);
                            }}
                            className="group relative bg-primary hover:bg-primary-hover text-bg-dark font-bold px-6 py-2.5 rounded-xl text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:scale-105"
                        >
                            <Plus size={18} className="group-hover:rotate-90 transition-transform duration-200" />
                            <span>Registrar Evento</span>
                            {/* Shine effect */}
                            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-shine"></div>
                        </button>
                    </div>
                </div>
            </div>

            <SummaryCards />

            <div className="space-y-8">
                <div className="space-y-8">


                    <Heatmap
                        data={heatmapData}
                        title="Registro de Actividad"
                        subtitle={filterCategory === 'all' ? "Densidad diaria de todas las actividades" : `Densidad diaria de ${filterCategory}`}
                        customColor={selectedCategoryColor}
                        onDayClick={handleDayClick}
                        timeRange={heatmapTimeRange}
                        onTimeRangeChange={setHeatmapTimeRange}
                        onFullscreenToggle={() => setIsHeatmapFullscreen(true)}
                    />
                    {/* Cast logs to ActivityLog[] to match type if needed, though structure matches mostly */}
                    <LogTable
                        logs={logs as unknown as ActivityLog[]}
                        onEdit={handleEditLog}
                        onDelete={handleDeleteLog}
                    />
                </div>


            </div>

            {/* Day Detail Modal */}
            <Modal isOpen={!!viewingDate} onClose={() => setViewingDate(null)} title={`Actividad: ${new Date(viewingDate || '').toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`}>
                <div className="space-y-4">
                    {selectedDayLogs.length > 0 ? (
                        <div className="space-y-3">
                            {selectedDayLogs.map(log => {
                                const cat = categories.find(c => c.name === log.category);
                                return (
                                    <div key={log.id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between group">
                                        <div className="flex items-center gap-4">
                                            <div
                                                className="w-10 h-10 rounded-lg flex items-center justify-center border border-white/10 shrink-0"
                                                style={{ backgroundColor: `${cat?.color || '#30e87a'}20`, borderColor: `${cat?.color || '#30e87a'}30` }}
                                            >
                                                <div className="w-5 h-5 rounded-[2px]" style={{ backgroundColor: cat?.color || '#30e87a' }}></div>
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-white text-sm">{log.eventName}</h4>
                                                <p className="text-xs text-text-muted">{log.category} • {log.timestamp && log.timestamp.split(',')[1]?.trim()}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleEditLog(log)}
                                                className="p-2 hover:bg-white/10 rounded-lg text-text-muted hover:text-primary transition-colors"
                                                title="Editar"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => log.id !== undefined && handleDeleteLog(log.id)}
                                                className="p-2 hover:bg-white/10 rounded-lg text-text-muted hover:text-red-400 transition-colors"
                                                title="Eliminar"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="py-8 text-center">
                            <p className="text-text-muted">No hay actividad registrada para este día.</p>
                            <button
                                onClick={() => {
                                    setViewingDate(null);
                                    if (viewingDate) setSelectedDate(viewingDate); // Set date to the viewed date
                                    setIsLogModalOpen(true);
                                }}
                                className="mt-4 text-primary text-sm font-semibold hover:underline"
                            >
                                Registrar actividad para este día
                            </button>
                        </div>
                    )}
                </div>
            </Modal>

            <Modal isOpen={isLogModalOpen} onClose={() => setIsLogModalOpen(false)} title={editingLogId ? "Editar Actividad" : "Registrar Actividad"}>
                <div className="space-y-8">
                    <div className="space-y-2">
                        <label className="block text-xs font-bold text-text-muted uppercase tracking-widest">Fecha</label>
                        <div className="relative">
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all [&::-webkit-calendar-picker-indicator]:invert"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-xs font-bold text-text-muted uppercase tracking-widest">Categoría del Evento</label>
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all appearance-none"
                        >
                            {categories.filter(c => c.enabled).map(c => (
                                <option key={c.id} value={c.name}>{c.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-xs font-bold text-text-muted uppercase tracking-widest">Activaciones</label>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setCount(Math.max(1, count - 1))}
                                className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center hover:bg-primary/20 text-white transition-colors"
                            >
                                -
                            </button>
                            <input
                                type="number"
                                value={count}
                                readOnly
                                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-center text-lg font-bold text-white focus:ring-1 focus:ring-primary outline-none"
                            />
                            <button
                                onClick={() => setCount(count + 1)}
                                className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center hover:bg-primary/20 text-white transition-colors"
                            >
                                +
                            </button>
                        </div>
                        <p className="text-[11px] text-text-muted mt-1 italic">¿Cuántas veces completaste esto hoy?</p>
                    </div>



                    <div className="pt-4 border-t border-white/10 flex items-center gap-3">
                        <button onClick={handleAddLog} className="flex-1 py-3.5 bg-primary text-bg-dark font-bold rounded-xl text-sm hover:opacity-90 transition-all">
                            Registrar
                        </button>
                        <button onClick={() => setIsLogModalOpen(false)} className="px-6 py-3.5 border border-white/10 rounded-xl text-sm font-medium text-white hover:bg-white/5 transition-colors">
                            Cancelar
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Fullscreen Heatmap Modal */}
            <Modal
                isOpen={isHeatmapFullscreen}
                onClose={() => setIsHeatmapFullscreen(false)}
                title="Vista Completa - Registro de Actividad"
            >
                <div className="space-y-4">
                    <p className="text-sm text-text-muted">
                        Rota tu dispositivo a modo horizontal para una mejor visualización
                    </p>
                    <div className="overflow-x-auto">
                        <Heatmap
                            data={heatmapData}
                            subtitle={filterCategory === 'all' ? "Todas las categorías" : filterCategory}
                            customColor={selectedCategoryColor}
                            onDayClick={(date) => {
                                setIsHeatmapFullscreen(false);
                                handleDayClick(date);
                            }}
                            timeRange={heatmapTimeRange}
                            onTimeRangeChange={setHeatmapTimeRange}
                        />
                    </div>
                </div>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={deleteConfirmId !== null}
                onClose={cancelDelete}
                title="Confirmar Eliminación"
            >
                <div className="space-y-6">
                    <p className="text-text-muted">
                        ¿Estás seguro de que quieres eliminar este registro? Esta acción no se puede deshacer.
                    </p>
                    <div className="flex gap-3 justify-end">
                        <button
                            onClick={cancelDelete}
                            className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-text-muted hover:text-white transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={confirmDelete}
                            className="px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 transition-colors font-medium"
                        >
                            Eliminar
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};