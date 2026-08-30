import type { Config } from 'tailwindcss';

// V6 — sistema "terminal". Paleta y escala tomadas literalmente de la guía.
const config: Config = {
    content: [
        './app/**/*.{ts,tsx}',
        './components/**/*.{ts,tsx}',
        './views/**/*.{ts,tsx}',
        './App.tsx',
    ],
    theme: {
        extend: {
            colors: {
                background: 'var(--v6-bg)',
                surface: 'var(--v6-surface)',
                border: 'var(--v6-line)',
                foreground: 'var(--v6-fg)',
                white: 'var(--v6-white)',
                muted: 'var(--v6-dim2)',
                subtle: 'var(--v6-dim)',

                green: 'var(--v6-green)',
                amber: 'var(--v6-amber)',
                orange: 'var(--v6-orange)',
                red: 'var(--v6-red)',
                violet: 'var(--v6-violet)',
                blue: 'var(--v6-blue)',
            },
            fontFamily: {
                // Una sola familia para toda la hoja. `sans` apunta aquí también
                // para que una clase suelta no rompa la estética.
                sans: ['var(--font-mono-v6)', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
                mono: ['var(--font-mono-v6)', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
            },
            // Cuadrado, no redondo. Todos los radios grandes caen a 2px para que
            // una clase heredada no deje una tarjeta redondeada al lado de un
            // botón cuadrado (§9).
            borderRadius: {
                none: '0',
                sm: '1px',
                DEFAULT: '2px',
                md: '2px',
                lg: '2px',
                xl: '2px',
                '2xl': '2px',
                '3xl': '2px',
                full: '9999px',
            },
            fontSize: {
                '9': ['9px', '1.4'],
                '10': ['10px', '1.4'],
                '11': ['11px', '1.5'],
                '12': ['12px', '1.5'],
                '13': ['13px', '1.5'],
                '14': ['14px', '1.4'],
                display: ['44px', '1'],
            },
        },
    },
    plugins: [],
};

export default config;
