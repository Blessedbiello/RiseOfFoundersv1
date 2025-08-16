'use client';

import api from './auth';

export interface MissionSubmission {
  missionId: string;
  artifacts: any[];
  reflection: string;
  startedAt: string;
  completedAt: string;
}

export interface MissionProgress {
  missionId: string;
  userId: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'failed';
  progress: number;
  artifacts: any[];
  startedAt?: string;
  completedAt?: string;
  xpEarned?: number;
  badgesEarned?: string[];
}

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
}

export const missionsApi = {
  // Start a mission
  startMission: async (missionId: string): Promise<ApiResponse<{ submissionId: string }>> => {
    const response = await api.post('/missions/start', { missionId });
    return response.data;
  },

  // Submit completed mission
  submitMission: async (submission: MissionSubmission): Promise<ApiResponse<{
    xpEarned: number;
    badgesEarned: string[];
    newLevel?: number;
    honeycombResult: any;
  }>> => {
    const response = await api.post('/missions/submit', submission);
    return response.data;
  },

  // Get user's mission progress
  getMissionProgress: async (userId?: string): Promise<ApiResponse<MissionProgress[]>> => {
    const url = userId ? `/missions/progress/${userId}` : '/missions/progress';
    const response = await api.get(url);
    return response.data;
  },

  // Get mission leaderboard
  getLeaderboard: async (missionId?: string): Promise<ApiResponse<any[]>> => {
    const url = missionId ? `/missions/leaderboard/${missionId}` : '/missions/leaderboard';
    const response = await api.get(url);
    return response.data;
  },

  // Validate GitHub artifact
  validateGitHubArtifact: async (data: {
    url: string;
    type: 'repository' | 'pull_request';
  }): Promise<ApiResponse<any>> => {
    const response = await api.post('/missions/validate/github', data);
    return response.data;
  },

  // Validate Solana transaction
  validateSolanaTransaction: async (data: {
    signature: string;
    expectedProgram?: string;
    minAmount?: number;
  }): Promise<ApiResponse<any>> => {
    const response = await api.post('/missions/validate/solana', data);
    return response.data;
  },

  // Upload mission artifact
  uploadArtifact: async (file: File, submissionId: string): Promise<ApiResponse<{
    fileId: string;
    url: string;
  }>> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('submissionId', submissionId);

    const response = await api.post('/missions/artifacts/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Get mission definitions
  getMissionDefinitions: async (): Promise<ApiResponse<any[]>> => {
    const response = await api.get('/missions/definitions');
    return response.data;
  },

  // Get user achievements
  getUserAchievements: async (userId?: string): Promise<ApiResponse<any[]>> => {
    const url = userId ? `/missions/achievements/${userId}` : '/missions/achievements';
    const response = await api.get(url);
    return response.data;
  },

  // Honeycomb integration endpoints
  honeycomb: {
    // Complete mission in Honeycomb
    completeMission: async (data: {
      missionId: string;
      submissionId: string;
      artifacts: any[];
    }): Promise<ApiResponse<any>> => {
      const response = await api.post('/honeycomb/missions/complete', data);
      return response.data;
    },

    // Check for new badges
    checkBadges: async (userId: string): Promise<ApiResponse<any>> => {
      const response = await api.post(`/honeycomb/badges/check/${userId}`);
      return response.data;
    },

    // Update user traits
    updateTraits: async (data: {
      technical?: number;
      business?: number;
      marketing?: number;
      leadership?: number;
      design?: number;
    }): Promise<ApiResponse<any>> => {
      const response = await api.post('/honeycomb/traits/update', data);
      return response.data;
    },
  },
};