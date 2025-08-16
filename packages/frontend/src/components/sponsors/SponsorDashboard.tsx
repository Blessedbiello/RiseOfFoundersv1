'use client';

import { useState, useCallback, useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { 
  Building2,
  Plus,
  DollarSign,
  Target,
  TrendingUp,
  Users,
  Award,
  Clock,
  Eye,
  BarChart3,
  Settings,
  Filter,
  Search,
  Calendar,
  MapPin,
  Star,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Wallet,
  Shield,
  Zap
} from 'lucide-react';
import toast from 'react-hot-toast';

interface SponsorQuest {
  id: string;
  title: string;
  description: string;
  category: 'fintech' | 'healthcare' | 'edtech' | 'climate' | 'ai' | 'web3' | 'other';
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  duration: number; // days
  budget: {
    total: number;
    currency: 'USD' | 'SOL' | 'USDC';
    distribution: {
      winner: number;
      runner_up: number;
      participation: number;
    };
  };
  requirements: string[];
  deliverables: string[];
  judging_criteria: Array<{
    criterion: string;
    weight: number;
    description: string;
  }>;
  sponsor: {
    id: string;
    name: string;
    logo: string;
    tier: 'startup' | 'growth' | 'enterprise';
  };
  status: 'draft' | 'active' | 'review' | 'completed' | 'cancelled';
  timeline: {
    created: string;
    starts: string;
    submissions_due: string;
    judging_complete: string;
  };
  metrics: {
    views: number;
    applications: number;
    submissions: number;
    completion_rate: number;
  };
  participants: Array<{
    teamId: string;
    teamName: string;
    status: 'applied' | 'accepted' | 'submitted' | 'winner' | 'runner_up';
    submission?: any;
  }>;
  escrow: {
    address: string;
    status: 'pending' | 'funded' | 'released' | 'refunded';
    funded_amount: number;
    release_conditions: string[];
  };
}

interface SponsorProfile {
  id: string;
  name: string;
  description: string;
  industry: string;
  logo: string;
  website: string;
  tier: 'startup' | 'growth' | 'enterprise';
  verification_status: 'unverified' | 'pending' | 'verified';
  stats: {
    quests_created: number;
    total_budget: number;
    teams_supported: number;
    success_rate: number;
    avg_rating: number;
  };
  contact: {
    email: string;
    linkedin: string;
    twitter: string;
  };
}

const questCategories = [
  { id: 'fintech', label: 'FinTech', icon: '💰', color: 'bg-green-500' },
  { id: 'healthcare', label: 'HealthTech', icon: '🏥', color: 'bg-red-500' },
  { id: 'edtech', label: 'EdTech', icon: '📚', color: 'bg-blue-500' },
  { id: 'climate', label: 'Climate Tech', icon: '🌱', color: 'bg-green-600' },
  { id: 'ai', label: 'AI/ML', icon: '🤖', color: 'bg-purple-500' },
  { id: 'web3', label: 'Web3/Crypto', icon: '⛓️', color: 'bg-orange-500' },
  { id: 'other', label: 'Other', icon: '🚀', color: 'bg-gray-500' }
];

const difficultyLevels = [
  { id: 'beginner', label: 'Beginner', color: 'text-green-400', description: 'Entry-level challenges' },
  { id: 'intermediate', label: 'Intermediate', color: 'text-yellow-400', description: 'Moderate complexity' },
  { id: 'advanced', label: 'Advanced', color: 'text-orange-400', description: 'High-level skills required' },
  { id: 'expert', label: 'Expert', color: 'text-red-400', description: 'Expert-level mastery needed' }
];

export const SponsorDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'quests' | 'create' | 'analytics' | 'profile'>('overview');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const { user } = useAuth();

  // Mock sponsor data
  const sponsorProfile: SponsorProfile = {
    id: 'sponsor_1',
    name: 'TechVentures Inc.',
    description: 'Leading venture capital firm focused on early-stage fintech and AI startups.',
    industry: 'Venture Capital',
    logo: '/api/placeholder/64/64',
    website: 'https://techventures.com',
    tier: 'enterprise',
    verification_status: 'verified',
    stats: {
      quests_created: 12,
      total_budget: 250000,
      teams_supported: 45,
      success_rate: 87,
      avg_rating: 4.8
    },
    contact: {
      email: 'partnerships@techventures.com',
      linkedin: 'techventures-inc',
      twitter: '@techventures'
    }
  };

  const mockQuests: SponsorQuest[] = [
    {
      id: 'quest_1',
      title: 'AI-Powered Personal Finance Assistant',
      description: 'Build an intelligent personal finance application that helps users optimize their spending, savings, and investments using AI/ML algorithms.',
      category: 'fintech',
      difficulty: 'advanced',
      duration: 30,
      budget: {
        total: 50000,
        currency: 'USD',
        distribution: {
          winner: 30000,
          runner_up: 15000,
          participation: 5000
        }
      },
      requirements: [
        'AI/ML integration for financial insights',
        'Real-time data processing',
        'Mobile-responsive web application',
        'User authentication and security'
      ],
      deliverables: [
        'Working MVP with core features',
        'Technical documentation',
        'Pitch presentation',
        'Go-to-market strategy'
      ],
      judging_criteria: [
        { criterion: 'Innovation & Creativity', weight: 30, description: 'Novel approach to personal finance' },
        { criterion: 'Technical Excellence', weight: 25, description: 'Code quality and architecture' },
        { criterion: 'User Experience', weight: 25, description: 'Intuitive and engaging interface' },
        { criterion: 'Business Viability', weight: 20, description: 'Market potential and monetization' }
      ],
      sponsor: {
        id: 'sponsor_1',
        name: 'TechVentures Inc.',
        logo: '/api/placeholder/32/32',
        tier: 'enterprise'
      },
      status: 'active',
      timeline: {
        created: '2025-01-10T00:00:00Z',
        starts: '2025-01-15T00:00:00Z',
        submissions_due: '2025-02-14T23:59:59Z',
        judging_complete: '2025-02-21T23:59:59Z'
      },
      metrics: {
        views: 1240,
        applications: 28,
        submissions: 0,
        completion_rate: 0
      },
      participants: [
        { teamId: 'team_alpha', teamName: 'Alpha Ventures', status: 'accepted' },
        { teamId: 'team_beta', teamName: 'Beta Innovations', status: 'applied' },
        { teamId: 'team_gamma', teamName: 'Gamma Corp', status: 'accepted' }
      ],
      escrow: {
        address: '8x9y7z6w5v4u3t2s1r0q9p8o7n6m5l4k3j2h1g0f',
        status: 'funded',
        funded_amount: 50000,
        release_conditions: [
          'Judging completed',
          'Winners announced',
          'Deliverables verified'
        ]
      }
    },
    {
      id: 'quest_2', 
      title: 'Sustainable Supply Chain Tracker',
      description: 'Create a blockchain-based solution for tracking and verifying sustainability metrics across supply chains.',
      category: 'climate',
      difficulty: 'expert',
      duration: 45,
      budget: {
        total: 75000,
        currency: 'USD',
        distribution: {
          winner: 45000,
          runner_up: 20000,
          participation: 10000
        }
      },
      requirements: [
        'Blockchain integration',
        'Supply chain data modeling',
        'Sustainability metrics tracking',
        'Multi-stakeholder dashboard'
      ],
      deliverables: [
        'Prototype with blockchain integration',
        'Sustainability verification system',
        'Stakeholder interface',
        'Impact measurement framework'
      ],
      judging_criteria: [
        { criterion: 'Environmental Impact', weight: 35, description: 'Measurable sustainability benefits' },
        { criterion: 'Technical Innovation', weight: 25, description: 'Blockchain implementation quality' },
        { criterion: 'Scalability', weight: 25, description: 'Ability to handle large supply chains' },
        { criterion: 'User Adoption', weight: 15, description: 'Ease of integration for businesses' }
      ],
      sponsor: {
        id: 'sponsor_1',
        name: 'TechVentures Inc.',
        logo: '/api/placeholder/32/32',
        tier: 'enterprise'
      },
      status: 'review',
      timeline: {
        created: '2024-12-01T00:00:00Z',
        starts: '2024-12-15T00:00:00Z',
        submissions_due: '2025-01-30T23:59:59Z',
        judging_complete: '2025-02-06T23:59:59Z'
      },
      metrics: {
        views: 856,
        applications: 15,
        submissions: 12,
        completion_rate: 80
      },
      participants: [
        { teamId: 'team_delta', teamName: 'Delta Systems', status: 'submitted' },
        { teamId: 'team_echo', teamName: 'Echo Innovations', status: 'submitted' }
      ],
      escrow: {
        address: '7y6x5w4v3u2t1s0r9q8p7o6n5m4l3k2j1h0g9f8e',
        status: 'funded',
        funded_amount: 75000,
        release_conditions: [
          'All submissions received',
          'Judging in progress',
          'Results pending'
        ]
      }
    }
  ];

  const filteredQuests = useMemo(() => {
    return mockQuests.filter(quest => {
      const matchesCategory = filterCategory === 'all' || quest.category === filterCategory;
      const matchesStatus = filterStatus === 'all' || quest.status === filterStatus;
      const matchesSearch = quest.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           quest.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesCategory && matchesStatus && matchesSearch;
    });
  }, [mockQuests, filterCategory, filterStatus, searchQuery]);

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Sponsor Profile Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center">
              <Building2 className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{sponsorProfile.name}</h1>
              <p className="text-blue-100 mb-2">{sponsorProfile.industry}</p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-sm">Verified Sponsor</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm">{sponsorProfile.stats.avg_rating}/5.0</span>
                </div>
                <div className="px-2 py-1 bg-white/20 rounded text-sm capitalize">
                  {sponsorProfile.tier}
                </div>
              </div>
            </div>
          </div>
          
          <Button 
            onClick={() => setActiveTab('profile')}
            className="bg-white/20 hover:bg-white/30"
          >
            <Settings className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-800/50 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Target className="w-6 h-6 text-blue-400" />
            <div>
              <div className="text-2xl font-bold text-white">{sponsorProfile.stats.quests_created}</div>
              <div className="text-sm text-gray-400">Active Quests</div>
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <DollarSign className="w-6 h-6 text-green-400" />
            <div>
              <div className="text-2xl font-bold text-white">${sponsorProfile.stats.total_budget.toLocaleString()}</div>
              <div className="text-sm text-gray-400">Total Budget</div>
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6 text-purple-400" />
            <div>
              <div className="text-2xl font-bold text-white">{sponsorProfile.stats.teams_supported}</div>
              <div className="text-sm text-gray-400">Teams Supported</div>
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-6 h-6 text-orange-400" />
            <div>
              <div className="text-2xl font-bold text-white">{sponsorProfile.stats.success_rate}%</div>
              <div className="text-sm text-gray-400">Success Rate</div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-gray-800/50 rounded-lg p-6">
        <h3 className="text-xl font-bold text-white mb-4">Recent Activity</h3>
        
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-gray-700/30 rounded">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <div className="text-white font-medium">Quest "AI Finance Assistant" launched</div>
              <div className="text-sm text-gray-400">28 teams applied • $50,000 prize pool</div>
              <div className="text-xs text-gray-500">2 hours ago</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-gray-700/30 rounded">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <Award className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <div className="text-white font-medium">Winners announced for "Supply Chain Tracker"</div>
              <div className="text-sm text-gray-400">Delta Systems won 1st place • 80% completion rate</div>
              <div className="text-xs text-gray-500">1 day ago</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-gray-700/30 rounded">
            <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <div className="text-white font-medium">Escrow funded for new quest</div>
              <div className="text-sm text-gray-400">$75,000 deposited to smart contract</div>
              <div className="text-xs text-gray-500">3 days ago</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderQuests = () => (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-gray-800/50 rounded-lg p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search quests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
            >
              <option value="all">All Categories</option>
              {questCategories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.label}</option>
              ))}
            </select>
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
          >
            <option value="all">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="review">Under Review</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <Button
            onClick={() => setActiveTab('create')}
            className="ml-auto bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Quest
          </Button>
        </div>
      </div>

      {/* Quests List */}
      <div className="space-y-4">
        {filteredQuests.map((quest) => (
          <div key={quest.id} className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-bold text-white">{quest.title}</h3>
                  <div className={`px-2 py-1 rounded text-xs font-medium ${
                    quest.status === 'active' ? 'bg-green-500/20 text-green-400' :
                    quest.status === 'review' ? 'bg-yellow-500/20 text-yellow-400' :
                    quest.status === 'completed' ? 'bg-blue-500/20 text-blue-400' :
                    quest.status === 'draft' ? 'bg-gray-500/20 text-gray-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {quest.status.charAt(0).toUpperCase() + quest.status.slice(1)}
                  </div>
                </div>
                
                <p className="text-gray-300 mb-3 line-clamp-2">{quest.description}</p>
                
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <div className="flex items-center gap-1">
                    <div className={`w-3 h-3 rounded ${questCategories.find(c => c.id === quest.category)?.color}`}></div>
                    {questCategories.find(c => c.id === quest.category)?.label}
                  </div>
                  
                  <div className={`${difficultyLevels.find(d => d.id === quest.difficulty)?.color} capitalize`}>
                    {quest.difficulty}
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {quest.duration} days
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4" />
                    {quest.budget.total.toLocaleString()} {quest.budget.currency}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-2xl font-bold text-green-400">
                  ${quest.budget.total.toLocaleString()}
                </div>
                <div className="text-sm text-gray-400">Prize Pool</div>
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <div className="text-lg font-bold text-white">{quest.metrics.views}</div>
                <div className="text-xs text-gray-400">Views</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-blue-400">{quest.metrics.applications}</div>
                <div className="text-xs text-gray-400">Applications</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-green-400">{quest.metrics.submissions}</div>
                <div className="text-xs text-gray-400">Submissions</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-purple-400">{quest.metrics.completion_rate}%</div>
                <div className="text-xs text-gray-400">Completion</div>
              </div>
            </div>

            {/* Escrow Status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-gray-400">Escrow:</span>
                <div className={`px-2 py-1 rounded text-xs ${
                  quest.escrow.status === 'funded' ? 'bg-green-500/20 text-green-400' :
                  quest.escrow.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-gray-500/20 text-gray-400'
                }`}>
                  {quest.escrow.status === 'funded' ? '✅ Funded' : quest.escrow.status}
                </div>
                <span className="text-sm text-gray-400">
                  ${quest.escrow.funded_amount.toLocaleString()}
                </span>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </Button>
                <Button variant="outline" size="sm">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Analytics
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredQuests.length === 0 && (
        <div className="text-center py-12">
          <Target className="w-16 h-16 mx-auto text-gray-600 mb-4" />
          <h3 className="text-lg font-medium text-gray-400 mb-2">No Quests Found</h3>
          <p className="text-sm text-gray-500 mb-4">
            {searchQuery || filterCategory !== 'all' || filterStatus !== 'all'
              ? 'Try adjusting your search filters'
              : 'Create your first quest to get started'
            }
          </p>
          <Button onClick={() => setActiveTab('create')}>
            <Plus className="w-4 h-4 mr-2" />
            Create Quest
          </Button>
        </div>
      )}
    </div>
  );

  const renderCreateQuest = () => (
    <div className="max-w-4xl mx-auto">
      <div className="bg-gray-800/50 rounded-lg p-6">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">Create Sponsor Quest</h2>
          <p className="text-gray-400">Design challenges that attract top founding teams</p>
        </div>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="border-b border-gray-700 pb-6">
            <h3 className="text-lg font-semibold text-white mb-4">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="questTitle">Quest Title *</Label>
                <Input
                  id="questTitle"
                  placeholder="e.g., AI-Powered Personal Finance Assistant"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="category">Category *</Label>
                <select
                  id="category"
                  className="mt-1 w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                >
                  <option value="">Select category</option>
                  {questCategories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon} {cat.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-4">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe the challenge, objectives, and expected outcomes..."
                rows={4}
                className="mt-1"
              />
            </div>
          </div>

          {/* Quest Parameters */}
          <div className="border-b border-gray-700 pb-6">
            <h3 className="text-lg font-semibold text-white mb-4">Quest Parameters</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="difficulty">Difficulty Level *</Label>
                <select
                  id="difficulty"
                  className="mt-1 w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                >
                  <option value="">Select difficulty</option>
                  {difficultyLevels.map(level => (
                    <option key={level.id} value={level.id}>
                      {level.label} - {level.description}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <Label htmlFor="duration">Duration (Days) *</Label>
                <Input
                  id="duration"
                  type="number"
                  min="7"
                  max="180"
                  placeholder="30"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="maxParticipants">Max Participants</Label>
                <Input
                  id="maxParticipants"
                  type="number"
                  min="1"
                  max="100"
                  placeholder="20"
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* Budget & Rewards */}
          <div className="border-b border-gray-700 pb-6">
            <h3 className="text-lg font-semibold text-white mb-4">Budget & Rewards</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="totalBudget">Total Budget *</Label>
                <div className="mt-1 flex gap-2">
                  <Input
                    id="totalBudget"
                    type="number"
                    min="1000"
                    placeholder="50000"
                    className="flex-1"
                  />
                  <select className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white min-w-[80px]">
                    <option value="USD">USD</option>
                    <option value="SOL">SOL</option>
                    <option value="USDC">USDC</option>
                  </select>
                </div>
              </div>
              
              <div>
                <Label>Reward Distribution</Label>
                <div className="mt-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">1st Place (60%)</span>
                    <span className="text-sm text-white">$30,000</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">2nd Place (30%)</span>
                    <span className="text-sm text-white">$15,000</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Participation (10%)</span>
                    <span className="text-sm text-white">$5,000</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Requirements & Deliverables */}
          <div className="border-b border-gray-700 pb-6">
            <h3 className="text-lg font-semibold text-white mb-4">Requirements & Deliverables</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label>Technical Requirements</Label>
                <div className="mt-2 space-y-2">
                  <Input placeholder="e.g., AI/ML integration" />
                  <Input placeholder="e.g., Real-time data processing" />
                  <Input placeholder="e.g., Mobile-responsive design" />
                  <Button variant="outline" size="sm" className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Requirement
                  </Button>
                </div>
              </div>
              
              <div>
                <Label>Expected Deliverables</Label>
                <div className="mt-2 space-y-2">
                  <Input placeholder="e.g., Working MVP" />
                  <Input placeholder="e.g., Technical documentation" />
                  <Input placeholder="e.g., Pitch presentation" />
                  <Button variant="outline" size="sm" className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Deliverable
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Judging Criteria */}
          <div className="border-b border-gray-700 pb-6">
            <h3 className="text-lg font-semibold text-white mb-4">Judging Criteria</h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <Input placeholder="Innovation & Creativity" />
                <Input type="number" placeholder="30" min="0" max="100" />
                <Input placeholder="Description..." />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <Input placeholder="Technical Excellence" />
                <Input type="number" placeholder="25" min="0" max="100" />
                <Input placeholder="Description..." />
              </div>
              <Button variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Criteria
              </Button>
            </div>
          </div>

          {/* Launch Options */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Launch Options</h3>
            
            <div className="flex items-center gap-4">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Shield className="w-4 h-4 mr-2" />
                Save as Draft
              </Button>
              
              <Button className="bg-green-600 hover:bg-green-700">
                <Zap className="w-4 h-4 mr-2" />
                Launch Quest
              </Button>
              
              <div className="text-sm text-gray-400">
                Launching will create escrow contract and make quest public
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Building2 className="w-8 h-8 text-blue-400" />
            <h1 className="text-4xl font-bold text-white">Sponsor Portal</h1>
          </div>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Create meaningful challenges, discover top talent, and drive innovation 
            in the startup ecosystem
          </p>
        </div>

        {/* Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-gray-800/50 rounded-lg p-1">
            {(['overview', 'quests', 'create', 'analytics', 'profile'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === tab
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                {tab === 'overview' && <BarChart3 className="w-4 h-4 inline mr-2" />}
                {tab === 'quests' && <Target className="w-4 h-4 inline mr-2" />}
                {tab === 'create' && <Plus className="w-4 h-4 inline mr-2" />}
                {tab === 'analytics' && <TrendingUp className="w-4 h-4 inline mr-2" />}
                {tab === 'profile' && <Settings className="w-4 h-4 inline mr-2" />}
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'quests' && renderQuests()}
        {activeTab === 'create' && renderCreateQuest()}
        {activeTab === 'analytics' && (
          <div className="text-center py-12">
            <BarChart3 className="w-16 h-16 mx-auto text-gray-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-400">Analytics Dashboard Coming Soon</h3>
            <p className="text-sm text-gray-500">Track ROI, engagement metrics, and success rates</p>
          </div>
        )}
        {activeTab === 'profile' && (
          <div className="text-center py-12">
            <Settings className="w-16 h-16 mx-auto text-gray-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-400">Profile Settings Coming Soon</h3>
            <p className="text-sm text-gray-500">Manage your sponsor profile and verification</p>
          </div>
        )}
      </div>
    </div>
  );
};