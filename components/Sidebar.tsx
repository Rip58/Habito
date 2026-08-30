import React from 'react';
import { Page } from '../types';
import { NAV_ITEMS } from './v6/nav';
import { Prompt } from './v6/Prompt';

interface SidebarProps {
    currentPage: Page;
    onNavigate: (page: Page) => void;
}

/** Barra superior de escritorio: el prompt a la izquierda, destinos a la derecha. */
export const Sidebar: React.FC<SidebarProps> = ({ currentPage, onNavigate }) => (
    <header className="sticky top-0 z-50 hidden items-baseline gap-2 border-b border-border bg-background px-8 py-3.5 md:flex">
        <Prompt section={currentPage} />
        <div className="ml-auto flex items-center gap-4 text-12">
            {NAV_ITEMS.map(item => {
                const active = currentPage === item.id;
                return (
                    <button key={item.id} onClick={() => onNavigate(item.id)} aria-current={active ? 'page' : undefined}>
                        [<span
                            className={active ? 'font-bold' : ''}
                            style={{ color: active ? item.accent : 'var(--v6-dim)' }}
                        >{item.label}</span>]
                    </button>
                );
            })}
        </div>
    </header>
);
