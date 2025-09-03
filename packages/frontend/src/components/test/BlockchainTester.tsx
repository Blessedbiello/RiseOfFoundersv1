'use client';

import { useState } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Button } from '../ui/button';
import { useHoneycomb } from '../../lib/honeycomb';
import { apiService } from '../../services/api';
import { toast } from 'react-hot-toast';
import bs58 from 'bs58';
import { SystemProgram, Transaction, LAMPORTS_PER_SOL } from '@solana/web3.js';

export const BlockchainTester: React.FC = () => {
  const { publicKey, connected, signMessage, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const { client } = useHoneycomb();
  
  const [isLoading, setIsLoading] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [results, setResults] = useState<string[]>([]);

  const addResult = (result: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  // Test 1: Wallet Connection
  const testWalletConnection = async () => {
    try {
      if (!connected || !publicKey) {
        addResult('❌ Wallet not connected');
        return;
      }
      
      addResult(`✅ Wallet connected: ${publicKey.toString().substring(0, 8)}...`);
      addResult(`🌐 Network: ${connection.rpcEndpoint}`);
      
      // Check balance
      const balance = await connection.getBalance(publicKey);
      addResult(`💰 SOL Balance: ${(balance / 1e9).toFixed(4)} SOL`);
    } catch (error: any) {
      addResult(`❌ Wallet test failed: ${error.message}`);
    }
  };

  // Test 2: Honeycomb Authentication (via Backend API)
  const testAuthentication = async () => {
    if (!connected || !publicKey || !signMessage) {
      addResult('❌ Wallet not connected for auth test');
      return;
    }

    setIsLoading(true);
    try {
      // Step 1: Get auth challenge from backend
      addResult('🔄 Getting authentication challenge from backend...');
      const challengeResponse = await apiService.getAuthChallenge(publicKey.toString());
      const message = challengeResponse.message;
      addResult(`📝 Auth challenge received: ${message.substring(0, 30)}...`);

      // Step 2: Sign the message
      addResult('✍️ Signing authentication message...');
      const encodedMessage = new TextEncoder().encode(message);
      const signature = await signMessage(encodedMessage);
      
      // Convert signature to base58 format (Solana standard)
      const signatureBase58 = bs58.encode(signature);
      addResult(`✅ Message signed successfully`);
      addResult(`📝 Signature (base58): ${signatureBase58.substring(0, 20)}...`);

      // Step 3: Verify authentication with backend
      addResult('🔐 Verifying authentication with backend...');
      const authResult = await apiService.verifyAuthentication(
        publicKey.toString(),
        signatureBase58,
        message
      );
      
      setAuthToken(authResult.accessToken);
      
      addResult(`✅ Authentication successful!`);
      addResult(`🎫 Access token received (${authResult.accessToken.substring(0, 20)}...)`);
      addResult(`👤 User ID: ${authResult.user.id}`);
      addResult(`📧 Display name: ${authResult.user.displayName}`);
      addResult(`🏆 XP Total: ${authResult.user.xpTotal}`);
      
    } catch (error: any) {
      console.error('Authentication error details:', error);
      addResult(`❌ Authentication failed: ${error.message}`);
      
      // Try to provide more detailed error information
      if (error.cause) {
        addResult(`🔍 Root cause: ${error.cause}`);
      }
    }
    setIsLoading(false);
  };

  // Test 3: Profile Creation (via Backend API)
  const testProfileCreation = async () => {
    if (!connected || !publicKey) {
      addResult('❌ Wallet not connected for profile test');
      return;
    }

    setIsLoading(true);
    try {
      const profileName = `Founder_${publicKey.toString().substring(0, 6)}`;
      const profileBio = 'Rise of Founders test profile';
      
      addResult('📋 Creating Honeycomb profile via backend...');
      const profileResult = await apiService.createProfile(
        profileName,
        profileBio,
        publicKey.toString()
      );
      
      addResult(`✅ Profile creation successful!`);
      addResult(`📄 Profile ID: ${profileResult.profileId}`);
      addResult(`💬 Message: ${profileResult.message}`);
      
      setProfile({
        id: profileResult.profileId,
        name: profileName,
        wallet: publicKey.toString()
      });
      
      // Try to fetch the created profile
      try {
        addResult('🔍 Fetching created profile...');
        const fetchedProfile = await apiService.getUserProfile(publicKey.toString());
        if (fetchedProfile) {
          addResult(`✅ Profile fetched: ${fetchedProfile.name || 'Unknown'}`);
        } else {
          addResult('⚠️ Profile not immediately available (normal for new profiles)');
        }
      } catch (fetchError) {
        addResult('⚠️ Could not fetch profile immediately (normal for new profiles)');
      }
      
    } catch (error: any) {
      console.error('Profile creation error details:', error);
      addResult(`❌ Profile creation failed: ${error.message}`);
    }
    setIsLoading(false);
  };

  // Test 4: Badge Claiming (via Backend API)
  const testBadgeClaiming = async () => {
    if (!connected || !publicKey || !authToken) {
      addResult('❌ Wallet not connected or not authenticated for badge test');
      return;
    }

    setIsLoading(true);
    try {
      addResult('🏆 Checking for available badges...');
      
      // Check for new badges through backend API
      const badgeResult = await apiService.checkBadges(authToken);
      
      if (badgeResult.badges && badgeResult.badges.length > 0) {
        addResult(`✅ Badge check successful!`);
        addResult(`🎉 Found ${badgeResult.badges.length} available badges:`);
        
        badgeResult.badges.forEach((badge, index) => {
          addResult(`   ${index + 1}. ${badge.name || 'Unknown Badge'}`);
        });
      } else {
        addResult(`✅ Badge check completed - no new badges available at this time`);
        addResult(`💡 Badges are typically awarded for completing specific actions:`);
        addResult(`   - Connecting wallet (Web3 Pioneer)`);
        addResult(`   - Completing authentication (Honeycomb Verified)`);
        addResult(`   - Creating profile (Profile Creator)`);
        addResult(`   - First transaction (Transaction Master)`);
      }
      
      // Try to get user's current badges
      try {
        addResult('📊 Fetching current badges...');
        // Note: This would need the user ID from the auth result
        // For now, we'll skip this part since we need proper user ID
        addResult('⚠️ Badge history requires user ID from authentication');
      } catch (fetchError) {
        addResult('⚠️ Could not fetch badge history');
      }
      
    } catch (error: any) {
      console.error('Badge checking error:', error);
      addResult(`❌ Badge checking failed: ${error.message}`);
    }
    setIsLoading(false);
  };

  // Test 5: Direct Solana Transaction
  const testSolanaTransaction = async () => {
    if (!connected || !publicKey || !sendTransaction) {
      addResult('❌ Wallet not connected for transaction test');
      return;
    }

    setIsLoading(true);
    try {
      // Create a simple memo transaction
      const { blockhash } = await connection.getLatestBlockhash();
      
      const transaction = new Transaction({
        recentBlockhash: blockhash,
        feePayer: publicKey,
      });

      // Add a memo instruction (this doesn't cost anything)
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: publicKey, // Transfer to self (0 SOL)
          lamports: 0,
        })
      );

      addResult(`📋 Transaction prepared`);
      
      // Send the transaction
      const signature = await sendTransaction(transaction, connection);
      addResult(`📤 Transaction sent: ${signature.substring(0, 16)}...`);
      
      // Wait for confirmation
      const confirmation = await connection.confirmTransaction(signature, 'confirmed');
      
      if (confirmation.value.err) {
        addResult(`❌ Transaction failed: ${JSON.stringify(confirmation.value.err)}`);
      } else {
        addResult(`✅ Transaction confirmed!`);
        addResult(`🔗 View on explorer: https://explorer.solana.com/tx/${signature}?cluster=devnet`);
      }
      
    } catch (error: any) {
      addResult(`❌ Transaction test failed: ${error.message}`);
    }
    setIsLoading(false);
  };

  // Test 6: Network Information
  const testNetworkInfo = async () => {
    try {
      const slot = await connection.getSlot();
      const blockHeight = await connection.getBlockHeight();
      const version = await connection.getVersion();
      
      addResult(`🌐 Current slot: ${slot}`);
      addResult(`📦 Block height: ${blockHeight}`);
      addResult(`🔧 Solana version: ${version['solana-core']}`);
      
    } catch (error: any) {
      addResult(`❌ Network info failed: ${error.message}`);
    }
  };

  const runAllTests = async () => {
    setResults([]);
    addResult('🚀 Starting comprehensive blockchain tests...');
    
    await testWalletConnection();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await testNetworkInfo();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (connected) {
      await testSolanaTransaction();
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      await testAuthentication();
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await testProfileCreation();
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await testBadgeClaiming();
    }
    
    addResult('🎯 All tests completed!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-800/50 backdrop-blur-sm border border-white/10 rounded-lg p-8">
          <h1 className="text-3xl font-bold text-white mb-6">
            🧪 Rise of Founders - Blockchain Integration Tester
          </h1>
          
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-white mb-4">Wallet Connection</h2>
            <WalletMultiButton className="!bg-blue-600 hover:!bg-blue-700" />
          </div>

          {connected && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-white mb-4">Test Suite</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                <Button onClick={testWalletConnection} variant="outline" size="sm">
                  🔗 Wallet Test
                </Button>
                <Button onClick={testNetworkInfo} variant="outline" size="sm">
                  🌐 Network Info
                </Button>
                <Button 
                  onClick={testAuthentication} 
                  variant="outline" 
                  size="sm"
                  disabled={isLoading}
                >
                  🔐 Backend Auth
                </Button>
                <Button 
                  onClick={testProfileCreation} 
                  variant="outline" 
                  size="sm"
                  disabled={isLoading}
                >
                  👤 Backend Profile
                </Button>
                <Button 
                  onClick={testBadgeClaiming} 
                  variant="outline" 
                  size="sm"
                  disabled={isLoading}
                >
                  🏆 Backend Badges
                </Button>
                <Button 
                  onClick={testSolanaTransaction} 
                  variant="outline" 
                  size="sm"
                  disabled={isLoading}
                >
                  📤 TX Test
                </Button>
                <Button 
                  onClick={runAllTests} 
                  className="bg-green-600 hover:bg-green-700"
                  size="sm"
                  disabled={isLoading}
                >
                  🚀 Run All Tests
                </Button>
              </div>
            </div>
          )}

          <div className="mb-6">
            <h2 className="text-xl font-semibold text-white mb-4">Test Results</h2>
            <div className="bg-gray-900/50 rounded-lg p-4 h-96 overflow-y-auto">
              {results.length === 0 ? (
                <p className="text-gray-400">No tests run yet. Connect your wallet and start testing!</p>
              ) : (
                <div className="space-y-1">
                  {results.map((result, index) => (
                    <div key={index} className="text-sm font-mono text-gray-300">
                      {result}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-700/30 rounded-lg p-4">
              <h3 className="font-semibold text-white mb-2">Connection Status</h3>
              <p className={`text-sm ${connected ? 'text-green-400' : 'text-red-400'}`}>
                {connected ? '✅ Connected' : '❌ Disconnected'}
              </p>
              {connected && publicKey && (
                <p className="text-xs text-gray-400 mt-1">
                  {publicKey.toString().substring(0, 16)}...
                </p>
              )}
            </div>

            <div className="bg-gray-700/30 rounded-lg p-4">
              <h3 className="font-semibold text-white mb-2">Authentication</h3>
              <p className={`text-sm ${authToken ? 'text-green-400' : 'text-gray-400'}`}>
                {authToken ? '✅ Authenticated' : '⏳ Not authenticated'}
              </p>
            </div>

            <div className="bg-gray-700/30 rounded-lg p-4">
              <h3 className="font-semibold text-white mb-2">Profile Status</h3>
              <p className={`text-sm ${profile ? 'text-green-400' : 'text-gray-400'}`}>
                {profile ? '✅ Profile ready' : '⏳ No profile'}
              </p>
              {profile && (
                <p className="text-xs text-gray-400 mt-1">
                  {profile.name}
                </p>
              )}
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-900/20 rounded-lg border border-blue-500/30">
            <h3 className="font-semibold text-blue-300 mb-2">💡 Testing Instructions</h3>
            <ul className="text-sm text-blue-200 space-y-1">
              <li>1. Connect your Solana wallet (Phantom or Solflare)</li>
              <li>2. Ensure you're on Devnet with some test SOL</li>
              <li>3. Test wallet connection and network info first</li>
              <li>4. Run "Backend Auth" to authenticate with Rise of Founders API</li>
              <li>5. Test profile creation and badge checking</li>
              <li>6. Visit <a href="https://explorer.solana.com/?cluster=devnet" target="_blank" className="underline">Solana Explorer</a> to verify transactions</li>
            </ul>
            <div className="mt-3 p-2 bg-green-900/30 rounded border-l-2 border-green-400">
              <p className="text-xs text-green-300">
                ✨ Now using proper Honeycomb Protocol integration through backend API!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};