import React, { useMemo } from 'react';
import { HeatmapDay } from '../types';

interface HeatmapProps {
  data: HeatmapDay[];
  title?: string;
  subtitle?: string;
  customColor?: string;
  onDayClick?: (date: string) => void;
  timeRange?: '1M' | '3M' | '6M' | '12M';
  onTimeRangeChange?: (range: '1M' | '3M' | '6M' | '12M') => void;
  onFullscreenToggle?: () => void;
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

export const Heatmap: React.FC<HeatmapProps> = ({ data, title, subtitle, customColor, onDayClick, timeRange = '12M', onTimeRangeChange, onFullscreenToggle }) => {
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
    if (level === 0) return { className: 'bg-white/5', style: {} };

    if (customColor) {
      const rgb = hexToRgb(customColor);
      if (rgb) {
        const { r, g, b } = rgb;
        let alpha = 0.2;
        if (level === 2) alpha = 0.4;
        if (level === 3) alpha = 0.7;
        if (level === 4) alpha = 1;
        return {
          className: '',
          style: { backgroundColor: `rgba(${r}, ${g}, ${b}, ${alpha})` }
        };
      }
    }

    switch (level) {
      case 1: return { className: 'bg-primary/20', style: {} };
      case 2: return { className: 'bg-primary/40', style: {} };
      case 3: return { className: 'bg-primary/70', style: {} };
      case 4: return { className: 'bg-primary', style: {} };
      default: return { className: 'bg-white/5', style: {} };
    }
  };

  return (
    <div className="bg-bg-card border border-white/10 rounded-2xl p-6 shadow-lg hover:border-primary/20 transition-all duration-300 flex flex-col w-full">
      {/* Header with Title, Filters, and Actions */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            {title && <h2 className="text-lg font-bold text-text-primary">{title}</h2>}
            {subtitle && <p className="text-text-muted text-sm">{subtitle}</p>}
          </div>

          {/* Fullscreen Button */}
          {onFullscreenToggle && (
            <button
              onClick={onFullscreenToggle}
              className="md:hidden self-end p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-primary/30 transition-all"
              aria-label="Ver en pantalla completa"
            >
              <svg className="w-5 h-5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>
          )}
        </div>

        {/* Time Range Filters and Legend */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Time Range Filter */}
          {onTimeRangeChange && (
            <div className="flex items-center gap-2 bg-white/5 p-1 rounded-lg border border-white/5">
              {(['1M', '3M', '6M', '12M'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => onTimeRangeChange(range)}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 ${timeRange === range
                      ? 'bg-primary text-bg-dark shadow-sm'
                      : 'text-text-muted hover:text-text-primary hover:bg-white/5'
                    }`}
                >
                  {range}
                </button>
              ))}
            </div>
          )}

          {/* Intensity Legend */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-text-muted font-medium">Menos</span>
            <div className="flex gap-1.5">
              {[0, 1, 2, 3, 4].map((level) => {
                const { className, style } = getStyle(level);
                return (
                  <div
                    key={level}
                    className={`w-3 h-3 rounded-sm ${className} border border-white/10`}
                    style={style}
                  ></div>
                );
              })}
            </div>
            <span className="text-xs text-text-muted font-medium">Más</span>
          </div>
        </div>
      </div>

      {/* Heatmap Grid Container */}
      <div className="w-full overflow-x-auto">
        <div className="relative min-w-full">
          {/* Month Labels */}
          <div className="flex text-[10px] font-medium text-text-muted mb-3 relative h-4 w-full">
            {monthLabels.map((m, i) => {
              const leftPos = (m.weekIndex / weeks.length) * 100;
              if (i > 0 && (m.weekIndex - monthLabels[i - 1].weekIndex) < 4) return null;
              return (
                <span key={i} style={{ left: `${leftPos}%` }} className="absolute">
                  {m.name}
                </span>
              );
            })}
          </div>

          {/* Heatmap Cells */}
          <div className="flex gap-1 w-full">
            {weeks.map((week, wIndex) => (
              <div key={wIndex} className="flex flex-col gap-1 flex-1 min-w-[10px]">
                {week.map((day, dIndex) => {
                  const isWeekend = dIndex >= 5;
                  const { className, style } = day ? getStyle(day.level) : { className: 'opacity-0', style: {} };

                  return (
                    <div
                      key={`${wIndex}-${dIndex}`}
                      onClick={() => day && onDayClick && onDayClick(day.date)}
                      className={`
                        relative aspect-square rounded-md w-full 
                        ${className}
                        ${isWeekend && day ? 'ring-1 ring-white/5' : ''} 
                        group
                        transition-all duration-200
                        ${day ? 'cursor-pointer hover:scale-110 hover:shadow-lg hover:shadow-primary/20 hover:z-20 hover:ring-2 hover:ring-primary/50' : ''}
                      `}
                      style={style}
                      title={day ? `${day.date}: ${day.count} eventos` : undefined}
                    >
                      {day && (
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-white/10 rounded-md transition-opacity pointer-events-none"></div>
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