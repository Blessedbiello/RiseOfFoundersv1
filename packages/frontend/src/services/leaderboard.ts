'use client';

import api from './auth';
import { ApiResponse } from './auth';

interface LeaderboardUser {
  id: string;
  displayName: string;
  avatarUrl?: string;
  xpTotal: number;
  reputationScore: number;
  skillScores: Record<string, number>;
  selectedKingdom?: string;
  badges: any[];
  rank: number;
}

interface LeaderboardData {
  users: LeaderboardUser[];
  page: number;
  limit: number;
  total: number;
}

export const leaderboardApi = {
  // Get global leaderboard
  getLeaderboard: async (params?: {
    skill?: string;
    limit?: number;
    page?: number;
  }): Promise<ApiResponse<LeaderboardData>> => {
    const queryParams = new URLSearchParams();
    if (params?.skill) queryParams.append('skill', params.skill);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.page) queryParams.append('page', params.page.toString());
    
    const response = await api.get(`/public/leaderboard?${queryParams.toString()}`);
    return response.data;
  },

  // Get user's current rank
  getUserRank: async (userId: string): Promise<ApiResponse<{ rank: number }>> => {
    const response = await api.get(`/users/${userId}/rank`);
    return response.data;
  },

  // Get kingdom-specific leaderboard
  getKingdomLeaderboard: async (kingdom: string, params?: {
    limit?: number;
    page?: number;
  }): Promise<ApiResponse<LeaderboardData>> => {
    const queryParams = new URLSearchParams();
    queryParams.append('kingdom', kingdom);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.page) queryParams.append('page', params.page.toString());
    
    const response = await api.get(`/public/leaderboard?${queryParams.toString()}`);
    return response.data;
  }
};