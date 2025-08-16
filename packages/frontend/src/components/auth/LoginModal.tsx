'use client';

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useAuth } from '../../hooks/useAuth';
import dynamic from 'next/dynamic';

// Dynamically import wallet button to avoid hydration issues
const WalletMultiButton = dynamic(
  () => import('@solana/wallet-adapter-react-ui').then((mod) => mod.WalletMultiButton),
  { ssr: false }
);
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Github, Wallet, User, Shield } from 'lucide-react';
import { cn } from '../../lib/utils';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [step, setStep] = useState<'choose' | 'wallet' | 'github'>('choose');
  const [isConnecting, setIsConnecting] = useState(false);
  
  const { connected, publicKey } = useWallet();
  const { 
    authenticateWallet, 
    loginWithGitHub, 
    isLoading, 
    error, 
    clearError 
  } = useAuth();

  const handleWalletAuth = async () => {
    if (!connected || !publicKey) {
      setStep('wallet');
      return;
    }

    setIsConnecting(true);
    const success = await authenticateWallet();
    
    if (success) {
      onSuccess?.();
      onClose();
    }
    setIsConnecting(false);
  };

  const handleGitHubLogin = () => {
    loginWithGitHub();
  };

  const handleClose = () => {
    setStep('choose');
    clearError();
    onClose();
  };

  const renderChooseMethod = () => (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900">Welcome to Rise of Founders</h3>
        <p className="text-sm text-gray-600 mt-1">
          Choose your preferred authentication method
        </p>
      </div>

      <div className="space-y-3">
        <Button
          onClick={() => setStep('wallet')}
          className="w-full flex items-center justify-center gap-3 h-12"
          variant="outline"
        >
          <Wallet className="w-5 h-5" />
          <span>Connect Wallet</span>
          <div className="ml-auto">
            <Shield className="w-4 h-4 text-green-500" />
          </div>
        </Button>

        <Button
          onClick={handleGitHubLogin}
          className="w-full flex items-center justify-center gap-3 h-12 bg-gray-900 hover:bg-gray-800"
        >
          <Github className="w-5 h-5" />
          <span>Continue with GitHub</span>
        </Button>
      </div>

      <div className="text-xs text-gray-500 text-center">
        By continuing, you agree to our Terms of Service and Privacy Policy
      </div>
    </div>
  );

  const renderWalletConnect = () => (
    <div className="space-y-4">
      <div className="text-center">
        <Wallet className="w-12 h-12 mx-auto text-blue-500 mb-3" />
        <h3 className="text-lg font-semibold text-gray-900">Connect Your Wallet</h3>
        <p className="text-sm text-gray-600 mt-1">
          Connect your Solana wallet to authenticate securely
        </p>
      </div>

      <div className="space-y-3">
        {!connected ? (
          <div className="flex justify-center">
            <WalletMultiButton className="!bg-blue-600 hover:!bg-blue-700" />
          </div>
        ) : (
          <div className="space-y-3">
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-green-800">Wallet Connected</span>
              </div>
              <p className="text-xs text-green-600 mt-1 font-mono">
                {publicKey?.toString().slice(0, 8)}...{publicKey?.toString().slice(-8)}
              </p>
            </div>

            <Button
              onClick={handleWalletAuth}
              disabled={isLoading || isConnecting}
              className="w-full"
            >
              {isLoading || isConnecting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Authenticating...
                </div>
              ) : (
                'Authenticate with Wallet'
              )}
            </Button>
          </div>
        )}

        <Button
          onClick={() => setStep('choose')}
          variant="ghost"
          className="w-full"
        >
          Back to options
        </Button>
      </div>
    </div>
  );

  const renderError = () => {
    if (!error) return null;

    return (
      <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-sm text-red-800">{error}</p>
        <Button
          onClick={clearError}
          variant="ghost"
          size="sm"
          className="mt-1 text-red-600 hover:text-red-700"
        >
          Dismiss
        </Button>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Authentication
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {error && renderError()}

          {step === 'choose' && renderChooseMethod()}
          {step === 'wallet' && renderWalletConnect()}
        </div>
      </DialogContent>
    </Dialog>
  );
};