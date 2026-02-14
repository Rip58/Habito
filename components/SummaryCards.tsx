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

  // Helper to get local YYYY-MM-DD
  const getLocalDateKey = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getFilteredLogs = (filter: string) => {
    return filter === 'all' ? logs : logs.filter(l => (l.categoryId === filter) || (l.category === filter));
  };

  const activeCategories = categories.filter(c => c.enabled);

  // --- Stats Calculations ---

  // 1. Total Stats
  const totalStats = useMemo(() => {
    const filtered = getFilteredLogs(filterTotal);
    const total = filtered.length;
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const daysElapsed = Math.floor((now.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return { total, daysElapsed };
  }, [logs, filterTotal]);

  // 2. Streak Stats (Longest Streak)
  const streakStats = useMemo(() => {
    const filtered = getFilteredLogs(filterStreak);
    const uniqueDates = Array.from(new Set(filtered
      .filter(l => l.dateObj)
      .map(l => getLocalDateKey(l.dateObj!))
    )).sort();

    let maxStreak = 0;
    let currentStreak = 0;
    let prevDate: Date | null = null;

    // Convert keys back to dates for comparison
    const sortedDates = uniqueDates.map(d => {
      const [y, m, da] = d.split('-').map(Number);
      return new Date(y, m - 1, da);
    }).sort((a, b) => a.getTime() - b.getTime());

    sortedDates.forEach((date) => {
      if (!prevDate) {
        currentStreak = 1;
      } else {
        const diffTime = Math.abs(date.getTime() - prevDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          currentStreak++;
        } else {
          currentStreak = Math.max(1, currentStreak);
          // Reset streak but check if new date is start of new streak? 
          // Logic: diffDays > 1 means gap. So currentStreak becomes 1.
          currentStreak = 1;
        }
      }
      if (currentStreak > maxStreak) maxStreak = currentStreak;
      prevDate = date;
    });

    // If no logs, maxStreak is 0
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

    let maxDay = '-';
    let maxCount = 0;

    for (const [day, count] of dayCounts.entries()) {
      if (count > maxCount) {
        maxCount = count;
        const [y, m, d] = day.split('-');
        const dateObj = new Date(Number(y), Number(m) - 1, Number(d));
        maxDay = dateObj.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
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
    // Avoid division by zero
    const percent = countDenom === 0 ? 0 : Math.round((countNum / countDenom) * 100);
    return { countNum, countDenom, percent };
  }, [logs, filterNum, filterDenom]);

  // Reusable Card Component
  const StatCard = ({
    icon: Icon,
    label,
    value,
    subtext,
    filter,
    setFilter,
    options
  }: {
    icon: any,
    label: string,
    value: React.ReactNode,
    subtext: string,
    filter: string,
    setFilter: (val: string) => void,
    options: Category[]
  }) => (
    <div className="glass-card rounded-2xl p-6 relative group transition-all duration-300 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-primary/10 text-primary group-hover:scale-105 transition-transform duration-300 border border-primary/10`}>
          <Icon size={24} />
        </div>

        {/* Dropdown Filter */}
        <div className="relative z-10">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="appearance-none bg-white/5 border border-white/5 hover:border-white/10 text-xs font-semibold text-text-muted rounded-lg pl-3 pr-8 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary/50 cursor-pointer transition-colors w-full max-w-[120px]"
          >
            <option value="all" className="bg-bg-dark text-white">Todas</option>
            {options.map(cat => (
              <option key={cat.id} value={cat.id} className="bg-bg-dark text-white">{cat.name}</option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
        </div>
      </div>

      <div>
        <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1 opacity-80">{label}</p>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-white tabular-nums tracking-tight">{value}</span>
        </div>
        <p className="text-[11px] text-text-muted mt-2 opacity-60 font-medium">{subtext}</p>
      </div>

      {/* Decorative Glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
    </div>
  );

  // New Percentage Card Component
  const StatCardPercentage = ({
    icon: Icon,
    label,
    countNum,
    countDenom,
    percent,
    filterNum,
    setFilterNum,
    filterDenom,
    setFilterDenom,
    options
  }: {
    icon: any,
    label: string,
    countNum: number,
    countDenom: number,
    percent: number,
    filterNum: string,
    setFilterNum: (val: string) => void,
    filterDenom: string,
    setFilterDenom: (val: string) => void,
    options: Category[]
  }) => (
    <div className="glass-card rounded-2xl p-6 relative group transition-all duration-300 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5">

      {/* Header with Title and Icon */}
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-primary/10 text-primary group-hover:scale-105 transition-transform duration-300 border border-primary/10`}>
          <Icon size={24} />
        </div>
        <p className="text-xs font-bold text-text-muted uppercase tracking-wider opacity-80">{label}</p>
      </div>

      {/* Dual Selectors */}
      <div className="flex flex-col gap-2 mb-4 relative z-10">
        {/* Numerator */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] text-text-muted uppercase font-bold w-4 text-center">A</span>
          <div className="relative w-full">
            <select
              value={filterNum}
              onChange={(e) => setFilterNum(e.target.value)}
              className="w-full appearance-none bg-white/5 border border-white/5 hover:border-white/10 text-xs font-semibold text-text-muted rounded-lg pl-3 pr-6 py-1 focus:outline-none focus:ring-1 focus:ring-primary/50 cursor-pointer transition-colors"
            >
              <option value="all" className="bg-bg-dark text-white">Todas</option>
              {options.map(cat => (
                <option key={cat.id} value={cat.id} className="bg-bg-dark text-white">{cat.name}</option>
              ))}
            </select>
            <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-white/10 w-full"></div>

        {/* Denominator */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] text-text-muted uppercase font-bold w-4 text-center">B</span>
          <div className="relative w-full">
            <select
              value={filterDenom}
              onChange={(e) => setFilterDenom(e.target.value)}
              className="w-full appearance-none bg-white/5 border border-white/5 hover:border-white/10 text-xs font-semibold text-text-muted rounded-lg pl-3 pr-6 py-1 focus:outline-none focus:ring-1 focus:ring-primary/50 cursor-pointer transition-colors"
            >
              <option value="all" className="bg-bg-dark text-white">Todas</option>
              {options.map(cat => (
                <option key={cat.id} value={cat.id} className="bg-bg-dark text-white">{cat.name}</option>
              ))}
            </select>
            <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Result Display */}
      <div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-white tabular-nums tracking-tight">{percent}%</span>
          <span className="text-xs text-text-muted font-medium">(A/B)</span>
        </div>
        <p className="text-[10px] text-text-muted mt-1 opacity-60 font-medium">{countNum} / {countDenom} eventos</p>
      </div>

      {/* Decorative Glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
    </div>
  );

  return (
    <div className="grid grid-cols-2 gap-4 animate-in fade-in duration-500 delay-100">

      {/* Total Card */}
      <StatCard
        icon={Zap}
        label="Total Eventos"
        value={totalStats.total}
        subtext={`${totalStats.total} eventos / ${totalStats.daysElapsed} días`}
        filter={filterTotal}
        setFilter={setFilterTotal}
        options={activeCategories}
      />

      {/* Streak Card */}
      <StatCard
        icon={Flame}
        label="Racha Actual"
        value={<span>{streakStats.maxStreak} <span className="text-sm font-medium text-text-muted">días</span></span>}
        subtext="Mantén el ritmo"
        filter={filterStreak}
        setFilter={setFilterStreak}
        options={activeCategories}
      />

      {/* Top Day Card */}
      <StatCard
        icon={CalendarCheck}
        label="Día Más Activo"
        value={topDayStats.maxDay}
        subtext={`${topDayStats.maxCount} activaciones`}
        filter={filterTopDay}
        setFilter={setFilterTopDay}
        options={activeCategories}
      />

      {/* Percentage Card */}
      <StatCardPercentage
        icon={Zap} // Or another icon like Percent or Ratio if available
        label="Ratio de Eventos"
        countNum={percentageStats.countNum}
        countDenom={percentageStats.countDenom}
        percent={percentageStats.percent}
        filterNum={filterNum}
        setFilterNum={setFilterNum}
        filterDenom={filterDenom}
        setFilterDenom={setFilterDenom}
        options={activeCategories}
      />
    </div>
  );
};