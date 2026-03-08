import React, { useMemo } from 'react';
import { HeatmapDay, Category } from '../types';
import { ChevronDown, Filter } from 'lucide-react';

interface HeatmapProps {
  data: HeatmapDay[];
  title?: string;
  subtitle?: string;
  customColor?: string;
  onDayClick?: (date: string) => void;
  timeRange?: '1M' | '3M' | '6M' | '12M';
  onTimeRangeChange?: (range: '1M' | '3M' | '6M' | '12M') => void;
  categories?: Category[];
  selectedCategory?: string;
  onCategoryChange?: (category: string) => void;
}

const hexToRgb = (hex: string) => {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

export const Heatmap: React.FC<HeatmapProps> = ({
  data,
  title,
  subtitle,
  customColor,
  onDayClick,
  timeRange = '12M',
  onTimeRangeChange,
  categories = [],
  selectedCategory,
  onCategoryChange
}) => {
  // Process data to align by weeks starting Monday
  const { weeks, monthLabels } = useMemo(() => {
    if (!data.length) return { weeks: [], monthLabels: [] };

    const firstDate = new Date(data[0].date);
    // getUTCDay(): 0=Sun, 1=Mon, ..., 6=Sat
    // We want 0=Mon, ..., 6=Sun
    let startDayOfWeek = firstDate.getUTCDay() - 1;
    if (startDayOfWeek === -1) startDayOfWeek = 6; // Sunday becomes 6

    const totalDays = startDayOfWeek + data.length;
    const totalWeeks = Math.ceil(totalDays / 7);

    const weeksArray: (HeatmapDay | null)[][] = [];

    // Track months for labels
    const months: { name: string; weekIndex: number }[] = [];
    let currentMonth = -1;

    for (let w = 0; w < totalWeeks; w++) {
      const week: (HeatmapDay | null)[] = [];
      for (let d = 0; d < 7; d++) {
        const globalIndex = w * 7 + d;
        const dataIndex = globalIndex - startDayOfWeek;

        if (dataIndex >= 0 && dataIndex < data.length) {
          const dayData = data[dataIndex];
          week.push(dayData);

          // Check for new month
          const date = new Date(dayData.date);
          if (date.getUTCMonth() !== currentMonth) {
            currentMonth = date.getUTCMonth();
            // Only add label if it fits (not too close to end, roughly)
            // Using short names, ensure UTC timezone to avoid shift
            const monthName = date.toLocaleDateString('es-ES', { month: 'short', timeZone: 'UTC' });
            // capitalize
            months.push({
              name: monthName.charAt(0).toUpperCase() + monthName.slice(1),
              weekIndex: w
            });
          }
        } else {
          week.push(null);
        }
      }
      weeksArray.push(week);
    }
    return { weeks: weeksArray, monthLabels: months };
  }, [data]);

  const getStyle = (level: number) => {
    if (level === 0) return { className: 'bg-foreground/5 dark:bg-foreground/10', style: {} };

    if (customColor) {
      const rgb = hexToRgb(customColor);
      if (rgb) {
        const { r, g, b } = rgb;
        // Opacidades más marcadas para que se vean bien
        const alphas = [0.05, 0.4, 0.65, 0.85, 1];
        const alpha = alphas[level] || 1;
        if (level === 0) return { className: 'bg-foreground/5 dark:bg-foreground/10', style: {} };
        return { className: '', style: { backgroundColor: `rgba(${r}, ${g}, ${b}, ${alpha})` } };
      }
    }

    switch (level) {
      case 1: return { className: 'bg-primary/40', style: {} };
      case 2: return { className: 'bg-primary/65', style: {} };
      case 3: return { className: 'bg-primary/85', style: {} };
      case 4: return { className: 'bg-primary', style: {} };
      default: return { className: 'bg-foreground/5 dark:bg-foreground/10', style: {} };
    }
  };

  return (
    <div className="flex flex-col w-full h-full">
      {/* Header */}
      <div className="flex flex-col gap-3 mb-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            {title && <h2 className="text-base font-semibold text-foreground">{title}</h2>}
            {subtitle && <p className="text-muted-foreground text-sm">{subtitle}</p>}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Category Selector */}
            {categories.length > 0 && onCategoryChange && (
              <div className="relative">
                <select
                  value={selectedCategory}
                  onChange={(e) => onCategoryChange(e.target.value)}
                  className="appearance-none bg-muted/60 border border-border/40 text-xs text-muted-foreground font-medium rounded-md pl-2.5 pr-7 py-1.5 focus:outline-none focus:ring-1 focus:ring-ring/50 cursor-pointer hover:bg-muted transition-colors"
                >
                  <option value="all">Todas</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                <Filter size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              </div>
            )}

            {/* Time Range — shadcn Tabs style */}
            {onTimeRangeChange && (
              <div className="flex items-center gap-0.5 bg-muted/60 p-1 rounded-md border border-border/40">
                {(['1M', '3M', '6M', '12M'] as const).map((range) => (
                  <button
                    key={range}
                    onClick={() => onTimeRangeChange(range)}
                    className={`px-2.5 py-1 rounded-sm text-xs font-medium transition-all duration-200 ${timeRange === range
                      ? 'bg-card shadow-sm text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                      }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Intensity Legend */}
        <div className="flex justify-end w-full">
          <div className="flex items-center gap-2 group cursor-help" title="Sin eventos vs 1 o más eventos">
            <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">Menos</span>
            <div className="flex gap-1">
              {[0, 4].map((level) => {
                const { className, style } = getStyle(level);
                return (
                  <div
                    key={level}
                    className={`w-3 h-3 rounded-sm ${className} border border-border/20 shadow-sm`}
                    style={style}
                  />
                );
              })}
            </div>
            <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">Más</span>
          </div>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="w-full">
        <div className="relative w-full">
          {/* Month Labels */}
          <div className="flex text-[10px] font-medium text-muted-foreground mb-2 relative h-4 w-full">
            {monthLabels.map((m, i) => {
              const leftPos = (m.weekIndex / weeks.length) * 100;
              if (i > 0 && (m.weekIndex - monthLabels[i - 1].weekIndex) < 4) return null;
              return (
                <span key={i} style={{ left: `${leftPos}%` }} className="absolute -translate-x-1/2">
                  {m.name}
                </span>
              );
            })}
          </div>

          {/* Cells */}
          <div className="flex gap-[2px] sm:gap-[3px] w-full justify-between">
            {weeks.map((week, wIndex) => (
              <div key={wIndex} className="flex flex-col gap-[2px] sm:gap-[3px] flex-1 min-w-[4px]">
                {week.map((day, dIndex) => {
                  const { className, style } = day ? getStyle(day.level) : { className: 'opacity-0', style: {} };
                  return (
                    <div
                      key={`${wIndex}-${dIndex}`}
                      onClick={() => day && onDayClick && onDayClick(day.date)}
                      className={`
                        relative aspect-square rounded-[2px] w-full group transition-all duration-200
                        ${className}
                        ${day ? 'cursor-pointer hover:scale-[1.3] hover:z-20 hover:ring-1 hover:ring-border/50 hover:shadow-md' : ''}
                      `}
                      style={style}
                      title={day ? `${day.date}: ${day.count} eventos (Nivel ${day.level})` : undefined}
                    >
                      {day && (
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-white/20 rounded-[2px] transition-opacity pointer-events-none" />
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};