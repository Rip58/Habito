import { Page } from '../../types';

export interface NavItem {
    id: Page;
    label: string;
    accent: string;
}

export const NAV_ITEMS: NavItem[] = [
    { id: Page.OVERVIEW, label: 'resumen', accent: 'var(--v6-green)' },
    { id: Page.FOCUS, label: 'focus', accent: 'var(--v6-amber)' },
    { id: Page.SETTINGS, label: 'ajustes', accent: 'var(--v6-violet)' },
];

export const accentFor = (page: Page): string =>
    NAV_ITEMS.find(i => i.id === page)?.accent ?? 'var(--v6-green)';

/** Los hábitos toman color de la paleta, nunca un hex libre. */
// Sin rojo: en V6 significa error / borrar / negativo. Un hábito rojo se lee
// como una alerta.
export const HABIT_COLORS = [
    'var(--v6-green)',
    'var(--v6-amber)',
    'var(--v6-violet)',
    'var(--v6-blue)',
    'var(--v6-orange)',
] as const;

const HEX: Record<string, string> = {
    'var(--v6-green)': '#4ecca3',
    'var(--v6-amber)': '#e2b144',
    'var(--v6-violet)': '#a78bfa',
    'var(--v6-blue)': '#5aa9e6',
    'var(--v6-orange)': '#e0793c',
};

/**
 * Las categorías guardadas traen un hex de la app anterior. Lo mapeamos al
 * token más cercano de la paleta para no meter colores fuera del sistema.
 */
export const toPaletteHex = (stored?: string): string => {
    if (!stored) return '#4ecca3';
    const s = stored.toLowerCase();
    if (HEX[s]) return HEX[s];
    if (Object.values(HEX).includes(s)) return s;
    // Reparto estable por el propio valor, para que un mismo hábito no cambie
    // de color entre cargas.
    const sum = [...s].reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const values = Object.values(HEX);
    return values[sum % values.length];
};
