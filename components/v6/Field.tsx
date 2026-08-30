import React from 'react';

export const Label: React.FC<{ children: React.ReactNode; error?: boolean; htmlFor?: string; right?: React.ReactNode }> = ({
    children, error, htmlFor, right,
}) => (
    <div className="flex items-baseline gap-2">
        <label
            htmlFor={htmlFor}
            className="text-10 uppercase tracking-[.3px]"
            style={{ color: error ? 'var(--v6-red)' : 'var(--v6-dim)' }}
        >
            {children}
        </label>
        {right && <span className="ml-auto text-11 text-subtle">{right}</span>}
    </div>
);

/** Input cuadrado: padding 5px 8px, borde de 1px, fondo hundido. */
export const inputClass =
    'w-full rounded border bg-surface px-2 py-[5px] text-12 text-foreground outline-none focus:border-green';

export const errorBorder = { borderColor: 'var(--v6-red)' };
