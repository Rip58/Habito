import React from 'react';
import { Zap, Flame, CalendarCheck } from 'lucide-react';
import { StatCardProps } from '../types';

const Card: React.FC<StatCardProps & { colorClass: string }> = ({ title, value, subtext, icon, trend, trendUp, colorClass }) => (
  <div className="bg-bg-card p-6 rounded-2xl border border-white/5 shadow-sm hover:border-white/10 transition-all">
    <div className="flex items-center justify-between mb-4">
      <span className="text-text-muted text-sm font-medium">{title}</span>
      <div className={`p-2 rounded-lg ${colorClass} bg-opacity-20`}>
        {icon}
      </div>
    </div>
    <div className="flex items-end gap-3">
      <span className="text-3xl font-bold text-white">{value}</span>
      {trend && (
        <span className={`text-xs font-bold mb-1.5 flex items-center ${trendUp ? 'text-primary' : 'text-red-500'}`}>
           {trendUp ? '+' : ''}{trend}
        </span>
      )}
      {subtext && <span className="text-text-muted text-xs font-semibold mb-1.5">{subtext}</span>}
    </div>
  </div>
);

export const SummaryCards: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card
        title="Activaciones Totales"
        value="12,482"
        trend="12% vs mes anterior"
        trendUp={true}
        icon={<Zap size={20} className="text-primary" />}
        colorClass="bg-primary/20"
      />
      <Card
        title="Racha Actual"
        value="15 Días"
        subtext="Mejor: 42 Días"
        icon={<Flame size={20} className="text-orange-500" />}
        colorClass="bg-orange-500/20"
      />
      <Card
        title="Día Más Activo"
        value="12 Oct"
        subtext="432 activaciones"
        icon={<CalendarCheck size={20} className="text-blue-500" />}
        colorClass="bg-blue-500/20"
      />
    </div>
  );
};