import React, { useState } from 'react';
import { Category } from '../types';
import { Edit2, Trash2, Plus, X, Lock, Save, CheckCircle, Layers, Cloud, RefreshCw, ChevronRight, Moon, Sun, Monitor } from 'lucide-react';
import { Modal } from '../components/Modal';
import { api } from '../lib/api';
import { useVersion } from '../components/VersionCheck';
import { useTheme } from '../components/ThemeProvider';

interface SettingsProps {
    categories?: Category[];
    setCategories?: (cats: Category[]) => void;
    onCategoriesChange?: () => void;
    currentPin?: string;
    onUpdatePin?: (pin: string) => void;
}

export const Settings: React.FC<SettingsProps> = ({
    categories = [],
    setCategories = () => { },
    onCategoriesChange = () => { },
    currentPin = '0001',
    onUpdatePin = () => { }
}) => {
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [newPin, setNewPin] = useState(currentPin);
    const [isEditingPin, setIsEditingPin] = useState(false);
    const [pinSuccess, setPinSuccess] = useState(false);
    const { currentVersion, checkForUpdates, isChecking } = useVersion();
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

    const handleSavePin = () => {
        if (newPin && newPin.length === 4) {
            onUpdatePin(newPin);
            setIsEditingPin(false);
            setPinSuccess(true);
            setTimeout(() => setPinSuccess(false), 3000);
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

            {/* ── Apariencia ───────────────────────────────────── */}
            <section className="space-y-3">
                <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                        <Monitor size={14} />
                    </div>
                    <h2 className="text-base font-semibold text-foreground">Apariencia</h2>
                </div>

                <div className="rounded-lg border bg-card/40 border-border/40 p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <p className="text-sm font-semibold text-foreground">Tema Visual</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Define cómo se ve la interfaz de usuario.</p>
                    </div>

                    <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-md border border-border/40 w-fit">
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
                    <h2 className="text-base font-semibold text-foreground">Seguridad</h2>
                </div>

                <div className="rounded-lg border bg-card/40 border-border/40 px-4 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
                    <div>
                        <p className="text-sm font-semibold text-foreground">PIN de Acceso</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Código de 4 dígitos para acceder a la aplicación.</p>
                    </div>

                    <div className="flex items-center gap-3">
                        {isEditingPin ? (
                            <div className="flex items-center gap-2 slide-in">
                                <input
                                    type="text"
                                    maxLength={4}
                                    value={newPin}
                                    onChange={(e) => setNewPin(e.target.value.replace(/[^0-9]/g, ''))}
                                    className="h-10 w-28 bg-background border border-input rounded-md px-3 text-center font-mono text-foreground focus:ring-2 focus:ring-ring/30 focus:border-ring outline-none"
                                    placeholder="0000"
                                    autoFocus
                                />
                                <button
                                    onClick={handleSavePin}
                                    className="h-9 w-9 bg-primary/10 text-primary hover:bg-primary/20 rounded-md flex items-center justify-center transition-colors"
                                    title="Guardar"
                                >
                                    <Save size={16} />
                                </button>
                                <button
                                    onClick={() => { setIsEditingPin(false); setNewPin(currentPin); }}
                                    className="h-9 w-9 hover:bg-accent text-muted-foreground rounded-md flex items-center justify-center transition-colors"
                                    title="Cancelar"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <span className="font-mono text-xl text-muted-foreground tracking-widest">••••</span>
                                <button
                                    onClick={() => { setIsEditingPin(true); setNewPin(currentPin); }}
                                    className="h-9 px-4 bg-muted/60 hover:bg-muted border border-border/40 text-foreground rounded-md text-sm font-medium transition-colors"
                                >
                                    Cambiar PIN
                                </button>
                            </div>
                        )}
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
                    <div className="h-7 w-7 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                        <Cloud size={14} />
                    </div>
                    <h2 className="text-base font-semibold text-foreground">Información de Deploy</h2>
                </div>

                <div className="rounded-lg border bg-card/40 border-border/40 p-4 space-y-4 shadow-sm">
                    {currentVersion ? (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Fecha de Deploy</p>
                                    <p className="text-sm font-medium text-foreground">
                                        {new Date(currentVersion.buildDate).toLocaleDateString('es-ES', {
                                            year: 'numeric', month: 'long', day: 'numeric',
                                            hour: '2-digit', minute: '2-digit'
                                        })}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Número de Deploy</p>
                                    <p className="text-sm font-medium text-foreground">#{currentVersion.deployNumber}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Versión</p>
                                    <p className="text-sm font-mono text-foreground">{currentVersion.buildHash}</p>
                                </div>
                            </div>
                            <div className="pt-3 border-t border-border/40">
                                <button
                                    onClick={checkForUpdates}
                                    disabled={isChecking}
                                    className="h-9 px-4 bg-muted/60 hover:bg-muted border border-border/40 text-foreground rounded-md text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <RefreshCw size={14} className={isChecking ? 'animate-spin' : ''} />
                                    {isChecking ? 'Verificando...' : 'Verificar Actualizaciones'}
                                </button>
                            </div>
                        </>
                    ) : (
                        <p className="text-sm text-muted-foreground text-center py-3">Cargando información de versión...</p>
                    )}
                </div>
            </section>

            {/* ── Categories ───────────────────────────────────── */}
            <section className="space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                            <Layers size={14} />
                        </div>
                        <h2 className="text-base font-semibold text-foreground">Categorías de Actividad</h2>
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
                            className="group flex items-center gap-3 px-4 py-3 rounded-xl bg-card/40 border border-border/40 hover:bg-card/70 transition-all duration-200"
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
                                        <span className="px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground text-[10px] font-semibold border border-border/40">
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
                                    className="p-1.5 hover:bg-accent rounded-md text-muted-foreground hover:text-primary transition-colors opacity-0 group-hover:opacity-100"
                                >
                                    <Edit2 size={14} />
                                </button>
                                <button
                                    onClick={() => handleDelete(cat.id)}
                                    className="p-1.5 hover:bg-destructive/10 rounded-md text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                                >
                                    <Trash2 size={14} />
                                </button>
                                <ChevronRight size={14} className="text-muted-foreground/30 ml-1" />
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
                        <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border/40">
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
                        <div className="flex gap-2 pt-1 border-t border-border/40">
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