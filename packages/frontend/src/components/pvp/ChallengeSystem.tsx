'use client';

import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { 
  Sword,
  Shield,
  Clock,
  Users,
  Trophy,
  Target,
  Upload,
  FileText,
  Github,
  ExternalLink,
  Star,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Zap,
  Crown
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Challenge {
  id: string;
  territoryId: string;
  territoryName: string;
  challengerTeam: {
    id: string;
    name: string;
    color: string;
    strength: number;
  };
  defenderTeam?: {
    id: string;
    name: string;
    color: string;
    strength: number;
  };
  type: 'capture' | 'defend' | 'duel';
  status: 'pending' | 'active' | 'submission' | 'judging' | 'completed';
  title: string;
  description: string;
  requirements: string[];
  stakes: {
    winner: {
      xp: number;
      credits: number;
      reputation: number;
    };
    loser: {
      xp: number;
      credits: number;
      reputation: number;
    };
  };
  submissionDeadline: string;
  judgingDeadline: string;
  createdAt: string;
  judging?: {
    judges: Array<{
      id: string;
      name: string;
      expertise: string;
      reputation: number;
    }>;
    submissions: Array<{
      teamId: string;
      teamName: string;
      artifacts: Array<{
        type: 'github' | 'url' | 'file' | 'demo';
        title: string;
        url?: string;
        description: string;
      }>;
      submittedAt: string;
    }>;
    voting: Record<string, { teamId: string; score: number; feedback: string }>;
    results?: {
      winner: string;
      scores: Record<string, number>;
      finalVerdict: string;
    };
  };
}

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

const challengeTypes = {
  capture: {
    title: 'Territory Capture',
    description: 'Build a solution to claim this neutral territory',
    icon: <Target className="w-5 h-5" />,
    color: 'green',
    requirements: [
      'Create a functional MVP demonstrating your solution',
      'Submit comprehensive documentation',
      'Present a go-to-market strategy',
      'Show technical implementation details'
    ]
  },
  defend: {
    title: 'Territory Defense', 
    description: 'Improve and fortify your controlled territory',
    icon: <Shield className="w-5 h-5" />,
    color: 'blue',
    requirements: [
      'Enhance existing solution with new features',
      'Demonstrate measurable improvements',
      'Show scalability and robustness',
      'Provide user feedback and metrics'
    ]
  },
  duel: {
    title: 'Direct Challenge',
    description: 'Head-to-head competition for territory control',
    icon: <Sword className="w-5 h-5" />,
    color: 'red',
    requirements: [
      'Build competing solutions to the same problem',
      'Demonstrate superior execution and strategy',
      'Present compelling business case',
      'Show innovation and creativity'
    ]
  }
};

interface ChallengeSystemProps {
  territory: Territory;
  onClose: () => void;
  userTeamId?: string;
}

export const ChallengeSystem: React.FC<ChallengeSystemProps> = ({
  territory,
  onClose,
  userTeamId
}) => {
  const [activeTab, setActiveTab] = useState<'create' | 'active' | 'history'>('create');
  const [selectedChallengeType, setSelectedChallengeType] = useState<keyof typeof challengeTypes>('capture');
  const [challengeTitle, setChallengeTitle] = useState('');
  const [challengeDescription, setChallengeDescription] = useState('');
  const [customRequirements, setCustomRequirements] = useState<string[]>(['']);
  const [isCreating, setIsCreating] = useState(false);
  
  const { user } = useAuth();

  // Mock active challenges
  const activeChallenges: Challenge[] = [
    {
      id: 'challenge_1',
      territoryId: territory.id,
      territoryName: territory.name,
      challengerTeam: {
        id: 'team_alpha',
        name: 'Alpha Ventures',
        color: '#3b82f6',
        strength: 85
      },
      defenderTeam: territory.controlledBy ? {
        id: territory.controlledBy,
        name: 'Beta Innovations',
        color: '#10b981',
        strength: 72
      } : undefined,
      type: territory.controlledBy ? 'duel' : 'capture',
      status: 'judging',
      title: 'AI-Powered Startup Analytics Platform',
      description: 'Build a comprehensive analytics platform for startup metrics, funding tracking, and growth predictions using AI/ML.',
      requirements: [
        'Implement real-time data visualization',
        'Create ML models for growth prediction',
        'Build user authentication and team management',
        'Deploy on cloud infrastructure'
      ],
      stakes: {
        winner: { xp: 2500, credits: 10000, reputation: 500 },
        loser: { xp: 500, credits: 2000, reputation: -100 }
      },
      submissionDeadline: '2025-01-20T23:59:59Z',
      judgingDeadline: '2025-01-25T23:59:59Z',
      createdAt: '2025-01-15T10:00:00Z',
      judging: {
        judges: [
          { id: 'judge_1', name: 'Sarah Chen', expertise: 'AI/ML Expert', reputation: 950 },
          { id: 'judge_2', name: 'Marcus Rodriguez', expertise: 'Startup Founder', reputation: 880 },
          { id: 'judge_3', name: 'Dr. Kim Park', expertise: 'Technical Architect', reputation: 920 }
        ],
        submissions: [
          {
            teamId: 'team_alpha',
            teamName: 'Alpha Ventures',
            artifacts: [
              {
                type: 'github',
                title: 'StartupAnalytics Platform',
                url: 'https://github.com/alpha-ventures/startup-analytics',
                description: 'Full-stack analytics platform with React frontend and Python backend'
              },
              {
                type: 'demo',
                title: 'Live Demo',
                url: 'https://analytics.alpha-ventures.com',
                description: 'Interactive demo showcasing all platform features'
              }
            ],
            submittedAt: '2025-01-19T15:30:00Z'
          },
          {
            teamId: 'team_beta',
            teamName: 'Beta Innovations',
            artifacts: [
              {
                type: 'github',
                title: 'MetricsAI Platform',
                url: 'https://github.com/beta-innovations/metrics-ai',
                description: 'Advanced ML-driven analytics with predictive modeling'
              },
              {
                type: 'url',
                title: 'Technical Documentation',
                url: 'https://docs.beta-innovations.com/metrics-ai',
                description: 'Comprehensive technical documentation and API reference'
              }
            ],
            submittedAt: '2025-01-20T09:15:00Z'
          }
        ],
        voting: {
          judge_1: { teamId: 'team_alpha', score: 8.5, feedback: 'Excellent UI/UX and solid ML implementation' },
          judge_2: { teamId: 'team_beta', score: 9.0, feedback: 'Superior business strategy and market positioning' }
        }
      }
    }
  ];

  const createChallenge = useCallback(async () => {
    if (!challengeTitle.trim() || !challengeDescription.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsCreating(true);

    try {
      const challengeData = {
        territoryId: territory.id,
        type: selectedChallengeType,
        title: challengeTitle,
        description: challengeDescription,
        requirements: customRequirements.filter(req => req.trim()),
        challengerTeamId: userTeamId
      };

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast.success('Challenge created successfully!');
      
      // Reset form
      setChallengeTitle('');
      setChallengeDescription('');
      setCustomRequirements(['']);
      setActiveTab('active');
      
    } catch (error) {
      toast.error('Failed to create challenge');
    } finally {
      setIsCreating(false);
    }
  }, [challengeTitle, challengeDescription, customRequirements, selectedChallengeType, territory.id, userTeamId]);

  const addCustomRequirement = useCallback(() => {
    setCustomRequirements(prev => [...prev, '']);
  }, []);

  const updateCustomRequirement = useCallback((index: number, value: string) => {
    setCustomRequirements(prev => prev.map((req, i) => i === index ? value : req));
  }, []);

  const removeCustomRequirement = useCallback((index: number) => {
    setCustomRequirements(prev => prev.filter((_, i) => i !== index));
  }, []);

  const renderChallengeCreation = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-bold text-white mb-2">Create New Challenge</h3>
        <p className="text-gray-400">Challenge teams to compete for {territory.name}</p>
      </div>

      {/* Challenge Type Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(challengeTypes).map(([type, config]) => (
          <button
            key={type}
            onClick={() => setSelectedChallengeType(type as keyof typeof challengeTypes)}
            className={`p-4 rounded-lg border-2 transition-all ${
              selectedChallengeType === type
                ? 'border-blue-500 bg-blue-500/20'
                : 'border-gray-600 bg-gray-700/30 hover:border-gray-500'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              {config.icon}
              <span className="font-medium text-white">{config.title}</span>
            </div>
            <p className="text-sm text-gray-400">{config.description}</p>
          </button>
        ))}
      </div>

      {/* Challenge Details Form */}
      <div className="bg-gray-800/50 rounded-lg p-6 space-y-4">
        <div>
          <Label htmlFor="challengeTitle">Challenge Title *</Label>
          <Input
            id="challengeTitle"
            value={challengeTitle}
            onChange={(e) => setChallengeTitle(e.target.value)}
            placeholder="Enter a compelling challenge title"
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="challengeDescription">Description *</Label>
          <Textarea
            id="challengeDescription"
            value={challengeDescription}
            onChange={(e) => setChallengeDescription(e.target.value)}
            placeholder="Describe what teams need to build and achieve..."
            rows={4}
            className="mt-1"
          />
        </div>

        {/* Default Requirements */}
        <div>
          <Label>Default Requirements</Label>
          <div className="mt-2 space-y-2">
            {challengeTypes[selectedChallengeType].requirements.map((req, index) => (
              <div key={index} className="flex items-center gap-2 text-sm text-gray-300 bg-gray-700/30 p-2 rounded">
                <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                {req}
              </div>
            ))}
          </div>
        </div>

        {/* Custom Requirements */}
        <div>
          <Label>Additional Requirements</Label>
          <div className="mt-2 space-y-2">
            {customRequirements.map((req, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={req}
                  onChange={(e) => updateCustomRequirement(index, e.target.value)}
                  placeholder="Add custom requirement..."
                  className="flex-1"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeCustomRequirement(index)}
                  className="text-red-400 hover:text-red-300"
                >
                  <XCircle className="w-4 h-4" />
                </Button>
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={addCustomRequirement}
              className="w-full"
            >
              <Target className="w-4 h-4 mr-2" />
              Add Requirement
            </Button>
          </div>
        </div>

        {/* Stakes Display */}
        <div className="bg-gray-700/30 rounded-lg p-4">
          <h4 className="font-medium text-white mb-3">Challenge Stakes</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-green-400 font-medium mb-2">Winner Rewards:</div>
              <div className="space-y-1 text-gray-300">
                <div>+2,500 XP</div>
                <div>+10,000 Credits</div>
                <div>+500 Reputation</div>
                <div className="text-purple-400">Territory Control</div>
              </div>
            </div>
            <div>
              <div className="text-red-400 font-medium mb-2">Loser Penalties:</div>
              <div className="space-y-1 text-gray-300">
                <div>+500 XP (participation)</div>
                <div>+2,000 Credits</div>
                <div>-100 Reputation</div>
                <div className="text-gray-500">No territory rights</div>
              </div>
            </div>
          </div>
        </div>

        <Button
          onClick={createChallenge}
          disabled={!challengeTitle.trim() || !challengeDescription.trim() || isCreating}
          className="w-full bg-red-600 hover:bg-red-700"
        >
          {isCreating ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Creating Challenge...
            </div>
          ) : (
            <>
              <Sword className="w-4 h-4 mr-2" />
              Launch Challenge
            </>
          )}
        </Button>
      </div>
    </div>
  );

  const renderActiveChallenges = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-bold text-white mb-2">Active Challenges</h3>
        <p className="text-gray-400">Ongoing competitions for {territory.name}</p>
      </div>

      {activeChallenges.length === 0 ? (
        <div className="text-center py-12">
          <Sword className="w-16 h-16 mx-auto text-gray-600 mb-4" />
          <h4 className="text-lg font-medium text-gray-400 mb-2">No Active Challenges</h4>
          <p className="text-sm text-gray-500">Create a challenge to compete for this territory</p>
        </div>
      ) : (
        <div className="space-y-4">
          {activeChallenges.map((challenge) => (
            <div key={challenge.id} className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {challengeTypes[challenge.type].icon}
                  <div>
                    <h4 className="font-bold text-white">{challenge.title}</h4>
                    <p className="text-sm text-gray-400">{challengeTypes[challenge.type].title}</p>
                  </div>
                </div>
                
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  challenge.status === 'active' ? 'bg-blue-500/20 text-blue-400' :
                  challenge.status === 'judging' ? 'bg-yellow-500/20 text-yellow-400' :
                  challenge.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                  'bg-gray-500/20 text-gray-400'
                }`}>
                  {challenge.status.charAt(0).toUpperCase() + challenge.status.slice(1)}
                </div>
              </div>

              <p className="text-gray-300 mb-4">{challenge.description}</p>

              {/* Teams */}
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-4 h-4 rounded" 
                    style={{ backgroundColor: challenge.challengerTeam.color }}
                  ></div>
                  <span className="text-sm font-medium text-white">
                    {challenge.challengerTeam.name}
                  </span>
                  <span className="text-xs text-gray-400">
                    (Strength: {challenge.challengerTeam.strength})
                  </span>
                </div>
                
                {challenge.defenderTeam && (
                  <>
                    <span className="text-gray-500">vs</span>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded" 
                        style={{ backgroundColor: challenge.defenderTeam.color }}
                      ></div>
                      <span className="text-sm font-medium text-white">
                        {challenge.defenderTeam.name}
                      </span>
                      <span className="text-xs text-gray-400">
                        (Strength: {challenge.defenderTeam.strength})
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* Timeline */}
              <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  Submission: {new Date(challenge.submissionDeadline).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  Judging: {new Date(challenge.judgingDeadline).toLocaleDateString()}
                </div>
              </div>

              {/* Judging Status */}
              {challenge.status === 'judging' && challenge.judging && (
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Star className="w-4 h-4 text-yellow-400" />
                    <span className="font-medium text-yellow-400">Judging in Progress</span>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="text-sm text-gray-300 mb-2">Judges ({challenge.judging.judges.length}):</div>
                      <div className="flex flex-wrap gap-2">
                        {challenge.judging.judges.map((judge) => (
                          <div key={judge.id} className="bg-gray-700/50 rounded px-2 py-1 text-xs">
                            <span className="text-white">{judge.name}</span>
                            <span className="text-gray-400 ml-1">({judge.expertise})</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-gray-300 mb-2">Submissions ({challenge.judging.submissions.length}):</div>
                      <div className="space-y-2">
                        {challenge.judging.submissions.map((submission) => (
                          <div key={submission.teamId} className="bg-gray-700/30 rounded p-3">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-medium text-white">{submission.teamName}</span>
                              <span className="text-xs text-gray-400">
                                Submitted {new Date(submission.submittedAt).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {submission.artifacts.map((artifact, idx) => (
                                <a
                                  key={idx}
                                  href={artifact.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded hover:bg-blue-500/30"
                                >
                                  {artifact.type === 'github' ? <Github className="w-3 h-3" /> :
                                   artifact.type === 'demo' ? <ExternalLink className="w-3 h-3" /> :
                                   <FileText className="w-3 h-3" />}
                                  {artifact.title}
                                </a>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="text-xs text-gray-400">
                      Voting Progress: {Object.keys(challenge.judging.voting).length}/{challenge.judging.judges.length} judges
                    </div>
                  </div>
                </div>
              )}

              {/* Stakes */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="bg-green-500/10 rounded p-3">
                  <div className="text-green-400 font-medium mb-1">Winner Gets:</div>
                  <div className="text-gray-300 space-y-1">
                    <div>+{challenge.stakes.winner.xp.toLocaleString()} XP</div>
                    <div>+{challenge.stakes.winner.credits.toLocaleString()} Credits</div>
                    <div>+{challenge.stakes.winner.reputation} Reputation</div>
                  </div>
                </div>
                
                <div className="bg-red-500/10 rounded p-3">
                  <div className="text-red-400 font-medium mb-1">Loser Gets:</div>
                  <div className="text-gray-300 space-y-1">
                    <div>+{challenge.stakes.loser.xp.toLocaleString()} XP</div>
                    <div>+{challenge.stakes.loser.credits.toLocaleString()} Credits</div>
                    <div>{challenge.stakes.loser.reputation} Reputation</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderChallengeHistory = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-bold text-white mb-2">Challenge History</h3>
        <p className="text-gray-400">Past competitions for {territory.name}</p>
      </div>

      <div className="text-center py-12">
        <Trophy className="w-16 h-16 mx-auto text-gray-600 mb-4" />
        <h4 className="text-lg font-medium text-gray-400 mb-2">No Historical Challenges</h4>
        <p className="text-sm text-gray-500">Challenge history will appear here after completion</p>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg border border-gray-700 w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <Zap className="w-6 h-6 text-yellow-400" />
            <div>
              <h2 className="text-xl font-bold text-white">Territory Challenges</h2>
              <p className="text-sm text-gray-400">{territory.name}</p>
            </div>
          </div>
          
          <Button variant="ghost" onClick={onClose}>
            <XCircle className="w-5 h-5" />
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-700">
          {(['create', 'active', 'history'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-500/10'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {tab === 'active' && activeChallenges.length > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {activeChallenges.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-8rem)]">
          {activeTab === 'create' && renderChallengeCreation()}
          {activeTab === 'active' && renderActiveChallenges()}
          {activeTab === 'history' && renderChallengeHistory()}
        </div>
      </div>
    </div>
  );
};