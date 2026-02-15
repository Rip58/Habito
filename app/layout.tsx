import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
    title: 'Activator',
    description: 'Activator Dashboard',
    icons: {
        icon: '/icon.png',
        apple: '/icon.png',
    },
};

export const viewport: Viewport = {
    themeColor: '#020617',
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: 'cover',
};

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
                    primary: '#CA8A04', // Elegant Gold
                    'primary-hover': '#A16207', // Darker Gold
                    'bg-dark': '#1C1917', // Warm Black (Stone 950)
                    'bg-card': '#292524', // Warm Dark Grey (Stone 800)
                    'bg-sidebar': '#292524', // Match card
                    'text-muted': '#A8A29E', // Stone 400
                    'text-primary': '#FAFAF9', // Stone 50
                    'accent': '#CA8A04', // Gold
                    'border-subtle': '#44403C', // Stone 700
                },
                fontFamily: {
                    sans: ['DM Sans', 'sans-serif'],
                    mono: ['Fira Code', 'monospace'],
                },
                animation: {
                    'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                    'float': 'float 6s ease-in-out infinite',
                    'glow': 'glow 2s ease-in-out infinite alternate',
                    'fade-in': 'fadeIn 0.5s ease-out forwards',
                    'shine': 'shine 0.6s ease-in-out',
                },
                keyframes: {
                    float: {
                        '0%, 100%': { transform: 'translateY(0)' },
                        '50%': { transform: 'translateY(-10px)' },
                    },
                    glow: {
                        'from': { boxShadow: '0 0 8px -4px #CA8A04' }, // Gold glow
                        'to': { boxShadow: '0 0 16px 2px #CA8A0440' },
                    },
                    shine: {
                        '0%': { transform: 'translateX(-100%)' },
                        '100%': { transform: 'translateX(100%)' },
                    },
                    fadeIn: {
                        'from': { opacity: '0', transform: 'translateY(20px)', filter: 'blur(10px)' },
                        'to': { opacity: '1', transform: 'translateY(0)', filter: 'blur(0)' },
                    }
                }
            },
        },
    };

    return (
        <html lang="en" className="dark" suppressHydrationWarning>
            <head>
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
                <script src="https://cdn.tailwindcss.com"></script>
                <link
                    href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Fira+Code:wght@400;500;600;700&display=swap"
                    rel="stylesheet" />
                <script dangerouslySetInnerHTML={{ __html: `tailwind.config = ${JSON.stringify(tailwindConfig)}` }} />
            </head>
            <body>{children}</body>
        </html>
    );
}
