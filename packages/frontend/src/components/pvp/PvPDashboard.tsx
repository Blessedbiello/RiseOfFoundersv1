'use client';

import { useState, useCallback } from 'react';
import { TerritoryMap } from './TerritoryMap';
import { ChallengeSystem } from './ChallengeSystem';
import { ReputationSystem } from './ReputationSystem';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/button';
import { 
  Map,
  Sword,
  Trophy,
  Users,
  Shield,
  Star,
  Target,
  Crown,
  Zap,
  TrendingUp,
  Calendar,
  Activity
} from 'lucide-react';

interface Territory {
  id: string;
  name: string;
  type: string;
  controlledBy?: string;
  defenseStrength: number;
  resources: {
    xp: number;
    credits: number;
    influence: number;
  };
}

interface PvPStats {
  teamRank: number;
  totalTeams: number;
  territoriesControlled: number;
  activeChallenges: number;
  reputation: number;
  winRate: number;
  totalBattles: number;
  seasonRank: number;
}

export const PvPDashboard: React.FC = () => {
  const [activeView, setActiveView] = useState<'map' | 'challenges' | 'reputation'>('map');
  const [selectedTerritory, setSelectedTerritory] = useState<Territory | null>(null);
  const [showChallengeSystem, setShowChallengeSystem] = useState(false);
  
  const { user } = useAuth();

  // Mock PvP stats - would come from API
  const pvpStats: PvPStats = {
    teamRank: 3,
    totalTeams: 47,
    territoriesControlled: 2,
    activeChallenges: 1,
    reputation: 1250,
    winRate: 73,
    totalBattles: 11,
    seasonRank: 8
  };

  const handleTerritorySelect = useCallback((territory: Territory) => {
    setSelectedTerritory(territory);
    setShowChallengeSystem(true);
  }, []);

  const renderPvPStats = () => (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-white/10 rounded-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">PvP Statistics</h2>
        <div className="flex items-center gap-2">
          <Crown className="w-5 h-5 text-yellow-400" />
          <span className="text-yellow-400 font-bold">Season 1</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        <div className="bg-gray-700/30 rounded-lg p-3 text-center">
          <Trophy className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">{pvpStats.teamRank}</div>
          <div className="text-xs text-gray-400">Team Rank</div>
        </div>

        <div className="bg-gray-700/30 rounded-lg p-3 text-center">
          <Shield className="w-6 h-6 text-blue-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">{pvpStats.territoriesControlled}</div>
          <div className="text-xs text-gray-400">Territories</div>
        </div>

        <div className="bg-gray-700/30 rounded-lg p-3 text-center">
          <Sword className="w-6 h-6 text-red-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">{pvpStats.activeChallenges}</div>
          <div className="text-xs text-gray-400">Active Fights</div>
        </div>

        <div className="bg-gray-700/30 rounded-lg p-3 text-center">
          <Star className="w-6 h-6 text-purple-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">{pvpStats.reputation.toLocaleString()}</div>
          <div className="text-xs text-gray-400">Reputation</div>
        </div>

        <div className="bg-gray-700/30 rounded-lg p-3 text-center">
          <TrendingUp className="w-6 h-6 text-green-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">{pvpStats.winRate}%</div>
          <div className="text-xs text-gray-400">Win Rate</div>
        </div>

        <div className="bg-gray-700/30 rounded-lg p-3 text-center">
          <Activity className="w-6 h-6 text-orange-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">{pvpStats.totalBattles}</div>
          <div className="text-xs text-gray-400">Total Battles</div>
        </div>

        <div className="bg-gray-700/30 rounded-lg p-3 text-center">
          <Crown className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">{pvpStats.seasonRank}</div>
          <div className="text-xs text-gray-400">Season Rank</div>
        </div>

        <div className="bg-gray-700/30 rounded-lg p-3 text-center">
          <Users className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">{pvpStats.totalTeams}</div>
          <div className="text-xs text-gray-400">Total Teams</div>
        </div>
      </div>
    </div>
  );

  const renderQuickActions = () => (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-white/10 rounded-lg p-4 mb-6">
      <h3 className="text-lg font-bold text-white mb-3">Quick Actions</h3>
      <div className="flex flex-wrap gap-3">
        <Button 
          onClick={() => setActiveView('map')}
          variant={activeView === 'map' ? 'default' : 'outline'}
          size="sm"
        >
          <Map className="w-4 h-4 mr-2" />
          Territory Map
        </Button>
        
        <Button 
          onClick={() => setActiveView('challenges')}
          variant={activeView === 'challenges' ? 'default' : 'outline'}
          size="sm"
        >
          <Sword className="w-4 h-4 mr-2" />
          Active Challenges
        </Button>
        
        <Button 
          onClick={() => setActiveView('reputation')}
          variant={activeView === 'reputation' ? 'default' : 'outline'}
          size="sm"
        >
          <Star className="w-4 h-4 mr-2" />
          Reputation Board
        </Button>

        <Button variant="outline" size="sm">
          <Target className="w-4 h-4 mr-2" />
          Find Opponents
        </Button>

        <Button variant="outline" size="sm">
          <Calendar className="w-4 h-4 mr-2" />
          Tournament Schedule
        </Button>
      </div>
    </div>
  );

  const renderRecentActivity = () => (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-white/10 rounded-lg p-4">
      <h3 className="text-lg font-bold text-white mb-3">Recent Activity</h3>
      
      <div className="space-y-3">
        <div className="flex items-center gap-3 p-3 bg-gray-700/30 rounded-lg">
          <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
            <Trophy className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1">
            <div className="text-white font-medium">Challenge Victory!</div>
            <div className="text-sm text-gray-400">
              Won control of "Innovation Lab Delta" against Team Nexus
            </div>
            <div className="text-xs text-gray-500">2 hours ago</div>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 bg-gray-700/30 rounded-lg">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1">
            <div className="text-white font-medium">Territory Fortified</div>
            <div className="text-sm text-gray-400">
              Increased defense strength of "Tech Hub Alpha" to 95
            </div>
            <div className="text-xs text-gray-500">1 day ago</div>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 bg-gray-700/30 rounded-lg">
          <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
            <Sword className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1">
            <div className="text-white font-medium">New Challenge Created</div>
            <div className="text-sm text-gray-400">
              Challenged Team Phoenix for "Funding Center Beta"
            </div>
            <div className="text-xs text-gray-500">3 days ago</div>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 bg-gray-700/30 rounded-lg">
          <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
            <Star className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1">
            <div className="text-white font-medium">Reputation Milestone</div>
            <div className="text-sm text-gray-400">
              Reached 1,250 reputation points - new rank unlocked!
            </div>
            <div className="text-xs text-gray-500">1 week ago</div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Zap className="w-8 h-8 text-yellow-400" />
            <h1 className="text-4xl font-bold text-white">Territory Wars</h1>
          </div>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Compete with other founding teams for control of valuable territories. 
            Build, battle, and dominate the startup ecosystem!
          </p>
        </div>

        {/* Stats Dashboard */}
        {renderPvPStats()}

        {/* Quick Actions */}
        {renderQuickActions()}

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Primary View */}
          <div className="lg:col-span-3">
            {activeView === 'map' && (
              <div className="bg-gray-800/50 backdrop-blur-sm border border-white/10 rounded-lg overflow-hidden h-[600px]">
                <TerritoryMap onTerritorySelect={handleTerritorySelect} />
              </div>
            )}
            
            {activeView === 'challenges' && (
              <div className="bg-gray-800/50 backdrop-blur-sm border border-white/10 rounded-lg p-6">
                <h2 className="text-xl font-bold text-white mb-4">Active Challenges</h2>
                <div className="text-center py-12">
                  <Sword className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                  <h3 className="text-lg font-medium text-gray-400 mb-2">No Active Challenges</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Challenge other teams for territory control
                  </p>
                  <Button onClick={() => setActiveView('map')}>
                    <Map className="w-4 h-4 mr-2" />
                    View Territory Map
                  </Button>
                </div>
              </div>
            )}
            
            {activeView === 'reputation' && (
              <div className="bg-gray-800/50 backdrop-blur-sm border border-white/10 rounded-lg">
                <ReputationSystem />
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {renderRecentActivity()}

            {/* Upcoming Events */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-white/10 rounded-lg p-4">
              <h3 className="text-lg font-bold text-white mb-3">Upcoming Events</h3>
              
              <div className="space-y-3">
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded p-3">
                  <div className="flex items-center gap-2 text-yellow-400 mb-1">
                    <Crown className="w-4 h-4" />
                    <span className="font-medium">Season Tournament</span>
                  </div>
                  <div className="text-xs text-gray-300">
                    Grand championship with exclusive rewards
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Starts in 15 days</div>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/20 rounded p-3">
                  <div className="flex items-center gap-2 text-blue-400 mb-1">
                    <Zap className="w-4 h-4" />
                    <span className="font-medium">Double XP Weekend</span>
                  </div>
                  <div className="text-xs text-gray-300">
                    Earn 2x reputation from all battles
                  </div>
                  <div className="text-xs text-gray-500 mt-1">This weekend</div>
                </div>

                <div className="bg-purple-500/10 border border-purple-500/20 rounded p-3">
                  <div className="flex items-center gap-2 text-purple-400 mb-1">
                    <Target className="w-4 h-4" />
                    <span className="font-medium">New Territory</span>
                  </div>
                  <div className="text-xs text-gray-300">
                    "Quantum Research Lab" opens for challenges
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Next week</div>
                </div>
              </div>
            </div>

            {/* Territory Control Tips */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-white/10 rounded-lg p-4">
              <h3 className="text-lg font-bold text-white mb-3">Strategy Tips</h3>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-1.5 flex-shrink-0"></div>
                  <div className="text-gray-300">
                    Focus on territories that match your team's expertise for higher win rates
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full mt-1.5 flex-shrink-0"></div>
                  <div className="text-gray-300">
                    Build strong defenses before expanding to new territories
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full mt-1.5 flex-shrink-0"></div>
                  <div className="text-gray-300">
                    Form alliances with other teams for mutual protection
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mt-1.5 flex-shrink-0"></div>
                  <div className="text-gray-300">
                    Time your challenges when opponents are least active
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Challenge System Modal */}
      {showChallengeSystem && selectedTerritory && (
        <ChallengeSystem
          territory={selectedTerritory}
          onClose={() => {
            setShowChallengeSystem(false);
            setSelectedTerritory(null);
          }}
          userTeamId={user?.teamId}
        />
      )}
    </div>
  );
};