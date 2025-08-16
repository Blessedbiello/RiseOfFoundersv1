import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Create axios instance with default config
const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface GitHubConnectResponse {
  authUrl: string;
  state: string;
}

export interface GitHubCallbackResponse {
  githubConnected: boolean;
  githubUsername: string;
  githubId: number;
  xpAwarded: number;
  badgeEarned: string;
}

export interface GitHubCallbackRequest {
  code: string;
  state: string;
}

export const githubApi = {
  /**
   * Start GitHub OAuth flow
   */
  connect: async (): Promise<GitHubConnectResponse> => {
    const response = await api.post('/auth/github/connect');
    return response.data.data;
  },

  /**
   * Complete GitHub OAuth flow
   */
  callback: async (data: GitHubCallbackRequest): Promise<GitHubCallbackResponse> => {
    const response = await api.post('/auth/github/callback', data);
    return response.data.data;
  },

  /**
   * Disconnect GitHub account
   */
  disconnect: async (): Promise<{ success: boolean }> => {
    const response = await api.post('/auth/github/disconnect');
    return response.data;
  },

  /**
   * Get GitHub connection status
   */
  getStatus: async (): Promise<{
    connected: boolean;
    username?: string;
    githubId?: string;
  }> => {
    const response = await api.get('/auth/github/status');
    return response.data.data;
  },
};

/**
 * Helper function to handle GitHub OAuth popup
 */
export const openGitHubOAuth = (authUrl: string): Promise<GitHubCallbackRequest> => {
  return new Promise((resolve, reject) => {
    const popup = window.open(
      authUrl,
      'github-oauth',
      'width=600,height=700,scrollbars=yes,resizable=yes'
    );

    if (!popup) {
      reject(new Error('Failed to open GitHub OAuth popup'));
      return;
    }

    // Listen for messages from the popup
    const messageListener = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) {
        return;
      }

      if (event.data.type === 'GITHUB_OAUTH_SUCCESS') {
        window.removeEventListener('message', messageListener);
        popup.close();
        resolve(event.data.payload);
      } else if (event.data.type === 'GITHUB_OAUTH_ERROR') {
        window.removeEventListener('message', messageListener);
        popup.close();
        reject(new Error(event.data.error));
      }
    };

    window.addEventListener('message', messageListener);

    // Check if popup is closed manually
    const checkClosed = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkClosed);
        window.removeEventListener('message', messageListener);
        reject(new Error('GitHub OAuth cancelled'));
      }
    }, 1000);
  });
};

/**
 * Extract GitHub OAuth parameters from URL
 */
export const extractOAuthParams = (): GitHubCallbackRequest | null => {
  if (typeof window === 'undefined') return null;

  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');
  const state = urlParams.get('state');

  if (code && state) {
    return { code, state };
  }

  return null;
};

/**
 * Handle GitHub OAuth callback in popup
 */
export const handleOAuthCallback = () => {
  if (typeof window === 'undefined') return;

  const params = extractOAuthParams();
  
  if (params) {
    // Send success message to parent window
    window.opener?.postMessage({
      type: 'GITHUB_OAUTH_SUCCESS',
      payload: params,
    }, window.location.origin);
  } else {
    // Send error message to parent window
    window.opener?.postMessage({
      type: 'GITHUB_OAUTH_ERROR',
      error: 'Invalid OAuth parameters',
    }, window.location.origin);
  }
};