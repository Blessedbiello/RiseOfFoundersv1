'use client';

import { useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useAuthStore } from '../stores/authStore';
import { authApi } from '../services/auth';
import { honeycombApi } from '../services/honeycomb';
import { userApi, AddXpRequest } from '../services/user';
import toast from 'react-hot-toast';

export const useAuth = () => {
  const { 
    user, 
    accessToken, 
    isAuthenticated, 
    isLoading, 
    error,
    setUser,
    setAccessToken,
    setLoading,
    setError,
    login,
    logout: storeLogout,
    clearError
  } = useAuthStore();

  const { publicKey, signMessage, disconnect } = useWallet();

  const authenticateWallet = useCallback(async () => {
    if (!publicKey || !signMessage) {
      setError('Wallet not connected');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const walletAddress = publicKey.toString();
      
      // Get authentication challenge from Honeycomb via our backend
      const challengeResult = await honeycombApi.getAuthChallenge(walletAddress);
      
      if (!challengeResult.success) {
        throw new Error(challengeResult.message || 'Failed to get authentication challenge');
      }

      const message = challengeResult.data.message;

      // Sign the message
      const messageBytes = new TextEncoder().encode(message);
      const signature = await signMessage(messageBytes);
      const signatureBase64 = Buffer.from(signature).toString('base64');

      // Verify signature with Honeycomb via our backend
      const authResult = await honeycombApi.verifySignature({
        walletAddress,
        signature: signatureBase64,
        message,
      });
      
      if (!authResult.success) {
        throw new Error(authResult.message || 'Authentication failed');
      }

      // Store authentication data (includes Honeycomb access token)
      login(authResult.data.user, authResult.data.accessToken);
      
      toast.success('Wallet authenticated with Honeycomb Protocol!');
      return true;
    } catch (error: any) {
      const errorMessage = error?.message || 'Authentication failed';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, [publicKey, signMessage, setLoading, setError, login]);

  const loginWithGitHub = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Redirect to GitHub OAuth
      const redirectUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/auth/github`;
      window.location.href = redirectUrl;
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'GitHub login failed';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);

  const linkGitHubAccount = useCallback(async () => {
    if (!isAuthenticated) {
      setError('Must be authenticated to link GitHub account');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await authApi.linkGitHub();
      
      // Update user data
      setUser(result.data.user);
      toast.success('GitHub account linked successfully!');
      return true;
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Failed to link GitHub account';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, setLoading, setError, setUser]);

  const logout = useCallback(async () => {
    setLoading(true);
    
    try {
      // Disconnect wallet
      if (disconnect) {
        await disconnect();
      }
      
      // Clear auth state
      storeLogout();
      
      toast.success('Logged out successfully');
    } catch (error: any) {
      console.error('Logout error:', error);
      // Still clear state even if disconnect fails
      storeLogout();
    } finally {
      setLoading(false);
    }
  }, [disconnect, storeLogout, setLoading]);

  const updateProfile = useCallback(async (profileData: {
    name?: string;
    bio?: string;
    profilePicture?: string;
    selectedKingdom?: string;
  }) => {
    if (!isAuthenticated) {
      setError('Must be authenticated to update profile');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await authApi.updateProfile(profileData);
      
      // Update user data
      setUser(result.data.user);
      toast.success('Profile updated successfully!');
      return true;
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Failed to update profile';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, setLoading, setError, setUser]);

  const addXp = useCallback(async (xpData: AddXpRequest) => {
    if (!isAuthenticated) {
      setError('Must be authenticated to add XP');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await userApi.addXp(xpData);
      
      // Update user data in store
      setUser(result.data.user);
      toast.success(`+${result.data.xpAdded} XP! ${result.message}`);
      return true;
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Failed to add XP';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, setLoading, setError, setUser]);

  return {
    // State
    user,
    accessToken,
    isAuthenticated,
    isLoading,
    error,
    
    // Actions
    authenticateWallet,
    loginWithGitHub,
    linkGitHubAccount,
    logout,
    updateProfile,
    addXp,
    clearError,
    
    // Wallet info
    walletAddress: publicKey?.toString() || null,
    isWalletConnected: !!publicKey,
  };
};