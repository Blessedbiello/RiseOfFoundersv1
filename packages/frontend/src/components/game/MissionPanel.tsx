'use client';

import { useState } from 'react';
import { MapNodeData } from './GameMap';
import { MissionWorkflow } from '../missions/MissionWorkflow';
import { Button } from '../ui/button';
import { 
  X, 
  Play, 
  Trophy, 
  Target, 
  Clock, 
  Users, 
  Star,
  ChevronRight,
  Github,
  Globe,
  Zap,
  Shield
} from 'lucide-react';

interface MissionPanelProps {
  node: MapNodeData;
  onClose: () => void;
  onStartMission: (node: MapNodeData) => void;
}

// Mission details data (would come from API in production)
const getMissionDetails = (nodeId: string) => {
  const missions = {
    'first-commit': {
      title: 'First Commit',
      description: 'Learn the fundamentals of version control by making your first Git commit. This mission will teach you the basics of Git workflow and prepare you for collaborative development.',
      objectives: [
        'Create a new Git repository',
        'Add files to the staging area',
        'Make your first commit with a descriptive message',
        'Push to remote repository'
      ],
      requirements: [
        'GitHub account (can be linked during mission)',
        'Basic understanding of command line'
      ],
      rewards: {
        xp: 100,
        badges: ['Git Initiate'],
        skills: ['Technical +50']
      },
      estimatedTime: '15-30 minutes',
      difficulty: 'Bronze',
      type: 'Individual',
      category: 'Technical Development'
    },
    'idea-validation': {
      title: 'Idea Validation',
      description: 'Learn to validate your startup idea through customer interviews, surveys, and market research. Build confidence in your concept before investing significant time and resources.',
      objectives: [
        'Define your target customer persona',
        'Conduct 5 customer interviews',
        'Create and distribute a validation survey',
        'Analyze and document your findings'
      ],
      requirements: [
        'A startup idea or problem you want to solve',
        'Access to potential customers (online/offline)'
      ],
      rewards: {
        xp: 100,
        badges: ['Validation Expert'],
        skills: ['Business +50', 'Marketing +25']
      },
      estimatedTime: '1-2 hours',
      difficulty: 'Bronze',
      type: 'Individual',
      category: 'Business Development'
    },
    'deployment-zone': {
      title: 'Deployment Zone',
      description: 'Master the art of deployment and DevOps. This contested territory requires you to successfully deploy and maintain applications while defending against challenges from other teams.',
      objectives: [
        'Deploy a full-stack application',
        'Set up CI/CD pipeline',
        'Implement monitoring and logging',
        'Successfully defend against 2 PvP challenges'
      ],
      requirements: [
        'Completed Repository Mastery mission',
        'Level 5 or higher',
        'Active team membership (recommended)'
      ],
      rewards: {
        xp: 500,
        badges: ['DevOps Master', 'Territory Controller'],
        skills: ['Technical +150', 'Leadership +100']
      },
      estimatedTime: '3-5 hours',
      difficulty: 'Gold',
      type: 'Territory (PvP)',
      category: 'Technical Development',
      territory: true
    }
  };
  
  return missions[nodeId as keyof typeof missions] || null;
};

export const MissionPanel: React.FC<MissionPanelProps> = ({
  node,
  onClose,
  onStartMission
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'requirements' | 'rewards'>('overview');
  const [showWorkflow, setShowWorkflow] = useState(false);
  const missionDetails = getMissionDetails(node.id);
  
  if (!missionDetails) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-gray-900 rounded-lg max-w-md w-full p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">{node.name}</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-gray-400">Mission details coming soon...</p>
        </div>
      </div>
    );
  }

  const canStart = node.status === 'available';
  const isLocked = node.status === 'locked';
  const isTerritory = node.type === 'territory';

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-4">
            <p className="text-gray-300 leading-relaxed">
              {missionDetails.description}
            </p>
            
            <div>
              <h4 className="font-semibold text-white mb-2">Objectives</h4>
              <ul className="space-y-2">
                {missionDetails.objectives.map((objective, index) => (
                  <li key={index} className="flex items-start gap-2 text-gray-300">
                    <Target className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{objective}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        );
      
      case 'requirements':
        return (
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-white mb-2">Requirements</h4>
              <ul className="space-y-2">
                {missionDetails.requirements.map((req, index) => (
                  <li key={index} className="flex items-start gap-2 text-gray-300">
                    <ChevronRight className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{req}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            {node.requiredLevel && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                <div className="flex items-center gap-2 text-red-400">
                  <Shield className="w-4 h-4" />
                  <span className="font-medium">Level Requirement</span>
                </div>
                <p className="text-red-300 text-sm mt-1">
                  Requires Level {node.requiredLevel} to access
                </p>
              </div>
            )}
          </div>
        );
      
      case 'rewards':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                <div className="flex items-center gap-2 text-blue-400 mb-1">
                  <Zap className="w-4 h-4" />
                  <span className="font-medium text-sm">Experience</span>
                </div>
                <div className="text-white font-bold">{missionDetails.rewards.xp} XP</div>
              </div>
              
              <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3">
                <div className="flex items-center gap-2 text-purple-400 mb-1">
                  <Trophy className="w-4 h-4" />
                  <span className="font-medium text-sm">Badges</span>
                </div>
                <div className="text-white text-sm">
                  {missionDetails.rewards.badges.join(', ')}
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-2">Skill Progression</h4>
              <div className="space-y-2">
                {missionDetails.rewards.skills.map((skill, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-400" />
                    <span className="text-gray-300 text-sm">{skill}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden border border-white/10">
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold text-white">{missionDetails.title}</h2>
                {isTerritory && (
                  <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full border border-red-500/30">
                    PvP Zone
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {missionDetails.estimatedTime}
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {missionDetails.type}
                </div>
                <div className={`px-2 py-1 rounded text-xs ${
                  missionDetails.difficulty === 'Bronze' ? 'bg-orange-500/20 text-orange-400' :
                  missionDetails.difficulty === 'Silver' ? 'bg-gray-500/20 text-gray-400' :
                  missionDetails.difficulty === 'Gold' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {missionDetails.difficulty}
                </div>
              </div>
            </div>
            
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-white/10">
          <div className="flex">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'requirements', label: 'Requirements' },
              { id: 'rewards', label: 'Rewards' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-6 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-blue-400 border-b-2 border-blue-400'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-96">
          {renderTabContent()}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10 bg-gray-800/50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-400">
              Category: <span className="text-white">{missionDetails.category}</span>
            </div>
            
            <div className="flex gap-3">
              {canStart && (
                <Button
                  onClick={() => setShowWorkflow(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Start Mission
                </Button>
              )}
              
              {isLocked && (
                <Button disabled className="px-6">
                  <Shield className="w-4 h-4 mr-2" />
                  Locked
                </Button>
              )}
              
              {node.status === 'completed' && (
                <Button variant="outline" className="px-6 border-green-500 text-green-400">
                  <Trophy className="w-4 h-4 mr-2" />
                  Completed
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Mission Workflow */}
      {showWorkflow && (
        <MissionWorkflow
          mission={node}
          onComplete={async (artifacts, reflection) => {
            try {
              // This will be handled by the useMissions hook inside MissionWorkflow
              onStartMission(node);
              setShowWorkflow(false);
              onClose();
            } catch (error) {
              console.error('Mission completion error:', error);
            }
          }}
          onCancel={() => setShowWorkflow(false)}
        />
      )}
    </div>
  );
};