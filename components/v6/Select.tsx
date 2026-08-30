"use client";
import React, { useEffect, useId, useRef, useState } from 'react';

export interface SelectOption {
    value: string;
    label: string;
    /** Punto de color a la izquierda de la opción. */
    dot?: string;
}

interface SelectProps {
    value: string;
    onChange: (value: string) => void;
    options: SelectOption[];
    disabled?: boolean;
    placeholder?: string;
    error?: boolean;
    label?: string;
    className?: string;
}

/**
 * El <select> nativo no se puede restylear cuando está abierto: ese panel lo
 * pinta el sistema operativo, no el navegador. Para tener la estética cuadrada
 * hay que construirlo a mano.
 */
export const Select: React.FC<SelectProps> = ({
    value, onChange, options, disabled, placeholder, error, label, className,
}) => {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const listId = useId();

    useEffect(() => {
        if (!open) return;
        const onPointerDown = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') { e.stopPropagation(); setOpen(false); }
        };
        document.addEventListener('mousedown', onPointerDown);
        document.addEventListener('keydown', onKeyDown);
        return () => {
            document.removeEventListener('mousedown', onPointerDown);
            document.removeEventListener('keydown', onKeyDown);
        };
    }, [open]);

    const current = options.find(o => String(o.value) === String(value));
    const borderColor = open ? 'var(--v6-green)' : error ? 'var(--v6-red)' : 'var(--v6-line)';

    return (
        <div ref={ref} className={`relative ${className ?? ''}`}>
            {label && (
                <span className="mb-1 block text-10 uppercase tracking-[.3px] text-subtle">{label}</span>
            )}
            <button
                type="button"
                onClick={() => !disabled && setOpen(o => !o)}
                disabled={disabled}
                aria-haspopup="listbox"
                aria-expanded={open}
                aria-controls={open ? listId : undefined}
                style={{ borderColor }}
                className="flex min-h-[44px] w-full items-center justify-between gap-2 rounded border bg-surface px-2 py-[5px] text-left text-12 text-foreground outline-none disabled:text-subtle"
            >
                <span className="flex min-w-0 items-center gap-2">
                    {current?.dot && (
                        <span className="h-2 w-2 shrink-0 rounded-sm" style={{ background: current.dot }} />
                    )}
                    <span className="truncate">{current ? current.label : (placeholder ?? '—')}</span>
                </span>
                <span className="shrink-0 text-9 text-subtle">{open ? '▲' : '▼'}</span>
            </button>

            {open && (
                <div
                    id={listId}
                    role="listbox"
                    className="absolute left-0 right-0 top-[calc(100%+4px)] z-[60] max-h-60 overflow-y-auto rounded border border-border bg-surface"
                    style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}
                >
                    {options.map(o => {
                        const selected = String(o.value) === String(value);
                        return (
                            <button
                                key={o.value}
                                type="button"
                                role="option"
                                aria-selected={selected}
                                onClick={() => { onChange(o.value); setOpen(false); }}
                                style={{ background: selected ? 'rgba(78,204,163,0.08)' : 'transparent' }}
                                className={`flex min-h-[44px] w-full items-center gap-2 px-2 py-1.5 text-left text-12 ${selected ? 'text-green' : 'text-foreground'}`}
                            >
                                <span className="w-3 shrink-0">{selected ? '✓' : ''}</span>
                                {o.dot && <span className="h-2 w-2 shrink-0 rounded-sm" style={{ background: o.dot }} />}
                                <span className="truncate">{o.label}</span>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
