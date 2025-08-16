'use client';

import { useState, useCallback, useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { 
  Shield, 
  Wallet, 
  Plus, 
  Minus, 
  CheckCircle, 
  AlertTriangle, 
  Key,
  Users,
  Lock,
  Copy,
  ExternalLink
} from 'lucide-react';
import toast from 'react-hot-toast';

interface MultiSigConfig {
  threshold: number;
  signers: string[];
  vaultAddress?: string;
  programId?: string;
  createdAt: string;
}

interface MultiSigWalletSetupProps {
  teamSize: number;
  onConfigured: (config: MultiSigConfig) => void;
  config: MultiSigConfig | null;
}

export const MultiSigWalletSetup: React.FC<MultiSigWalletSetupProps> = ({
  teamSize,
  onConfigured,
  config
}) => {
  const [threshold, setThreshold] = useState(Math.ceil(teamSize / 2));
  const [signers, setSigners] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newSignerAddress, setNewSignerAddress] = useState('');
  
  const { publicKey, signTransaction } = useWallet();
  const { connection } = useConnection();

  // Initialize with current user's wallet
  useEffect(() => {
    if (publicKey && signers.length === 0) {
      setSigners([publicKey.toString()]);
    }
  }, [publicKey, signers.length]);

  const addSigner = useCallback(() => {
    if (!newSignerAddress.trim()) {
      toast.error('Please enter a valid wallet address');
      return;
    }

    try {
      // Validate the address format
      new PublicKey(newSignerAddress);
      
      if (signers.includes(newSignerAddress)) {
        toast.error('This address is already added');
        return;
      }

      setSigners(prev => [...prev, newSignerAddress]);
      setNewSignerAddress('');
      toast.success('Signer added successfully');
    } catch (error) {
      toast.error('Invalid wallet address format');
    }
  }, [newSignerAddress, signers]);

  const removeSigner = useCallback((index: number) => {
    if (signers.length <= 2) {
      toast.error('Multi-sig requires at least 2 signers');
      return;
    }
    
    setSigners(prev => prev.filter((_, i) => i !== index));
    
    // Adjust threshold if needed
    if (threshold > signers.length - 1) {
      setThreshold(Math.ceil((signers.length - 1) / 2));
    }
  }, [signers.length, threshold]);

  const createMultiSig = useCallback(async () => {
    if (!publicKey || !signTransaction) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (signers.length < 2) {
      toast.error('Multi-sig requires at least 2 signers');
      return;
    }

    if (threshold > signers.length) {
      toast.error('Threshold cannot exceed number of signers');
      return;
    }

    setIsCreating(true);

    try {
      // In a real implementation, this would:
      // 1. Deploy a Squads or similar multi-sig program
      // 2. Initialize the multi-sig with the specified signers and threshold
      // 3. Create the vault account
      
      // For demo purposes, we'll simulate the creation
      await new Promise(resolve => setTimeout(resolve, 3000));

      const mockConfig: MultiSigConfig = {
        threshold,
        signers: [...signers],
        vaultAddress: `MS${Math.random().toString(36).substring(2, 15)}`,
        programId: 'SMSqvK3p8RQN1NXr8gESr3HgBa65P7rFo7m5UWPp12a', // Mock Squads program ID
        createdAt: new Date().toISOString(),
      };

      onConfigured(mockConfig);
      toast.success('Multi-sig wallet created successfully!');
    } catch (error) {
      console.error('Multi-sig creation error:', error);
      toast.error('Failed to create multi-sig wallet');
    } finally {
      setIsCreating(false);
    }
  }, [publicKey, signTransaction, signers, threshold, onConfigured]);

  const copyToClipboard = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  }, []);

  if (config) {
    return (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-4" />
          <h2 className="text-2xl font-bold text-white">Multi-Sig Wallet Created</h2>
          <p className="text-gray-400 mt-2">Your team treasury is secured</p>
        </div>

        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Vault Address:</span>
              <div className="flex items-center gap-2">
                <code className="text-green-400 font-mono text-sm">{config.vaultAddress}</code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(config.vaultAddress!)}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-400">Threshold:</span>
              <span className="text-white font-medium">{config.threshold} of {config.signers.length}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-400">Created:</span>
              <span className="text-white">{new Date(config.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-6">
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Authorized Signers ({config.signers.length})
          </h3>
          
          <div className="space-y-2">
            {config.signers.map((signer, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-gray-700/30 rounded">
                <Key className="w-4 h-4 text-blue-400" />
                <code className="flex-1 font-mono text-sm text-gray-300">
                  {signer.slice(0, 8)}...{signer.slice(-8)}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(signer)}
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
          <div className="flex items-center gap-2 text-blue-400 mb-2">
            <Lock className="w-4 h-4" />
            <span className="font-medium">Treasury Security</span>
          </div>
          <p className="text-sm text-gray-300">
            Your team funds are secured by a {config.threshold}-of-{config.signers.length} multi-signature wallet. 
            All transactions require approval from at least {config.threshold} team members.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <Shield className="w-12 h-12 mx-auto text-blue-500 mb-4" />
        <h2 className="text-2xl font-bold text-white">Multi-Sig Treasury</h2>
        <p className="text-gray-400 mt-2">Secure your team funds with multi-signature protection</p>
      </div>

      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <Shield className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold text-blue-400 mb-2">Why Multi-Signature?</h3>
            <p className="text-gray-300 text-sm mb-4">
              Multi-sig wallets require multiple team members to approve transactions, providing:
            </p>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• Enhanced security against single points of failure</li>
              <li>• Transparent financial decision-making</li>
              <li>• Protection against unauthorized spending</li>
              <li>• Built-in accountability and trust</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Threshold Configuration */}
      <div className="bg-gray-800/50 rounded-lg p-6">
        <h3 className="font-semibold text-white mb-4">Approval Threshold</h3>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="threshold">Required Signatures</Label>
            <div className="flex items-center gap-4 mt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setThreshold(Math.max(1, threshold - 1))}
                disabled={threshold <= 1}
              >
                <Minus className="w-4 h-4" />
              </Button>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{threshold}</div>
                <div className="text-sm text-gray-400">of {signers.length}</div>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setThreshold(Math.min(signers.length, threshold + 1))}
                disabled={threshold >= signers.length}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-sm text-gray-400 mt-2">
              Transactions will require approval from {threshold} out of {signers.length} signers
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 text-sm">
            <button
              onClick={() => setThreshold(1)}
              className={`p-2 rounded ${threshold === 1 ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}
            >
              1-of-{signers.length}
            </button>
            <button
              onClick={() => setThreshold(Math.ceil(signers.length / 2))}
              className={`p-2 rounded ${threshold === Math.ceil(signers.length / 2) ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}
            >
              Majority
            </button>
            <button
              onClick={() => setThreshold(signers.length)}
              className={`p-2 rounded ${threshold === signers.length ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}
            >
              Unanimous
            </button>
          </div>
        </div>
      </div>

      {/* Signers Management */}
      <div className="bg-gray-800/50 rounded-lg p-6">
        <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
          <Users className="w-5 h-5" />
          Authorized Signers ({signers.length})
        </h3>
        
        <div className="space-y-3">
          {signers.map((signer, index) => (
            <div key={index} className="flex items-center gap-3 p-3 bg-gray-700/30 rounded">
              <Key className="w-4 h-4 text-blue-400" />
              <code className="flex-1 font-mono text-sm text-gray-300">
                {signer.slice(0, 12)}...{signer.slice(-12)}
              </code>
              {index === 0 && publicKey?.toString() === signer && (
                <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">
                  You
                </span>
              )}
              {signers.length > 2 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeSigner(index)}
                  className="text-red-400 hover:text-red-300"
                >
                  <Minus className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}
          
          <div className="flex gap-2">
            <Input
              value={newSignerAddress}
              onChange={(e) => setNewSignerAddress(e.target.value)}
              placeholder="Enter wallet address..."
              className="flex-1 font-mono text-sm"
            />
            <Button onClick={addSigner} disabled={!newSignerAddress.trim()}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Validation Warnings */}
      {signers.length < 2 && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
          <div className="flex items-center gap-2 text-yellow-400">
            <AlertTriangle className="w-4 h-4" />
            <span className="font-medium">Add More Signers</span>
          </div>
          <p className="text-sm text-gray-300 mt-1">
            Multi-sig requires at least 2 signers for security
          </p>
        </div>
      )}

      {threshold > signers.length && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-400">
            <AlertTriangle className="w-4 h-4" />
            <span className="font-medium">Invalid Threshold</span>
          </div>
          <p className="text-sm text-gray-300 mt-1">
            Threshold cannot exceed the number of signers
          </p>
        </div>
      )}

      <Button
        onClick={createMultiSig}
        disabled={signers.length < 2 || threshold > signers.length || isCreating}
        className="w-full bg-green-600 hover:bg-green-700"
      >
        {isCreating ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Creating Multi-Sig...
          </div>
        ) : (
          <>
            <Shield className="w-4 h-4 mr-2" />
            Create Multi-Sig Wallet
          </>
        )}
      </Button>
    </div>
  );
};