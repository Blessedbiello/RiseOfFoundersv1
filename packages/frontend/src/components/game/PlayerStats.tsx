'use client';

import { useAuth } from '../../hooks/useAuth';
import { calculateLevel } from '../../lib/utils';
import { 
  User, 
  Trophy, 
  Zap, 
  Target, 
  Users, 
  Star,
  Github,
  Wallet,
  TrendingUp,
  Award,
  MapPin,
  Crown,
  Sword,
  Shield
} from 'lucide-react';

const kingdoms = {
  'silicon-valley': { name: 'Silicon Valley', icon: '💻', color: 'from-blue-600 to-cyan-600', title: 'Code Citadel' },
  'crypto-valley': { name: 'Crypto Valley', icon: '⛓️', color: 'from-purple-600 to-pink-600', title: 'Decentralized Frontier' },
  'business-strategy': { name: 'Business Strategy', icon: '📈', color: 'from-green-600 to-emerald-600', title: 'Boardroom Colosseum' },
  'product-olympus': { name: 'Product Olympus', icon: '🎨', color: 'from-orange-600 to-red-600', title: 'User Paradise' },
  'marketing-multiverse': { name: 'Marketing Multiverse', icon: '🚀', color: 'from-yellow-600 to-orange-600', title: 'Attention Wars' }
};

export const PlayerStats: React.FC = () => {
  const { user, walletAddress, isWalletConnected } = useAuth();
  
  if (!user) {
    return (
      <div className="text-center text-gray-400">
        <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No user data available</p>
      </div>
    );
  }

  const levelInfo = calculateLevel(user.xpTotal);
  const completionRate = 0.15; // Mock data - would come from backend
  const selectedKingdom = kingdoms[user.selectedKingdom as keyof typeof kingdoms] || kingdoms['silicon-valley'];
  
  const stats = [
    {
      icon: Zap,
      label: 'Total XP',
      value: user.xpTotal.toLocaleString(),
      color: 'text-yellow-400'
    },
    {
      icon: Star,
      label: 'Current Level',
      value: user.level,
      color: 'text-blue-400'
    },
    {
      icon: Target,
      label: 'Missions Completed',
      value: '3', // Mock data
      color: 'text-green-400'
    },
    {
      icon: Trophy,
      label: 'Badges Earned',
      value: '2', // Mock data
      color: 'text-purple-400'
    },
    {
      icon: Users,
      label: 'Team Rank',
      value: '#47', // Mock data
      color: 'text-cyan-400'
    },
    {
      icon: TrendingUp,
      label: 'Completion Rate',
      value: `${Math.round(completionRate * 100)}%`,
      color: 'text-orange-400'
    }
  ];

  const skillData = [
    { name: 'Technical', level: 3, progress: 75, color: 'bg-blue-500' },
    { name: 'Business', level: 2, progress: 40, color: 'bg-green-500' },
    { name: 'Marketing', level: 1, progress: 20, color: 'bg-yellow-500' },
    { name: 'Leadership', level: 1, progress: 10, color: 'bg-purple-500' },
    { name: 'Design', level: 1, progress: 5, color: 'bg-pink-500' }
  ];

  const recentAchievements = [
    {
      id: '1',
      title: 'Git Initiate',
      description: 'Made your first commit',
      icon: Github,
      rarity: 'bronze',
      earnedAt: '2 hours ago'
    },
    {
      id: '2',
      title: 'Early Adopter',
      description: 'Joined Rise of Founders',
      icon: Award,
      rarity: 'bronze',
      earnedAt: '1 day ago'
    }
  ];

  return (
    <div className="space-y-6 text-white max-w-4xl mx-auto">
      {/* Kingdom Banner */}
      <div className={`bg-gradient-to-r ${selectedKingdom.color} rounded-xl p-4 border border-white/20`}>
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="text-4xl">{selectedKingdom.icon}</div>
            <div>
              <h2 className="text-2xl font-bold">{selectedKingdom.name}</h2>
              <p className="text-white/80">{selectedKingdom.title}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Crown className="w-6 h-6 text-yellow-300" />
            <span className="text-lg font-bold">Kingdom Founder</span>
          </div>
        </div>
      </div>

      {/* Profile Header */}
      <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 border border-white/10 rounded-lg p-6 backdrop-blur-lg">
        <div className="flex items-center gap-6">
          <div className="relative">
            {user.profilePicture ? (
              <img
                src={user.profilePicture}
                alt={user.name}
                className="w-20 h-20 rounded-full border-2 border-white/20"
              />
            ) : (
              <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                <User className="w-10 h-10 text-white" />
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 bg-yellow-500 text-black rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
              {user.level}
            </div>
          </div>
          
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{user.name}</h1>
            <p className="text-gray-300 mb-4">Aspiring Founder</p>
            
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Wallet className="w-4 h-4" />
                <span className={isWalletConnected ? 'text-green-400' : 'text-red-400'}>
                  {isWalletConnected ? 'Wallet Connected' : 'Wallet Disconnected'}
                </span>
              </div>
              
              {user.githubUsername && (
                <div className="flex items-center gap-2">
                  <Github className="w-4 h-4" />
                  <span className="text-gray-300">@{user.githubUsername}</span>
                </div>
              )}
              
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span className="text-gray-300">{selectedKingdom.name}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* XP Progress Bar */}
        <div className="mt-6">
          <div className="flex justify-between text-sm mb-2">
            <span>Level {levelInfo.level} Progress</span>
            <span>{levelInfo.currentLevelXP} / {levelInfo.nextLevelXP} XP</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${levelInfo.progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="bg-gray-800/50 border border-white/10 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
              <span className="text-gray-400 text-sm">{stat.label}</span>
            </div>
            <div className="text-2xl font-bold">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Skills Progress */}
      <div className="bg-gray-800/50 border border-white/10 rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Skill Progression
        </h2>
        
        <div className="space-y-4">
          {skillData.map((skill) => (
            <div key={skill.name} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium">{skill.name}</span>
                <span className="text-sm text-gray-400">Level {skill.level}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className={`${skill.color} h-2 rounded-full transition-all duration-500`}
                  style={{ width: `${skill.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Achievements */}
      <div className="bg-gray-800/50 border border-white/10 rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Trophy className="w-5 h-5" />
          Recent Achievements
        </h2>
        
        <div className="space-y-3">
          {recentAchievements.map((achievement) => (
            <div key={achievement.id} className="flex items-center gap-4 p-3 bg-gray-700/30 rounded-lg">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                achievement.rarity === 'bronze' ? 'bg-orange-500/20 text-orange-400' :
                achievement.rarity === 'silver' ? 'bg-gray-500/20 text-gray-400' :
                achievement.rarity === 'gold' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-purple-500/20 text-purple-400'
              }`}>
                <achievement.icon className="w-6 h-6" />
              </div>
              
              <div className="flex-1">
                <h3 className="font-semibold">{achievement.title}</h3>
                <p className="text-gray-400 text-sm">{achievement.description}</p>
              </div>
              
              <div className="text-right text-xs text-gray-500">
                {achievement.earnedAt}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};