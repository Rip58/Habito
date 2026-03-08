import React, { useState, useEffect, useCallback } from 'react';
import { SummaryCards } from '../components/SummaryCards';
import { Heatmap } from '../components/Heatmap';
import { LogTable } from '../components/LogTable';
import { Plus, Calendar } from 'lucide-react';
import { Modal } from '../components/Modal';
import { Category, HeatmapDay, ActivityLog } from '../types';
import { api, Log } from '../lib/api';
import { Edit2, Trash2 } from 'lucide-react';

interface OverviewProps {
    categories?: Category[];
    onCategoriesChange?: () => void;
}

export const Overview: React.FC<OverviewProps> = ({ categories = [], onCategoriesChange }) => {
    const [logs, setLogs] = useState<ActivityLog[]>([]);
    const [filterCategory, setFilterCategory] = useState<string>('all');
    const [heatmapTimeRange, setHeatmapTimeRange] = useState<'1M' | '3M' | '6M' | '12M'>('12M');
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

    const fetchLogs = useCallback(async () => {
        try {
            const data = await api.logs.getAll();
            const formattedLogs = data.map(log => ({ ...log, dateObj: new Date(log.dateObj) }));
            setLogs(formattedLogs);
        } catch (err: any) {
            console.error('Failed to fetch logs:', err);
            alert('Debug: Failed to fetch logs (GET). ' + (err.message || JSON.stringify(err)));
        }
    }, []);

    useEffect(() => { fetchLogs(); }, [fetchLogs]);

    const getLocalDateKey = (date: Date | string) => {
        const d = typeof date === 'string' ? new Date(date) : date;
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    };

    // Generate heatmap data
    const heatmapData: HeatmapDay[] = (() => {
        let filteredLogs = logs;
        if (filterCategory !== 'all') {
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
            case '1M': start = new Date(end); start.setUTCDate(start.getUTCDate() - 30); break;
            case '3M': start = new Date(end); start.setUTCDate(start.getUTCDate() - 90); break;
            case '6M': start = new Date(end); start.setUTCDate(start.getUTCDate() - 180); break;
            case '12M':
            default:
                start = new Date(Date.UTC(currentYear, 0, 1));
                end = new Date(Date.UTC(currentYear, 11, 31));
                break;
        }

        const days: HeatmapDay[] = [];
        const loopDate = new Date(start);
        while (loopDate <= end) {
            const dateStr = `${loopDate.getUTCFullYear()}-${String(loopDate.getUTCMonth() + 1).padStart(2, '0')}-${String(loopDate.getUTCDate()).padStart(2, '0')}`;
            const count = daysMap.get(dateStr) || 0;
            let level: 0 | 1 | 2 | 3 | 4 = 0;
            if (count > 0) level = 4;
            days.push({ date: dateStr, count, level });
            loopDate.setUTCDate(loopDate.getUTCDate() + 1);
        }
        return days;
    })();

    // Log Modal state
    const [isLogModalOpen, setIsLogModalOpen] = useState(false);
    const [count, setCount] = useState(1);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [note, setNote] = useState('');

    const getTodayStr = () => {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    };

    const [selectedDate, setSelectedDate] = useState(getTodayStr());
    const [viewingDate, setViewingDate] = useState<string | null>(null);
    const [editingLogId, setEditingLogId] = useState<string | null>(null);

    const selectedDayLogs = logs.filter(log => {
        if (!viewingDate || !log.dateObj) return false;
        return getLocalDateKey(log.dateObj) === viewingDate;
    });

    const handleDeleteLog = (id: string | number) => setDeleteConfirmId(String(id));

    const confirmDelete = async () => {
        if (deleteConfirmId !== null) {
            await api.logs.delete(deleteConfirmId);
            setDeleteConfirmId(null);
            fetchLogs();
        }
    };

    const handleEditLog = (log: ActivityLog) => {
        if (!log.id) return;
        setViewingDate(null);
        setEditingLogId(String(log.id));
        if (log.dateObj) {
            const d = typeof log.dateObj === 'string' ? new Date(log.dateObj) : log.dateObj;
            setSelectedDate(getLocalDateKey(d));
        }
        setSelectedCategory(log.categoryId || categories.find(c => c.name === log.category)?.id || '');
        setNote(log.eventName.replace(`Sesión de ${log.category}`, '').trim());
        setCount(1);
        setIsLogModalOpen(true);
    };

    const handleAddLog = async () => {
        try {
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
            fetchLogs();
        } catch (error: any) {
            console.error('Save failed:', error);
            alert('Error al guardar: ' + (error.message || 'Error desconocido'));
        }
    };

    const currentYear = new Date().getFullYear();
    const selectedCategoryColor = categories.find(c => c.id === filterCategory)?.color;

    return (
        <div className="p-4 md:p-6 max-w-[1600px] mx-auto space-y-5 fade-in">

            {/* Page Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                <div>
                    <h1 className="text-2xl font-semibold text-foreground tracking-tight">Resumen</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        {`1 Ene, ${currentYear} – 31 Dic, ${currentYear}`}
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => {
                            setEditingLogId(null);
                            setSelectedDate(getTodayStr());
                            setNote('');
                            setCount(1);
                            setIsLogModalOpen(true);
                        }}
                        className="h-10 bg-primary text-primary-foreground font-semibold px-4 rounded-md text-sm transition-all flex items-center gap-2 hover:opacity-90 active:scale-[0.99]"
                    >
                        <Plus size={16} />
                        <span>Registrar</span>
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <SummaryCards logs={logs} categories={categories} />

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

                {/* Heatmap (8/12) */}
                <div className="lg:col-span-8">
                    <div className="rounded-lg border bg-card/40 border-border/40 p-5 h-full shadow-sm">
                        <Heatmap
                            data={heatmapData}
                            title="Mapa de Actividad"
                            customColor={selectedCategoryColor}
                            onDayClick={(date) => setViewingDate(date)}
                            timeRange={heatmapTimeRange}
                            onTimeRangeChange={setHeatmapTimeRange}
                            categories={categories}
                            selectedCategory={filterCategory}
                            onCategoryChange={setFilterCategory}
                        />
                    </div>
                </div>

                {/* Log Table (4/12) */}
                <div className="lg:col-span-4">
                    <div className="rounded-lg border bg-card/40 border-border/40 p-5 h-full shadow-sm">
                        <LogTable
                            logs={logs}
                            categories={categories}
                            onEdit={handleEditLog}
                            onDelete={handleDeleteLog}
                        />
                    </div>
                </div>
            </div>

            {/* ── Day Detail Modal ─────────────────────────────── */}
            <Modal
                isOpen={!!viewingDate}
                onClose={() => setViewingDate(null)}
                title={viewingDate
                    ? new Date(viewingDate).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
                    : 'Actividad del día'
                }
            >
                <div className="space-y-2">
                    {selectedDayLogs.length > 0 ? (
                        selectedDayLogs.map(log => {
                            const cat = categories.find(c => c.name === log.category);
                            return (
                                <div
                                    key={log.id}
                                    className="group flex items-center gap-3 px-4 py-3 rounded-xl bg-card/40 border border-border/40 hover:bg-card/70 transition-all duration-200"
                                >
                                    <div
                                        className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0 border"
                                        style={{
                                            backgroundColor: `${cat?.color || 'var(--primary)'}15`,
                                            borderColor: `${cat?.color || 'var(--primary)'}25`,
                                        }}
                                    >
                                        <div
                                            className="w-3 h-3 rounded-full"
                                            style={{ backgroundColor: cat?.color || 'var(--primary)' }}
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-foreground">{log.eventName}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {log.category} · {log.timestamp?.split(',')[1]?.trim()}
                                        </p>
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleEditLog(log)}
                                            className="p-1.5 hover:bg-accent rounded-md text-muted-foreground hover:text-primary transition-colors"
                                        >
                                            <Edit2 size={13} />
                                        </button>
                                        <button
                                            onClick={() => log.id !== undefined && handleDeleteLog(log.id)}
                                            className="p-1.5 hover:bg-destructive/10 rounded-md text-muted-foreground hover:text-destructive transition-colors"
                                        >
                                            <Trash2 size={13} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="py-8 text-center">
                            <p className="text-sm text-muted-foreground">No hay actividad para este día.</p>
                            <button
                                onClick={() => {
                                    setViewingDate(null);
                                    if (viewingDate) setSelectedDate(viewingDate);
                                    setIsLogModalOpen(true);
                                }}
                                className="mt-3 text-sm font-semibold text-primary hover:underline"
                            >
                                Registrar actividad
                            </button>
                        </div>
                    )}
                </div>
            </Modal>

            {/* ── Add / Edit Log Modal ─────────────────────────── */}
            <Modal
                isOpen={isLogModalOpen}
                onClose={() => setIsLogModalOpen(false)}
                title={editingLogId ? 'Editar Actividad' : 'Registrar Actividad'}
            >
                <div className="space-y-5">
                    {/* Date */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Fecha</label>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="h-10 w-full bg-background border border-input rounded-md px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-ring/30 focus:border-ring outline-none transition-all [&::-webkit-calendar-picker-indicator]:opacity-50"
                        />
                    </div>

                    {/* Category */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Categoría</label>
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="h-10 w-full bg-background border border-input rounded-md px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-ring/30 focus:border-ring outline-none transition-all appearance-none"
                        >
                            {categories.filter(c => c.enabled).map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Activations */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Activaciones</label>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCount(Math.max(1, count - 1))}
                                className="h-10 w-10 rounded-md bg-muted hover:bg-accent text-foreground flex items-center justify-center transition-colors text-lg font-medium shrink-0"
                            >
                                −
                            </button>
                            <div className="flex-1 h-10 bg-primary/10 border border-primary/20 rounded-md flex items-center justify-center">
                                <span className="text-xl font-semibold text-primary tabular-nums">{count}</span>
                            </div>
                            <button
                                onClick={() => setCount(count + 1)}
                                className="h-10 w-10 rounded-md bg-muted hover:bg-accent text-foreground flex items-center justify-center transition-colors text-lg font-medium shrink-0"
                            >
                                +
                            </button>
                        </div>
                        <p className="text-xs text-muted-foreground">¿Cuántas veces lo completaste hoy?</p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2 border-t border-border/40">
                        <button
                            onClick={handleAddLog}
                            className="flex-1 h-10 bg-primary text-primary-foreground font-semibold rounded-md text-sm hover:opacity-90 transition-all active:scale-[0.99]"
                        >
                            {editingLogId ? 'Guardar cambios' : 'Registrar'}
                        </button>
                        <button
                            onClick={() => setIsLogModalOpen(false)}
                            className="px-5 h-10 border border-border rounded-md text-sm font-medium text-foreground hover:bg-accent transition-colors"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            </Modal>

            {/* ── Delete Confirmation Modal ────────────────────── */}
            <Modal
                isOpen={deleteConfirmId !== null}
                onClose={() => setDeleteConfirmId(null)}
                title="Confirmar eliminación"
            >
                <div className="space-y-5">
                    <p className="text-sm text-muted-foreground">
                        ¿Estás seguro de que quieres eliminar este registro? Esta acción no se puede deshacer.
                    </p>
                    <div className="flex gap-2 justify-end">
                        <button
                            onClick={() => setDeleteConfirmId(null)}
                            className="px-4 h-9 rounded-md border border-border text-sm font-medium text-foreground hover:bg-accent transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={confirmDelete}
                            className="px-4 h-9 rounded-md bg-destructive/10 hover:bg-destructive/20 text-destructive text-sm font-medium transition-colors"
                        >
                            Eliminar
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};