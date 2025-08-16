'use client';

import { useState, useCallback } from 'react';
import { useAuth } from './useAuth';
import { missionsApi, MissionSubmission, MissionProgress } from '../services/missions';
import { honeycombApi } from '../services/honeycomb';
import toast from 'react-hot-toast';

export const useMissions = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [missionProgress, setMissionProgress] = useState<MissionProgress[]>([]);
  const [currentSubmissionId, setCurrentSubmissionId] = useState<string | null>(null);
  
  const { user } = useAuth();

  const startMission = useCallback(async (missionId: string) => {
    if (!user) {
      setError('User not authenticated');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await missionsApi.startMission(missionId);
      
      if (result.success) {
        setCurrentSubmissionId(result.data.submissionId);
        toast.success('Mission started successfully!');
        return result.data.submissionId;
      } else {
        throw new Error(result.message || 'Failed to start mission');
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error.message || 'Failed to start mission';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const submitMission = useCallback(async (
    missionId: string,
    artifacts: any[],
    reflection: string
  ) => {
    if (!user || !currentSubmissionId) {
      setError('User not authenticated or no active submission');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Prepare submission data
      const submission: MissionSubmission = {
        missionId,
        artifacts,
        reflection,
        startedAt: new Date().toISOString(), // Should come from when mission started
        completedAt: new Date().toISOString()
      };

      // Submit to our backend
      const result = await missionsApi.submitMission(submission);
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to submit mission');
      }

      // Submit to Honeycomb Protocol for on-chain verification
      try {
        const honeycombResult = await honeycombApi.completeMission({
          missionId,
          submissionId: currentSubmissionId,
          artifacts
        });

        // Check for new badges
        const badgeResult = await honeycombApi.checkUserBadges(user.id);
        
        toast.success(`Mission completed! +${result.data.xpEarned} XP`);
        
        if (result.data.badgesEarned?.length > 0) {
          toast.success(`New badges earned: ${result.data.badgesEarned.join(', ')}`);
        }

        if (result.data.newLevel) {
          toast.success(`🎉 Level up! You're now level ${result.data.newLevel}!`);
        }

        // Reset current submission
        setCurrentSubmissionId(null);
        
        return {
          ...result.data,
          honeycombResult: honeycombResult.data,
          newBadges: badgeResult.data?.newBadges || []
        };
      } catch (honeycombError: any) {
        console.error('Honeycomb submission error:', honeycombError);
        // Still return success from our backend, but log Honeycomb error
        toast.warn('Mission submitted locally, but Honeycomb sync failed');
        
        return result.data;
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error.message || 'Failed to submit mission';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user, currentSubmissionId]);

  const getMissionProgress = useCallback(async (userId?: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await missionsApi.getMissionProgress(userId);
      
      if (result.success) {
        setMissionProgress(result.data);
        return result.data;
      } else {
        throw new Error(result.message || 'Failed to get mission progress');
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error.message || 'Failed to get mission progress';
      setError(errorMessage);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const validateGitHubArtifact = useCallback(async (url: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Determine type from URL
      const type = url.includes('/pull/') ? 'pull_request' : 'repository';
      
      const result = await missionsApi.validateGitHubArtifact({ url, type });
      
      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.message || 'GitHub validation failed');
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error.message || 'GitHub validation failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const validateSolanaTransaction = useCallback(async (signature: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await missionsApi.validateSolanaTransaction({ signature });
      
      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.message || 'Solana validation failed');
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error.message || 'Solana validation failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const uploadArtifact = useCallback(async (file: File) => {
    if (!currentSubmissionId) {
      throw new Error('No active submission');
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await missionsApi.uploadArtifact(file, currentSubmissionId);
      
      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.message || 'File upload failed');
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error.message || 'File upload failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [currentSubmissionId]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    isLoading,
    error,
    missionProgress,
    currentSubmissionId,
    
    // Actions
    startMission,
    submitMission,
    getMissionProgress,
    validateGitHubArtifact,
    validateSolanaTransaction,
    uploadArtifact,
    clearError,
    
    // Computed state
    hasActiveMission: !!currentSubmissionId,
  };
};