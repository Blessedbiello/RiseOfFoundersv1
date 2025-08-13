'use client';

import { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { WalletProvider } from './WalletProvider';
import { ThemeProvider } from './ThemeProvider';
import { AuthProvider } from './AuthProvider';
import { GameProvider } from './GameProvider';
import { SocketProvider } from './SocketProvider';
import { ToastProvider } from './ToastProvider';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    },
    mutations: {
      retry: 1,
    },
  },
});

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem
        disableTransitionOnChange
      >
        <WalletProvider>
          <AuthProvider>
            <GameProvider>
              <SocketProvider>
                <ToastProvider>
                  {children}
                </ToastProvider>
              </SocketProvider>
            </GameProvider>
          </AuthProvider>
        </WalletProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}