import React, { useMemo } from 'react';
import { Zap, Flame } from 'lucide-react';
import { ActivityLog, Category } from '../types';

interface SummaryCardsProps {
  logs: ActivityLog[];
  categories: Category[];
  selectedCategory: string;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ logs, selectedCategory }) => {
  const getLocalDateKey = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const getFilteredLogs = (filter: string) =>
    filter === 'all' ? logs : logs.filter(l => (l.categoryId === filter) || (l.category === filter));

  // 1. Total Stats
  const totalStats = useMemo(() => {
    const filtered = getFilteredLogs(selectedCategory);
    const total = filtered.length;
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const daysElapsed = Math.floor((now.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return { total, daysElapsed };
  }, [logs, selectedCategory]);

  // 2. Streak Stats
  const streakStats = useMemo(() => {
    const filtered = getFilteredLogs(selectedCategory);
    const uniqueDates = Array.from(new Set(filtered
      .filter(l => l.dateObj)
      .map(l => getLocalDateKey(l.dateObj!))
    )).sort();

    let maxStreak = 0, currentStreak = 0;
    let prevDate: Date | null = null;

    const sortedDates = uniqueDates.map(d => {
      const [y, m, da] = d.split('-').map(Number);
      return new Date(y, m - 1, da);
    }).sort((a, b) => a.getTime() - b.getTime());

    sortedDates.forEach((date) => {
      if (!prevDate) {
        currentStreak = 1;
      } else {
        const diffDays = Math.ceil(Math.abs(date.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
        currentStreak = diffDays === 1 ? currentStreak + 1 : 1;
      }
      if (currentStreak > maxStreak) maxStreak = currentStreak;
      prevDate = date;
    });

    if (uniqueDates.length > 0 && maxStreak === 0) maxStreak = 1;
    return { maxStreak };
  }, [logs, selectedCategory]);

  return (
    <div className="rounded-lg border bg-card/40 border-border/40 shadow-sm hover:bg-card/70 transition-all duration-200 fade-in grid grid-cols-2 divide-x divide-border/40">
      <div className="p-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary/10 text-primary border border-primary/10 shrink-0 mb-4">
          <Zap size={20} />
        </div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Total Eventos</p>
        <span className="text-2xl font-semibold text-foreground tabular-nums">{totalStats.total}</span>
        <p className="text-xs text-muted-foreground mt-1.5 font-medium">en {totalStats.daysElapsed} días este año</p>
      </div>
      <div className="p-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary/10 text-primary border border-primary/10 shrink-0 mb-4">
          <Flame size={20} />
        </div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Racha Máxima</p>
        <span className="text-2xl font-semibold text-foreground tabular-nums">
          {streakStats.maxStreak} <span className="text-sm font-medium text-muted-foreground">días</span>
        </span>
        <p className="text-xs text-muted-foreground mt-1.5 font-medium">Mantén el ritmo 🔥</p>
      </div>
    </div>
  );
};
