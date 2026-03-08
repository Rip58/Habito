import React, { useState, useMemo } from 'react';
import { Zap, Flame, CalendarCheck, ChevronDown } from 'lucide-react';
import { ActivityLog, Category } from '../types';

interface SummaryCardsProps {
  logs: ActivityLog[];
  categories: Category[];
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ logs, categories }) => {
  const [filterTotal, setFilterTotal] = useState('all');
  const [filterStreak, setFilterStreak] = useState('all');
  const [filterTopDay, setFilterTopDay] = useState('all');

  const getLocalDateKey = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const getFilteredLogs = (filter: string) =>
    filter === 'all' ? logs : logs.filter(l => (l.categoryId === filter) || (l.category === filter));

  const activeCategories = categories.filter(c => c.enabled);

  // 1. Total Stats
  const totalStats = useMemo(() => {
    const filtered = getFilteredLogs(filterTotal);
    const total = filtered.length;
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const daysElapsed = Math.floor((now.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return { total, daysElapsed };
  }, [logs, filterTotal]);

  // 2. Streak Stats
  const streakStats = useMemo(() => {
    const filtered = getFilteredLogs(filterStreak);
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
  }, [logs, filterStreak]);

  // 3. Top Day Stats
  const topDayStats = useMemo(() => {
    const filtered = getFilteredLogs(filterTopDay);
    const dayCounts = new Map<string, number>();
    filtered.forEach(log => {
      if (log.dateObj) {
        const key = getLocalDateKey(log.dateObj);
        dayCounts.set(key, (dayCounts.get(key) || 0) + 1);
      }
    });
    let maxDay = '-', maxCount = 0;
    for (const [day, count] of dayCounts.entries()) {
      if (count > maxCount) {
        maxCount = count;
        const [y, m, d] = day.split('-');
        maxDay = new Date(Number(y), Number(m) - 1, Number(d))
          .toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
      }
    }
    return { maxDay, maxCount };
  }, [logs, filterTopDay]);

  // 4. Percentage Stats
  const [filterNum, setFilterNum] = useState(categories[0]?.id || 'all');
  const [filterDenom, setFilterDenom] = useState(categories[1]?.id || 'all');

  const percentageStats = useMemo(() => {
    const countNum = getFilteredLogs(filterNum).length;
    const countDenom = getFilteredLogs(filterDenom).length;
    const percent = countDenom === 0 ? 0 : Math.round((countNum / countDenom) * 100);
    return { countNum, countDenom, percent };
  }, [logs, filterNum, filterDenom]);

  // ── Reusable Filter Select ─────────────────────────────
  const FilterSelect = ({
    value,
    onChange,
    options,
  }: {
    value: string;
    onChange: (v: string) => void;
    options: Category[];
  }) => (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none bg-muted/60 border border-border/40 hover:border-border text-xs font-semibold text-muted-foreground rounded-md pl-2.5 pr-6 py-1.5 focus:outline-none focus:ring-1 focus:ring-ring/50 cursor-pointer transition-colors"
      >
        <option value="all">Todas</option>
        {options.map(cat => (
          <option key={cat.id} value={cat.id}>{cat.name}</option>
        ))}
      </select>
      <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
    </div>
  );

  // ── Stat Card ──────────────────────────────────────────
  const StatCard = ({
    icon: Icon,
    label,
    value,
    subtext,
    filter,
    setFilter,
    options,
  }: {
    icon: any;
    label: string;
    value: React.ReactNode;
    subtext: string;
    filter: string;
    setFilter: (v: string) => void;
    options: Category[];
  }) => (
    <div className="rounded-lg border bg-card/40 border-border/40 p-4 shadow-sm hover:bg-card/70 transition-all duration-200 relative overflow-hidden">
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary/10 text-primary border border-primary/10 shrink-0">
          <Icon size={20} />
        </div>
        <FilterSelect value={filter} onChange={setFilter} options={options} />
      </div>
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">{label}</p>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-semibold text-foreground tabular-nums">{value}</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1.5 font-medium">{subtext}</p>
      </div>
    </div>
  );

  // ── Percentage Card ────────────────────────────────────
  const PercentageCard = () => (
    <div className="rounded-lg border bg-card/40 border-border/40 p-4 shadow-sm hover:bg-card/70 transition-all duration-200 relative overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary/10 text-primary border border-primary/10 shrink-0">
          <Zap size={20} />
        </div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ratio</p>
      </div>

      <div className="flex flex-col gap-1.5 mb-3">
        <FilterSelect value={filterNum} onChange={setFilterNum} options={activeCategories} />
        <div className="h-px bg-border/40 w-full" />
        <FilterSelect value={filterDenom} onChange={setFilterDenom} options={activeCategories} />
      </div>

      <div>
        <span className="text-2xl font-semibold text-foreground tabular-nums">{percentageStats.percent}%</span>
        <p className="text-xs text-muted-foreground mt-1 font-medium">
          {percentageStats.countNum} / {percentageStats.countDenom} eventos
        </p>
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-2 gap-3 fade-in">
      <StatCard
        icon={Zap}
        label="Total Eventos"
        value={totalStats.total}
        subtext={`en ${totalStats.daysElapsed} días este año`}
        filter={filterTotal}
        setFilter={setFilterTotal}
        options={activeCategories}
      />
      <StatCard
        icon={Flame}
        label="Racha Máxima"
        value={<span>{streakStats.maxStreak} <span className="text-sm font-medium text-muted-foreground">días</span></span>}
        subtext="Mantén el ritmo 🔥"
        filter={filterStreak}
        setFilter={setFilterStreak}
        options={activeCategories}
      />
      <StatCard
        icon={CalendarCheck}
        label="Día Más Activo"
        value={topDayStats.maxDay}
        subtext={`${topDayStats.maxCount} activaciones`}
        filter={filterTopDay}
        setFilter={setFilterTopDay}
        options={activeCategories}
      />
      <PercentageCard />
    </div>
  );
};