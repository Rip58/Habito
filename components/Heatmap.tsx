import React, { useMemo } from 'react';
import { HeatmapDay } from '../types';

interface HeatmapProps {
    data: HeatmapDay[];
    /** Hex de la paleta V6. */
    color: string;
    onDayClick?: (date: string) => void;
}

// Cinco pasos reales. El nivel 0 es un hueco visible, no transparente.
// #141414 sobre el fondo #0a0a0a era casi invisible. Este es el mismo tono
// que las líneas divisorias, que sí se distingue.
const EMPTY = '#1e1e1e';
const STEPS = ['33', '66', '99', 'ff'];

const cellBackground = (level: number, color: string) =>
    level <= 0 ? EMPTY : `${color}${STEPS[Math.min(4, level) - 1]}`;

export const Heatmap: React.FC<HeatmapProps> = ({ data, color, onDayClick }) => {
    const weeks = useMemo(() => {
        if (!data.length) return [] as (HeatmapDay | null)[][];
        const first = new Date(data[0].date);
        let offset = first.getUTCDay() - 1;
        if (offset === -1) offset = 6; // domingo al final

        const total = Math.ceil((offset + data.length) / 7);
        const out: (HeatmapDay | null)[][] = [];
        for (let w = 0; w < total; w++) {
            const week: (HeatmapDay | null)[] = [];
            for (let d = 0; d < 7; d++) {
                const index = w * 7 + d - offset;
                week.push(index >= 0 && index < data.length ? data[index] : null);
            }
            out.push(week);
        }
        return out;
    }, [data]);

    return (
        <div className="flex flex-col gap-1.5">
            {/* A 12 meses son 53 columnas: en un móvil de 390px la celda caería a
                unos 3px. Con ancho mínimo la tira se desborda y se desplaza en
                horizontal, en vez de encogerse hasta ser ilegible. */}
            <div className="-mx-0.5 overflow-x-auto px-0.5">
                <div className="flex gap-[3px]">
                    {weeks.map((week, w) => (
                        <div key={w} className="flex flex-col gap-[3px]" style={{ flex: '1 0 11px' }}>
                            {week.map((day, d) => (
                                <button
                                    key={`${w}-${d}`}
                                    type="button"
                                    disabled={!day}
                                    onClick={() => day && onDayClick?.(day.date)}
                                    title={day ? `${day.date}: ${day.count} ${day.count === 1 ? 'registro' : 'registros'}` : undefined}
                                    aria-label={day ? `${day.date}, ${day.count} registros` : undefined}
                                    style={{ background: day ? cellBackground(day.level, color) : 'transparent' }}
                                    className="aspect-square w-full rounded-sm"
                                />
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex items-center gap-2 text-10 uppercase tracking-[.3px] text-subtle">
                <span>menos</span>
                <div className="flex gap-[3px]">
                    {[0, 1, 2, 3, 4].map(level => (
                        <span
                            key={level}
                            className="h-[9px] w-[9px] rounded-sm"
                            style={{ background: cellBackground(level, color) }}
                        />
                    ))}
                </div>
                <span>más</span>
            </div>
        </div>
    );
};
