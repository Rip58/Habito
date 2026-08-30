import React from 'react';

interface DiffRowProps {
    /** Color de la categoría: pinta el borde izquierdo y el signo. */
    color: string;
    sign?: '+' | '−' | '·';
    /** Fondo tintado del mismo color. Se apaga en filas neutras. */
    tinted?: boolean;
    onClick?: () => void;
    className?: string;
    children: React.ReactNode;
}

/**
 * Fila tipo `diff` de terminal: borde izquierdo de 2px del color de resultado,
 * fondo muy tenue y el signo como primer elemento. Se escanea sin leer nada.
 */
export const DiffRow: React.FC<DiffRowProps> = ({ color, sign = '+', tinted = true, onClick, className = '', children }) => {
    const Tag = onClick ? 'button' : 'div';
    return (
        <Tag
            onClick={onClick}
            style={{
                borderLeft: `2px solid ${color}`,
                background: tinted ? `${color}12` : 'transparent',
            }}
            className={`flex w-full items-center gap-2 px-2 py-[5px] text-left ${onClick ? 'tap-highlight-transparent' : ''} ${className}`}
        >
            <span className="w-2 shrink-0 text-12 font-bold" style={{ color }}>{sign}</span>
            {children}
        </Tag>
    );
};
