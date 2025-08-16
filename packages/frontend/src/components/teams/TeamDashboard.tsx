'use client';

import { useState, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { TeamCreation } from './TeamCreation';
import { Button } from '../ui/button';
import { 
  Users, 
  Plus, 
  Crown, 
  Shield, 
  Target,
  TrendingUp,
  Calendar,
  MessageSquare,
  Settings,
  Award
} from 'lucide-react';

interface Team {
  id: string;
  name: string;
  description: string;
  focus: string;
  memberCount: number;
  level: number;
  xpTotal: number;
  missionsCompleted: number;
  territoriesControlled: number;
  createdAt: string;
  role: 'founder' | 'co_founder' | 'member';
}

export const TeamDashboard: React.FC = () => {
  const [showCreation, setShowCreation] = useState(false);
  const [userTeam, setUserTeam] = useState<Team | null>(null);
  
  const { user } = useAuth();

  const handleTeamCreated = useCallback((teamData: any) => {
    console.log('Team created:', teamData);
    setShowCreation(false);
    
    // Mock team data - would come from API in production
    const newTeam: Team = {
      id: 'team_' + Math.random().toString(36).substring(2, 15),
      name: teamData.name,
      description: teamData.description,
      focus: teamData.focus,
      memberCount: 1,
      level: 1,
      xpTotal: 0,
      missionsCompleted: 0,
      territoriesControlled: 0,
      createdAt: new Date().toISOString(),
      role: 'founder'
    };
    
    setUserTeam(newTeam);
  }, []);

  const renderNoTeam = () => (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <Users className="w-20 h-20 mx-auto text-blue-500 mb-6" />
          <h1 className="text-4xl font-bold text-white mb-4">Build Your Founding Team</h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Great startups are built by great teams. Form your founding team, 
            set up governance, and embark on collaborative missions together.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800/50 backdrop-blur-sm border border-white/10 rounded-lg p-6">
            <Crown className="w-8 h-8 text-yellow-400 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Collaborative Missions</h3>
            <p className="text-gray-400 text-sm">
              Work together on complex missions that require diverse skills and perspectives
            </p>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm border border-white/10 rounded-lg p-6">
            <Shield className="w-8 h-8 text-blue-400 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Multi-Sig Treasury</h3>
            <p className="text-gray-400 text-sm">
              Secure team funds with multi-signature wallets and transparent governance
            </p>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm border border-white/10 rounded-lg p-6">
            <Target className="w-8 h-8 text-green-400 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Territory Control</h3>
            <p className="text-gray-400 text-sm">
              Compete with other teams for valuable territories and exclusive rewards
            </p>
          </div>
        </div>

        <div className="text-center">
          <Button
            onClick={() => setShowCreation(true)}
            className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-3 h-auto"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Your Team
          </Button>
          
          <p className="text-gray-500 text-sm mt-4">
            Or wait for an invitation from another founder
          </p>
        </div>
      </div>

      {showCreation && (
        <TeamCreation
          onComplete={handleTeamCreated}
          onCancel={() => setShowCreation(false)}
        />
      )}
    </div>
  );

  const renderTeamDashboard = () => (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Team Header */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-white/10 rounded-lg p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-2xl">{userTeam!.name.charAt(0)}</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">{userTeam!.name}</h1>
                <p className="text-gray-400 mt-1">{userTeam!.description}</p>
                <div className="flex items-center gap-4 mt-2 text-sm">
                  <span className="text-blue-400 capitalize">{userTeam!.focus} Focus</span>
                  <span className="text-gray-400">•</span>
                  <span className="text-purple-400 capitalize">{userTeam!.role}</span>
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-400">{userTeam!.memberCount} members</span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <MessageSquare className="w-4 h-4 mr-2" />
                Chat
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>

        {/* Team Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800/50 backdrop-blur-sm border border-white/10 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-6 h-6 text-green-400" />
              <div>
                <div className="text-2xl font-bold text-white">{userTeam!.level}</div>
                <div className="text-sm text-gray-400">Team Level</div>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm border border-white/10 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Award className="w-6 h-6 text-yellow-400" />
              <div>
                <div className="text-2xl font-bold text-white">{userTeam!.xpTotal.toLocaleString()}</div>
                <div className="text-sm text-gray-400">Total XP</div>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm border border-white/10 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Target className="w-6 h-6 text-blue-400" />
              <div>
                <div className="text-2xl font-bold text-white">{userTeam!.missionsCompleted}</div>
                <div className="text-sm text-gray-400">Missions</div>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm border border-white/10 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Shield className="w-6 h-6 text-purple-400" />
              <div>
                <div className="text-2xl font-bold text-white">{userTeam!.territoriesControlled}</div>
                <div className="text-sm text-gray-400">Territories</div>
              </div>
            </div>
          </div>
        </div>

        {/* Team Content Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <div className="lg:col-span-2 bg-gray-800/50 backdrop-blur-sm border border-white/10 rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4">Recent Activity</h2>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-gray-700/30 rounded-lg">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <Plus className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-white font-medium">Team created</div>
                  <div className="text-sm text-gray-400">
                    {new Date(userTeam!.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
              
              <div className="text-center py-8 text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Start collaborating to see team activity here</p>
              </div>
            </div>
          </div>

          {/* Team Actions */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-white/10 rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
            
            <div className="space-y-3">
              <Button className="w-full justify-start">
                <Plus className="w-4 h-4 mr-2" />
                Invite Members
              </Button>
              
              <Button className="w-full justify-start" variant="outline">
                <Target className="w-4 h-4 mr-2" />
                Start Mission
              </Button>
              
              <Button className="w-full justify-start" variant="outline">
                <Shield className="w-4 h-4 mr-2" />
                Manage Treasury
              </Button>
              
              <Button className="w-full justify-start" variant="outline">
                <Calendar className="w-4 h-4 mr-2" />
                Schedule Meeting
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return userTeam ? renderTeamDashboard() : renderNoTeam();
};