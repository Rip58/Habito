"use client";
import React, { useEffect, useRef, useState } from 'react';
import { Category } from '../types';
import { api } from '../lib/api';
import { Modal } from './Modal';
import { Box, Cmd } from './v6/Button';
import { Select } from './v6/Select';
import { Label, inputClass } from './v6/Field';
import { HABIT_COLORS, toPaletteHex } from './v6/nav';

interface FocusTimerProps {
    categories: Category[];
    onSessionComplete: () => void;
    onCategoriesChange?: () => void;
}

const STORAGE_ACTIVE = 'habito_focus_active';
const STORAGE_START_TIME = 'habito_focus_start_time';
const STORAGE_CAT_ID = 'habito_focus_cat_id';
const STORAGE_PAUSED = 'habito_focus_paused';
const STORAGE_ELAPSED = 'habito_focus_elapsed';

// Category.target es texto libre ("3 horas", "45 min", "1 sesión"). Si expresa
// tiempo lo convertimos a segundos para poder dibujar el progreso.
const parseTargetSeconds = (target?: string): number | null => {
    if (!target) return null;
    const t = target.toLowerCase();
    const hours = t.match(/(\d+(?:[.,]\d+)?)\s*(?:h\b|horas?)/);
    const minutes = t.match(/(\d+(?:[.,]\d+)?)\s*(?:m\b|min|minutos?)/);
    if (!hours && !minutes) return null;
    const num = (m: RegExpMatchArray | null) => (m ? parseFloat(m[1].replace(',', '.')) : 0);
    const seconds = num(hours) * 3600 + num(minutes) * 60;
    return seconds > 0 ? seconds : null;
};

const formatTime = (total: number) => {
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    const pad = (n: number) => String(n).padStart(2, '0');
    return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
};

export const FocusTimer: React.FC<FocusTimerProps> = ({ categories, onSessionComplete, onCategoriesChange }) => {
    const [isActive, setIsActive] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [elapsedSec, setElapsedSec] = useState(0);
    const [selectedCategoryId, setSelectedCategoryId] = useState('');
    const [showSaveModal, setShowSaveModal] = useState(false);
    const [note, setNote] = useState('');

    const [showNewCategory, setShowNewCategory] = useState(false);
    const [newName, setNewName] = useState('');
    const [newColor, setNewColor] = useState<string>(HABIT_COLORS[0]);

    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        if (!selectedCategoryId && categories.length > 0) setSelectedCategoryId(categories[0].id);
    }, [categories, selectedCategoryId]);

    useEffect(() => {
        const storedActive = localStorage.getItem(STORAGE_ACTIVE) === 'true';
        const storedPaused = localStorage.getItem(STORAGE_PAUSED) === 'true';
        const storedCatId = localStorage.getItem(STORAGE_CAT_ID);
        const storedStart = localStorage.getItem(STORAGE_START_TIME);
        const storedElapsed = localStorage.getItem(STORAGE_ELAPSED);

        if (storedCatId) setSelectedCategoryId(storedCatId);
        if (storedActive && storedStart) {
            setIsActive(true);
            if (storedPaused && storedElapsed) {
                setIsPaused(true);
                setElapsedSec(parseInt(storedElapsed, 10));
            } else {
                const diff = Math.floor((Date.now() - parseInt(storedStart, 10)) / 1000);
                setElapsedSec(diff > 0 ? diff : 0);
            }
        }
    }, []);

    useEffect(() => {
        if (isActive && !isPaused) {
            intervalRef.current = setInterval(() => {
                const start = localStorage.getItem(STORAGE_START_TIME);
                if (start) {
                    const diff = Math.floor((Date.now() - parseInt(start, 10)) / 1000);
                    setElapsedSec(diff > 0 ? diff : 0);
                }
            }, 1000);
        } else if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
        return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    }, [isActive, isPaused]);

    useEffect(() => {
        const onVisible = () => {
            if (document.visibilityState === 'visible' && isActive && !isPaused) {
                const start = localStorage.getItem(STORAGE_START_TIME);
                if (start) {
                    const diff = Math.floor((Date.now() - parseInt(start, 10)) / 1000);
                    setElapsedSec(diff > 0 ? diff : 0);
                }
            }
        };
        document.addEventListener('visibilitychange', onVisible);
        return () => document.removeEventListener('visibilitychange', onVisible);
    }, [isActive, isPaused]);

    const pauseAt = (seconds: number) => {
        localStorage.setItem(STORAGE_PAUSED, 'true');
        localStorage.setItem(STORAGE_ELAPSED, String(seconds));
        localStorage.setItem(STORAGE_START_TIME, String(Date.now() - seconds * 1000));
    };

    const handleStart = () => {
        if (!selectedCategoryId) return;
        setIsActive(true);
        setIsPaused(false);
        setElapsedSec(0);
        localStorage.setItem(STORAGE_ACTIVE, 'true');
        localStorage.setItem(STORAGE_START_TIME, String(Date.now()));
        localStorage.setItem(STORAGE_CAT_ID, selectedCategoryId);
        localStorage.removeItem(STORAGE_PAUSED);
        localStorage.removeItem(STORAGE_ELAPSED);
    };

    const handlePause = () => { setIsPaused(true); pauseAt(elapsedSec); };

    const handleResume = () => {
        setIsPaused(false);
        localStorage.removeItem(STORAGE_PAUSED);
        localStorage.removeItem(STORAGE_ELAPSED);
    };

    // Persistimos la pausa también aquí: si se recarga con el diálogo abierto,
    // el contador no debe seguir corriendo por detrás.
    const handleStop = () => { setIsPaused(true); pauseAt(elapsedSec); setShowSaveModal(true); };

    const clearTimerState = () => {
        setIsActive(false);
        setIsPaused(false);
        setElapsedSec(0);
        [STORAGE_ACTIVE, STORAGE_START_TIME, STORAGE_PAUSED, STORAGE_ELAPSED].forEach(k => localStorage.removeItem(k));
    };

    const handleSaveSession = async () => {
        const cat = categories.find(c => c.id === selectedCategoryId);
        if (!cat) return;
        const end = new Date();
        const start = new Date(end.getTime() - elapsedSec * 1000);
        await api.timerSessions.create({
            categoryId: cat.id,
            category: cat.name,
            startedAt: start.toISOString(),
            endedAt: end.toISOString(),
            durationSec: elapsedSec,
            note: note.trim() || undefined,
        });
        clearTimerState();
        setShowSaveModal(false);
        setNote('');
        onSessionComplete();
    };

    const handleCreateCategory = async () => {
        if (!newName.trim()) return;
        try {
            const created = await api.categories.create({
                name: newName.trim(), target: '1 hora', enabled: true, color: newColor,
            });
            await onCategoriesChange?.();
            if (created?.id) setSelectedCategoryId(created.id);
        } catch (err) {
            console.error('Error creating category:', err);
        } finally {
            setShowNewCategory(false);
            setNewName('');
            setNewColor(HABIT_COLORS[0]);
        }
    };

    const activeCat = categories.find(c => c.id === selectedCategoryId);
    const accent = toPaletteHex(activeCat?.color);
    const targetSeconds = parseTargetSeconds(activeCat?.target);
    const progress = targetSeconds ? Math.min(1, elapsedSec / targetSeconds) : 0;

    return (
        <div className="flex flex-col gap-3.5">
            <div className="flex items-end gap-2">
                <Select
                    className="flex-1"
                    value={selectedCategoryId}
                    onChange={setSelectedCategoryId}
                    disabled={isActive}
                    placeholder="sin hábitos"
                    options={categories.map(c => ({ value: c.id, label: c.name.toLowerCase(), dot: toPaletteHex(c.color) }))}
                />
                {!isActive && (
                    <Box accent="var(--v6-dim)" onClick={() => setShowNewCategory(true)} aria-label="Nuevo hábito">+</Box>
                )}
            </div>

            <div className="flex flex-col gap-2.5">
                <span className="text-display font-bold tabular-nums" style={{ color: isActive && !isPaused ? accent : 'var(--v6-fg)', letterSpacing: '-1px' }}>
                    {formatTime(elapsedSec)}
                </span>

                {targetSeconds && (
                    <>
                        <div className="v6-track">
                            <span
                                className="v6-fill"
                                style={{ width: `${Math.round(progress * 100)}%`, ['--v6-fill' as string]: accent }}
                            />
                        </div>
                        <div className="flex items-baseline gap-2 text-11 text-subtle">
                            <span>{Math.round(progress * 100)}% de la meta</span>
                            <span className="ml-auto">meta {activeCat?.target}</span>
                        </div>
                    </>
                )}
            </div>

            <div className="flex items-center gap-2">
                {!isActive ? (
                    <Box onClick={handleStart} disabled={categories.length === 0} className="flex-1">iniciar</Box>
                ) : (
                    <>
                        <Box accent="var(--v6-amber)" onClick={isPaused ? handleResume : handlePause} className="flex-1">
                            {isPaused ? 'reanudar' : 'pausa'}
                        </Box>
                        <Box onClick={handleStop} className="flex-[2]">terminar y guardar</Box>
                    </>
                )}
            </div>

            <Modal
                isOpen={showSaveModal}
                onClose={() => { clearTimerState(); setShowSaveModal(false); setNote(''); }}
                title="sesión terminada"
                comment={`// ${formatTime(elapsedSec)} en ${activeCat?.name.toLowerCase() ?? 'el hábito'}`}
            >
                <div className="flex flex-col gap-1">
                    <Label htmlFor="sesion-nota" right="opcional">nota</Label>
                    <textarea
                        id="sesion-nota"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        rows={3}
                        placeholder="¿qué has hecho en esta sesión?"
                        className={`${inputClass} resize-none placeholder:text-subtle`}
                        autoFocus
                    />
                </div>
                <div className="flex gap-2">
                    <Box onClick={handleSaveSession} className="flex-1">guardar</Box>
                    <Box
                        accent="var(--v6-dim)"
                        onClick={() => { clearTimerState(); setShowSaveModal(false); setNote(''); }}
                        className="w-28"
                    >descartar</Box>
                </div>
            </Modal>

            <Modal
                isOpen={showNewCategory}
                onClose={() => setShowNewCategory(false)}
                title="nuevo hábito"
                comment="// el color es el del mapa de actividad"
            >
                <div className="flex flex-col gap-1">
                    <Label htmlFor="nuevo-nombre">nombre</Label>
                    <input
                        id="nuevo-nombre"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="leer, programar, meditar…"
                        className={`${inputClass} placeholder:text-subtle`}
                        autoFocus
                    />
                </div>
                <div className="flex flex-col gap-1">
                    <Label>color</Label>
                    <div className="flex gap-2">
                        {HABIT_COLORS.map(color => (
                            <button
                                key={color}
                                onClick={() => setNewColor(color)}
                                aria-label={`Color ${color}`}
                                style={{ background: color, outline: newColor === color ? '1px solid var(--v6-fg)' : 'none', outlineOffset: 2 }}
                                className="h-6 w-6 rounded-sm"
                            />
                        ))}
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <Box onClick={handleCreateCategory} disabled={!newName.trim()} className="flex-1">crear</Box>
                    <Cmd accent="var(--v6-dim)" onClick={() => setShowNewCategory(false)}>cancelar</Cmd>
                </div>
            </Modal>
        </div>
    );
};
