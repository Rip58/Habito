import React from 'react';
import { Zap, Flame, CalendarCheck, TrendingUp } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';

export const SummaryCards: React.FC = () => {
  const stats = useLiveQuery(async () => {
    const logs = await db.logs.toArray();

    // Total
    const total = logs.length;

    // Helper to get local YYYY-MM-DD
    const getLocalDateKey = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    // Most Active Day & Unique Dates
    const dayCounts = new Map<string, number>();
    const uniqueDates = new Set<string>();

    logs.forEach(log => {
      if (log.dateObj) {
        const key = getLocalDateKey(log.dateObj);
        dayCounts.set(key, (dayCounts.get(key) || 0) + 1);
        uniqueDates.add(key);
      }
    });

    let maxDay = '-';
    let maxCount = 0;

    // Find max day
    for (const [day, count] of dayCounts.entries()) {
      if (count > maxCount) {
        maxCount = count;
        const [y, m, d] = day.split('-');
        const dateObj = new Date(Number(y), Number(m) - 1, Number(d));
        maxDay = dateObj.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
      }
    }

    // Calculate Streak
    const sortedDates = Array.from(uniqueDates).sort().reverse();
    const todayKey = getLocalDateKey(new Date());
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = getLocalDateKey(yesterday);

    let streak = 0;

    if (!uniqueDates.has(todayKey) && !uniqueDates.has(yesterdayKey)) {
      streak = 0;
    } else {
      let currentCheckDate = new Date();
      if (!uniqueDates.has(todayKey)) {
        currentCheckDate = yesterday;
      }

      while (true) {
        const dateKey = getLocalDateKey(currentCheckDate);
        if (uniqueDates.has(dateKey)) {
          streak++;
          currentCheckDate.setDate(currentCheckDate.getDate() - 1);
        } else {
          break;
        }
      }
    }

    return { total, maxDay, maxCount, streak };
  }, []) || { total: 0, maxDay: '-', maxCount: 0, streak: 0 };

  if (!stats) return null;

  return (
    <div className="bg-bg-card rounded-2xl border border-white/10 p-6 shadow-lg hover:border-primary/30 transition-all duration-300 group">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
            <TrendingUp className="text-primary" size={20} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">Estadísticas Generales</h3>
            <p className="text-xs text-text-muted">Resumen de tu actividad</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Activations */}
        <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all cursor-pointer group/stat border border-white/5 hover:border-primary/30">
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0 group-hover/stat:scale-110 transition-transform">
            <Zap className="text-primary" size={22} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">Total</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-text-primary tabular-nums">{stats.total}</span>
              {stats.total > 0 && (
                <span className="text-xs font-bold text-primary bg-primary/20 px-2 py-0.5 rounded-full">
                  +100%
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Current Streak */}
        <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all cursor-pointer group/stat border border-white/5 hover:border-orange-500/30">
          <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center shrink-0 group-hover/stat:scale-110 transition-transform">
            <Flame className="text-orange-500" size={22} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">Racha</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-text-primary tabular-nums">{stats.streak}</span>
              <span className="text-sm font-medium text-text-muted">días</span>
            </div>
            <p className="text-[10px] text-text-muted mt-0.5">Mantén el ritmo</p>
          </div>
        </div>

        {/* Most Active Day */}
        <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all cursor-pointer group/stat border border-white/5 hover:border-accent/30">
          <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center shrink-0 group-hover/stat:scale-110 transition-transform">
            <CalendarCheck className="text-accent" size={22} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">Día Top</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-text-primary">{stats.maxDay}</span>
            </div>
            <p className="text-[10px] text-text-muted mt-0.5">{stats.maxCount} activaciones</p>
          </div>
        </div>
      </div>
    </div>
  );
};