import React from 'react';

type Base = React.ButtonHTMLAttributes<HTMLButtonElement>;

/**
 * Botón "de comando": texto entre corchetes, sin fondo ni borde. Para acciones
 * ligeras dentro del flujo de texto.
 */
export const Cmd: React.FC<Base & { accent?: string; strong?: boolean }> = ({
    accent = 'var(--v6-green)', strong, children, className = '', disabled, ...rest
}) => (
    <button
        {...rest}
        disabled={disabled}
        className={`text-12 ${className}`}
    >
        [<span
            className={strong ? 'font-bold' : ''}
            style={{ color: disabled ? 'var(--v6-dim)' : accent }}
        >{children}</span>]
    </button>
);

/**
 * Botón "de caja": borde de 1px del color de acento, fondo transparente. Para
 * acciones con más peso. Nunca fondo sólido de color.
 */
export const Box: React.FC<Base & { accent?: string }> = ({
    accent = 'var(--v6-green)', children, className = '', disabled, ...rest
}) => (
    <button
        {...rest}
        disabled={disabled}
        style={{
            borderColor: disabled ? 'var(--v6-line)' : accent,
            color: disabled ? 'var(--v6-dim)' : accent,
        }}
        className={`flex min-h-[44px] items-center justify-center rounded border px-2.5 py-2 text-12 font-bold ${className}`}
    >
        {children}
    </button>
);
