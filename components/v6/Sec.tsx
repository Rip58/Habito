import React from 'react';

interface SecProps {
    /** Color de acento de la sección (token de la paleta V6). */
    accent: string;
    title: string;
    /** Se pinta a la derecha del título, en dim. */
    right?: React.ReactNode;
    /** Siempre en minúscula y con el prefijo `//`. */
    comment?: string;
    children: React.ReactNode;
}

/**
 * Cabecera de sección: sustituye a la tarjeta con sombra. Un triángulo del
 * color de acento, el título, y el contenido indentado 18px — el hueco que
 * deja el triángulo más un espacio.
 */
export const Sec: React.FC<SecProps> = ({ accent, title, right, comment, children }) => (
    <section className="mt-[22px]">
        <div className="flex items-baseline gap-2">
            <span style={{ color: accent }}>▸</span>
            <h2 className="text-14 font-bold text-white">{title}</h2>
            {right && <div className="ml-auto whitespace-nowrap text-11 text-subtle">{right}</div>}
        </div>
        {comment && <p className="mb-2 mt-0.5 pl-[18px] text-11 text-subtle">{comment}</p>}
        <div className="pl-[18px]">{children}</div>
    </section>
);
