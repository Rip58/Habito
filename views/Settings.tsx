import React, { useState } from 'react';
import { Category } from '../types';
import { Edit2, Trash2, Plus, X, Lock, Save, CheckCircle, Layers, Cloud, RefreshCw, Moon, Sun, Monitor, LogOut, AlertCircle } from 'lucide-react';
import { Modal } from '../components/Modal';
import { api, ApiError } from '../lib/api';
import { useVersion } from '../components/VersionCheck';
import { useTheme } from '../components/ThemeProvider';

interface SettingsProps {
    categories?: Category[];
    onCategoriesChange?: () => void;
    onLogout?: () => void;
}

export const Settings: React.FC<SettingsProps> = ({
    categories = [],
    onCategoriesChange = () => { },
    onLogout = () => { }
}) => {
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [currentPin, setCurrentPin] = useState('');
    const [newPin, setNewPin] = useState('');
    const [isEditingPin, setIsEditingPin] = useState(false);
    const [pinSuccess, setPinSuccess] = useState(false);
    const [pinError, setPinError] = useState<string | null>(null);
    const [isSavingPin, setIsSavingPin] = useState(false);
    const { currentVersion, checkForUpdates, isChecking, updateAvailable, lastCheckedAt } = useVersion();
    const { theme, setTheme } = useTheme();

    const handleDelete = async (id: string) => {
        await api.categories.delete(id);
        onCategoriesChange();
    };

    const handleSaveCategory = async () => {
        if (editingCategory) {
            const { id, ...data } = editingCategory;
            if (id && !id.startsWith('temp-')) {
                await api.categories.update(id, data);
            } else {
                await api.categories.create(data as any);
            }
            setEditingCategory(null);
            onCategoriesChange();
        }
    };

    const handleNewCategory = () => {
        setEditingCategory({
            id: 'temp-' + Date.now(),
            name: 'Nueva Categoría',
            target: '1 hora',
            enabled: true,
            color: '#3b82f6'
        });
    };

    const closePinEditor = () => {
        setIsEditingPin(false);
        setCurrentPin('');
        setNewPin('');
        setPinError(null);
    };

    const handleSavePin = async () => {
        setPinError(null);
        if (!/^\d{4}$/.test(newPin)) {
            setPinError('El PIN nuevo debe tener 4 dígitos.');
            return;
        }
        setIsSavingPin(true);
        try {
            await api.auth.changePin(currentPin, newPin);
            closePinEditor();
            setPinSuccess(true);
            setTimeout(() => setPinSuccess(false), 3000);
        } catch (err) {
            setPinError(err instanceof ApiError ? err.message : 'No se pudo cambiar el PIN.');
        } finally {
            setIsSavingPin(false);
        }
    };

    const COLOR_PRESETS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f97316', '#22c55e', '#ef4444', '#eab308', '#06b6d4'];

    return (
        <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-6 fade-in">

            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-semibold text-foreground tracking-tight">Configuración</h1>
                <p className="text-sm text-muted-foreground mt-0.5">Gestiona tus preferencias del sistema.</p>
            </div>

            {/* ── Categories ───────────────────────────────────── */}
            <section className="space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                            <Layers size={14} />
                        </div>
                        <h2 className="text-base font-semibold text-foreground">Hábitos</h2>
                    </div>
                    <button
                        onClick={handleNewCategory}
                        className="h-9 px-3 bg-primary text-primary-foreground font-semibold rounded-md flex items-center gap-1.5 text-sm transition-all hover:opacity-90 active:scale-[0.99]"
                    >
                        <Plus size={15} />
                        Nueva
                    </button>
                </div>

                <div className="space-y-1.5">
                    {categories.map((cat) => (
                        <div
                            key={cat.id}
                            className="group flex items-center gap-3 px-4 py-3 rounded-xl bg-card border border-border hover:bg-accent transition-all duration-200"
                        >
                            {/* Color icon */}
                            <div
                                className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0 border transition-colors"
                                style={{
                                    backgroundColor: `${cat.color}15`,
                                    borderColor: `${cat.color}25`,
                                }}
                            >
                                <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: cat.color }} />
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-foreground">{cat.name}</p>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-xs text-muted-foreground">Meta: {cat.target}</span>
                                    {!cat.enabled && (
                                        <span className="px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground text-[10px] font-semibold border border-border">
                                            Inactivo
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Color preview dots (hidden on small screens) */}
                            <div className="hidden lg:flex gap-1 opacity-40">
                                {[0.15, 0.35, 0.55, 0.75, 1].map((op, i) => (
                                    <div
                                        key={i}
                                        className="w-2.5 h-2.5 rounded-sm"
                                        style={{ backgroundColor: cat.color, opacity: op }}
                                    />
                                ))}
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-1 shrink-0">
                                <button
                                    onClick={() => setEditingCategory(cat)}
                                    aria-label={`Editar ${cat.name}`}
                                    className="h-10 w-10 flex items-center justify-center hover:bg-accent rounded-md text-muted-foreground hover:text-primary transition-colors"
                                >
                                    <Edit2 size={16} />
                                </button>
                                <button
                                    onClick={() => handleDelete(cat.id)}
                                    aria-label={`Eliminar ${cat.name}`}
                                    className="h-10 w-10 flex items-center justify-center hover:bg-destructive/10 rounded-md text-muted-foreground hover:text-destructive transition-colors"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}

                    {categories.length === 0 && (
                        <div className="py-8 text-center text-sm text-muted-foreground">
                            No hay categorías configuradas.
                        </div>
                    )}
                </div>
            </section>

            {/* ── Apariencia ───────────────────────────────────── */}
            <section className="space-y-3">
                <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                        <Monitor size={14} />
                    </div>
                    <h2 className="text-base font-semibold text-foreground">Apariencia</h2>
                </div>

                <div className="rounded-lg border bg-card border-border p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <p className="text-sm font-semibold text-foreground">Tema Visual</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Define cómo se ve la interfaz de usuario.</p>
                    </div>

                    <div className="flex items-center gap-1 bg-muted p-1 rounded-md border border-border w-fit">
                        <button
                            onClick={() => setTheme('light')}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-sm text-sm font-medium transition-all duration-200 ${theme === 'light'
                                ? 'bg-card shadow-sm text-foreground'
                                : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            <Sun size={14} />
                            Claro
                        </button>
                        <button
                            onClick={() => setTheme('dark')}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-sm text-sm font-medium transition-all duration-200 ${theme === 'dark'
                                ? 'bg-card shadow-sm text-foreground'
                                : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            <Moon size={14} />
                            Oscuro
                        </button>
                    </div>
                </div>
            </section>

            {/* ── Seguridad ─────────────────────────────────────── */}
            <section className="space-y-3">
                <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                        <Lock size={14} />
                    </div>
                    <h2 className="text-base font-semibold text-foreground">Bloqueo</h2>
                </div>

                <div className="rounded-lg border bg-card border-border px-4 py-4 space-y-4 shadow-sm">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <p className="text-sm font-semibold text-foreground">PIN de acceso</p>
                            <p className="text-xs text-muted-foreground mt-0.5">Código de 4 dígitos para abrir la aplicación.</p>
                        </div>
                        {!isEditingPin && (
                            <div className="flex items-center gap-3">
                                <span className="font-mono text-xl text-muted-foreground tracking-widest">••••</span>
                                <button
                                    onClick={() => setIsEditingPin(true)}
                                    className="h-9 px-4 bg-muted hover:bg-muted border border-border text-foreground rounded-md text-sm font-medium transition-colors"
                                >
                                    Cambiar PIN
                                </button>
                            </div>
                        )}
                    </div>

                    {isEditingPin && (
                        <div className="space-y-3 slide-in">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <label htmlFor="pin-actual" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">PIN actual</label>
                                    <input
                                        id="pin-actual"
                                        type="password"
                                        inputMode="numeric"
                                        autoComplete="current-password"
                                        maxLength={4}
                                        value={currentPin}
                                        onChange={(e) => setCurrentPin(e.target.value.replace(/\D/g, ''))}
                                        className="h-10 w-full bg-background border border-input rounded-md px-3 text-center font-mono tracking-[0.3em] text-foreground focus:ring-2 focus:ring-ring/30 focus:border-ring outline-none"
                                        placeholder="••••"
                                        autoFocus
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label htmlFor="pin-nuevo" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">PIN nuevo</label>
                                    <input
                                        id="pin-nuevo"
                                        type="password"
                                        inputMode="numeric"
                                        autoComplete="new-password"
                                        maxLength={4}
                                        value={newPin}
                                        onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                                        className="h-10 w-full bg-background border border-input rounded-md px-3 text-center font-mono tracking-[0.3em] text-foreground focus:ring-2 focus:ring-ring/30 focus:border-ring outline-none"
                                        placeholder="••••"
                                    />
                                </div>
                            </div>

                            {pinError && (
                                <div role="alert" className="flex items-center gap-2 text-sm bg-destructive/10 border border-destructive/20 text-destructive p-3 rounded-lg">
                                    <AlertCircle size={15} className="shrink-0" />
                                    <span>{pinError}</span>
                                </div>
                            )}

                            <div className="flex gap-2">
                                <button
                                    onClick={handleSavePin}
                                    disabled={isSavingPin}
                                    className="h-9 px-4 bg-primary text-primary-foreground rounded-md text-sm font-semibold flex items-center gap-2 transition-all hover:opacity-90 disabled:opacity-50"
                                >
                                    <Save size={15} />
                                    {isSavingPin ? 'Guardando…' : 'Guardar'}
                                </button>
                                <button
                                    onClick={closePinEditor}
                                    className="h-9 px-4 border border-border rounded-md text-sm font-medium text-foreground hover:bg-accent transition-colors flex items-center gap-2"
                                >
                                    <X size={15} />
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="flex gap-2.5 p-3 rounded-lg bg-muted border border-border">
                        <AlertCircle size={15} className="text-muted-foreground shrink-0 mt-0.5" />
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            El PIN protege el acceso a tus datos en el servidor. No los cifra: quien tenga acceso a la base de datos puede leerlos.
                        </p>
                    </div>

                    <div className="pt-3 border-t border-border">
                        <button
                            onClick={onLogout}
                            className="h-9 px-4 border border-border rounded-md text-sm font-medium text-foreground hover:bg-accent transition-colors flex items-center gap-2"
                        >
                            <LogOut size={15} />
                            Cerrar sesión
                        </button>
                    </div>
                </div>

                {pinSuccess && (
                    <div className="flex items-center gap-2 text-sm bg-primary/10 border border-primary/20 text-primary p-3 rounded-lg fade-in">
                        <CheckCircle size={15} />
                        <span>PIN actualizado correctamente</span>
                    </div>
                )}
            </section>

            {/* ── Deploy Info ──────────────────────────────────── */}
            <section className="space-y-3">
                <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-xl bg-muted text-muted-foreground flex items-center justify-center">
                        <Cloud size={14} />
                    </div>
                    <h2 className="text-base font-medium text-muted-foreground">Información de deploy</h2>
                </div>

                <div className="rounded-lg border bg-card border-border p-4 space-y-4 shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Fecha</p>
                            <p className="text-sm font-medium text-foreground">
                                {new Date(currentVersion.buildDate).toLocaleDateString('es-ES', {
                                    year: 'numeric', month: 'long', day: 'numeric',
                                    hour: '2-digit', minute: '2-digit'
                                })}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Build</p>
                            <p className="text-sm font-mono text-foreground">{currentVersion.buildId}</p>
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Commit</p>
                            <p className="text-sm font-mono text-foreground">
                                {currentVersion.commit || <span className="font-sans text-muted-foreground">Build local</span>}
                            </p>
                        </div>
                    </div>

                    <div className="pt-3 border-t border-border flex flex-wrap items-center gap-3">
                        <button
                            onClick={checkForUpdates}
                            disabled={isChecking}
                            className="h-9 px-4 bg-muted hover:bg-accent border border-border text-foreground rounded-md text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <RefreshCw size={14} className={isChecking ? 'animate-spin' : ''} />
                            {isChecking ? 'Comprobando…' : 'Buscar actualizaciones'}
                        </button>

                        {updateAvailable ? (
                            <span className="text-sm font-medium text-primary">Hay una versión nueva disponible.</span>
                        ) : lastCheckedAt ? (
                            <span className="text-sm text-muted-foreground">
                                Estás en la última versión · comprobado a las{' '}
                                {lastCheckedAt.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        ) : null}
                    </div>
                </div>
            </section>

            {/* ── Edit Category Modal ──────────────────────────── */}
            {editingCategory && (
                <Modal
                    isOpen={true}
                    onClose={() => setEditingCategory(null)}
                    title={editingCategory.id.startsWith('temp-') ? 'Nueva Categoría' : `Editar: ${editingCategory.name}`}
                >
                    <div className="space-y-5">
                        {/* Name */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Nombre</label>
                            <input
                                type="text"
                                value={editingCategory.name}
                                onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                                className="h-10 w-full bg-background border border-input rounded-md px-3 text-sm text-foreground focus:ring-2 focus:ring-ring/30 focus:border-ring outline-none transition-all"
                            />
                        </div>

                        {/* Target */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Meta Diaria</label>
                            <input
                                type="text"
                                value={editingCategory.target}
                                onChange={(e) => setEditingCategory({ ...editingCategory, target: e.target.value })}
                                placeholder="ej. 1 hora, 30 min"
                                className="h-10 w-full bg-background border border-input rounded-md px-3 text-sm text-foreground focus:ring-2 focus:ring-ring/30 focus:border-ring outline-none transition-all"
                            />
                        </div>

                        {/* Color — highlight card */}
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Color del Heatmap</label>
                            <div
                                className="p-3 rounded-xl border transition-all"
                                style={{
                                    backgroundColor: `${editingCategory.color}15`,
                                    borderColor: `${editingCategory.color}30`,
                                }}
                            >
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-10 h-10 rounded-lg shrink-0 ring-2 ring-white/20"
                                        style={{ backgroundColor: editingCategory.color }}
                                    />
                                    <input
                                        type="text"
                                        value={editingCategory.color}
                                        onChange={(e) => setEditingCategory({ ...editingCategory, color: e.target.value })}
                                        className="flex-1 bg-transparent border-none p-0 text-base font-mono text-foreground focus:ring-0 outline-none"
                                    />
                                </div>
                            </div>

                            {/* Color presets */}
                            <div className="flex gap-2 flex-wrap">
                                {COLOR_PRESETS.map(color => (
                                    <button
                                        key={color}
                                        onClick={() => setEditingCategory({ ...editingCategory, color })}
                                        className={`w-7 h-7 rounded-full transition-all ${editingCategory.color === color ? 'ring-2 ring-offset-2 ring-offset-card ring-foreground scale-110' : 'hover:scale-105'}`}
                                        style={{ backgroundColor: color }}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Enabled toggle */}
                        <div className="flex items-center justify-between p-3 rounded-xl bg-muted border border-border">
                            <div>
                                <p className="text-sm font-medium text-foreground">Categoría activa</p>
                                <p className="text-xs text-muted-foreground">Aparece en los filtros y formularios</p>
                            </div>
                            <button
                                onClick={() => setEditingCategory({ ...editingCategory, enabled: !editingCategory.enabled })}
                                className={`relative h-6 w-11 rounded-full transition-colors ${editingCategory.enabled ? 'bg-primary' : 'bg-muted border border-border'}`}
                            >
                                <span
                                    className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${editingCategory.enabled ? 'translate-x-5' : 'translate-x-0'}`}
                                />
                            </button>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 pt-1 border-t border-border">
                            <button
                                onClick={handleSaveCategory}
                                className="flex-1 h-10 bg-primary text-primary-foreground font-semibold rounded-md text-sm hover:opacity-90 transition-all active:scale-[0.99]"
                            >
                                Guardar cambios
                            </button>
                            <button
                                onClick={() => setEditingCategory(null)}
                                className="px-5 h-10 border border-border rounded-md text-sm font-medium text-foreground hover:bg-accent transition-colors"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};