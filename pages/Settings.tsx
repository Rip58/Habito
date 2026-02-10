import React, { useState } from 'react';
import { Category } from '../types';
import { Edit2, Trash2, Plus, Bell, BellOff, X, Lightbulb, Lock, Save, CheckCircle, Layers } from 'lucide-react';
import { Modal } from '../components/Modal';
import { api } from '../lib/api';

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
            color: '#30e87a'
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

    return (
        <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
            <header className="flex flex-col gap-4 md:flex-row md:justify-between md:items-end mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-2">Configuración</h1>
                    <p className="text-text-muted">Gestiona tus preferencias del sistema.</p>
                </div>
            </header>

            {/* Security Section */}
            <section className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                    <Lock className="text-primary" size={20} />
                    <h2 className="text-lg font-bold text-white">Seguridad</h2>
                </div>

                <div className="bg-bg-card border border-white/5 rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h3 className="font-semibold text-white">PIN de Acceso</h3>
                        <p className="text-sm text-text-muted mt-1">Código de 4 dígitos para acceder a la aplicación.</p>
                    </div>

                    <div className="flex items-center gap-4">
                        {isEditingPin ? (
                            <div className="flex items-center gap-3 animate-in fade-in slide-in-from-right-4">
                                <input
                                    type="text"
                                    maxLength={4}
                                    value={newPin}
                                    onChange={(e) => setNewPin(e.target.value.replace(/[^0-9]/g, ''))}
                                    className="bg-bg-dark border border-white/10 rounded-lg px-4 py-2 text-center font-mono text-white w-32 focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                                    placeholder="0000"
                                    autoFocus
                                />
                                <button
                                    onClick={handleSavePin}
                                    className="p-2 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg transition-colors"
                                    title="Guardar"
                                >
                                    <Save size={20} />
                                </button>
                                <button
                                    onClick={() => { setIsEditingPin(false); setNewPin(currentPin); }}
                                    className="p-2 hover:bg-white/10 text-text-muted rounded-lg transition-colors"
                                    title="Cancelar"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-4">
                                <span className="font-mono text-xl text-slate-400 tracking-widest">••••</span>
                                <button
                                    onClick={() => { setIsEditingPin(true); setNewPin(currentPin); }}
                                    className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg text-sm font-medium transition-colors"
                                >
                                    Cambiar PIN
                                </button>
                            </div>
                        )}
                    </div>
                </div>
                {pinSuccess && (
                    <div className="flex items-center gap-2 text-primary text-sm bg-primary/5 p-3 rounded-lg animate-in fade-in slide-in-from-top-2">
                        <CheckCircle size={16} />
                        <span>PIN actualizado correctamente</span>
                    </div>
                )}
            </section>

            <hr className="border-white/5 my-8" />

            {/* Categories Section */}
            <section className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <Layers className="text-primary" size={20} />
                        <h2 className="text-lg font-bold text-white">Categorías de Actividad</h2>
                    </div>
                    <button className="bg-primary hover:bg-primary-hover text-bg-dark font-semibold px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/10 text-sm" onClick={handleNewCategory}>
                        <Plus size={16} />
                        Nueva
                    </button>
                </div>

                <div className="space-y-4">
                    {categories.map((cat) => (
                        <div key={cat.id} className="bg-bg-card border border-white/5 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between group hover:border-primary/30 transition-all gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-lg flex items-center justify-center border border-white/10" style={{ backgroundColor: `${cat.color}20`, borderColor: `${cat.color}30` }}>
                                    <div className="w-6 h-6 rounded" style={{ backgroundColor: cat.color }}></div>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg text-white">{cat.name}</h3>
                                    <div className="flex items-center gap-3 mt-1">
                                        <span className="text-xs px-2 py-0.5 bg-white/10 rounded text-slate-300">Objetivo: {cat.target}</span>
                                        <span className="flex items-center gap-1 text-xs text-text-muted">
                                            {cat.enabled ? 'Habilitado' : 'Deshabilitado'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-8 justify-end">
                                {/* Preview of color blocks */}
                                <div className="hidden lg:flex gap-1 opacity-60">
                                    {[10, 30, 50, 80, 100].map(opacity => (
                                        <div key={opacity} className="w-3 h-3 rounded-[2px]" style={{ backgroundColor: cat.color, opacity: opacity / 100 }}></div>
                                    ))}
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => setEditingCategory(cat)} className="p-2 hover:bg-white/10 rounded-lg text-text-muted hover:text-primary transition-colors">
                                        <Edit2 size={20} />
                                    </button>
                                    <button onClick={() => handleDelete(cat.id)} className="p-2 hover:bg-white/10 rounded-lg text-text-muted hover:text-red-400 transition-colors">
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Edit Modal */}
            {editingCategory && (
                <Modal isOpen={true} onClose={() => setEditingCategory(null)} title={`Editar Categoría: ${editingCategory.name}`}>
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-text-muted mb-2">Nombre de Categoría</label>
                            <input
                                type="text"
                                value={editingCategory.name}
                                onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                                className="w-full bg-bg-dark border border-white/10 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-text-muted mb-2">Meta Diaria</label>
                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    value={editingCategory.target}
                                    onChange={(e) => setEditingCategory({ ...editingCategory, target: e.target.value })}
                                    className="w-full bg-bg-dark border border-white/10 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-text-muted mb-2">Color del Mapa de Calor</label>
                            <div className="flex items-center gap-4 p-4 bg-bg-dark border border-white/10 rounded-xl">
                                <div className="w-10 h-10 rounded-lg cursor-pointer ring-2 ring-white/20" style={{ backgroundColor: editingCategory.color }}></div>
                                <input
                                    type="text"
                                    value={editingCategory.color}
                                    onChange={(e) => setEditingCategory({ ...editingCategory, color: e.target.value })}
                                    className="flex-1 bg-transparent border-none p-0 text-lg font-mono text-white focus:ring-0"
                                />
                            </div>
                            <div className="flex gap-2 mt-4">
                                {['#f87171', '#fb923c', '#fbbf24', '#30e87a', '#60a5fa', '#818cf8', '#f472b6'].map(color => (
                                    <div
                                        key={color}
                                        onClick={() => setEditingCategory({ ...editingCategory, color })}
                                        className={`w-6 h-6 rounded-full cursor-pointer ${editingCategory.color === color ? 'ring-2 ring-white' : ''}`}
                                        style={{ backgroundColor: color }}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="pt-6 flex justify-end gap-3">
                            <button onClick={() => setEditingCategory(null)} className="px-5 py-2 rounded-lg text-text-muted hover:text-white font-medium transition-colors">Cancelar</button>
                            <button onClick={handleSaveCategory} className="bg-primary hover:bg-primary-hover text-bg-dark font-bold px-6 py-2 rounded-lg transition-all">Guardar Cambios</button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};