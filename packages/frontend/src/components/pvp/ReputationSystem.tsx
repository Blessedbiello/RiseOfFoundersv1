'use client';

import { useState, useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/button';
import { 
  Star,
  Trophy,
  Crown,
  Shield,
  Sword,
  TrendingUp,
  Users,
  Target,
  Zap,
  Award,
  Medal,
  ChevronUp,
  ChevronDown,
  Filter
} from 'lucide-react';

interface ReputationTier {
  id: string;
  name: string;
  minReputation: number;
  maxReputation: number;
  color: string;
  icon: JSX.Element;
  benefits: string[];
}

interface TeamReputation {
  rank: number;
  teamId: string;
  teamName: string;
  reputation: number;
  tier: string;
  change: number; // weekly change
  territories: number;
  battlesWon: number;
  battlesTotal: number;
  specialAchievements: string[];
  color: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: JSX.Element;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  reputationReward: number;
  unlockedAt?: string;
}

const reputationTiers: ReputationTier[] = [
  {
    id: 'novice',
    name: 'Novice Founder',
    minReputation: 0,
    maxReputation: 499,
    color: '#6b7280',
    icon: <Users className="w-4 h-4" />,
    benefits: ['Access to basic territories', 'Standard resource generation', 'Community forum access']
  },
  {
    id: 'emerging',
    name: 'Emerging Entrepreneur',
    minReputation: 500,
    maxReputation: 999,
    color: '#10b981',
    icon: <TrendingUp className="w-4 h-4" />,
    benefits: ['Access to advanced territories', '+10% resource bonus', 'Mentor matching access', 'Team alliance features']
  },
  {
    id: 'established',
    name: 'Established Leader',
    minReputation: 1000,
    maxReputation: 1999,
    color: '#3b82f6',
    icon: <Shield className="w-4 h-4" />,
    benefits: ['Premium territory access', '+25% resource bonus', 'Priority support', 'Custom challenges', 'Investor networking']
  },
  {
    id: 'veteran',
    name: 'Veteran Strategist',
    minReputation: 2000,
    maxReputation: 3499,
    color: '#8b5cf6',
    icon: <Star className="w-4 h-4" />,
    benefits: ['Elite territories unlocked', '+50% resource bonus', 'Beta feature access', 'Private mastermind groups', 'Speaker opportunities']
  },
  {
    id: 'master',
    name: 'Master Architect',
    minReputation: 3500,
    maxReputation: 4999,
    color: '#f59e0b',
    icon: <Crown className="w-4 h-4" />,
    benefits: ['Legendary territories', '+75% resource bonus', 'Advisory board positions', 'Exclusive events', 'Co-creation opportunities']
  },
  {
    id: 'legendary',
    name: 'Legendary Founder',
    minReputation: 5000,
    maxReputation: Infinity,
    color: '#ef4444',
    icon: <Trophy className="w-4 h-4" />,
    benefits: ['All content unlocked', '+100% resource bonus', 'Platform governance rights', 'Legacy recognition', 'Unlimited access']
  }
];

const achievements: Achievement[] = [
  {
    id: 'first_territory',
    title: 'Territory Pioneer',
    description: 'Successfully claim your first territory',
    icon: <Target className="w-4 h-4" />,
    rarity: 'common',
    reputationReward: 50,
    unlockedAt: '2025-01-10T15:30:00Z'
  },
  {
    id: 'win_streak_5',
    title: 'Unstoppable Force',
    description: 'Win 5 challenges in a row',
    icon: <Zap className="w-4 h-4" />,
    rarity: 'rare',
    reputationReward: 200
  },
  {
    id: 'territory_master',
    title: 'Territory Master',
    description: 'Control 5 territories simultaneously',
    icon: <Crown className="w-4 h-4" />,
    rarity: 'epic',
    reputationReward: 500
  },
  {
    id: 'season_champion',
    title: 'Season Champion',
    description: 'Finish #1 in a competitive season',
    icon: <Trophy className="w-4 h-4" />,
    rarity: 'legendary',
    reputationReward: 1000
  },
  {
    id: 'mentor_veteran',
    title: 'Mentor Veteran',
    description: 'Help 10 teams through mentoring',
    icon: <Users className="w-4 h-4" />,
    rarity: 'rare',
    reputationReward: 300,
    unlockedAt: '2025-01-05T09:20:00Z'
  },
  {
    id: 'innovation_leader',
    title: 'Innovation Leader',
    description: 'Win challenges in all territory types',
    icon: <Star className="w-4 h-4" />,
    rarity: 'epic',
    reputationReward: 750
  }
];

const mockLeaderboard: TeamReputation[] = [
  {
    rank: 1,
    teamId: 'team_alpha',
    teamName: 'Alpha Ventures',
    reputation: 2850,
    tier: 'veteran',
    change: +125,
    territories: 4,
    battlesWon: 18,
    battlesTotal: 21,
    specialAchievements: ['season_champion', 'territory_master'],
    color: '#3b82f6'
  },
  {
    rank: 2,
    teamId: 'team_nexus',
    teamName: 'Nexus Innovations',
    reputation: 2640,
    tier: 'veteran',
    change: +87,
    territories: 3,
    battlesWon: 15,
    battlesTotal: 19,
    specialAchievements: ['innovation_leader'],
    color: '#10b981'
  },
  {
    rank: 3,
    teamId: 'team_phoenix',
    teamName: 'Phoenix Rising',
    reputation: 2380,
    tier: 'veteran',
    change: -42,
    territories: 3,
    battlesWon: 12,
    battlesTotal: 16,
    specialAchievements: ['win_streak_5', 'mentor_veteran'],
    color: '#f59e0b'
  },
  {
    rank: 4,
    teamId: 'team_quantum',
    teamName: 'Quantum Labs',
    reputation: 1950,
    tier: 'established',
    change: +156,
    territories: 2,
    battlesWon: 11,
    battlesTotal: 14,
    specialAchievements: ['first_territory'],
    color: '#8b5cf6'
  },
  {
    rank: 5,
    teamId: 'team_stellar',
    teamName: 'Stellar Dynamics',
    reputation: 1720,
    tier: 'established',
    change: +93,
    territories: 2,
    battlesWon: 9,
    battlesTotal: 13,
    specialAchievements: ['mentor_veteran'],
    color: '#ef4444'
  }
];

export const ReputationSystem: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'achievements' | 'tiers'>('leaderboard');
  const [filterTier, setFilterTier] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<'weekly' | 'monthly' | 'season'>('weekly');
  
  const { user } = useAuth();

  // Find user's current tier
  const userTier = useMemo(() => {
    const reputation = user?.reputation || 1250;
    return reputationTiers.find(tier => 
      reputation >= tier.minReputation && reputation <= tier.maxReputation
    ) || reputationTiers[0];
  }, [user?.reputation]);

  // Filter achievements
  const userAchievements = useMemo(() => {
    return achievements.filter(achievement => achievement.unlockedAt);
  }, []);

  const availableAchievements = useMemo(() => {
    return achievements.filter(achievement => !achievement.unlockedAt);
  }, []);

  // Filter leaderboard
  const filteredLeaderboard = useMemo(() => {
    if (filterTier === 'all') return mockLeaderboard;
    return mockLeaderboard.filter(team => team.tier === filterTier);
  }, [filterTier]);

  const getRarityColor = (rarity: Achievement['rarity']) => {
    switch (rarity) {
      case 'common': return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
      case 'rare': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      case 'epic': return 'text-purple-400 bg-purple-400/10 border-purple-400/20';
      case 'legendary': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  const renderLeaderboard = () => (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filterTier}
              onChange={(e) => setFilterTier(e.target.value)}
              className="bg-gray-700 border border-gray-600 rounded px-3 py-1 text-white text-sm"
            >
              <option value="all">All Tiers</option>
              {reputationTiers.map(tier => (
                <option key={tier.id} value={tier.id}>{tier.name}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">Period:</span>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as typeof timeRange)}
              className="bg-gray-700 border border-gray-600 rounded px-3 py-1 text-white text-sm"
            >
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="season">Season</option>
            </select>
          </div>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="space-y-2">
        {filteredLeaderboard.map((team, index) => {
          const tier = reputationTiers.find(t => t.id === team.tier)!;
          const isUserTeam = team.teamId === user?.teamId;
          
          return (
            <div
              key={team.teamId}
              className={`p-4 rounded-lg border transition-all ${
                isUserTeam 
                  ? 'border-blue-500 bg-blue-500/10' 
                  : 'border-gray-700 bg-gray-700/30 hover:bg-gray-700/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Rank */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                    team.rank === 1 ? 'bg-yellow-400 text-black' :
                    team.rank === 2 ? 'bg-gray-300 text-black' :
                    team.rank === 3 ? 'bg-amber-600 text-white' :
                    'bg-gray-600 text-white'
                  }`}>
                    {team.rank}
                  </div>

                  {/* Team Info */}
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded" style={{ backgroundColor: team.color }}></div>
                      <span className="font-bold text-white">{team.teamName}</span>
                      {isUserTeam && (
                        <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded">YOU</span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 mt-1">
                      <div 
                        className="flex items-center gap-1 px-2 py-0.5 rounded text-xs"
                        style={{ backgroundColor: tier.color + '20', color: tier.color }}
                      >
                        {tier.icon}
                        {tier.name}
                      </div>
                      
                      <span className="text-sm text-gray-400">
                        {team.territories} territories • {team.battlesWon}/{team.battlesTotal} wins
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  {/* Reputation */}
                  <div className="text-xl font-bold text-white">
                    {team.reputation.toLocaleString()}
                  </div>
                  
                  {/* Change indicator */}
                  <div className={`flex items-center gap-1 text-sm justify-end ${
                    team.change > 0 ? 'text-green-400' :
                    team.change < 0 ? 'text-red-400' :
                    'text-gray-400'
                  }`}>
                    {team.change > 0 ? <ChevronUp className="w-4 h-4" /> :
                     team.change < 0 ? <ChevronDown className="w-4 h-4" /> : null}
                    {Math.abs(team.change)} this {timeRange.slice(0, -2)}
                  </div>
                  
                  {/* Achievements */}
                  {team.specialAchievements.length > 0 && (
                    <div className="flex gap-1 mt-1 justify-end">
                      {team.specialAchievements.slice(0, 3).map(achievementId => {
                        const achievement = achievements.find(a => a.id === achievementId);
                        if (!achievement) return null;
                        return (
                          <div
                            key={achievementId}
                            className={`w-5 h-5 rounded flex items-center justify-center ${getRarityColor(achievement.rarity)}`}
                            title={achievement.title}
                          >
                            {achievement.icon}
                          </div>
                        );
                      })}
                      {team.specialAchievements.length > 3 && (
                        <div className="w-5 h-5 rounded bg-gray-500/20 flex items-center justify-center text-xs text-gray-400">
                          +{team.specialAchievements.length - 3}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderAchievements = () => (
    <div className="space-y-6">
      {/* Unlocked Achievements */}
      <div>
        <h3 className="text-lg font-bold text-white mb-4">Unlocked Achievements ({userAchievements.length})</h3>
        
        {userAchievements.length === 0 ? (
          <div className="text-center py-8">
            <Award className="w-16 h-16 mx-auto text-gray-600 mb-4" />
            <p className="text-gray-400">No achievements unlocked yet</p>
            <p className="text-sm text-gray-500">Complete challenges to earn your first achievements</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {userAchievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`border rounded-lg p-4 ${getRarityColor(achievement.rarity)}`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
                    {achievement.icon}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-white">{achievement.title}</h4>
                      <span className={`px-2 py-0.5 rounded-full text-xs capitalize ${getRarityColor(achievement.rarity)}`}>
                        {achievement.rarity}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-300 mb-2">{achievement.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-purple-400">
                        +{achievement.reputationReward} Reputation
                      </span>
                      {achievement.unlockedAt && (
                        <span className="text-xs text-gray-500">
                          {new Date(achievement.unlockedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Available Achievements */}
      <div>
        <h3 className="text-lg font-bold text-white mb-4">Available Achievements ({availableAchievements.length})</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {availableAchievements.map((achievement) => (
            <div
              key={achievement.id}
              className="border border-gray-700 bg-gray-700/20 rounded-lg p-4 opacity-75"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center text-gray-500">
                  {achievement.icon}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-gray-300">{achievement.title}</h4>
                    <span className={`px-2 py-0.5 rounded-full text-xs capitalize border ${getRarityColor(achievement.rarity)}`}>
                      {achievement.rarity}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-400 mb-2">{achievement.description}</p>
                  
                  <span className="text-xs text-purple-400">
                    +{achievement.reputationReward} Reputation
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderTiers = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-bold text-white mb-2">Your Current Tier</h3>
        <div 
          className="inline-flex items-center gap-3 px-6 py-4 rounded-lg border-2"
          style={{ 
            borderColor: userTier.color, 
            backgroundColor: userTier.color + '20' 
          }}
        >
          <div className="text-2xl">{userTier.icon}</div>
          <div>
            <div className="font-bold text-white text-lg">{userTier.name}</div>
            <div className="text-sm" style={{ color: userTier.color }}>
              {user?.reputation || 1250} / {userTier.maxReputation === Infinity ? '∞' : userTier.maxReputation} Reputation
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {reputationTiers.map((tier, index) => {
          const isCurrentTier = tier.id === userTier.id;
          const isPastTier = (user?.reputation || 1250) > tier.maxReputation;
          const userRep = user?.reputation || 1250;
          const progressPercent = Math.min(
            100,
            ((userRep - tier.minReputation) / (tier.maxReputation - tier.minReputation)) * 100
          );

          return (
            <div
              key={tier.id}
              className={`border-2 rounded-lg p-6 transition-all ${
                isCurrentTier 
                  ? `border-2` 
                  : isPastTier
                  ? 'border-green-500/50 bg-green-500/5'
                  : 'border-gray-700 bg-gray-700/20'
              }`}
              style={isCurrentTier ? { borderColor: tier.color, backgroundColor: tier.color + '10' } : {}}
            >
              <div className="flex items-start gap-4">
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: tier.color + '20', color: tier.color }}
                >
                  {tier.icon}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-bold text-white text-lg">{tier.name}</h4>
                    {isPastTier && <Medal className="w-5 h-5 text-green-400" />}
                    {isCurrentTier && <span className="bg-blue-500 text-white px-2 py-1 rounded text-xs">CURRENT</span>}
                  </div>
                  
                  <div className="text-sm text-gray-400 mb-3">
                    {tier.minReputation.toLocaleString()} - {tier.maxReputation === Infinity ? '∞' : tier.maxReputation.toLocaleString()} Reputation
                  </div>

                  {/* Progress Bar */}
                  {isCurrentTier && tier.maxReputation !== Infinity && (
                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>Progress to next tier</span>
                        <span>{Math.round(progressPercent)}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full transition-all"
                          style={{ 
                            width: `${progressPercent}%`, 
                            backgroundColor: tier.color 
                          }}
                        ></div>
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <h5 className="font-medium text-white mb-2">Benefits:</h5>
                    <ul className="space-y-1">
                      {tier.benefits.map((benefit, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm text-gray-300">
                          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: tier.color }}></div>
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Star className="w-6 h-6 text-purple-400" />
          <h2 className="text-2xl font-bold text-white">Reputation System</h2>
        </div>
        
        <div className="text-right">
          <div className="text-2xl font-bold text-white">{(user?.reputation || 1250).toLocaleString()}</div>
          <div className="text-sm text-gray-400">Your Reputation</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-700 mb-6">
        {(['leaderboard', 'achievements', 'tiers'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === tab
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'leaderboard' && renderLeaderboard()}
      {activeTab === 'achievements' && renderAchievements()}
      {activeTab === 'tiers' && renderTiers()}
    </div>
  );
};