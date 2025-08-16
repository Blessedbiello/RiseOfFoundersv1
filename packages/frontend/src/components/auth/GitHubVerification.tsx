'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GitBranch, CheckCircle, Award, Star } from 'lucide-react';
import { githubApi, openGitHubOAuth, extractOAuthParams } from '../../services/github';
import toast from 'react-hot-toast';

interface GitHubVerificationProps {
  onVerificationComplete?: (data: {
    githubUsername: string;
    xpAwarded: number;
    badgeEarned: string;
  }) => void;
}

export const GitHubVerification: React.FC<GitHubVerificationProps> = ({
  onVerificationComplete,
}) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [githubUsername, setGithubUsername] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkGitHubStatus();
    handleOAuthCallbackIfPresent();
  }, []);

  const checkGitHubStatus = async () => {
    try {
      const status = await githubApi.getStatus();
      setIsConnected(status.connected);
      if (status.username) {
        setGithubUsername(status.username);
      }
    } catch (error) {
      console.error('Failed to check GitHub status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthCallbackIfPresent = async () => {
    const params = extractOAuthParams();
    if (params) {
      setIsConnecting(true);
      try {
        const result = await githubApi.callback(params);
        setIsConnected(true);
        setGithubUsername(result.githubUsername);
        
        toast.success(`🎉 GitHub connected! +${result.xpAwarded} XP earned!`);
        
        onVerificationComplete?.(result);
        
        // Clean up URL parameters
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch (error: any) {
        console.error('GitHub OAuth callback failed:', error);
        toast.error('Failed to connect GitHub account');
      } finally {
        setIsConnecting(false);
      }
    }
  };

  const connectGitHub = async () => {
    setIsConnecting(true);
    try {
      const { authUrl } = await githubApi.connect();
      
      // For popup OAuth flow
      try {
        const params = await openGitHubOAuth(authUrl);
        const result = await githubApi.callback(params);
        
        setIsConnected(true);
        setGithubUsername(result.githubUsername);
        
        toast.success(
          <div className="flex items-center space-x-2">
            <Award className="w-5 h-5 text-yellow-500" />
            <div>
              <div className="font-semibold">GitHub Connected!</div>
              <div className="text-sm">+{result.xpAwarded} XP • {result.badgeEarned}</div>
            </div>
          </div>
        );
        
        onVerificationComplete?.(result);
      } catch (popupError) {
        // Fallback to redirect flow
        window.location.href = authUrl;
      }
    } catch (error: any) {
      console.error('GitHub connection failed:', error);
      toast.error('Failed to start GitHub connection');
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectGitHub = async () => {
    try {
      await githubApi.disconnect();
      setIsConnected(false);
      setGithubUsername('');
      toast.success('GitHub account disconnected');
    } catch (error) {
      toast.error('Failed to disconnect GitHub account');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-6 border border-slate-700"
    >
      <div className="flex items-center space-x-3 mb-4">
        <div className="p-2 bg-slate-800 rounded-lg">
          <GitBranch className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">GitHub Developer Verification</h3>
          <p className="text-sm text-slate-400">
            Connect your GitHub to unlock developer achievements
          </p>
        </div>
      </div>

      {isConnected ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-4"
        >
          <div className="flex items-center space-x-3 p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <div className="flex-1">
              <div className="font-medium text-green-300">
                Connected as @{githubUsername}
              </div>
              <div className="text-sm text-green-400/80">
                GitHub developer account verified
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-slate-800/50 rounded-lg">
              <Star className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
              <div className="text-sm font-medium text-white">+150 XP</div>
              <div className="text-xs text-slate-400">Verification Bonus</div>
            </div>
            <div className="text-center p-3 bg-slate-800/50 rounded-lg">
              <Award className="w-5 h-5 text-purple-400 mx-auto mb-1" />
              <div className="text-sm font-medium text-white">Developer</div>
              <div className="text-xs text-slate-400">Badge Earned</div>
            </div>
          </div>

          <button
            onClick={disconnectGitHub}
            className="w-full py-2 px-4 text-sm text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg border border-red-500/30 transition-colors"
          >
            Disconnect GitHub
          </button>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm text-slate-300">
              <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
              <span>Verify your developer credentials</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-slate-300">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <span>Unlock exclusive developer challenges</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-slate-300">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>Earn +150 XP and Developer Badge</span>
            </div>
          </div>

          <button
            onClick={connectGitHub}
            disabled={isConnecting}
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-slate-600 disabled:to-slate-700 text-white font-medium rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
          >
            {isConnecting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Connecting...</span>
              </>
            ) : (
              <>
                <GitBranch className="w-4 h-4" />
                <span>Connect GitHub Account</span>
              </>
            )}
          </button>

          <div className="text-xs text-slate-500 text-center">
            We only access your public profile. No code or private data is accessed.
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};