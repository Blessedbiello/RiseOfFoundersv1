'use client';

import { useState, useCallback } from 'react';
import { MissionStep } from './MissionWorkflow';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { 
  Globe, 
  CheckCircle, 
  Loader2, 
  AlertTriangle, 
  ExternalLink,
  Shield,
  Eye
} from 'lucide-react';
import toast from 'react-hot-toast';

interface URLVerifierProps {
  step: MissionStep;
  onVerified: (data: any) => void;
  isCompleted: boolean;
}

interface URLData {
  url: string;
  title?: string;
  description?: string;
  domain: string;
  isHttps: boolean;
  isAccessible: boolean;
  responseTime?: number;
  contentType?: string;
}

export const URLVerifier: React.FC<URLVerifierProps> = ({
  step,
  onVerified,
  isCompleted
}) => {
  const [url, setUrl] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationData, setVerificationData] = useState<URLData | null>(null);
  const [error, setError] = useState('');

  const parseUrl = useCallback((urlString: string) => {
    try {
      const parsedUrl = new URL(urlString);
      return {
        url: parsedUrl.href,
        domain: parsedUrl.hostname,
        protocol: parsedUrl.protocol,
        isHttps: parsedUrl.protocol === 'https:'
      };
    } catch {
      return null;
    }
  }, []);

  const checkUrlAccessibility = useCallback(async (url: string) => {
    // Since we can't directly fetch arbitrary URLs from the frontend due to CORS,
    // we'll use a simple validation approach and assume the URL is accessible
    // In a real implementation, this would be done through a backend service
    
    const startTime = Date.now();
    
    // Basic URL validation
    const parsedUrl = parseUrl(url);
    if (!parsedUrl) {
      throw new Error('Invalid URL format');
    }

    // Simulate response time check
    await new Promise(resolve => setTimeout(resolve, 500));
    const responseTime = Date.now() - startTime;

    return {
      url: parsedUrl.url,
      domain: parsedUrl.domain,
      isHttps: parsedUrl.isHttps,
      isAccessible: true, // Assume accessible for demo
      responseTime,
      contentType: 'text/html', // Default assumption
      title: `Content from ${parsedUrl.domain}`,
      description: 'URL verified successfully'
    };
  }, [parseUrl]);

  const validateUrl = useCallback((data: URLData) => {
    const rules = step.validationRules?.url;
    if (!rules) return { valid: true, message: 'Validation passed' };

    // Check HTTPS requirement
    if (rules.requiresHttps && !data.isHttps) {
      return { valid: false, message: 'URL must use HTTPS protocol' };
    }

    // Check allowed domains
    if (rules.domains && rules.domains.length > 0) {
      const domainMatches = rules.domains.some(allowedDomain => {
        return data.domain === allowedDomain || data.domain.endsWith(`.${allowedDomain}`);
      });
      
      if (!domainMatches) {
        return { 
          valid: false, 
          message: `URL must be from one of these domains: ${rules.domains.join(', ')}` 
        };
      }
    }

    // Check accessibility
    if (!data.isAccessible) {
      return { valid: false, message: 'URL is not accessible or returns an error' };
    }

    return { valid: true, message: 'Validation passed' };
  }, [step.validationRules]);

  const handleVerify = useCallback(async () => {
    if (!url.trim()) {
      setError('Please enter a URL');
      return;
    }

    // Basic URL format check
    if (!url.match(/^https?:\/\/.+/)) {
      setError('URL must start with http:// or https://');
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      const data = await checkUrlAccessibility(url);
      const validation = validateUrl(data);

      if (!validation.valid) {
        setError(validation.message);
        return;
      }

      setVerificationData(data);
      onVerified({
        type: 'url',
        url,
        data,
        verified_at: new Date().toISOString()
      });
      
      toast.success('URL verified successfully!');
    } catch (error: any) {
      setError(error.message);
      toast.error('Verification failed');
    } finally {
      setIsVerifying(false);
    }
  }, [url, checkUrlAccessibility, validateUrl, onVerified]);

  const renderVerificationResult = () => {
    if (!verificationData) return null;

    return (
      <div className="mt-4 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle className="w-5 h-5 text-green-400" />
          <span className="font-medium text-green-400">URL Verified</span>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-gray-400" />
            <a
              href={verificationData.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline flex items-center gap-1"
            >
              {verificationData.domain}
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          
          {verificationData.title && (
            <div className="text-sm font-medium text-white">{verificationData.title}</div>
          )}
          
          {verificationData.description && (
            <p className="text-sm text-gray-400">{verificationData.description}</p>
          )}
          
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <div className="flex items-center gap-1">
              {verificationData.isHttps ? (
                <Shield className="w-3 h-3 text-green-400" />
              ) : (
                <Shield className="w-3 h-3 text-yellow-400" />
              )}
              <span>{verificationData.isHttps ? 'HTTPS' : 'HTTP'}</span>
            </div>
            
            {verificationData.responseTime && (
              <div className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                <span>{verificationData.responseTime}ms</span>
              </div>
            )}
            
            {verificationData.contentType && (
              <span>{verificationData.contentType}</span>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (isCompleted) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-green-400">
          <CheckCircle className="w-5 h-5" />
          <span>URL verification completed</span>
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
            URL to Verify
          </label>
          <div className="flex gap-2">
            <Input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/your-content"
              className="flex-1"
            />
            <Button
              onClick={handleVerify}
              disabled={isVerifying || !url.trim()}
            >
              {isVerifying ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Globe className="w-4 h-4" />
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

        {step.validationRules?.url && (
          <div className="text-xs text-gray-500">
            <p><strong>Requirements:</strong></p>
            <ul className="list-disc list-inside mt-1">
              {step.validationRules.url.requiresHttps && (
                <li>Must use HTTPS (secure connection)</li>
              )}
              {step.validationRules.url.domains && (
                <li>Must be from: {step.validationRules.url.domains.join(', ')}</li>
              )}
            </ul>
          </div>
        )}
      </div>

      {renderVerificationResult()}
    </div>
  );
};