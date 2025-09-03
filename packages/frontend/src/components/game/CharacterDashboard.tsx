'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { 
  User, 
  Trophy, 
  Zap, 
  Target, 
  Crown,
  TrendingUp,
  Award,
  Star,
  Shield,
  Swords,
  Package,
  Timer,
  ArrowUp,
  BarChart3,
  Sparkles,
  Settings,
  RefreshCw
} from 'lucide-react';

interface Character {
  id: string;
  name: string;
  kingdom: string;
  characterClass: string;
  level: number;
  experience: number;
  experienceToNext: number;
  stats: {
    technical: number;
    business: number;
    marketing: number;
    community: number;
    design: number;
    product: number;
  };
  visual: {
    avatarUrl?: string;
    kingdomEmblem?: string;
    characterTheme?: any;
  };
  progression: {
    currentLevel: number;
    experience: number;
    experienceToNext: number;
    progressPercent: number;
  };
  kingdomBonuses: Record<string, number>;
  totalPower: number;
  resourceInventory?: any[];
  stakingRecords?: any[];
  recentEvolutions?: any[];
  user: {
    displayName: string;
    walletAddress: string;
    xpTotal: number;
    reputationScore: number;
  };
}

interface EvolutionCheck {
  canEvolve: boolean;
  evolutionType?: string;
  requirements?: any;
  reward?: any;
}

const kingdoms = {
  'SILICON_VALLEY': { name: 'Silicon Valley', icon: '💻', color: 'from-blue-600 to-cyan-600', title: 'Code Citadel' },
  'CRYPTO_VALLEY': { name: 'Crypto Valley', icon: '⛓️', color: 'from-purple-600 to-pink-600', title: 'Decentralized Frontier' },
  'BUSINESS_STRATEGY': { name: 'Business Strategy', icon: '📈', color: 'from-green-600 to-emerald-600', title: 'Boardroom Colosseum' },
  'PRODUCT_OLYMPUS': { name: 'Product Olympus', icon: '🎨', color: 'from-orange-600 to-red-600', title: 'User Paradise' },
  'MARKETING_MULTIVERSE': { name: 'Marketing Multiverse', icon: '🚀', color: 'from-yellow-600 to-orange-600', title: 'Attention Wars' },
  'ALL_KINGDOMS': { name: 'All Kingdoms', icon: '👑', color: 'from-purple-600 to-pink-600', title: 'Renaissance Founder' }
};

const characterClasses = {
  'TECH_FOUNDER': 'Tech Founder',
  'CRYPTO_FOUNDER': 'Crypto Founder', 
  'BUSINESS_STRATEGIST': 'Business Strategist',
  'PRODUCT_VISIONARY': 'Product Visionary',
  'MARKETING_MAVERICK': 'Marketing Maverick',
  'RENAISSANCE_FOUNDER': 'Renaissance Founder'
};

export const CharacterDashboard: React.FC = () => {
  const { user, token } = useAuth();
  const [character, setCharacter] = useState<Character | null>(null);
  const [evolutionCheck, setEvolutionCheck] = useState<EvolutionCheck | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user && token) {
      fetchCharacterData();
    }
  }, [user, token]);

  const fetchCharacterData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/characters/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCharacter(data.data.character);
        
        // Check for evolution opportunities
        await checkEvolution(data.data.character.id);
      } else if (response.status === 404) {
        // No character exists yet
        setCharacter(null);
        setError('No character found. Select a kingdom to create your founder character.');
      } else {
        throw new Error('Failed to fetch character data');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load character data');
    } finally {
      setLoading(false);
    }
  };

  const checkEvolution = async (characterId: string) => {
    try {
      const response = await fetch(`/api/characters/${characterId}/evolution-check`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setEvolutionCheck(data.data);
      }
    } catch (err) {
      console.error('Failed to check evolution:', err);
    }
  };

  const handleEvolve = async () => {
    if (!character || !evolutionCheck?.canEvolve) return;

    try {
      const response = await fetch(`/api/characters/${character.id}/evolve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          evolutionType: evolutionCheck.evolutionType,
          triggerType: 'MANUAL',
          statChanges: evolutionCheck.reward?.statBoost || {}
        }),
      });

      if (response.ok) {
        // Refresh character data
        await fetchCharacterData();
      }
    } catch (err) {
      console.error('Failed to evolve character:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error && !character) {
    return (
      <div className="text-center text-yellow-400 bg-gray-800/50 border border-yellow-500/30 rounded-lg p-8">
        <Crown className="w-16 h-16 mx-auto mb-4 opacity-50" />
        <p className="text-lg mb-4">{error}</p>
        <p className="text-gray-400">Visit your profile to select a kingdom and begin your founder journey!</p>
      </div>
    );
  }

  if (!character) {
    return null;
  }

  const selectedKingdom = kingdoms[character.kingdom as keyof typeof kingdoms];
  const characterClassName = characterClasses[character.characterClass as keyof typeof characterClasses];

  const statIcons = {
    technical: '💻',
    business: '📊', 
    marketing: '📢',
    community: '👥',
    design: '🎨',
    product: '🚀'
  };

  const statColors = {
    technical: 'from-blue-500 to-cyan-500',
    business: 'from-green-500 to-emerald-500',
    marketing: 'from-yellow-500 to-orange-500',
    community: 'from-purple-500 to-pink-500',
    design: 'from-pink-500 to-red-500',
    product: 'from-indigo-500 to-blue-500'
  };

  const resourceTypes = {
    'CODE_POINTS': { name: 'Code Points', icon: '💻', color: 'text-blue-400' },
    'BUSINESS_ACUMEN': { name: 'Business Acumen', icon: '📊', color: 'text-green-400' },
    'MARKETING_INFLUENCE': { name: 'Marketing Influence', icon: '📢', color: 'text-yellow-400' },
    'NETWORK_CONNECTIONS': { name: 'Network Connections', icon: '👥', color: 'text-purple-400' },
    'FUNDING_TOKENS': { name: 'Funding Tokens', icon: '💰', color: 'text-orange-400' },
    'DESIGN_CREATIVITY': { name: 'Design Creativity', icon: '🎨', color: 'text-pink-400' },
    'PRODUCT_VISION': { name: 'Product Vision', icon: '🚀', color: 'text-indigo-400' }
  };

  return (
    <div className="space-y-6 text-white max-w-6xl mx-auto">
      {/* Kingdom & Character Banner */}
      <div className={`bg-gradient-to-r ${selectedKingdom.color} rounded-xl p-6 border border-white/20 relative overflow-hidden`}>
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between text-white mb-4">
            <div className="flex items-center gap-4">
              <div className="text-6xl">{selectedKingdom.icon}</div>
              <div>
                <h2 className="text-3xl font-bold">{selectedKingdom.name}</h2>
                <p className="text-white/90 text-lg">{selectedKingdom.title}</p>
                <p className="text-white/70">{characterClassName}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 mb-2">
                <Crown className="w-6 h-6 text-yellow-300" />
                <span className="text-xl font-bold">Level {character.level}</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-300" />
                <span>Power: {character.totalPower.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Character Portrait */}
          <div className="flex items-center gap-6">
            <div className="relative">
              {character.visual.avatarUrl ? (
                <img
                  src={character.visual.avatarUrl}
                  alt={character.name}
                  className="w-24 h-24 rounded-full border-4 border-white/30 shadow-lg"
                />
              ) : (
                <div className="w-24 h-24 bg-gradient-to-br from-white/20 to-white/10 rounded-full flex items-center justify-center border-4 border-white/30">
                  <User className="w-12 h-12 text-white" />
                </div>
              )}
              <div className="absolute -bottom-2 -right-2 bg-yellow-500 text-black rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shadow-lg">
                {character.level}
              </div>
            </div>
            
            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-2">{character.name}</h1>
              
              {/* XP Progress */}
              <div className="bg-black/30 rounded-lg p-4 backdrop-blur-sm">
                <div className="flex justify-between text-sm mb-2">
                  <span>Level {character.level} Progress</span>
                  <span>{character.progression.experience.toLocaleString()} / {character.progression.experienceToNext.toLocaleString()} XP</span>
                </div>
                <div className="w-full bg-black/50 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-yellow-400 to-orange-500 h-3 rounded-full transition-all duration-500 shadow-lg"
                    style={{ width: `${character.progression.progressPercent}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Evolution Alert */}
      {evolutionCheck?.canEvolve && (
        <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/50 rounded-lg p-4 animate-pulse">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-yellow-400" />
              <div>
                <h3 className="text-lg font-bold text-yellow-400">Evolution Available!</h3>
                <p className="text-yellow-300">Your character is ready to evolve with {evolutionCheck.evolutionType}</p>
              </div>
            </div>
            <button
              onClick={handleEvolve}
              className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold px-6 py-2 rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-all duration-200 flex items-center gap-2"
            >
              <ArrowUp className="w-4 h-4" />
              Evolve Now
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stats Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Core Stats */}
          <div className="bg-gray-800/50 border border-white/10 rounded-lg p-6 backdrop-blur-lg">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <BarChart3 className="w-6 h-6" />
              Character Stats
            </h2>
            
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(character.stats).map(([statName, value]) => {
                const bonus = character.kingdomBonuses[statName] || 1;
                const isBuffed = bonus > 1;
                
                return (
                  <div key={statName} className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{statIcons[statName as keyof typeof statIcons]}</span>
                        <span className="font-medium capitalize">{statName}</span>
                        {isBuffed && <Shield className="w-4 h-4 text-yellow-400" title={`${Math.round((bonus - 1) * 100)}% Kingdom Bonus`} />}
                      </div>
                      <div className="text-right">
                        <span className="text-xl font-bold">{value}</span>
                        {isBuffed && <span className="text-yellow-400 text-sm ml-1">↗</span>}
                      </div>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className={`bg-gradient-to-r ${statColors[statName as keyof typeof statColors]} h-2 rounded-full transition-all duration-500`}
                        style={{ width: `${Math.min((value / 1000) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Evolutions */}
          {character.recentEvolutions && character.recentEvolutions.length > 0 && (
            <div className="bg-gray-800/50 border border-white/10 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Recent Evolutions
              </h2>
              
              <div className="space-y-3">
                {character.recentEvolutions.slice(0, 5).map((evolution: any, index: number) => (
                  <div key={index} className="flex items-center gap-4 p-3 bg-gray-700/30 rounded-lg">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-purple-400" />
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="font-semibold">{evolution.evolutionType.replace('_', ' ')}</h3>
                      <p className="text-gray-400 text-sm">Level {evolution.fromLevel} → {evolution.toLevel}</p>
                    </div>
                    
                    <div className="text-xs text-gray-500">
                      {new Date(evolution.evolvedAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Side Panel */}
        <div className="space-y-6">
          {/* Resources Inventory */}
          <div className="bg-gray-800/50 border border-white/10 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Package className="w-5 h-5" />
              Resources
            </h2>
            
            <div className="space-y-3">
              {character.resourceInventory?.slice(0, 7).map((resource: any) => {
                const resourceInfo = resourceTypes[resource.resourceType as keyof typeof resourceTypes] || 
                  { name: resource.resourceType, icon: '📦', color: 'text-gray-400' };
                
                return (
                  <div key={resource.resourceType} className="flex items-center justify-between p-2 bg-gray-700/30 rounded">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{resourceInfo.icon}</span>
                      <span className="text-sm font-medium truncate">{resourceInfo.name}</span>
                    </div>
                    <span className={`text-sm font-bold ${resourceInfo.color}`}>
                      {resource.amount.toLocaleString()}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Staking Records */}
          {character.stakingRecords && character.stakingRecords.length > 0 && (
            <div className="bg-gray-800/50 border border-white/10 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Timer className="w-5 h-5" />
                Active Stakes
              </h2>
              
              <div className="space-y-3">
                {character.stakingRecords.map((stake: any, index: number) => (
                  <div key={index} className="p-3 bg-gray-700/30 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{stake.pool.name}</span>
                      <span className="text-xs text-green-400">Active</span>
                    </div>
                    <div className="text-xs text-gray-400">
                      Staked: {stake.amountStaked} | Rewards: {stake.rewardsEarned}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="bg-gray-800/50 border border-white/10 rounded-lg p-6">
            <h2 className="text-lg font-bold mb-4">Quick Actions</h2>
            
            <div className="space-y-2">
              <button 
                onClick={fetchCharacterData}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh Data
              </button>
              
              <button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2">
                <Swords className="w-4 h-4" />
                Battle Arena
              </button>
              
              <button className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2">
                <Target className="w-4 h-4" />
                Missions
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CharacterDashboard;