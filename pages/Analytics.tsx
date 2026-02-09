import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, Tooltip, BarChart, Bar } from 'recharts';
import { Heatmap } from '../components/Heatmap';
import { generateHeatmapData } from '../data';
import { ArrowUpRight, TrendingUp, AlertTriangle, Clock } from 'lucide-react';

export const Analytics: React.FC = () => {
  const data = generateHeatmapData();

  // Mock data for charts
  const weeklyData = [
    { name: 'Mon', current: 40, prev: 24 },
    { name: 'Tue', current: 30, prev: 13 },
    { name: 'Wed', current: 55, prev: 40 },
    { name: 'Thu', current: 45, prev: 35 },
    { name: 'Fri', current: 20, prev: 15 },
    { name: 'Sat', current: 10, prev: 5 },
    { name: 'Sun', current: 5, prev: 2 },
  ];

  const monthlyData = [
    { name: 'Jul', sessions: 200 },
    { name: 'Aug', sessions: 350 },
    { name: 'Sep', sessions: 400 },
    { name: 'Oct', sessions: 600 },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
        <header className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-white">Detailed Analytics</h1>
            <div className="flex gap-4">
                 <button className="bg-primary/10 text-primary px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary/20 transition-colors">Last 12 Months</button>
                 <button className="bg-primary text-bg-dark font-bold px-4 py-2 rounded-lg text-sm hover:opacity-90 transition-opacity">Export Report</button>
            </div>
        </header>

        {/* Top Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
             {[
                { label: 'Total Activations', val: '124,892', trend: '12%', up: true },
                { label: 'Peak Day', val: 'Tuesday', sub: 'Avg 4.2k' },
                { label: 'Active Streak', val: '18 Days', sub: 'On fire!' },
                { label: 'Success Rate', val: '99.4%', sub: 'Stable' },
             ].map((stat, i) => (
                <div key={i} className="bg-bg-card p-5 rounded-xl border border-white/5 shadow-sm">
                    <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">{stat.label}</p>
                    <div className="flex items-end gap-2">
                        <h3 className="text-2xl font-bold text-white">{stat.val}</h3>
                        {stat.trend && <span className="text-primary text-xs font-bold pb-1 flex items-center"><ArrowUpRight size={12}/> {stat.trend}</span>}
                        {stat.sub && <span className="text-text-muted text-xs pb-1">{stat.sub}</span>}
                    </div>
                </div>
             ))}
        </div>

        <Heatmap data={data} title="Yearly Activation Intensity" />

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
             <div className="lg:col-span-2 space-y-8">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="bg-bg-card p-6 rounded-xl border border-white/5 shadow-sm">
                         <div className="mb-6">
                            <h3 className="font-bold text-white text-md">Week-over-Week</h3>
                            <p className="text-xs text-text-muted">Comparing current vs previous 7 days</p>
                         </div>
                         <div className="h-48">
                             <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={weeklyData}>
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                                    <Tooltip contentStyle={{backgroundColor: '#111c16', border: '1px solid #ffffff10'}} cursor={{fill: 'transparent'}} />
                                    <Bar dataKey="prev" fill="#334155" radius={[2, 2, 0, 0]} />
                                    <Bar dataKey="current" fill="#30e87a" radius={[2, 2, 0, 0]} />
                                </BarChart>
                             </ResponsiveContainer>
                         </div>
                     </div>

                     <div className="bg-bg-card p-6 rounded-xl border border-white/5 shadow-sm">
                         <div className="mb-6">
                            <h3 className="font-bold text-white text-md">Monthly Trend</h3>
                            <p className="text-xs text-text-muted">Active sessions per month</p>
                         </div>
                         <div className="h-48">
                             <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={monthlyData}>
                                    <defs>
                                        <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#30e87a" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#30e87a" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                                    <Tooltip contentStyle={{backgroundColor: '#111c16', border: '1px solid #ffffff10'}} />
                                    <Area type="monotone" dataKey="sessions" stroke="#30e87a" fillOpacity={1} fill="url(#colorSessions)" strokeWidth={3} />
                                </AreaChart>
                             </ResponsiveContainer>
                         </div>
                     </div>
                 </div>
             </div>

             {/* Smart Insights Sidebar */}
             <div className="lg:col-span-1">
                 <div className="bg-bg-card rounded-xl border border-white/5 shadow-sm overflow-hidden h-full flex flex-col">
                     <div className="p-6 border-b border-white/5">
                         <div className="flex items-center gap-2 mb-1">
                             <TrendingUp className="text-primary" size={20} />
                             <h3 className="font-bold text-white">Smart Insights</h3>
                         </div>
                         <p className="text-xs text-text-muted">AI-generated activity observations</p>
                     </div>
                     <div className="p-6 space-y-6 flex-1">
                         <div className="flex gap-4">
                             <div className="mt-1 w-8 h-8 rounded bg-primary/10 flex items-center justify-center shrink-0">
                                 <ArrowUpRight className="text-primary" size={16} />
                             </div>
                             <div>
                                 <h4 className="text-sm font-bold text-white mb-1">Monthly Growth</h4>
                                 <p className="text-xs text-text-muted leading-relaxed">Your overall activity increased by <span className="text-primary font-bold">15%</span> compared to last month.</p>
                             </div>
                         </div>
                         <div className="flex gap-4">
                             <div className="mt-1 w-8 h-8 rounded bg-blue-500/10 flex items-center justify-center shrink-0">
                                 <Clock className="text-blue-500" size={16} />
                             </div>
                             <div>
                                 <h4 className="text-sm font-bold text-white mb-1">Peak Productivity</h4>
                                 <p className="text-xs text-text-muted leading-relaxed">Most events are triggered between <span className="text-white">9:00 AM - 11:30 AM</span>.</p>
                             </div>
                         </div>
                         <div className="flex gap-4">
                             <div className="mt-1 w-8 h-8 rounded bg-yellow-500/10 flex items-center justify-center shrink-0">
                                 <AlertTriangle className="text-yellow-500" size={16} />
                             </div>
                             <div>
                                 <h4 className="text-sm font-bold text-white mb-1">Error Anomaly</h4>
                                 <p className="text-xs text-text-muted leading-relaxed">Detected a <span className="text-yellow-500">4% spike</span> in API timeout errors on Wednesdays.</p>
                             </div>
                         </div>
                     </div>
                     <div className="p-4 border-t border-white/5">
                        <button className="w-full py-3 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold transition-colors">
                            VIEW FULL REPORT
                        </button>
                     </div>
                 </div>
             </div>
        </div>
    </div>
  );
};
