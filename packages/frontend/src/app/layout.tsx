import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from '../components/providers/Providers';
import { ResponsiveProvider } from '../components/ui/responsive';
import { cn } from '../lib/utils';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap'
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap'
});

export const metadata: Metadata = {
  title: 'Rise of Founders - Gamified Founder Education',
  description: 'A gamified founder education & launchpad that blends hands-on startup training with persistent, verifiable on-chain progression.',
  keywords: ['startup', 'founder', 'education', 'web3', 'blockchain', 'solana', 'honeycomb', 'gamification'],
  authors: [{ name: 'Rise of Founders Team' }],
  openGraph: {
    title: 'Rise of Founders - Gamified Founder Education',
    description: 'Learn to build startups through hands-on missions and on-chain progression.',
    type: 'website',
    url: process.env.NEXT_PUBLIC_APP_URL,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Rise of Founders',
    description: 'Gamified founder education with on-chain progression.',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={cn(inter.variable, jetbrainsMono.variable)}>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#3b82f6" />
      </head>
      <body className={cn(
        'min-h-screen bg-background font-sans antialiased',
        'scrollbar-thin selection:bg-primary-200 selection:text-primary-900'
      )}>
        <ResponsiveProvider>
          <Providers>
            {children}
          </Providers>
        </ResponsiveProvider>
      </body>
    </html>
  );
}