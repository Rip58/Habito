import React, { useState, useEffect, useRef } from 'react';
import { Category } from '../types';
import { Play, Square, Pause, Save, X } from 'lucide-react';
import { Modal } from './Modal';
import { api } from '../lib/api';

interface FocusTimerProps {
    categories: Category[];
    onSessionComplete: () => void;
    onCategoriesChange?: () => void;
}

const STORAGE_ACTIVE = 'habito_focus_active';
const STORAGE_START_TIME = 'habito_focus_start_time';
const STORAGE_CAT_ID = 'habito_focus_cat_id';
const STORAGE_PAUSED = 'habito_focus_paused';
const STORAGE_ELAPSED = 'habito_focus_elapsed'; // stores paused elapsed time

export const FocusTimer: React.FC<FocusTimerProps> = ({ categories, onSessionComplete, onCategoriesChange }) => {
    const [isActive, setIsActive] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [elapsedSec, setElapsedSec] = useState(0);
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
    const [showSaveModal, setShowSaveModal] = useState(false);
    const [note, setNote] = useState('');

    // New Category State
    const [showNewCategoryModal, setShowNewCategoryModal] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [newCategoryColor, setNewCategoryColor] = useState('#30e87a');

    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // Initialize category if none selected
    useEffect(() => {
        if (!selectedCategoryId && categories.length > 0) {
            setSelectedCategoryId(categories[0].id);
        }
    }, [categories, selectedCategoryId]);

    // Load state from localStorage on mount
    useEffect(() => {
        const storedActive = localStorage.getItem(STORAGE_ACTIVE) === 'true';
        const storedPaused = localStorage.getItem(STORAGE_PAUSED) === 'true';
        const storedCatId = localStorage.getItem(STORAGE_CAT_ID);
        const storedStartTime = localStorage.getItem(STORAGE_START_TIME);
        const storedElapsed = localStorage.getItem(STORAGE_ELAPSED);

        if (storedCatId) setSelectedCategoryId(storedCatId);

        if (storedActive && storedStartTime) {
            setIsActive(true);
            const start = parseInt(storedStartTime, 10);

            if (storedPaused && storedElapsed) {
                // Timer is paused, we just display the stored elapsed time
                setIsPaused(true);
                setElapsedSec(parseInt(storedElapsed, 10));
            } else {
                // Timer is running, we calculate total elapsed time
                const now = Date.now();
                const diffSec = Math.floor((now - start) / 1000);
                setElapsedSec(diffSec > 0 ? diffSec : 0);
            }
        }
    }, []);

    // Timer Tick
    useEffect(() => {
        if (isActive && !isPaused) {
            intervalRef.current = setInterval(() => {
                const startStr = localStorage.getItem(STORAGE_START_TIME);
                if (startStr) {
                    const start = parseInt(startStr, 10);
                    const now = Date.now();
                    const diffSec = Math.floor((now - start) / 1000);
                    setElapsedSec(diffSec > 0 ? diffSec : 0);
                }
            }, 1000);
        } else if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isActive, isPaused]);

    // Resync on visibility change (coming back to tab)
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible' && isActive && !isPaused) {
                const startStr = localStorage.getItem(STORAGE_START_TIME);
                if (startStr) {
                    const diffSec = Math.floor((Date.now() - parseInt(startStr, 10)) / 1000);
                    setElapsedSec(diffSec > 0 ? diffSec : 0);
                }
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [isActive, isPaused]);

    const handleStart = () => {
        if (!selectedCategoryId) return;

        const now = Date.now();
        setIsActive(true);
        setIsPaused(false);
        setElapsedSec(0);

        localStorage.setItem(STORAGE_ACTIVE, 'true');
        localStorage.setItem(STORAGE_START_TIME, now.toString());
        localStorage.setItem(STORAGE_CAT_ID, selectedCategoryId);
        localStorage.removeItem(STORAGE_PAUSED);
        localStorage.removeItem(STORAGE_ELAPSED);
    };

    const handlePause = () => {
        setIsPaused(true);
        localStorage.setItem(STORAGE_PAUSED, 'true');
        localStorage.setItem(STORAGE_ELAPSED, elapsedSec.toString());
        // We need to adjust startTime so when we resume, it's relative
        const adjustedStartTime = Date.now() - (elapsedSec * 1000);
        localStorage.setItem(STORAGE_START_TIME, adjustedStartTime.toString());
    };

    const handleResume = () => {
        setIsPaused(false);
        localStorage.removeItem(STORAGE_PAUSED);
        localStorage.removeItem(STORAGE_ELAPSED);
        // Start time is already adjusted, just let the interval pick it up
    };

    const handleStop = () => {
        // Pause timer temporarily
        setIsPaused(true);
        setShowSaveModal(true);
    };

    const handleSaveSession = async () => {
        const cat = categories.find(c => c.id === selectedCategoryId);
        if (!cat) return;

        // Clean up text
        const finalNote = note.trim() || undefined;

        // Calculate startedAt based on current time minus elapsedSec
        const end = new Date();
        const start = new Date(end.getTime() - (elapsedSec * 1000));

        await api.timerSessions.create({
            categoryId: cat.id,
            category: cat.name,
            startedAt: start.toISOString(),
            endedAt: end.toISOString(),
            durationSec: elapsedSec,
            note: finalNote
        });

        // Cleanup
        clearTimerState();
        setShowSaveModal(false);
        setNote('');
        onSessionComplete();
    };

    const handleCancelSave = () => {
        // Delete session data and reset without saving
        clearTimerState();
        setShowSaveModal(false);
        setNote('');
    };

    const handleSaveNewCategory = async () => {
        if (!newCategoryName.trim()) return;

        try {
            const newCat = await api.categories.create({
                name: newCategoryName.trim(),
                target: '1 hora',
                enabled: true,
                color: newCategoryColor
            } as any);

            if (onCategoriesChange) {
                await onCategoriesChange();
            }

            if (newCat && newCat.id) {
                setSelectedCategoryId(newCat.id);
            }
        } catch (error) {
            console.error('Error creating category:', error);
        } finally {
            setShowNewCategoryModal(false);
            setNewCategoryName('');
            setNewCategoryColor('#30e87a');
        }
    };

    const clearTimerState = () => {
        setIsActive(false);
        setIsPaused(false);
        setElapsedSec(0);
        localStorage.removeItem(STORAGE_ACTIVE);
        localStorage.removeItem(STORAGE_START_TIME);
        localStorage.removeItem(STORAGE_PAUSED);
        localStorage.removeItem(STORAGE_ELAPSED);
    };

    const formatTime = (totalSec: number) => {
        const h = Math.floor(totalSec / 3600);
        const m = Math.floor((totalSec % 3600) / 60);
        const s = totalSec % 60;

        if (h > 0) {
            return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        }
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const activeCat = categories.find(c => c.id === selectedCategoryId);

    return (
        <div className="bg-card border border-border shadow-sm rounded-3xl p-8 flex flex-col items-center justify-center space-y-8 max-w-lg mx-auto w-full transition-all">

            {/* Category Selector */}
            <div className="w-full">
                <label className="block text-sm font-medium text-muted-foreground mb-2 text-center">Actividad</label>
                <div className="flex gap-2">
                    <select
                        value={selectedCategoryId}
                        onChange={(e) => {
                            if (!isActive) setSelectedCategoryId(e.target.value);
                        }}
                        disabled={isActive}
                        className="flex-1 bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none font-medium disabled:opacity-50 transition-all cursor-pointer"
                    >
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                        {categories.length === 0 && <option value="">Sin categorías</option>}
                    </select>

                    {!isActive && (
                        <button
                            onClick={() => setShowNewCategoryModal(true)}
                            className="bg-muted text-muted-foreground hover:text-foreground hover:bg-muted-foreground/10 border border-border rounded-xl px-4 flex items-center justify-center transition-colors"
                            title="Añadir nueva actividad"
                        >
                            <span className="text-xl leading-none">+</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Timer Display */}
            <div className="relative flex items-center justify-center w-64 h-64 rounded-full border-4 border-border/40 bg-background/50 overflow-hidden group">
                {/* Colored pulse effect when active */}
                {isActive && !isPaused && activeCat && (
                    <div className="absolute inset-0 opacity-10 animate-pulse" style={{ backgroundColor: activeCat.color }}></div>
                )}

                <div className="z-10 text-center font-mono">
                    <div className="text-6xl font-bold tracking-tighter text-foreground" style={{ color: isActive && !isPaused && activeCat ? activeCat.color : undefined }}>
                        {formatTime(elapsedSec)}
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-4">
                {!isActive ? (
                    <button
                        onClick={handleStart}
                        disabled={categories.length === 0}
                        className="bg-primary text-primary-foreground rounded-full w-20 h-20 flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                    >
                        <Play size={32} fill="currentColor" className="ml-2" />
                    </button>
                ) : (
                    <>
                        {isPaused ? (
                            <button
                                onClick={handleResume}
                                className="bg-blue-500 text-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all"
                            >
                                <Play size={24} fill="currentColor" className="ml-1" />
                            </button>
                        ) : (
                            <button
                                onClick={handlePause}
                                className="bg-amber-500 text-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all"
                            >
                                <Pause size={24} fill="currentColor" />
                            </button>
                        )}
                        <button
                            onClick={handleStop}
                            className="bg-destructive text-destructive-foreground rounded-full w-16 h-16 flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all"
                        >
                            <Square size={20} fill="currentColor" />
                        </button>
                    </>
                )}
            </div>

            {/* Save Modal */}
            {showSaveModal && (
                <Modal isOpen={true} onClose={handleCancelSave} title="Sesión Terminada">
                    <div className="space-y-6">
                        <div className="text-center">
                            <h3 className="text-2xl font-bold text-foreground font-mono">{formatTime(elapsedSec)}</h3>
                            <p className="text-muted-foreground mt-1">Tiempo dedicado a {activeCat?.name}</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-2">Nota (opcional)</label>
                            <textarea
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                placeholder="¿Qué has hecho en esta sesión?"
                                rows={3}
                                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none"
                                autoFocus
                            />
                        </div>

                        <div className="pt-4 flex justify-end gap-3">
                            <button onClick={handleCancelSave} className="px-5 py-2 rounded-lg text-muted-foreground hover:bg-muted font-medium transition-colors flex items-center gap-2">
                                <X size={18} /> Descartar
                            </button>
                            <button onClick={handleSaveSession} className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-6 py-2 rounded-lg transition-all flex items-center gap-2">
                                <Save size={18} /> Guardar Sesión
                            </button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* New Category Modal */}
            {showNewCategoryModal && (
                <Modal isOpen={true} onClose={() => setShowNewCategoryModal(false)} title="Nueva Actividad">
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-2">Nombre de Actividad</label>
                            <input
                                type="text"
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                                placeholder="Ej: Leer, Programar, Meditar..."
                                className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                autoFocus
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-2">Color</label>
                            <div className="flex gap-2 mt-2">
                                {['#f87171', '#fb923c', '#fbbf24', '#30e87a', '#60a5fa', '#818cf8', '#f472b6'].map(color => (
                                    <div
                                        key={color}
                                        onClick={() => setNewCategoryColor(color)}
                                        className={`w-8 h-8 rounded-full cursor-pointer transition-all ${newCategoryColor === color ? 'ring-2 ring-primary scale-110' : 'hover:scale-105'}`}
                                        style={{ backgroundColor: color }}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="pt-4 flex justify-end gap-3">
                            <button onClick={() => setShowNewCategoryModal(false)} className="px-5 py-2 rounded-lg text-muted-foreground hover:text-foreground font-medium transition-colors">
                                Cancelar
                            </button>
                            <button
                                onClick={handleSaveNewCategory}
                                disabled={!newCategoryName.trim()}
                                className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-6 py-2 rounded-lg transition-all disabled:opacity-50"
                            >
                                Crear Actividad
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};
