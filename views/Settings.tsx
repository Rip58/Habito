"use client";
import React, { useState } from 'react';
import { Category } from '../types';
import { api, ApiError } from '../lib/api';
import { Modal } from '../components/Modal';
import { useVersion } from '../components/VersionCheck';
import { Sec } from '../components/v6/Sec';
import { Box, Cmd } from '../components/v6/Button';
import { Label, inputClass } from '../components/v6/Field';
import { HABIT_COLORS, toPaletteHex } from '../components/v6/nav';

interface SettingsProps {
    categories?: Category[];
    onCategoriesChange?: () => void;
    onLogout?: () => void;
}

const STEPS = ['33', '66', '99', 'ff'];

export const Settings: React.FC<SettingsProps> = ({
    categories = [], onCategoriesChange = () => { }, onLogout = () => { },
}) => {
    const [editing, setEditing] = useState<Category | null>(null);
    const [pendingDelete, setPendingDelete] = useState<Category | null>(null);

    const [currentPin, setCurrentPin] = useState('');
    const [newPin, setNewPin] = useState('');
    const [editingPin, setEditingPin] = useState(false);
    const [pinError, setPinError] = useState<string | null>(null);
    const [pinOk, setPinOk] = useState(false);
    const [savingPin, setSavingPin] = useState(false);

    const { currentVersion, checkForUpdates, isChecking, updateAvailable, lastCheckedAt } = useVersion();

    const closePinEditor = () => {
        setEditingPin(false); setCurrentPin(''); setNewPin(''); setPinError(null);
    };

    const handleSavePin = async () => {
        setPinError(null);
        if (!/^\d{4}$/.test(newPin)) { setPinError('el pin nuevo debe tener 4 dígitos'); return; }
        setSavingPin(true);
        try {
            await api.auth.changePin(currentPin, newPin);
            closePinEditor();
            setPinOk(true);
            setTimeout(() => setPinOk(false), 3000);
        } catch (err) {
            setPinError(err instanceof ApiError ? err.message.toLowerCase() : 'no se pudo cambiar el pin');
        } finally {
            setSavingPin(false);
        }
    };

    const handleSaveCategory = async () => {
        if (!editing) return;
        const { id, ...data } = editing;
        if (id && !id.startsWith('temp-')) await api.categories.update(id, data);
        else await api.categories.create(data);
        setEditing(null);
        onCategoriesChange();
    };

    const confirmDelete = async () => {
        if (!pendingDelete) return;
        await api.categories.delete(pendingDelete.id);
        setPendingDelete(null);
        onCategoriesChange();
    };

    return (
        <div className="mx-auto w-full max-w-3xl px-3.5 pb-32 md:px-8 md:pb-12">

            <Sec
                accent="var(--v6-green)"
                title="hábitos"
                right={<Cmd strong onClick={() => setEditing({ id: `temp-${Date.now()}`, name: 'nuevo hábito', target: '1 hora', enabled: true, color: HABIT_COLORS[0] })}>+ hábito</Cmd>}
                comment="// el color es el del mapa de actividad"
            >
                {categories.length === 0 ? (
                    <p className="text-11 text-subtle">{'// sin hábitos configurados'}</p>
                ) : (
                    <div className="flex flex-col gap-2">
                        {categories.map(cat => {
                            const color = toPaletteHex(cat.color);
                            return (
                                <div
                                    key={cat.id}
                                    style={{ borderLeft: `2px solid ${color}` }}
                                    className="flex flex-col gap-1.5 bg-surface px-2.5 py-2"
                                >
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-12 font-bold" style={{ color: cat.enabled ? 'var(--v6-fg)' : 'var(--v6-dim2)' }}>
                                            {cat.name.toLowerCase()}
                                        </span>
                                        {!cat.enabled && (
                                            <span className="rounded-sm border border-border px-1 text-9 text-subtle">inactivo</span>
                                        )}
                                        <span className="ml-auto text-10 uppercase tracking-[.3px] text-subtle">meta {cat.target}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="flex gap-0.5">
                                            {[0, 1, 2, 3, 4].map(level => (
                                                <span
                                                    key={level}
                                                    className="h-2 w-2 rounded-sm"
                                                    style={{ background: level === 0 ? '#141414' : `${color}${STEPS[level - 1]}` }}
                                                />
                                            ))}
                                        </div>
                                        <span className="ml-auto flex min-h-[44px] items-center gap-4">
                                            <Cmd accent="var(--v6-blue)" onClick={() => setEditing(cat)}>editar</Cmd>
                                            <Cmd accent="var(--v6-red)" onClick={() => setPendingDelete(cat)}>borrar</Cmd>
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </Sec>

            <Sec accent="var(--v6-violet)" title="bloqueo" comment="// pin de 4 dígitos al abrir la app">
                <div className="flex flex-col gap-2">
                    {!editingPin ? (
                        <div className="flex min-h-[44px] items-center gap-2">
                            <span className="w-20 shrink-0 text-10 uppercase tracking-[.3px] text-subtle">pin</span>
                            <span className="tracking-[3px] text-12">••••</span>
                            <span className="ml-auto"><Cmd accent="var(--v6-violet)" onClick={() => setEditingPin(true)}>cambiar</Cmd></span>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2">
                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                <div className="flex flex-col gap-1">
                                    <Label htmlFor="pin-actual">pin actual</Label>
                                    <input id="pin-actual" type="password" inputMode="numeric" maxLength={4} autoFocus
                                        value={currentPin} onChange={(e) => setCurrentPin(e.target.value.replace(/\D/g, ''))}
                                        className={`${inputClass} text-center tracking-[.3em]`} placeholder="••••" />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <Label htmlFor="pin-nuevo">pin nuevo</Label>
                                    <input id="pin-nuevo" type="password" inputMode="numeric" maxLength={4}
                                        value={newPin} onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                                        className={`${inputClass} text-center tracking-[.3em]`} placeholder="••••" />
                                </div>
                            </div>
                            {pinError && (
                                <div role="alert" className="rounded border px-2 py-1.5 text-11"
                                    style={{ borderColor: 'var(--v6-red)', background: 'rgba(232,83,110,0.1)', color: 'var(--v6-red)' }}>
                                    {pinError}
                                </div>
                            )}
                            <div className="flex items-center gap-4">
                                <Box onClick={handleSavePin} disabled={savingPin}>{savingPin ? 'guardando…' : 'guardar'}</Box>
                                <Cmd accent="var(--v6-dim)" onClick={closePinEditor}>cancelar</Cmd>
                            </div>
                        </div>
                    )}

                    {pinOk && <p className="text-11 text-green">{'// pin actualizado'}</p>}

                    <p className="text-11 leading-relaxed text-muted">
                        {'// el pin protege el acceso al servidor.'}<br />
                        {'// no cifra los datos.'}
                    </p>

                    <div className="flex min-h-[44px] items-center">
                        <Cmd accent="var(--v6-red)" onClick={onLogout}>cerrar sesión</Cmd>
                    </div>
                </div>
            </Sec>

            <Sec accent="var(--v6-dim)" title="deploy" comment="// versión que corre esta pestaña">
                <div className="flex flex-col gap-1">
                    {[
                        { k: 'build', v: currentVersion.buildId },
                        { k: 'commit', v: currentVersion.commit || 'local' },
                        { k: 'fecha', v: new Date(currentVersion.buildDate).toLocaleString('es-ES', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) },
                    ].map(row => (
                        <div key={row.k} className="flex items-baseline gap-2 text-11">
                            <span className="w-20 shrink-0 uppercase tracking-[.3px] text-subtle">{row.k}</span>
                            <span className="text-foreground">{row.v}</span>
                        </div>
                    ))}
                    <div className="mt-1.5 flex min-h-[44px] flex-wrap items-center gap-4">
                        <Cmd accent="var(--v6-blue)" onClick={checkForUpdates} disabled={isChecking}>
                            {isChecking ? 'comprobando…' : 'buscar actualizaciones'}
                        </Cmd>
                        {updateAvailable ? (
                            <span className="text-11 text-green">hay una versión nueva</span>
                        ) : lastCheckedAt ? (
                            <span className="text-11 text-subtle">
                                al día · {lastCheckedAt.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        ) : null}
                    </div>
                </div>
            </Sec>

            {editing && (
                <Modal
                    isOpen
                    onClose={() => setEditing(null)}
                    title={editing.id.startsWith('temp-') ? 'nuevo hábito' : `editar ${editing.name.toLowerCase()}`}
                    comment="// el color es el del mapa de actividad"
                >
                    <div className="flex flex-col gap-1">
                        <Label htmlFor="cat-nombre">nombre</Label>
                        <input id="cat-nombre" value={editing.name}
                            onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                            className={inputClass} />
                    </div>
                    <div className="flex flex-col gap-1">
                        <Label htmlFor="cat-meta">meta diaria</Label>
                        <input id="cat-meta" value={editing.target} placeholder="3 horas, 45 min…"
                            onChange={(e) => setEditing({ ...editing, target: e.target.value })}
                            className={`${inputClass} placeholder:text-subtle`} />
                    </div>
                    <div className="flex flex-col gap-1">
                        <Label>color</Label>
                        <div className="flex gap-2">
                            {HABIT_COLORS.map(color => (
                                <button key={color} onClick={() => setEditing({ ...editing, color })}
                                    aria-label={`Color ${color}`}
                                    style={{ background: color, outline: toPaletteHex(editing.color) === toPaletteHex(color) ? '1px solid var(--v6-fg)' : 'none', outlineOffset: 2 }}
                                    className="h-6 w-6 rounded-sm" />
                            ))}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-10 uppercase tracking-[.3px] text-subtle">activo</span>
                        <Cmd
                            accent={editing.enabled ? 'var(--v6-green)' : 'var(--v6-dim)'}
                            onClick={() => setEditing({ ...editing, enabled: !editing.enabled })}
                        >
                            {editing.enabled ? 'sí' : 'no'}
                        </Cmd>
                    </div>
                    <div className="flex items-center gap-4">
                        <Box onClick={handleSaveCategory} className="flex-1">guardar</Box>
                        <Cmd accent="var(--v6-dim)" onClick={() => setEditing(null)}>cancelar</Cmd>
                    </div>
                </Modal>
            )}

            <Modal
                isOpen={pendingDelete !== null}
                onClose={() => setPendingDelete(null)}
                title="borrar hábito"
                comment="// los registros asociados no se borran"
                destructive
            >
                <div className="flex items-center gap-2">
                    <Box accent="var(--v6-red)" onClick={confirmDelete} className="flex-1">borrar</Box>
                    <Box accent="var(--v6-dim)" onClick={() => setPendingDelete(null)} className="w-28">cancelar</Box>
                </div>
            </Modal>
        </div>
    );
};
