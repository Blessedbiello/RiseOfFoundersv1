'use client';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

interface AuthChallengeResponse {
  message: string;
  walletAddress: string;
}

interface AuthVerifyResponse {
  accessToken: string;
  user: {
    id: string;
    walletAddress: string;
    name: string;
    displayName: string;
    bio?: string;
    avatarUrl?: string;
    role: string;
    xpTotal: number;
    reputationScore: number;
    skillScores: any;
    badges: any[];
    traits: any[];
    isVerified: boolean;
    preferences: any;
    honeycombUserId?: string;
    createdAt: string;
    updatedAt: string;
  };
}

class ApiService {
  private async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `HTTP ${response.status}`;
      
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.error || errorJson.message || errorMessage;
      } catch {
        // If it's not JSON, use the raw text or status
        errorMessage = errorText || errorMessage;
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    
    if (!data.success && data.error) {
      throw new Error(data.error);
    }
    
    return data.data || data;
  }

  /**
   * Get authentication challenge from backend
   */
  async getAuthChallenge(walletAddress: string): Promise<AuthChallengeResponse> {
    return this.request<AuthChallengeResponse>('/api/honeycomb/auth/challenge', {
      method: 'POST',
      body: JSON.stringify({ walletAddress }),
    });
  }

  /**
   * Verify signature and authenticate with backend
   */
  async verifyAuthentication(
    walletAddress: string,
    signature: string,
    message: string
  ): Promise<AuthVerifyResponse> {
    return this.request<AuthVerifyResponse>('/api/honeycomb/auth/verify', {
      method: 'POST',
      body: JSON.stringify({ walletAddress, signature, message }),
    });
  }

  /**
   * Create Honeycomb profile through backend
   */
  async createProfile(
    name: string,
    bio?: string,
    walletAddress?: string
  ): Promise<{ profileId: string; message: string }> {
    return this.request('/api/honeycomb/profiles', {
      method: 'POST',
      body: JSON.stringify({ name, bio, walletAddress }),
    });
  }

  /**
   * Get user's Honeycomb profile
   */
  async getUserProfile(walletAddress: string): Promise<any> {
    return this.request(`/api/honeycomb/profile/${walletAddress}`);
  }

  /**
   * Get user's badges
   */
  async getUserBadges(userId: string): Promise<any[]> {
    return this.request(`/api/honeycomb/badges/${userId}`);
  }

  /**
   * Check for new badges
   */
  async checkBadges(authToken?: string): Promise<{ badges: any[] }> {
    return this.request('/api/honeycomb/badges/check', {
      method: 'POST',
      headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
    });
  }

  /**
   * Get Honeycomb status
   */
  async getHoneycombStatus(): Promise<any> {
    return this.request('/api/honeycomb/status');
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<any> {
    return this.request('/health');
  }
}

export const apiService = new ApiService();
export type { AuthChallengeResponse, AuthVerifyResponse };