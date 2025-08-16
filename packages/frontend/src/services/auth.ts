'use client';

import axios from 'axios';
import { User } from '../stores/authStore';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth-storage');
  if (token) {
    try {
      const authData = JSON.parse(token);
      if (authData.state?.accessToken) {
        config.headers.Authorization = `Bearer ${authData.state.accessToken}`;
      }
    } catch (error) {
      console.error('Error parsing auth token:', error);
    }
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth state on 401
      localStorage.removeItem('auth-storage');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export interface LoginResponse {
  success: boolean;
  data: {
    user: User;
    accessToken: string;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
}

export const authApi = {
  // GitHub OAuth callback
  handleGitHubCallback: async (code: string, state?: string): Promise<LoginResponse> => {
    const response = await api.post('/auth/github/callback', { code, state });
    return response.data;
  },

  // Link GitHub account to existing user
  linkGitHub: async (): Promise<ApiResponse<{ user: User }>> => {
    const response = await api.post('/auth/github/link');
    return response.data;
  },

  // Get current user profile
  getProfile: async (): Promise<ApiResponse<{ user: User }>> => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  // Update user profile
  updateProfile: async (profileData: {
    name?: string;
    bio?: string;
    profilePicture?: string;
    selectedKingdom?: string;
  }): Promise<ApiResponse<{ user: User }>> => {
    // Map frontend fields to backend fields
    const backendData = {
      displayName: profileData.name,
      bio: profileData.bio,
      avatarUrl: profileData.profilePicture,
      selectedKingdom: profileData.selectedKingdom,
    };
    const response = await api.put('/auth/profile', backendData);
    return response.data;
  },

  // Refresh access token
  refreshToken: async (): Promise<LoginResponse> => {
    const response = await api.post('/auth/refresh');
    return response.data;
  },

  // Logout
  logout: async (): Promise<ApiResponse> => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  // Verify email
  verifyEmail: async (token: string): Promise<ApiResponse> => {
    const response = await api.post('/auth/verify-email', { token });
    return response.data;
  },

  // Request password reset
  requestPasswordReset: async (email: string): Promise<ApiResponse> => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  // Reset password
  resetPassword: async (token: string, newPassword: string): Promise<ApiResponse> => {
    const response = await api.post('/auth/reset-password', { token, newPassword });
    return response.data;
  },
};

export default api;