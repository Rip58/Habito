import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { SummaryCards } from '../components/SummaryCards';
import { Heatmap } from '../components/Heatmap';
import { LogTable } from '../components/LogTable';
import { Plus, ChevronDown, ChevronUp, Zap, X, Check } from 'lucide-react';
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
    const [error, setError] = useState<string | null>(null);
    const [markingId, setMarkingId] = useState<string | null>(null);
    const [heatmapTimeRange, setHeatmapTimeRange] = useState<'1M' | '3M' | '6M' | '12M'>('12M');
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
    const [selectedAccount, setSelectedAccount] = useState(
        () => (typeof window !== 'undefined' && localStorage.getItem('habito_selected_account')) || 'all'
    );
    const [isHeatmapExpanded, setIsHeatmapExpanded] = useState(true);

    // Ratio selector (header button + popover)
    const [isRatioOpen, setIsRatioOpen] = useState(false);
    const [ratioNum, setRatioNum] = useState(
        () => (typeof window !== 'undefined' && localStorage.getItem('habito_ratio_num')) || categories[0]?.id || 'all'
    );
    const [ratioDenom, setRatioDenom] = useState(
        () => (typeof window !== 'undefined' && localStorage.getItem('habito_ratio_denom')) || categories[1]?.id || 'all'
    );

    useEffect(() => {
        localStorage.setItem('habito_selected_account', selectedAccount);
    }, [selectedAccount]);

    useEffect(() => {
        localStorage.setItem('habito_ratio_num', ratioNum);
    }, [ratioNum]);

    useEffect(() => {
        localStorage.setItem('habito_ratio_denom', ratioDenom);
    }, [ratioDenom]);

    const fetchLogs = useCallback(async () => {
        try {
            const data = await api.logs.getAll();
            const formattedLogs = data.map(log => ({ ...log, dateObj: new Date(log.dateObj) }));
            setLogs(formattedLogs);
            setError(null);
        } catch (err) {
            console.error('Failed to fetch logs:', err);
            setError('No se pudieron cargar los registros.');
        }
    }, []);

    useEffect(() => { fetchLogs(); }, [fetchLogs]);

    const getLocalDateKey = (date: Date | string) => {
        const d = typeof date === 'string' ? new Date(date) : date;
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    };

    // Un solo recorrido de los logs y un solo rango de fechas para TODAS las
    // categorías, memorizado. Antes esto se recalculaba por categoría en cada
    // render, dentro del propio JSX.
    const heatmapByCategory = useMemo(() => {
        const counts = new Map<string, Map<string, number>>();
        logs.forEach(log => {
            if (!log.dateObj) return;
            const dateKey = getLocalDateKey(log.dateObj);
            for (const key of [log.categoryId, log.category]) {
                if (!key) continue;
                let days = counts.get(key);
                if (!days) { days = new Map(); counts.set(key, days); }
                days.set(dateKey, (days.get(dateKey) || 0) + 1);
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

        const dateKeys: string[] = [];
        const loopDate = new Date(start);
        while (loopDate <= end) {
            dateKeys.push(`${loopDate.getUTCFullYear()}-${String(loopDate.getUTCMonth() + 1).padStart(2, '0')}-${String(loopDate.getUTCDate()).padStart(2, '0')}`);
            loopDate.setUTCDate(loopDate.getUTCDate() + 1);
        }

        const byCategory = new Map<string, HeatmapDay[]>();
        categories.forEach(cat => {
            const days = counts.get(cat.id) ?? counts.get(cat.name) ?? new Map<string, number>();
            byCategory.set(cat.id, dateKeys.map(date => {
                const count = days.get(date) || 0;
                // Cinco pasos reales: el dato ya estaba, antes se aplastaba a 0 ó 4.
                const level = (count === 0 ? 0 : count >= 4 ? 4 : count) as 0 | 1 | 2 | 3 | 4;
                return { date, count, level };
            }));
        });
        return byCategory;
    }, [logs, categories, heatmapTimeRange]);

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
                intensity: 1,
                status: 'COMPLETED' as const,
            };

            if (editingLogId) {
                await api.logs.update(editingLogId, logData);
            } else {
                // El contador crea N registros de verdad. Antes solo cifraba el
                // número en `intensity`, un campo que no lee nadie: el heatmap y
                // las tarjetas cuentan filas, así que registrar 5 veces contaba 1.
                await Promise.all(
                    Array.from({ length: Math.max(1, count) }, () => api.logs.create(logData)),
                );
            }

            setIsLogModalOpen(false);
            setNote('');
            setCount(1);
            setEditingLogId(null);
            setSelectedDate(getTodayStr());
            fetchLogs();
        } catch (err) {
            console.error('Save failed:', err);
            setError('No se pudo guardar el registro. Inténtalo de nuevo.');
        }
    };

    const currentYear = new Date().getFullYear();
    const enabledCategories = categories.filter(c => c.enabled);
    const heatmapCategories = selectedAccount === 'all'
        ? enabledCategories
        : enabledCategories.filter(c => c.id === selectedAccount);

    const getFilteredLogCount = (categoryId: string) =>
        categoryId === 'all' ? logs.length : logs.filter(l => (l.categoryId === categoryId) || (l.category === categoryId)).length;
    const ratioNumCount = getFilteredLogCount(ratioNum);
    const ratioDenomCount = getFilteredLogCount(ratioDenom);
    const ratioPercent = ratioDenomCount === 0 ? 0 : Math.round((ratioNumCount / ratioDenomCount) * 100);

    // ¿Qué hábitos llevo hechos hoy? Un hábito cuenta como hecho si tiene al
    // menos un registro con la fecha local de hoy.
    const todayKey = getTodayStr();
    const todayRows = useMemo(() => {
        const doneKeys = new Set<string>();
        logs.forEach(log => {
            if (!log.dateObj || getLocalDateKey(log.dateObj) !== todayKey) return;
            if (log.categoryId) doneKeys.add(log.categoryId);
            if (log.category) doneKeys.add(log.category);
        });
        return enabledCategories.map(cat => ({
            cat,
            done: doneKeys.has(cat.id) || doneKeys.has(cat.name),
        }));
    }, [logs, enabledCategories, todayKey]);

    const todayDone = todayRows.filter(r => r.done).length;
    const todayPercent = todayRows.length === 0 ? 0 : Math.round((todayDone / todayRows.length) * 100);

    const handleQuickLog = async (cat: Category) => {
        setMarkingId(cat.id);
        try {
            const now = new Date();
            await api.logs.create({
                timestamp: now.toLocaleString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }),
                dateObj: now.toISOString(),
                eventName: `Sesión de ${cat.name}`,
                category: cat.name,
                categoryId: cat.id,
                intensity: 1,
                status: 'COMPLETED',
            });
            await fetchLogs();
        } catch (err) {
            console.error('Quick log failed:', err);
            setError('No se pudo registrar el hábito.');
        } finally {
            setMarkingId(null);
        }
    };

    return (
        <>
        <div className="p-4 md:p-6 max-w-[1600px] mx-auto space-y-5 fade-in">

            {/* Page Header */}
            <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-semibold text-foreground tracking-tight">Resumen</h1>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            {`1 Ene, ${currentYear} – 31 Dic, ${currentYear}`}
                        </p>
                    </div>

                    <button
                        onClick={() => {
                            setEditingLogId(null);
                            setSelectedDate(getTodayStr());
                            setNote('');
                            setCount(1);
                            setIsLogModalOpen(true);
                        }}
                        className="h-10 bg-primary text-primary-foreground font-semibold px-4 rounded-md text-sm transition-all flex items-center gap-2 hover:opacity-90 active:scale-[0.99] shrink-0"
                    >
                        <Plus size={16} />
                        <span>Registrar</span>
                    </button>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    <div className="relative">
                        <select
                            value={selectedAccount}
                            onChange={(e) => setSelectedAccount(e.target.value)}
                            className="h-10 appearance-none bg-muted border border-border text-sm font-medium text-foreground rounded-md pl-3 pr-8 focus:outline-none focus:ring-1 focus:ring-ring/50 cursor-pointer transition-colors"
                        >
                            <option value="all">Todas las cuentas</option>
                            {enabledCategories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                        <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                    </div>

                    {/* Ratio selector — button that opens a popover to pick the two categories to compare */}
                    <div className="relative">
                        <button
                            onClick={() => setIsRatioOpen(!isRatioOpen)}
                            className="h-10 bg-muted border border-border text-sm font-medium text-foreground rounded-md pl-3 pr-3 flex items-center gap-2 transition-colors"
                        >
                            <Zap size={14} className="text-primary" />
                            <span>Ratio</span>
                            <span className="text-muted-foreground tabular-nums">{ratioPercent}%</span>
                            <ChevronDown size={14} className={`text-muted-foreground transition-transform ${isRatioOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isRatioOpen && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setIsRatioOpen(false)} />
                                <div className="absolute right-0 top-full mt-2 w-64 rounded-lg border bg-card border-border shadow-lg p-4 z-50">
                                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Comparar cuentas</p>
                                    <div className="flex flex-col gap-1.5 mb-3">
                                        <select
                                            value={ratioNum}
                                            onChange={(e) => setRatioNum(e.target.value)}
                                            className="appearance-none bg-muted border border-border text-xs font-semibold text-foreground rounded-md pl-2.5 pr-6 py-1.5 focus:outline-none focus:ring-1 focus:ring-ring/50 cursor-pointer transition-colors"
                                        >
                                            <option value="all">Todas</option>
                                            {enabledCategories.map(cat => (
                                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                                            ))}
                                        </select>
                                        <div className="h-px bg-border w-full" />
                                        <select
                                            value={ratioDenom}
                                            onChange={(e) => setRatioDenom(e.target.value)}
                                            className="appearance-none bg-muted border border-border text-xs font-semibold text-foreground rounded-md pl-2.5 pr-6 py-1.5 focus:outline-none focus:ring-1 focus:ring-ring/50 cursor-pointer transition-colors"
                                        >
                                            <option value="all">Todas</option>
                                            {enabledCategories.map(cat => (
                                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <span className="text-2xl font-semibold text-foreground tabular-nums">{ratioPercent}%</span>
                                    <p className="text-xs text-muted-foreground mt-1 font-medium">{ratioNumCount} / {ratioDenomCount} eventos</p>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
            {error && (
                <div role="alert" className="flex items-center gap-2.5 rounded-md border border-destructive/30 bg-destructive/10 px-3.5 py-2.5 text-sm font-medium text-destructive">
                    <span className="flex-1">{error}</span>
                    <button onClick={() => setError(null)} aria-label="Descartar" className="shrink-0 rounded-md p-1 hover:bg-destructive/10">
                        <X size={14} />
                    </button>
                </div>
            )}


            {/* ── Hoy ──────────────────────────────────────────── */}
            {todayRows.length > 0 && (
                <section aria-labelledby="hoy-heading" className="space-y-2.5">
                    <h2 id="hoy-heading" className="text-base font-semibold text-foreground">Hoy</h2>

                    <div className="rounded-lg border bg-card border-border shadow-sm overflow-hidden">
                        <div className="p-4 space-y-3">
                            <div className="flex items-baseline justify-between gap-3">
                                <div className="flex items-baseline gap-1.5">
                                    <span className="text-2xl font-semibold text-foreground tabular-nums">{todayDone}</span>
                                    <span className="text-sm font-medium text-muted-foreground">
                                        de {todayRows.length} {todayRows.length === 1 ? 'hábito' : 'hábitos'}
                                    </span>
                                </div>
                                <span className="text-xs font-semibold text-muted-foreground tabular-nums">{todayPercent}%</span>
                            </div>
                            <div
                                className="h-1.5 rounded-full bg-muted overflow-hidden"
                                role="progressbar"
                                aria-valuenow={todayDone}
                                aria-valuemin={0}
                                aria-valuemax={todayRows.length}
                                aria-label="Hábitos completados hoy"
                            >
                                <div
                                    className="h-full rounded-full bg-primary transition-all duration-300"
                                    style={{ width: `${todayPercent}%` }}
                                />
                            </div>
                        </div>

                        {todayRows.map(({ cat, done }) => (
                            <div key={cat.id} className="flex items-center gap-3 min-h-[3.5rem] px-4 py-2 border-t border-border">
                                <div
                                    className="h-7 w-7 rounded-full flex items-center justify-center shrink-0 border"
                                    style={{ backgroundColor: `${cat.color}1f`, borderColor: `${cat.color}3d` }}
                                >
                                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                                </div>
                                <span className="flex-1 min-w-0 text-sm font-medium text-foreground truncate">{cat.name}</span>
                                {done ? (
                                    <span className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground shrink-0">
                                        <Check size={16} className="text-primary" />
                                        Hecho
                                    </span>
                                ) : (
                                    <button
                                        onClick={() => handleQuickLog(cat)}
                                        disabled={markingId === cat.id}
                                        className="h-9 px-3.5 rounded-md border border-input text-sm font-semibold text-foreground hover:bg-accent transition-colors active:scale-[0.98] disabled:opacity-50 shrink-0"
                                    >
                                        {markingId === cat.id ? 'Guardando…' : 'Marcar'}
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Summary Cards */}
            <SummaryCards logs={logs} categories={categories} selectedCategory={selectedAccount} />

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

                {/* Heatmaps — one per habit, filtered by the selected account (8/12) */}
                <div className="lg:col-span-8 space-y-4">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => setIsHeatmapExpanded(!isHeatmapExpanded)}
                            className="flex items-center gap-1.5 text-base font-semibold text-foreground hover:text-foreground/80 transition-colors"
                        >
                            <span>Mapa de Actividad</span>
                            {isHeatmapExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                        {isHeatmapExpanded && (
                            <div className="flex items-center gap-0.5 bg-muted p-1 rounded-md border border-border">
                                {(['1M', '3M', '6M', '12M'] as const).map((range) => (
                                    <button
                                        key={range}
                                        onClick={() => setHeatmapTimeRange(range)}
                                        className={`px-2.5 py-1 rounded-sm text-xs font-medium transition-all duration-200 ${heatmapTimeRange === range
                                            ? 'bg-card shadow-sm text-foreground'
                                            : 'text-muted-foreground hover:text-foreground'
                                            }`}
                                    >
                                        {range}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {isHeatmapExpanded && (
                        heatmapCategories.length === 0 ? (
                            <div className="rounded-lg border bg-card border-border p-8 text-center shadow-sm">
                                <p className="text-sm text-muted-foreground">Crea una categoría para ver su mapa de actividad.</p>
                            </div>
                        ) : (
                            heatmapCategories.map(cat => (
                                <div key={cat.id} className="rounded-lg border bg-card border-border p-5 shadow-sm">
                                    <Heatmap
                                        data={heatmapByCategory.get(cat.id) ?? []}
                                        title={cat.name}
                                        customColor={cat.color}
                                        onDayClick={(date) => setViewingDate(date)}
                                        timeRange={heatmapTimeRange}
                                    />
                                </div>
                            ))
                        )
                    )}
                </div>

                {/* Log Table (4/12) */}
                <div className="lg:col-span-4">
                    <div className="rounded-lg border bg-card border-border p-5 h-full shadow-sm">
                        <LogTable
                            logs={logs}
                            categories={categories}
                            onEdit={handleEditLog}
                            onDelete={handleDeleteLog}
                        />
                    </div>
                </div>
            </div>
        </div>

            {/* Modals render outside the fade-in wrapper — its animation leaves a
                permanent `transform`, which would break position:fixed on descendants. */}

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
                                    className="group flex items-center gap-3 px-4 py-3 rounded-xl bg-card border border-border hover:bg-accent transition-all duration-200"
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
                                    <div className="flex gap-1 shrink-0">
                                        <button
                                            onClick={() => handleEditLog(log)}
                                            aria-label={`Editar ${log.eventName}`}
                                            className="h-10 w-10 flex items-center justify-center hover:bg-accent rounded-md text-muted-foreground hover:text-primary transition-colors"
                                        >
                                            <Edit2 size={15} />
                                        </button>
                                        <button
                                            onClick={() => log.id !== undefined && handleDeleteLog(log.id)}
                                            aria-label={`Eliminar ${log.eventName}`}
                                            className="h-10 w-10 flex items-center justify-center hover:bg-destructive/10 rounded-md text-muted-foreground hover:text-destructive transition-colors"
                                        >
                                            <Trash2 size={15} />
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
                    {!editingLogId && (
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Veces</label>
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
                        <p className="text-xs text-muted-foreground">
                            {count === 1 ? 'Se creará 1 registro.' : `Se crearán ${count} registros.`}
                        </p>
                    </div>
                    )}

                    {/* Nota — el estado ya existía y se guardaba en eventName,
                        pero el formulario nunca lo pintaba. */}
                    <div className="space-y-1.5">
                        <div className="flex items-baseline justify-between">
                            <label htmlFor="log-nota" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Nota</label>
                            <span className="text-xs text-muted-foreground">Opcional</span>
                        </div>
                        <textarea
                            id="log-nota"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            rows={3}
                            placeholder="¿Algo que recordar de esta sesión?"
                            className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-ring/30 focus:border-ring outline-none transition-all resize-none"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2 border-t border-border">
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
        </>
    );
};