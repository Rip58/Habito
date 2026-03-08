import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
    title: 'Habitos Pro',
    description: 'Habitos Pro Dashboard',
    icons: {
        icon: '/icon.png',
        apple: '/icon.png',
    },
};

export const viewport: Viewport = {
    themeColor: '#0f0f0f',
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: 'cover',
};

import { ThemeProvider } from '../components/ThemeProvider';

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const tailwindConfig = {
        darkMode: 'class',
        theme: {
            extend: {
                colors: {
                    border: 'hsl(var(--border) / <alpha-value>)',
                    input: 'hsl(var(--input) / <alpha-value>)',
                    ring: 'hsl(var(--ring) / <alpha-value>)',
                    background: 'hsl(var(--background) / <alpha-value>)',
                    foreground: 'hsl(var(--foreground) / <alpha-value>)',
                    primary: {
                        DEFAULT: 'hsl(var(--primary) / <alpha-value>)',
                        foreground: 'hsl(var(--primary-foreground) / <alpha-value>)',
                    },
                    secondary: {
                        DEFAULT: 'hsl(var(--secondary) / <alpha-value>)',
                        foreground: 'hsl(var(--secondary-foreground) / <alpha-value>)',
                    },
                    destructive: {
                        DEFAULT: 'hsl(var(--destructive) / <alpha-value>)',
                        foreground: 'hsl(var(--destructive-foreground) / <alpha-value>)',
                    },
                    muted: {
                        DEFAULT: 'hsl(var(--muted) / <alpha-value>)',
                        foreground: 'hsl(var(--muted-foreground) / <alpha-value>)',
                    },
                    accent: {
                        DEFAULT: 'hsl(var(--accent) / <alpha-value>)',
                        foreground: 'hsl(var(--accent-foreground) / <alpha-value>)',
                    },
                    popover: {
                        DEFAULT: 'hsl(var(--popover) / <alpha-value>)',
                        foreground: 'hsl(var(--popover-foreground) / <alpha-value>)',
                    },
                    card: {
                        DEFAULT: 'hsl(var(--card) / <alpha-value>)',
                        foreground: 'hsl(var(--card-foreground) / <alpha-value>)',
                    },
                },
                fontFamily: {
                    sans: ['Inter', 'system-ui', 'sans-serif'],
                    mono: ['JetBrains Mono', 'monospace'],
                },
                borderRadius: {
                    lg: '0.5rem',
                    md: '0.375rem',
                    sm: '0.25rem',
                    xl: '0.75rem',
                    '2xl': '1rem',
                    '3xl': '1.5rem',
                },
                animation: {
                    'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                    'fade-in': 'fade-in-up 0.4s ease-out both',
                    'slide-in': 'slide-in-right 0.3s ease-out both',
                    'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
                    'modal-in': 'zoom-in-95 0.2s ease-out both',
                },
                keyframes: {
                    'fade-in-up': {
                        from: { opacity: '0', transform: 'translateY(10px)' },
                        to: { opacity: '1', transform: 'translateY(0)' },
                    },
                    'slide-in-right': {
                        from: { opacity: '0', transform: 'translateX(-10px)' },
                        to: { opacity: '1', transform: 'translateX(0)' },
                    },
                    'pulse-glow': {
                        '0%, 100%': { opacity: '1' },
                        '50%': { opacity: '0.7' },
                    },
                    'zoom-in-95': {
                        from: { opacity: '0', transform: 'scale(0.95)' },
                        to: { opacity: '1', transform: 'scale(1)' },
                    },
                },
                boxShadow: {
                    sm: '0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 1px 2px -1px hsl(0 0% 0% / 0.10)',
                    md: '0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 2px 4px -1px hsl(0 0% 0% / 0.10)',
                },
            },
        },
    };

    return (
        <html lang="es" suppressHydrationWarning>
            <head>
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
                <script src="https://cdn.tailwindcss.com"></script>
                <link
                    href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Inter:wght@300;400;500;600;700&display=swap"
                    rel="stylesheet" />
                <script dangerouslySetInnerHTML={{ __html: `tailwind.config = ${JSON.stringify(tailwindConfig)}` }} />
            </head>
            <body>
                <ThemeProvider>
                    {children}
                </ThemeProvider>
            </body>
        </html>
    );
}
