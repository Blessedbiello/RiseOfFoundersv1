'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import { authApi } from '../../services/auth';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

export const GitHubCallback: React.FC = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');

        if (error) {
          throw new Error(`GitHub OAuth error: ${error}`);
        }

        if (!code) {
          throw new Error('No authorization code received from GitHub');
        }

        setMessage('Authenticating with GitHub...');
        
        const result = await authApi.handleGitHubCallback(code, state || undefined);
        
        if (result.success) {
          login(result.data.user, result.data.accessToken);
          setStatus('success');
          setMessage('Successfully authenticated! Redirecting...');
          
          // Redirect to dashboard after success
          setTimeout(() => {
            router.push('/dashboard');
          }, 2000);
        } else {
          throw new Error('Authentication failed');
        }
      } catch (error: any) {
        console.error('GitHub callback error:', error);
        setStatus('error');
        setMessage(error.message || 'Authentication failed');
        
        // Redirect to login after error
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      }
    };

    handleCallback();
  }, [searchParams, router, login]);

  const renderStatus = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="flex items-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            <span className="text-gray-600">Authenticating...</span>
          </div>
        );
      case 'success':
        return (
          <div className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-green-500" />
            <span className="text-green-600">Authentication successful!</span>
          </div>
        );
      case 'error':
        return (
          <div className="flex items-center gap-3">
            <XCircle className="w-6 h-6 text-red-500" />
            <span className="text-red-600">Authentication failed</span>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              GitHub Authentication
            </h1>
            <p className="text-gray-600">
              We're completing your authentication with GitHub...
            </p>
          </div>

          <div className="mb-6">
            {renderStatus()}
          </div>

          {message && (
            <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
              {message}
            </p>
          )}

          {status === 'error' && (
            <div className="mt-4">
              <button
                onClick={() => router.push('/login')}
                className="text-blue-600 hover:text-blue-700 text-sm underline"
              >
                Return to login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};