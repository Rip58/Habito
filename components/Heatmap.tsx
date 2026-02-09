import React from 'react';
import { HeatmapDay } from '../types';

interface HeatmapProps {
  data: HeatmapDay[];
  title?: string;
  subtitle?: string;
}

export const Heatmap: React.FC<HeatmapProps> = ({ data, title, subtitle }) => {
  // Logic to split data into weeks (columns)
  // For simplicity in this demo, we just map the flat array to a grid
  // In a real app, we'd align this by day of week
  
  const weeks = [];
  const chunkSize = 7;
  for (let i = 0; i < data.length; i += chunkSize) {
    weeks.push(data.slice(i, i + chunkSize));
  }

  const getColor = (level: number) => {
    switch(level) {
      case 0: return 'bg-white/5';
      case 1: return 'bg-primary/20';
      case 2: return 'bg-primary/40';
      case 3: return 'bg-primary/70';
      case 4: return 'bg-primary';
      default: return 'bg-white/5';
    }
  };

  return (
    <div className="bg-bg-card border border-white/5 rounded-2xl p-6 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <div>
          {title && <h2 className="text-lg font-bold text-white">{title}</h2>}
          {subtitle && <p className="text-text-muted text-sm">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-text-muted">Menos</span>
          <div className="flex gap-1">
            <div className="w-3 h-3 bg-white/5 rounded-sm"></div>
            <div className="w-3 h-3 bg-primary/20 rounded-sm"></div>
            <div className="w-3 h-3 bg-primary/40 rounded-sm"></div>
            <div className="w-3 h-3 bg-primary/70 rounded-sm"></div>
            <div className="w-3 h-3 bg-primary rounded-sm"></div>
          </div>
          <span className="text-xs text-text-muted">Más</span>
        </div>
      </div>

      <div className="relative overflow-x-auto pb-2">
        <div className="flex gap-1 min-w-max">
          {/* We display weeks as columns */}
          {weeks.map((week, wIndex) => (
            <div key={wIndex} className="flex flex-col gap-1">
              {week.map((day, dIndex) => (
                <div 
                  key={`${wIndex}-${dIndex}`}
                  className={`w-3 h-3 rounded-[2px] ${getColor(day.level)} hover:ring-1 hover:ring-white transition-all cursor-pointer`}
                  title={`${day.date}: ${day.count} eventos`}
                />
              ))}
            </div>
          ))}
        </div>
        
        {/* Months labels could go here absolutely positioned or flexed, keeping it simple for now */}
        <div className="flex justify-between text-[10px] text-text-muted mt-2 px-1">
            <span>Ene</span><span>Feb</span><span>Mar</span><span>Abr</span><span>May</span><span>Jun</span><span>Jul</span><span>Ago</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dic</span>
        </div>
      </div>
    </div>
  );
};