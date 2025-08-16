'use client';

import api from './auth';

export interface HoneycombAuthChallenge {
  message: string;
  walletAddress: string;
}

export interface HoneycombAuthResult {
  accessToken: string;
  user: {
    id: string;
    wallet: string;
  };
}

export interface HoneycombProfile {
  name: string;
  bio?: string;
  profilePicture?: string;
  walletAddress: string;
}

export interface HoneycombMissionCompletion {
  missionId: string;
  submissionId: string;
  artifacts: any[];
}

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
}

export const honeycombApi = {
  // Authentication
  getAuthChallenge: async (walletAddress: string): Promise<ApiResponse<HoneycombAuthChallenge>> => {
    const response = await api.post('/honeycomb/auth/challenge', { walletAddress });
    return response.data;
  },

  verifySignature: async (payload: {
    walletAddress: string;
    signature: string;
    message: string;
  }): Promise<ApiResponse<HoneycombAuthResult>> => {
    const response = await api.post('/honeycomb/auth/verify', payload);
    return response.data;
  },

  // Profile Management
  createProfile: async (profileData: HoneycombProfile): Promise<ApiResponse<{ profileId: string }>> => {
    const response = await api.post('/honeycomb/profiles', profileData);
    return response.data;
  },

  getProfile: async (userId: string): Promise<ApiResponse<any>> => {
    const response = await api.get(`/honeycomb/profiles/${userId}`);
    return response.data;
  },

  syncProfile: async (userId: string): Promise<ApiResponse<any>> => {
    const response = await api.post(`/honeycomb/profiles/${userId}/sync`);
    return response.data;
  },

  getUserStats: async (userId: string): Promise<ApiResponse<any>> => {
    const response = await api.get(`/honeycomb/profiles/${userId}/stats`);
    return response.data;
  },

  // Mission Management
  completeMission: async (missionData: HoneycombMissionCompletion): Promise<ApiResponse<any>> => {
    const response = await api.post('/honeycomb/missions/complete', missionData);
    return response.data;
  },

  getMissionProgress: async (userId: string): Promise<ApiResponse<any>> => {
    const response = await api.get(`/honeycomb/missions/progress/${userId}`);
    return response.data;
  },

  // Badge System
  getBadgeDefinitions: async (): Promise<ApiResponse<any>> => {
    const response = await api.get('/honeycomb/badges/definitions');
    return response.data;
  },

  checkUserBadges: async (userId: string): Promise<ApiResponse<any>> => {
    const response = await api.post(`/honeycomb/badges/check/${userId}`);
    return response.data;
  },

  // Status and Health
  getStatus: async (): Promise<ApiResponse<any>> => {
    const response = await api.get('/honeycomb/status');
    return response.data;
  },

  // Admin endpoints (require admin role)
  admin: {
    reinitialize: async (): Promise<ApiResponse<any>> => {
      const response = await api.post('/honeycomb/admin/reinitialize');
      return response.data;
    },

    setupProject: async (projectName: string, authorityPublicKey: string): Promise<ApiResponse<any>> => {
      const response = await api.post('/honeycomb/admin/setup-project', {
        projectName,
        authorityPublicKey,
      });
      return response.data;
    },

    getDetailedHealth: async (): Promise<ApiResponse<any>> => {
      const response = await api.get('/honeycomb/admin/health');
      return response.data;
    },
  },
};