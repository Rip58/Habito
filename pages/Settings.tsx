import React, { useState } from 'react';
import { initialCategories } from '../data';
import { Category } from '../types';
import { Edit2, Trash2, Plus, Bell, BellOff, X, Lightbulb } from 'lucide-react';
import { Modal } from '../components/Modal';

export const Settings: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const handleDelete = (id: string) => {
    setCategories(categories.filter(c => c.id !== id));
  };

  const handleSave = () => {
    if (editingCategory) {
      setCategories(categories.map(c => c.id === editingCategory.id ? editingCategory : c));
      setEditingCategory(null);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
       <header className="flex justify-between items-end mb-8">
           <div>
               <h1 className="text-2xl font-bold text-white mb-2">Event Category Settings</h1>
               <p className="text-text-muted">Manage your tracking categories and visualization preferences.</p>
           </div>
           <button className="bg-primary hover:bg-primary-hover text-bg-dark font-semibold px-4 py-2 rounded-lg flex items-center gap-2 transition-all shadow-lg shadow-primary/10">
               <Plus size={18} />
               Create Category
           </button>
       </header>

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
                               <span className="text-xs px-2 py-0.5 bg-white/10 rounded text-slate-300">Target: {cat.target}</span>
                               <span className="flex items-center gap-1 text-xs text-text-muted">
                                   {cat.enabled ? <Bell size={12} /> : <BellOff size={12} />}
                                   {cat.enabled ? 'Enabled' : 'Disabled'}
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

       {/* Edit Modal (simulated inline if using standard Modal component, here specific) */}
       {editingCategory && (
           <Modal isOpen={true} onClose={() => setEditingCategory(null)} title={`Edit Category: ${editingCategory.name}`}>
               <div className="space-y-6">
                   <div>
                       <label className="block text-sm font-medium text-text-muted mb-2">Category Name</label>
                       <input 
                         type="text" 
                         value={editingCategory.name}
                         onChange={(e) => setEditingCategory({...editingCategory, name: e.target.value})}
                         className="w-full bg-bg-dark border border-white/10 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                       />
                   </div>
                   
                   <div>
                        <label className="block text-sm font-medium text-text-muted mb-2">Daily Goal</label>
                        <div className="flex gap-3">
                            <input 
                                type="text"
                                value={editingCategory.target}
                                onChange={(e) => setEditingCategory({...editingCategory, target: e.target.value})}
                                className="w-full bg-bg-dark border border-white/10 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                            />
                        </div>
                   </div>

                   <div className="space-y-4 pt-4 border-t border-white/10">
                        <div className="flex items-center justify-between">
                            <div>
                                <span className="block font-medium text-white">Notifications</span>
                                <span className="text-sm text-text-muted">Receive alerts to reach your goal</span>
                            </div>
                            <button 
                                onClick={() => setEditingCategory({...editingCategory, enabled: !editingCategory.enabled})}
                                className={`w-11 h-6 rounded-full transition-colors relative ${editingCategory.enabled ? 'bg-primary' : 'bg-white/10'}`}
                            >
                                <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${editingCategory.enabled ? 'translate-x-5' : ''}`}></div>
                            </button>
                        </div>
                   </div>

                   <div>
                       <label className="block text-sm font-medium text-text-muted mb-2">Heatmap Color</label>
                       <div className="flex items-center gap-4 p-4 bg-bg-dark border border-white/10 rounded-xl">
                            <div className="w-10 h-10 rounded-lg cursor-pointer ring-2 ring-white/20" style={{ backgroundColor: editingCategory.color }}></div>
                            <input 
                                type="text"
                                value={editingCategory.color}
                                onChange={(e) => setEditingCategory({...editingCategory, color: e.target.value})}
                                className="flex-1 bg-transparent border-none p-0 text-lg font-mono text-white focus:ring-0"
                            />
                       </div>
                       <div className="flex gap-2 mt-4">
                           {['#f87171', '#fb923c', '#fbbf24', '#30e87a', '#60a5fa', '#818cf8', '#f472b6'].map(color => (
                               <div 
                                 key={color} 
                                 onClick={() => setEditingCategory({...editingCategory, color})}
                                 className={`w-6 h-6 rounded-full cursor-pointer ${editingCategory.color === color ? 'ring-2 ring-white' : ''}`}
                                 style={{ backgroundColor: color }}
                               />
                           ))}
                       </div>
                   </div>

                   <div className="pt-6 flex justify-end gap-3">
                       <button onClick={() => setEditingCategory(null)} className="px-5 py-2 rounded-lg text-text-muted hover:text-white font-medium transition-colors">Cancel</button>
                       <button onClick={handleSave} className="bg-primary hover:bg-primary-hover text-bg-dark font-bold px-6 py-2 rounded-lg transition-all">Save Changes</button>
                   </div>
               </div>
           </Modal>
       )}

       <div className="mt-10 p-6 rounded-xl border border-dashed border-white/10 flex items-start gap-4">
           <Lightbulb className="text-primary" size={24} />
           <div>
               <h4 className="font-semibold text-sm text-white">Pro Tip</h4>
               <p className="text-sm text-text-muted mt-1">Consistency is key! Set smaller targets initially and gradually increase them as you build momentum.</p>
           </div>
       </div>
    </div>
  );
};
