import React, { useState } from 'react';
import { SummaryCards } from '../components/SummaryCards';
import { Heatmap } from '../components/Heatmap';
import { LogTable } from '../components/LogTable';
import { generateHeatmapData, recentLogs } from '../data';
import { CheckCircle, Calendar, Plus, Info } from 'lucide-react';
import { Modal } from '../components/Modal';

export const Overview: React.FC = () => {
  const [heatmapData] = useState(generateHeatmapData());
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [count, setCount] = useState(1);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
         <div>
            <h1 className="text-2xl font-bold text-white">Activity Overview</h1>
            <p className="text-text-muted">Welcome back, Alex.</p>
         </div>
         <div className="flex items-center gap-4">
             <div className="hidden md:flex items-center bg-white/5 rounded-lg px-3 py-2 gap-2 border border-white/5">
                <Calendar size={16} className="text-text-muted" />
                <span className="text-sm font-medium text-slate-300">Jan 1, 2024 - Dec 31, 2024</span>
             </div>
             <button 
                onClick={() => setIsLogModalOpen(true)}
                className="bg-primary text-bg-dark font-bold px-4 py-2 rounded-lg text-sm hover:bg-primary-hover transition-colors flex items-center gap-2"
             >
                <Plus size={18} />
                Log Event
             </button>
         </div>
      </div>

      <SummaryCards />
      
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        <div className="xl:col-span-3 space-y-8">
            <Heatmap 
                data={heatmapData} 
                title="Activity Log" 
                subtitle="Real-time daily activation density throughout the year" 
            />
            <LogTable logs={recentLogs} />
        </div>

        {/* Right Sidebar - Widgets */}
        <div className="xl:col-span-1 space-y-8">
             {/* Breakdown Widget */}
             <div className="bg-bg-card p-6 rounded-2xl border border-white/5">
                <h3 className="font-bold text-sm uppercase tracking-widest text-text-muted mb-6">Activity Breakdown</h3>
                <div className="space-y-6">
                    {[
                        { label: 'Infrastructure', val: 42, color: 'bg-primary' },
                        { label: 'API Hooks', val: 28, color: 'bg-primary/60' },
                        { label: 'User Interactions', val: 15, color: 'bg-primary/40' },
                        { label: 'Others', val: 15, color: 'bg-primary/20' },
                    ].map((item, i) => (
                        <div key={i} className="space-y-2">
                             <div className="flex justify-between text-xs font-semibold text-slate-300">
                                <span>{item.label}</span>
                                <span className="text-primary">{item.val}%</span>
                             </div>
                             <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.val}%` }}></div>
                             </div>
                        </div>
                    ))}
                </div>
             </div>

             {/* Goal Widget */}
             <div className="bg-primary/10 rounded-2xl p-6 border border-primary/20 relative overflow-hidden">
                 <div className="relative z-10">
                    <h4 className="font-bold text-primary mb-2">Weekly Goal</h4>
                    <p className="text-xs text-slate-400 mb-4">You have reached 84% of your weekly activation target.</p>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full border-4 border-primary border-r-transparent flex items-center justify-center text-xs font-bold text-white">
                            84%
                        </div>
                        <span className="text-sm font-semibold text-white">3,248 / 4,000</span>
                    </div>
                 </div>
                 {/* Decorative */}
                 <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-primary/10 rounded-full blur-2xl"></div>
             </div>

             {/* System Health */}
             <div>
                <h3 className="font-bold text-sm uppercase tracking-widest text-text-muted mb-4">System Health</h3>
                <div className="flex items-center gap-4 p-4 rounded-xl bg-bg-card border border-white/5">
                    <CheckCircle className="text-primary" size={24} />
                    <div>
                        <p className="text-sm font-bold text-white">All nodes active</p>
                        <p className="text-[10px] text-text-muted">Last health check: 2m ago</p>
                    </div>
                </div>
             </div>
        </div>
      </div>

      <Modal isOpen={isLogModalOpen} onClose={() => setIsLogModalOpen(false)} title="Log Activity">
          <div className="space-y-8">
              <div className="space-y-2">
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-widest">Date</label>
                  <div className="relative">
                      <input 
                        type="text" 
                        defaultValue="Today, Oct 24 2023"
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all"
                      />
                      <Calendar className="absolute right-3 top-3 text-text-muted" size={18} />
                  </div>
              </div>

              <div className="space-y-2">
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-widest">Event Category</label>
                  <select className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all appearance-none">
                      <option>Coding session</option>
                      <option>Exercise / Fitness</option>
                      <option>Reading</option>
                      <option>Meditation</option>
                  </select>
              </div>

              <div className="space-y-2">
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-widest">Activations</label>
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
                  <p className="text-[11px] text-text-muted mt-1 italic">How many times did you complete this today?</p>
              </div>

              <div className="space-y-2">
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-widest">Notes (Optional)</label>
                  <textarea 
                     className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all resize-none"
                     placeholder="Brief details about the session..."
                     rows={4}
                  ></textarea>
              </div>

              <div className="p-4 rounded-lg bg-primary/5 border border-primary/10 flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                      <Info className="text-primary" size={20} />
                  </div>
                  <p className="text-xs leading-relaxed text-slate-400">
                      Logging this activity will increase your weekly consistency score by <span className="text-primary font-bold">4.2%</span> and extend your streak.
                  </p>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center gap-3">
                  <button onClick={() => setIsLogModalOpen(false)} className="flex-1 py-3.5 bg-primary text-bg-dark font-bold rounded-xl text-sm hover:opacity-90 transition-all">
                      Log Event
                  </button>
                  <button onClick={() => setIsLogModalOpen(false)} className="px-6 py-3.5 border border-white/10 rounded-xl text-sm font-medium text-white hover:bg-white/5 transition-colors">
                      Cancel
                  </button>
              </div>
          </div>
      </Modal>
    </div>
  );
};
