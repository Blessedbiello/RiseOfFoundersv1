import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers/Providers';
import { cn } from '@/lib/utils';

const inter = Inter({ subsets: ['latin'] });

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
    <html lang="en" suppressHydrationWarning>
      <body className={cn(inter.className, 'min-h-screen bg-background antialiased')}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}