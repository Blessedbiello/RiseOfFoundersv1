'use client';

import { useState, useCallback } from 'react';
import { MissionStep } from './MissionWorkflow';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { 
  Github, 
  CheckCircle, 
  Loader2, 
  AlertTriangle, 
  ExternalLink,
  GitBranch,
  GitCommit,
  Star
} from 'lucide-react';
import toast from 'react-hot-toast';

interface GitHubVerifierProps {
  step: MissionStep;
  onVerified: (data: any) => void;
  isCompleted: boolean;
}

interface GitHubRepoData {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string;
  created_at: string;
  updated_at: string;
  stargazers_count: number;
  forks_count: number;
  default_branch: string;
  commits_count?: number;
}

interface GitHubPRData {
  id: number;
  number: number;
  title: string;
  body: string;
  html_url: string;
  state: string;
  created_at: string;
  merged_at: string | null;
}

export const GitHubVerifier: React.FC<GitHubVerifierProps> = ({
  step,
  onVerified,
  isCompleted
}) => {
  const [url, setUrl] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationData, setVerificationData] = useState<any>(null);
  const [error, setError] = useState('');

  const parseGitHubUrl = useCallback((url: string) => {
    // Parse GitHub URLs to extract owner and repo/PR info
    const repoMatch = url.match(/github\.com\/([^\/]+)\/([^\/]+)(?:\/pull\/(\d+))?/);
    if (!repoMatch) return null;

    return {
      owner: repoMatch[1],
      repo: repoMatch[2],
      pullNumber: repoMatch[3] ? parseInt(repoMatch[3]) : null
    };
  }, []);

  const fetchGitHubData = useCallback(async (owner: string, repo: string, pullNumber?: number) => {
    const baseUrl = 'https://api.github.com';
    
    try {
      if (pullNumber) {
        // Fetch pull request data
        const prResponse = await fetch(`${baseUrl}/repos/${owner}/${repo}/pulls/${pullNumber}`);
        if (!prResponse.ok) throw new Error('Pull request not found');
        return await prResponse.json();
      } else {
        // Fetch repository data
        const [repoResponse, commitsResponse] = await Promise.all([
          fetch(`${baseUrl}/repos/${owner}/${repo}`),
          fetch(`${baseUrl}/repos/${owner}/${repo}/commits?per_page=100`)
        ]);
        
        if (!repoResponse.ok) throw new Error('Repository not found');
        
        const repoData = await repoResponse.json();
        const commitsData = commitsResponse.ok ? await commitsResponse.json() : [];
        
        return {
          ...repoData,
          commits_count: commitsData.length
        };
      }
    } catch (error: any) {
      throw new Error(`GitHub API Error: ${error.message}`);
    }
  }, []);

  const validateGitHubArtifact = useCallback((data: any) => {
    const rules = step.validationRules?.github;
    if (!rules) return { valid: true, message: 'Validation passed' };

    // Check repository requirements
    if (rules.requiresRepo && !data.full_name) {
      return { valid: false, message: 'Repository data is required' };
    }

    // Check minimum commits
    if (rules.minCommits && data.commits_count < rules.minCommits) {
      return { 
        valid: false, 
        message: `Repository must have at least ${rules.minCommits} commits (found ${data.commits_count})` 
      };
    }

    // Check pull request requirements
    if (rules.requiresPR && !data.number) {
      return { valid: false, message: 'Pull request is required' };
    }

    return { valid: true, message: 'Validation passed' };
  }, [step.validationRules]);

  const handleVerify = useCallback(async () => {
    if (!url.trim()) {
      setError('Please enter a GitHub URL');
      return;
    }

    const parsed = parseGitHubUrl(url);
    if (!parsed) {
      setError('Invalid GitHub URL format');
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      const data = await fetchGitHubData(parsed.owner, parsed.repo, parsed.pullNumber);
      const validation = validateGitHubArtifact(data);

      if (!validation.valid) {
        setError(validation.message);
        return;
      }

      setVerificationData(data);
      onVerified({
        type: 'github',
        url,
        data,
        verified_at: new Date().toISOString()
      });
      
      toast.success('GitHub artifact verified successfully!');
    } catch (error: any) {
      setError(error.message);
      toast.error('Verification failed');
    } finally {
      setIsVerifying(false);
    }
  }, [url, parseGitHubUrl, fetchGitHubData, validateGitHubArtifact, onVerified]);

  const renderVerificationResult = () => {
    if (!verificationData) return null;

    const isRepo = !!verificationData.full_name;
    const isPR = !!verificationData.number;

    return (
      <div className="mt-4 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle className="w-5 h-5 text-green-400" />
          <span className="font-medium text-green-400">Verification Successful</span>
        </div>
        
        {isRepo && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Github className="w-4 h-4 text-gray-400" />
              <a
                href={verificationData.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline flex items-center gap-1"
              >
                {verificationData.full_name}
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            
            {verificationData.description && (
              <p className="text-sm text-gray-400">{verificationData.description}</p>
            )}
            
            <div className="flex items-center gap-4 text-xs text-gray-400">
              <div className="flex items-center gap-1">
                <GitCommit className="w-3 h-3" />
                <span>{verificationData.commits_count} commits</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3" />
                <span>{verificationData.stargazers_count} stars</span>
              </div>
              <div className="flex items-center gap-1">
                <GitBranch className="w-3 h-3" />
                <span>{verificationData.default_branch}</span>
              </div>
            </div>
          </div>
        )}

        {isPR && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Github className="w-4 h-4 text-gray-400" />
              <a
                href={verificationData.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline flex items-center gap-1"
              >
                Pull Request #{verificationData.number}
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            
            <div className="text-sm font-medium text-white">{verificationData.title}</div>
            
            <div className="flex items-center gap-4 text-xs text-gray-400">
              <span className={`px-2 py-1 rounded ${
                verificationData.state === 'open' ? 'bg-green-500/20 text-green-400' :
                verificationData.state === 'merged' ? 'bg-purple-500/20 text-purple-400' :
                'bg-red-500/20 text-red-400'
              }`}>
                {verificationData.state}
              </span>
              <span>Created: {new Date(verificationData.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (isCompleted) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-green-400">
          <CheckCircle className="w-5 h-5" />
          <span>GitHub verification completed</span>
        </div>
        {renderVerificationResult()}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="prose prose-invert max-w-none">
        <div className="whitespace-pre-wrap text-gray-300 mb-4">
          {step.instructions}
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            GitHub URL
          </label>
          <div className="flex gap-2">
            <Input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://github.com/username/repository"
              className="flex-1"
            />
            <Button
              onClick={handleVerify}
              disabled={isVerifying || !url.trim()}
            >
              {isVerifying ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Github className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <div className="text-xs text-gray-500">
          <p><strong>Supported URLs:</strong></p>
          <ul className="list-disc list-inside mt-1">
            <li>Repository: https://github.com/username/repository</li>
            <li>Pull Request: https://github.com/username/repository/pull/123</li>
          </ul>
        </div>
      </div>

      {renderVerificationResult()}
    </div>
  );
};