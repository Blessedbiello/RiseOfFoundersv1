import axios from 'axios';

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
      if (authData?.state?.accessToken) {
        config.headers.Authorization = `Bearer ${authData.state.accessToken}`;
      }
    } catch (error) {
      console.warn('Failed to parse auth token:', error);
    }
  }
  return config;
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear invalid token
      localStorage.removeItem('auth-storage');
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);

export interface AddXpRequest {
  amount: number;
  source: string;
  description?: string;
}

export interface AddXpResponse {
  success: boolean;
  data: {
    user: {
      id: string;
      displayName: string;
      xpTotal: number;
      reputationScore: number;
      selectedKingdom: string | null;
      avatarUrl: string | null;
    };
    xpAdded: number;
    newTotal: number;
  };
  message: string;
}

export const userApi = {
  addXp: async (data: AddXpRequest): Promise<AddXpResponse> => {
    const response = await api.post('/users/add-xp', data);
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/users/profile');
    return response.data;
  },

  updateProfile: async (data: any) => {
    const response = await api.put('/users/profile', data);
    return response.data;
  },
};