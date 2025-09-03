'use client';

import { useState, useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Button } from '../ui/button';
import { toast } from 'react-hot-toast';
import { SystemProgram, Transaction, LAMPORTS_PER_SOL } from '@solana/web3.js';

interface DemoProfile {
  id: string;
  name: string;
  wallet: string;
  xp: number;
  level: number;
  badges: string[];
  kingdom: string;
  createdAt: string;
}

interface DemoBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  earnedAt?: string;
  transactionId?: string;
}

interface DemoMission {
  id: string;
  name: string;
  description: string;
  xpReward: number;
  badgeReward?: string;
  completed: boolean;
  completedAt?: string;
  transactionId?: string;
}

export const BlockchainDemo: React.FC = () => {
  const { publicKey, connected, sendTransaction } = useWallet();
  const { connection } = useConnection();
  
  const [profile, setProfile] = useState<DemoProfile | null>(null);
  const [badges, setBadges] = useState<DemoBadge[]>([]);
  const [missions, setMissions] = useState<DemoMission[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [transactions, setTransactions] = useState<string[]>([]);

  // Initialize demo data
  useEffect(() => {
    if (connected && publicKey) {
      initializeDemoData();
    }
  }, [connected, publicKey]);

  const initializeDemoData = () => {
    // Create demo profile
    const demoProfile: DemoProfile = {
      id: `profile_${publicKey!.toString().substring(0, 8)}`,
      name: `Founder_${publicKey!.toString().substring(0, 6)}`,
      wallet: publicKey!.toString(),
      xp: 0,
      level: 1,
      badges: [],
      kingdom: 'Silicon Valley',
      createdAt: new Date().toISOString(),
    };
    setProfile(demoProfile);

    // Initialize badges
    const demoBadges: DemoBadge[] = [
      {
        id: 'web3_pioneer',
        name: 'Web3 Pioneer',
        description: 'Connected your first Web3 wallet',
        icon: '🚀',
        earned: false,
      },
      {
        id: 'blockchain_builder',
        name: 'Blockchain Builder',
        description: 'Sent your first blockchain transaction',
        icon: '⛓️',
        earned: false,
      },
      {
        id: 'devnet_explorer',
        name: 'Devnet Explorer',
        description: 'Successfully tested on Solana devnet',
        icon: '🌐',
        earned: false,
      },
      {
        id: 'smart_founder',
        name: 'Smart Founder',
        description: 'Completed your first mission',
        icon: '🧠',
        earned: false,
      },
    ];
    setBadges(demoBadges);

    // Initialize missions
    const demoMissions: DemoMission[] = [
      {
        id: 'wallet_connect',
        name: 'Connect Your Wallet',
        description: 'Connect a Solana wallet to Rise of Founders',
        xpReward: 50,
        badgeReward: 'web3_pioneer',
        completed: false,
      },
      {
        id: 'first_transaction',
        name: 'Send First Transaction',
        description: 'Send your first transaction on Solana devnet',
        xpReward: 100,
        badgeReward: 'blockchain_builder',
        completed: false,
      },
      {
        id: 'profile_setup',
        name: 'Complete Profile Setup',
        description: 'Set up your founder profile on the blockchain',
        xpReward: 75,
        badgeReward: 'devnet_explorer',
        completed: false,
      },
      {
        id: 'first_mission',
        name: 'Mission Accomplished',
        description: 'Complete your first blockchain mission',
        xpReward: 150,
        badgeReward: 'smart_founder',
        completed: false,
      },
    ];
    setMissions(demoMissions);
  };

  const completeWalletMission = async () => {
    if (!connected) return;

    const mission = missions.find(m => m.id === 'wallet_connect');
    if (!mission || mission.completed) return;

    // Update mission as completed
    setMissions(prev => prev.map(m => 
      m.id === 'wallet_connect' 
        ? { ...m, completed: true, completedAt: new Date().toISOString() }
        : m
    ));

    // Award badge
    setBadges(prev => prev.map(b => 
      b.id === 'web3_pioneer' 
        ? { ...b, earned: true, earnedAt: new Date().toISOString() }
        : b
    ));

    // Update profile XP
    setProfile(prev => prev ? {
      ...prev,
      xp: prev.xp + mission.xpReward,
      level: Math.floor((prev.xp + mission.xpReward) / 100) + 1,
      badges: [...prev.badges, 'web3_pioneer']
    } : null);

    toast.success('🎉 Mission Complete! Badge earned: Web3 Pioneer');
  };

  const sendTestTransaction = async () => {
    if (!connected || !publicKey || !sendTransaction) {
      toast.error('Wallet not connected');
      return;
    }

    setIsLoading(true);
    try {
      // Create a simple transaction
      const { blockhash } = await connection.getLatestBlockhash();
      
      const transaction = new Transaction({
        recentBlockhash: blockhash,
        feePayer: publicKey,
      });

      // Add a self-transfer (0 SOL to demonstrate transaction)
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: publicKey,
          lamports: 0,
        })
      );

      // Send transaction
      const signature = await sendTransaction(transaction, connection);
      
      // Wait for confirmation
      const confirmation = await connection.confirmTransaction(signature, 'confirmed');
      
      if (confirmation.value.err) {
        toast.error('Transaction failed');
        return;
      }

      // Add to transactions list
      setTransactions(prev => [...prev, signature]);

      // Complete the transaction mission
      const transactionMission = missions.find(m => m.id === 'first_transaction');
      if (transactionMission && !transactionMission.completed) {
        setMissions(prev => prev.map(m => 
          m.id === 'first_transaction' 
            ? { ...m, completed: true, completedAt: new Date().toISOString(), transactionId: signature }
            : m
        ));

        setBadges(prev => prev.map(b => 
          b.id === 'blockchain_builder' 
            ? { ...b, earned: true, earnedAt: new Date().toISOString(), transactionId: signature }
            : b
        ));

        setProfile(prev => prev ? {
          ...prev,
          xp: prev.xp + transactionMission.xpReward,
          level: Math.floor((prev.xp + transactionMission.xpReward) / 100) + 1,
          badges: [...prev.badges, 'blockchain_builder']
        } : null);

        toast.success('🎉 Transaction Mission Complete! Badge earned: Blockchain Builder');
      }

      toast.success(`✅ Transaction sent! ${signature.substring(0, 16)}...`);
      
    } catch (error: any) {
      toast.error(`Transaction failed: ${error.message}`);
    }
    setIsLoading(false);
  };

  const completeProfileMission = async () => {
    const profileMission = missions.find(m => m.id === 'profile_setup');
    if (!profileMission || profileMission.completed) return;

    // Simulate profile setup transaction
    const mockTxId = `profile_tx_${Date.now()}`;

    setMissions(prev => prev.map(m => 
      m.id === 'profile_setup' 
        ? { ...m, completed: true, completedAt: new Date().toISOString(), transactionId: mockTxId }
        : m
    ));

    setBadges(prev => prev.map(b => 
      b.id === 'devnet_explorer' 
        ? { ...b, earned: true, earnedAt: new Date().toISOString(), transactionId: mockTxId }
        : b
    ));

    setProfile(prev => prev ? {
      ...prev,
      xp: prev.xp + profileMission.xpReward,
      level: Math.floor((prev.xp + profileMission.xpReward) / 100) + 1,
      badges: [...prev.badges, 'devnet_explorer']
    } : null);

    toast.success('🎉 Profile Mission Complete! Badge earned: Devnet Explorer');
  };

  const completeFinalMission = async () => {
    const finalMission = missions.find(m => m.id === 'first_mission');
    if (!finalMission || finalMission.completed) return;

    const mockTxId = `final_tx_${Date.now()}`;

    setMissions(prev => prev.map(m => 
      m.id === 'first_mission' 
        ? { ...m, completed: true, completedAt: new Date().toISOString(), transactionId: mockTxId }
        : m
    ));

    setBadges(prev => prev.map(b => 
      b.id === 'smart_founder' 
        ? { ...b, earned: true, earnedAt: new Date().toISOString(), transactionId: mockTxId }
        : b
    ));

    setProfile(prev => prev ? {
      ...prev,
      xp: prev.xp + finalMission.xpReward,
      level: Math.floor((prev.xp + finalMission.xpReward) / 100) + 1,
      badges: [...prev.badges, 'smart_founder']
    } : null);

    toast.success('🎉 Final Mission Complete! Badge earned: Smart Founder');
  };

  // Auto-complete wallet mission when connected
  useEffect(() => {
    if (connected && missions.length > 0) {
      setTimeout(() => completeWalletMission(), 1000);
    }
  }, [connected, missions.length]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            🎮 Rise of Founders - Blockchain Demo
          </h1>
          <p className="text-xl text-gray-300">
            Experience the future of gamified Web3 education on Solana
          </p>
        </div>

        {/* Wallet Connection */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-white/10 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white mb-2">Connect Your Wallet</h2>
              <p className="text-gray-400">Start your Web3 founder journey</p>
            </div>
            <WalletMultiButton className="!bg-blue-600 hover:!bg-blue-700" />
          </div>
        </div>

        {connected && profile && (
          <>
            {/* Profile Card */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-white/10 rounded-lg p-6 mb-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-2xl font-bold text-white">
                  {profile.name.substring(0, 2)}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{profile.name}</h2>
                  <p className="text-gray-400">{profile.kingdom} Kingdom</p>
                  <p className="text-sm text-gray-500">{profile.wallet.substring(0, 16)}...</p>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">{profile.level}</div>
                  <div className="text-sm text-gray-400">Level</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">{profile.xp}</div>
                  <div className="text-sm text-gray-400">Experience</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">{profile.badges.length}</div>
                  <div className="text-sm text-gray-400">Badges</div>
                </div>
              </div>
            </div>

            {/* Missions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-gray-800/50 backdrop-blur-sm border border-white/10 rounded-lg p-6">
                <h3 className="text-xl font-bold text-white mb-4">🎯 Active Missions</h3>
                <div className="space-y-3">
                  {missions.map(mission => (
                    <div key={mission.id} className={`p-4 rounded-lg ${mission.completed ? 'bg-green-900/30 border border-green-500/30' : 'bg-gray-700/50'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-white">{mission.name}</h4>
                        <span className={`px-2 py-1 rounded text-xs ${mission.completed ? 'bg-green-600 text-white' : 'bg-yellow-600 text-white'}`}>
                          {mission.completed ? '✅ Complete' : '⏳ Active'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400 mb-2">{mission.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-blue-400">+{mission.xpReward} XP</span>
                        {!mission.completed && mission.id === 'first_transaction' && (
                          <Button 
                            onClick={sendTestTransaction} 
                            size="sm" 
                            className="bg-blue-600 hover:bg-blue-700"
                            disabled={isLoading}
                          >
                            {isLoading ? 'Sending...' : 'Send TX'}
                          </Button>
                        )}
                        {!mission.completed && mission.id === 'profile_setup' && (
                          <Button 
                            onClick={completeProfileMission} 
                            size="sm" 
                            className="bg-purple-600 hover:bg-purple-700"
                          >
                            Setup Profile
                          </Button>
                        )}
                        {!mission.completed && mission.id === 'first_mission' && (
                          <Button 
                            onClick={completeFinalMission} 
                            size="sm" 
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Complete
                          </Button>
                        )}
                      </div>
                      {mission.transactionId && (
                        <div className="mt-2 pt-2 border-t border-gray-600">
                          <a 
                            href={`https://explorer.solana.com/tx/${mission.transactionId}?cluster=devnet`}
                            target="_blank"
                            className="text-xs text-blue-400 hover:underline"
                          >
                            View Transaction: {mission.transactionId.substring(0, 16)}...
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Badges */}
              <div className="bg-gray-800/50 backdrop-blur-sm border border-white/10 rounded-lg p-6">
                <h3 className="text-xl font-bold text-white mb-4">🏆 Achievement Badges</h3>
                <div className="grid grid-cols-2 gap-3">
                  {badges.map(badge => (
                    <div key={badge.id} className={`p-4 rounded-lg text-center ${badge.earned ? 'bg-yellow-900/30 border border-yellow-500/30' : 'bg-gray-700/30'}`}>
                      <div className="text-3xl mb-2">{badge.icon}</div>
                      <h4 className={`font-semibold ${badge.earned ? 'text-yellow-400' : 'text-gray-400'}`}>
                        {badge.name}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">{badge.description}</p>
                      {badge.earned && badge.earnedAt && (
                        <p className="text-xs text-green-400 mt-2">
                          Earned {new Date(badge.earnedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Transaction History */}
            {transactions.length > 0 && (
              <div className="bg-gray-800/50 backdrop-blur-sm border border-white/10 rounded-lg p-6">
                <h3 className="text-xl font-bold text-white mb-4">📜 Recent Transactions</h3>
                <div className="space-y-2">
                  {transactions.map((tx, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                      <div>
                        <p className="text-white font-mono text-sm">{tx.substring(0, 32)}...</p>
                        <p className="text-xs text-gray-400">Solana Devnet Transaction</p>
                      </div>
                      <a 
                        href={`https://explorer.solana.com/tx/${tx}?cluster=devnet`}
                        target="_blank"
                        className="text-blue-400 hover:underline text-sm"
                      >
                        View on Explorer →
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};