import type { Metadata, Viewport } from 'next';
import { JetBrains_Mono } from 'next/font/google';
import './globals.css';

// Autohospedada: no depende de una petición externa en tiempo de ejecución.
const jetbrainsMono = JetBrains_Mono({
    subsets: ['latin'],
    weight: ['400', '500', '700'],
    variable: '--font-mono-v6',
    display: 'swap',
});

export const metadata: Metadata = {
    title: 'habitos',
    description: 'Seguimiento de hábitos',
    icons: {
        icon: '/icon.png',
        apple: '/icon.png',
    },
};

export const viewport: Viewport = {
    themeColor: '#0a0a0a',
    width: 'device-width',
    initialScale: 1,
    // Sin maximumScale ni userScalable: bloquear el zoom incumple WCAG 1.4.4.
    viewportFit: 'cover',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="es" className={jetbrainsMono.variable}>
            <head>
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
            </head>
            <body>{children}</body>
        </html>
    );
}
