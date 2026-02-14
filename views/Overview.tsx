import React, { useState, useEffect, useCallback } from 'react';
import { SummaryCards } from '../components/SummaryCards';
import { Heatmap } from '../components/Heatmap';
import { LogTable } from '../components/LogTable';
import { CheckCircle, Calendar, Plus, Info } from 'lucide-react';
import { Modal } from '../components/Modal';
import { Category, HeatmapDay, ActivityLog } from '../types';
import { api, Log } from '../lib/api';
import { Edit2, Trash2, X } from 'lucide-react';

interface OverviewProps {
    categories?: Category[];
    onCategoriesChange?: () => void;
}

export const Overview: React.FC<OverviewProps> = ({ categories = [], onCategoriesChange }) => {
    const [logs, setLogs] = useState<ActivityLog[]>([]);
    const [filterCategory, setFilterCategory] = useState<string>('all');
    const [heatmapTimeRange, setHeatmapTimeRange] = useState<'1M' | '3M' | '6M' | '12M'>('12M');

    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

    // Fetch logs from API
    const fetchLogs = useCallback(async () => {
        try {
            const data = await api.logs.getAll();
            // Transform date strings to Date objects to match ActivityLog interface
            const formattedLogs = data.map(log => ({
                ...log,
                dateObj: new Date(log.dateObj)
            }));
            setLogs(formattedLogs);
        } catch (err) {
            console.error('Failed to fetch logs:', err);
        }
    }, []);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    // Helper to get local date key
    const getLocalDateKey = (date: Date | string) => {
        const d = typeof date === 'string' ? new Date(date) : date;
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // Generate heatmap data from logs
    const heatmapData: HeatmapDay[] = (() => {
        let filteredLogs = logs;
        if (filterCategory !== 'all') {
            // Filter by ID if available, otherwise name for backward compatibility
            filteredLogs = logs.filter(log => (log.categoryId === filterCategory) || (log.category === filterCategory));
        }

        const daysMap = new Map<string, number>();
        filteredLogs.forEach(log => {
            if (log.dateObj) {
                const dateKey = getLocalDateKey(log.dateObj);
                daysMap.set(dateKey, (daysMap.get(dateKey) || 0) + 1);
            }
        });

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
            const yearStr = loopDate.getUTCFullYear();
            const monthStr = String(loopDate.getUTCMonth() + 1).padStart(2, '0');
            const dayStr = String(loopDate.getUTCDate()).padStart(2, '0');
            const dateStr = `${yearStr}-${monthStr}-${dayStr}`;

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
    })();

    const [isLogModalOpen, setIsLogModalOpen] = useState(false);
    const [count, setCount] = useState(1);
    const [selectedCategory, setSelectedCategory] = useState(''); // Stores ID now
    const [note, setNote] = useState('');

    const getTodayStr = () => {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    };

    const [selectedDate, setSelectedDate] = useState(getTodayStr());
    const [viewingDate, setViewingDate] = useState<string | null>(null);
    const [editingLogId, setEditingLogId] = useState<string | null>(null);

    // Logs for the selected viewing date
    const selectedDayLogs = logs.filter(log => {
        if (!viewingDate || !log.dateObj) return false;
        const logDateStr = getLocalDateKey(log.dateObj);
        return logDateStr === viewingDate;
    });

    const handleDayClick = (date: string) => {
        setViewingDate(date);
    };

    const handleDeleteLog = (id: string | number) => {
        setDeleteConfirmId(String(id));
    };

    const confirmDelete = async () => {
        if (deleteConfirmId !== null) {
            await api.logs.delete(deleteConfirmId);
            setDeleteConfirmId(null);
            fetchLogs(); // Refresh
        }
    };

    const cancelDelete = () => {
        setDeleteConfirmId(null);
    };

    const handleEditLog = (log: ActivityLog) => {
        if (!log.id) return;
        setViewingDate(null);
        setEditingLogId(String(log.id));

        if (log.dateObj) {
            const d = typeof log.dateObj === 'string' ? new Date(log.dateObj) : log.dateObj;
            setSelectedDate(getLocalDateKey(d));
        }
        // Set selected category ID
        setSelectedCategory(log.categoryId || categories.find(c => c.name === log.category)?.id || '');
        setNote(log.eventName.replace(`Sesión de ${log.category}`, '').trim());
        setCount(1);
        setIsLogModalOpen(true);
    };

    const handleAddLog = async () => {
        // Default to first category ID if none selected
        if (!selectedCategory && categories.length > 0) setSelectedCategory(categories[0].id);

        const categoryIdToUse = selectedCategory || (categories.length > 0 ? categories[0].id : '');
        const categoryObj = categories.find(c => c.id === categoryIdToUse);
        const categoryName = categoryObj ? categoryObj.name : 'General';

        const [year, month, day] = selectedDate.split('-').map(Number);
        const now = new Date();
        const newDateObj = new Date(year, month - 1, day, now.getHours(), now.getMinutes());

        const logData = {
            timestamp: newDateObj.toLocaleString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }),
            dateObj: newDateObj.toISOString(),
            eventName: note || `Sesión de ${categoryName}`,
            category: categoryName,
            categoryId: categoryIdToUse,
            intensity: 50 + (count * 10),
            status: 'COMPLETED' as const,
        };

        if (editingLogId) {
            await api.logs.update(editingLogId, logData);
        } else {
            await api.logs.create(logData);
        }

        setIsLogModalOpen(false);
        setNote('');
        setCount(1);
        setEditingLogId(null);
        setSelectedDate(getTodayStr());
        fetchLogs(); // Refresh
    };

    const currentYear = new Date().getFullYear();
    const dateRange = `1 Ene, ${currentYear} - 31 Dic, ${currentYear}`;

    const totalLogs = logs.length;
    const categoryStats = categories.map(cat => {
        // Filter by ID
        const catLogs = logs.filter(log => log.categoryId === cat.id).length;
        const percentage = totalLogs > 0 ? Math.round((catLogs / totalLogs) * 100) : 0;
        return { ...cat, percentage };
    }).sort((a, b) => b.percentage - a.percentage);

    const activeCategories = categoryStats.filter(c => c.enabled);

    const selectedCategoryColor = categories.find(c => c.id === filterCategory)?.color;

    return (
        <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-6 animate-in fade-in duration-700">

            {/* Bento Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

                {/* Header Section - Spans Full Width */}
                <div className="col-span-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <h1 className="text-4xl font-bold tracking-tight text-white">
                                Resumen
                            </h1>
                            <button
                                onClick={() => {
                                    setEditingLogId(null);
                                    setSelectedDate(getTodayStr());
                                    setNote('');
                                    setCount(1);
                                    setIsLogModalOpen(true);
                                }}
                                className="group relative bg-primary hover:bg-primary-hover text-white font-bold px-4 py-2 rounded-xl text-sm transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5"
                            >
                                <Plus size={16} className="group-hover:rotate-90 transition-transform duration-300" />
                                <span>Registrar</span>
                            </button>
                        </div>
                        <p className="text-text-muted text-base flex items-center gap-2 font-medium">
                            <span className="inline-block w-2 h-2 bg-primary rounded-full animate-pulse"></span>
                            Bienvenido de nuevo
                        </p>
                    </div>

                    <div className="hidden md:flex items-center gap-3">
                        <div className="flex items-center bg-white/5 backdrop-blur-md rounded-full px-5 py-2.5 gap-2 border border-white/10 hover:border-primary/30 transition-all group">
                            <Calendar size={16} className="text-text-muted group-hover:text-primary transition-colors" />
                            <span className="text-sm font-semibold text-text-muted group-hover:text-white transition-colors">{dateRange}</span>
                        </div>
                    </div>
                </div>

                {/* Summary Cards - Spans Full Width */}
                <div className="col-span-12">
                    <SummaryCards
                        logs={logs}
                        categories={categories}
                    />
                </div>

                {/* Main Content Area */}

                {/* Heatmap - Large Cell (8/12 on large screens) */}
                <div className="col-span-12 lg:col-span-8">
                    <div className="glass-card rounded-3xl p-6 h-full border border-white/5 relative overflow-hidden">
                        <Heatmap
                            data={heatmapData}
                            title="Mapa de Actividad"
                            customColor={selectedCategoryColor}
                            onDayClick={handleDayClick}
                            timeRange={heatmapTimeRange}
                            onTimeRangeChange={setHeatmapTimeRange}
                            categories={categories}
                            selectedCategory={filterCategory}
                            onCategoryChange={setFilterCategory}
                        />
                        {/* Subtle background decoration */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] -z-10 pointer-events-none"></div>
                    </div>
                </div>

                {/* Log Table / Sidebar - Side Cell (4/12 on large screens) */}
                <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
                    {/* Recent Logs */}
                    <div className="glass-card rounded-3xl p-6 border border-white/5 h-full relative overflow-hidden">
                        <LogTable
                            logs={logs}
                            categories={categories}
                            onEdit={handleEditLog}
                            onDelete={handleDeleteLog}
                        />
                        {/* Subtle background decoration */}
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/5 rounded-full blur-[80px] -z-10 pointer-events-none"></div>
                    </div>
                </div>

            </div>

            {/* Day Detail Modal */}
            <Modal isOpen={!!viewingDate} onClose={() => setViewingDate(null)} title={`Actividad: ${new Date(viewingDate || '').toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`}>
                <div className="space-y-4">
                    {selectedDayLogs.length > 0 ? (
                        <div className="space-y-3">
                            {selectedDayLogs.map(log => {
                                const cat = categories.find(c => c.name === log.category); // Keep name fallback or use ID if available
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
                                    if (viewingDate) setSelectedDate(viewingDate);
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
                                <option key={c.id} value={c.id}>{c.name}</option>
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