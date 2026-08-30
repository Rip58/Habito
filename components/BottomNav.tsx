import React from 'react';
import { Page } from '../types';
import { NAV_ITEMS, accentFor } from './v6/nav';

interface BottomNavProps {
    currentPage: Page;
    onNavigate: (page: Page) => void;
}

/**
 * El prompt hace de menú: dice dónde estás con el cursor parpadeando, y debajo
 * los destinos entre corchetes. La celda de toque es el ancho completo dividido
 * entre destinos por 44px de alto — el mínimo para el dedo, no el texto.
 */
export const BottomNav: React.FC<BottomNavProps> = ({ currentPage, onNavigate }) => {
    const accent = accentFor(currentPage);
    const label = NAV_ITEMS.find(i => i.id === currentPage)?.label ?? String(currentPage);

    return (
        <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background px-3.5 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] md:hidden">
            <div className="text-12 text-muted">
                <span className="text-green">$</span> <span className="text-subtle">cd</span>{' '}
                <span className="font-bold" style={{ color: accent }}>{label}</span>
                <span className="v6-cursor" style={{ color: accent }} />
            </div>
            <div className="mt-0.5 flex items-stretch" style={{ height: 44 }}>
                {NAV_ITEMS.map(item => {
                    const active = currentPage === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => onNavigate(item.id)}
                            aria-current={active ? 'page' : undefined}
                            className="tap-highlight-transparent flex flex-1 items-center justify-center text-12"
                        >
                            [<span
                                className={active ? 'font-bold' : ''}
                                style={{ color: active ? item.accent : 'var(--v6-dim)' }}
                            >{item.label}</span>]
                        </button>
                    );
                })}
            </div>
        </nav>
    );
};
