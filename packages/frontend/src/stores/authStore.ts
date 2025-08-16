'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  email?: string;
  walletAddress: string;
  name?: string;
  displayName?: string;
  bio?: string;
  profilePicture?: string;
  avatarUrl?: string;
  selectedKingdom?: string;
  githubUsername?: string;
  honeycombUserId?: string;
  role: 'USER' | 'ADMIN' | 'MENTOR' | 'SPONSOR' | 'PLAYER';
  skills?: string[];
  skillScores?: Record<string, number>;
  xpTotal: number;
  reputationScore?: number;
  level?: number;
  badges?: any[];
  traits?: any[];
  isVerified?: boolean;
  preferences?: any;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AuthActions {
  setUser: (user: User | null) => void;
  setAccessToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  login: (user: User, token: string) => void;
  logout: () => void;
  clearError: () => void;
}

export type AuthStore = AuthState & AuthActions;

const initialState: AuthState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      setUser: (user) => set({ 
        user, 
        isAuthenticated: !!user 
      }),
      
      setAccessToken: (accessToken) => set({ accessToken }),
      
      setLoading: (isLoading) => set({ isLoading }),
      
      setError: (error) => set({ error }),
      
      login: (user, accessToken) => set({
        user,
        accessToken,
        isAuthenticated: true,
        error: null,
      }),
      
      logout: () => set({
        ...initialState,
      }),
      
      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);