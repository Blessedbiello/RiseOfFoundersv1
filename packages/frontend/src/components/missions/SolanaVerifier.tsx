'use client';

import { useState, useCallback } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { MissionStep } from './MissionWorkflow';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { 
  Wallet, 
  CheckCircle, 
  Loader2, 
  AlertTriangle, 
  ExternalLink,
  Coins,
  Activity
} from 'lucide-react';
import toast from 'react-hot-toast';

interface SolanaVerifierProps {
  step: MissionStep;
  onVerified: (data: any) => void;
  isCompleted: boolean;
}

interface TransactionData {
  signature: string;
  slot: number;
  blockTime: number;
  confirmationStatus: string;
  meta: any;
  transaction: {
    message: {
      accountKeys: string[];
      instructions: any[];
    };
  };
}

export const SolanaVerifier: React.FC<SolanaVerifierProps> = ({
  step,
  onVerified,
  isCompleted
}) => {
  const [transactionHash, setTransactionHash] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationData, setVerificationData] = useState<TransactionData | null>(null);
  const [error, setError] = useState('');
  
  const { connection } = useConnection();
  const { publicKey, connected } = useWallet();

  const fetchTransactionData = useCallback(async (signature: string) => {
    try {
      const transaction = await connection.getTransaction(signature, {
        maxSupportedTransactionVersion: 0,
      });
      
      if (!transaction) {
        throw new Error('Transaction not found or not confirmed');
      }

      return {
        signature,
        slot: transaction.slot,
        blockTime: transaction.blockTime || 0,
        confirmationStatus: 'confirmed',
        meta: transaction.meta,
        transaction: transaction.transaction
      };
    } catch (error: any) {
      throw new Error(`Failed to fetch transaction: ${error.message}`);
    }
  }, [connection]);

  const validateSolanaTransaction = useCallback((data: TransactionData) => {
    const rules = step.validationRules?.solana;
    if (!rules) return { valid: true, message: 'Validation passed' };

    // Check if transaction was successful
    if (data.meta?.err) {
      return { valid: false, message: 'Transaction failed on-chain' };
    }

    // Check program ID if specified
    if (rules.programId) {
      const programIds = data.transaction.message.instructions
        .map(ix => data.transaction.message.accountKeys[ix.programIdIndex]);
      
      if (!programIds.includes(rules.programId)) {
        return { 
          valid: false, 
          message: `Transaction must interact with program ${rules.programId}` 
        };
      }
    }

    // Check minimum amount if specified
    if (rules.minAmount) {
      const preBalances = data.meta?.preBalances || [];
      const postBalances = data.meta?.postBalances || [];
      const balanceChange = postBalances.reduce((sum: number, post: number, i: number) => 
        sum + Math.abs(post - (preBalances[i] || 0)), 0
      );
      
      if (balanceChange < rules.minAmount) {
        return { 
          valid: false, 
          message: `Transaction amount too small (minimum: ${rules.minAmount} lamports)` 
        };
      }
    }

    return { valid: true, message: 'Validation passed' };
  }, [step.validationRules]);

  const handleVerify = useCallback(async () => {
    if (!transactionHash.trim()) {
      setError('Please enter a transaction signature');
      return;
    }

    // Basic signature format validation
    if (transactionHash.length < 60 || transactionHash.length > 88) {
      setError('Invalid transaction signature format');
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      const data = await fetchTransactionData(transactionHash);
      const validation = validateSolanaTransaction(data);

      if (!validation.valid) {
        setError(validation.message);
        return;
      }

      setVerificationData(data);
      onVerified({
        type: 'solana',
        signature: transactionHash,
        data,
        verified_at: new Date().toISOString()
      });
      
      toast.success('Solana transaction verified successfully!');
    } catch (error: any) {
      setError(error.message);
      toast.error('Verification failed');
    } finally {
      setIsVerifying(false);
    }
  }, [transactionHash, fetchTransactionData, validateSolanaTransaction, onVerified]);

  const renderVerificationResult = () => {
    if (!verificationData) return null;

    const explorerUrl = `https://explorer.solana.com/tx/${verificationData.signature}${
      process.env.NEXT_PUBLIC_SOLANA_NETWORK === 'devnet' ? '?cluster=devnet' : ''
    }`;

    return (
      <div className="mt-4 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle className="w-5 h-5 text-green-400" />
          <span className="font-medium text-green-400">Transaction Verified</span>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4 text-gray-400" />
            <a
              href={explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline flex items-center gap-1 font-mono text-sm"
            >
              {verificationData.signature.slice(0, 8)}...{verificationData.signature.slice(-8)}
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <div className="flex items-center gap-1">
              <Activity className="w-3 h-3" />
              <span>Slot: {verificationData.slot.toLocaleString()}</span>
            </div>
            {verificationData.blockTime > 0 && (
              <span>
                Time: {new Date(verificationData.blockTime * 1000).toLocaleString()}
              </span>
            )}
            <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded">
              Confirmed
            </span>
          </div>

          {verificationData.meta && (
            <div className="mt-2 p-2 bg-gray-800/50 rounded text-xs">
              <div className="text-gray-400 mb-1">Transaction Details:</div>
              <div className="space-y-1 text-gray-300">
                <div>Fee: {(verificationData.meta.fee || 0).toLocaleString()} lamports</div>
                {verificationData.meta.preBalances && verificationData.meta.postBalances && (
                  <div>
                    Accounts affected: {verificationData.meta.preBalances.length}
                  </div>
                )}
                {verificationData.meta.logMessages && (
                  <div>Log entries: {verificationData.meta.logMessages.length}</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (isCompleted) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-green-400">
          <CheckCircle className="w-5 h-5" />
          <span>Solana transaction verified</span>
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
        {!connected && (
          <div className="flex items-center gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-yellow-400">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm">Connect your wallet to verify transactions</span>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Transaction Signature
          </label>
          <div className="flex gap-2">
            <Input
              type="text"
              value={transactionHash}
              onChange={(e) => setTransactionHash(e.target.value)}
              placeholder="Transaction signature hash..."
              className="flex-1 font-mono text-sm"
            />
            <Button
              onClick={handleVerify}
              disabled={isVerifying || !transactionHash.trim()}
            >
              {isVerifying ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Wallet className="w-4 h-4" />
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
          <p><strong>How to find your transaction signature:</strong></p>
          <ul className="list-disc list-inside mt-1">
            <li>Check your wallet transaction history</li>
            <li>Look for the transaction in Solana Explorer</li>
            <li>Copy the full signature hash (60-88 characters)</li>
          </ul>
        </div>
      </div>

      {renderVerificationResult()}
    </div>
  );
};