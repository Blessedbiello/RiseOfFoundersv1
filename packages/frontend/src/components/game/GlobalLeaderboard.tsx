'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { leaderboardApi } from '../../services/leaderboard';
import { 
  Trophy, 
  Crown, 
  Sword, 
  Shield, 
  Star,
  User,
  TrendingUp,
  Medal,
  Target
} from 'lucide-react';

interface LeaderboardUser {
  id: string;
  displayName: string;
  avatarUrl?: string;
  xpTotal: number;
  reputationScore: number;
  skillScores: Record<string, number>;
  selectedKingdom?: string;
  badges: any[];
  rank: number;
}

interface LeaderboardData {
  users: LeaderboardUser[];
  page: number;
  limit: number;
  total: number;
}

const kingdoms = {
  'silicon-valley': { name: 'Silicon Valley', icon: '💻', color: 'from-blue-600 to-cyan-600' },
  'crypto-valley': { name: 'Crypto Valley', icon: '⛓️', color: 'from-purple-600 to-pink-600' },
  'business-strategy': { name: 'Business Strategy', icon: '📈', color: 'from-green-600 to-emerald-600' },
  'product-olympus': { name: 'Product Olympus', icon: '🎨', color: 'from-orange-600 to-red-600' },
  'marketing-multiverse': { name: 'Marketing Multiverse', icon: '🚀', color: 'from-yellow-600 to-orange-600' }
};

export const GlobalLeaderboard: React.FC = () => {
  const { user } = useAuth();
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'kingdom'>('all');

  useEffect(() => {
    fetchLeaderboard();
  }, [filter]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const result = await leaderboardApi.getLeaderboard({ limit: 50 });
      setLeaderboardData(result.data);
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
      // Mock data for demo
      setLeaderboardData({
        users: [
          {
            id: '1',
            displayName: 'TechFounder99',
            avatarUrl: '',
            xpTotal: 15000,
            reputationScore: 850,
            skillScores: { technical: 90, business: 70 },
            selectedKingdom: 'silicon-valley',
            badges: [],
            rank: 1
          },
          {
            id: '2',
            displayName: 'CryptoKing',
            avatarUrl: '',
            xpTotal: 12500,
            reputationScore: 720,
            skillScores: { technical: 85, crypto: 95 },
            selectedKingdom: 'crypto-valley',
            badges: [],
            rank: 2
          },
          {
            id: '3',
            displayName: 'BusinessMaven',
            avatarUrl: '',
            xpTotal: 11000,
            reputationScore: 680,
            skillScores: { business: 88, strategy: 82 },
            selectedKingdom: 'business-strategy',
            badges: [],
            rank: 3
          },
          {
            id: '4',
            displayName: user?.name || 'You',
            avatarUrl: user?.profilePicture || '',
            xpTotal: user?.xpTotal || 2500,
            reputationScore: user?.reputationScore || 150,
            skillScores: { technical: 45, business: 30 },
            selectedKingdom: user?.selectedKingdom || 'silicon-valley',
            badges: [],
            rank: 47
          }
        ],
        page: 1,
        limit: 50,
        total: 150
      });
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-6 h-6 text-yellow-400" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-300" />;
    if (rank === 3) return <Medal className="w-6 h-6 text-orange-400" />;
    return <span className="text-lg font-bold text-gray-400">#{rank}</span>;
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/30';
    if (rank === 2) return 'bg-gradient-to-r from-gray-400/20 to-gray-500/20 border-gray-400/30';
    if (rank === 3) return 'bg-gradient-to-r from-orange-500/20 to-red-500/20 border-orange-500/30';
    return 'bg-gray-800/30 border-white/10';
  };

  const userKingdom = kingdoms[user?.selectedKingdom as keyof typeof kingdoms];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Trophy className="w-12 h-12 mx-auto mb-4 text-yellow-400 animate-pulse" />
          <p className="text-white">Loading Crown Rankings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-white max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Trophy className="w-8 h-8 text-yellow-400" />
          <h1 className="text-3xl font-bold">Crown Leaderboard</h1>
          <Trophy className="w-8 h-8 text-yellow-400" />
        </div>
        <p className="text-gray-300">
          The mightiest founders competing for the Crown of Unicorns
        </p>
      </div>

      {/* User's Kingdom Banner */}
      {userKingdom && (
        <div className={`bg-gradient-to-r ${userKingdom.color} rounded-xl p-4 mb-6 border border-white/20`}>
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              <div className="text-3xl">{userKingdom.icon}</div>
              <div>
                <h3 className="text-lg font-bold">Your Kingdom: {userKingdom.name}</h3>
                <p className="text-white/80">Representing your realm in the global rankings</p>
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">#{user?.xpTotal ? Math.floor(Math.random() * 50) + 1 : '??'}</div>
              <div className="text-sm text-white/70">Your Rank</div>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard */}
      <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl border border-white/10 overflow-hidden">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Sword className="w-5 h-5" />
              Global Rankings
            </h2>
            <div className="text-sm text-gray-400">
              {leaderboardData?.total} Total Founders
            </div>
          </div>
        </div>

        <div className="space-y-2 p-4">
          {leaderboardData?.users.map((leaderUser) => {
            const userKingdom = kingdoms[leaderUser.selectedKingdom as keyof typeof kingdoms];
            const isCurrentUser = leaderUser.id === user?.id;
            
            return (
              <div 
                key={leaderUser.id}
                className={`p-4 rounded-lg border transition-all ${
                  isCurrentUser 
                    ? 'bg-blue-600/20 border-blue-500/50 ring-2 ring-blue-500/30' 
                    : getRankColor(leaderUser.rank)
                } ${isCurrentUser ? 'transform scale-105' : ''}`}
              >
                <div className="flex items-center gap-4">
                  {/* Rank */}
                  <div className="w-16 flex items-center justify-center">
                    {getRankIcon(leaderUser.rank)}
                  </div>

                  {/* Avatar */}
                  <div className="relative">
                    {leaderUser.avatarUrl ? (
                      <img
                        src={leaderUser.avatarUrl}
                        alt={leaderUser.displayName}
                        className="w-12 h-12 rounded-full border-2 border-white/20"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-white" />
                      </div>
                    )}
                    {leaderUser.rank <= 3 && (
                      <div className="absolute -top-1 -right-1">
                        <Crown className="w-4 h-4 text-yellow-400" />
                      </div>
                    )}
                  </div>

                  {/* User Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-lg">
                        {leaderUser.displayName}
                        {isCurrentUser && <span className="text-blue-400 ml-2">(You)</span>}
                      </h3>
                      {userKingdom && (
                        <div className={`flex items-center gap-1 px-2 py-1 rounded-full bg-gradient-to-r ${userKingdom.color} text-xs text-white`}>
                          <span>{userKingdom.icon}</span>
                          <span>{userKingdom.name}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-400 mt-1">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400" />
                        <span>{leaderUser.xpTotal.toLocaleString()} XP</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Shield className="w-4 h-4 text-green-400" />
                        <span>{leaderUser.reputationScore} Rep</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Trophy className="w-4 h-4 text-purple-400" />
                        <span>{leaderUser.badges?.length || 0} Badges</span>
                      </div>
                    </div>
                  </div>

                  {/* XP Progress Visual */}
                  <div className="text-right">
                    <div className="text-xl font-bold text-yellow-400">
                      {leaderUser.xpTotal.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-400">Total XP</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 text-center">
          <p className="text-gray-400 text-sm">
            🏆 Climb the ranks by completing kingdom quests and defeating bosses!
          </p>
        </div>
      </div>

      {/* Your Stats Summary */}
      <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-xl p-6 border border-purple-500/30">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Target className="w-5 h-5" />
          Your Journey to Glory
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">{user?.xpTotal || 0}</div>
            <div className="text-sm text-gray-400">Current XP</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">
              {15000 - (user?.xpTotal || 0) > 0 ? (15000 - (user?.xpTotal || 0)).toLocaleString() : 0}
            </div>
            <div className="text-sm text-gray-400">XP to Crown</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">#{Math.floor(Math.random() * 50) + 1}</div>
            <div className="text-sm text-gray-400">Global Rank</div>
          </div>
        </div>
      </div>
    </div>
  );
};