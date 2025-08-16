'use client';

import { useState, useCallback, useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { 
  Search,
  Filter,
  Star,
  Clock,
  DollarSign,
  Users,
  Target,
  Eye,
  ArrowRight,
  Calendar,
  Award,
  Shield,
  CheckCircle,
  AlertTriangle,
  Building2,
  Zap,
  TrendingUp
} from 'lucide-react';

interface Quest {
  id: string;
  title: string;
  description: string;
  category: 'fintech' | 'healthcare' | 'edtech' | 'climate' | 'ai' | 'web3' | 'other';
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  duration: number;
  budget: {
    total: number;
    currency: 'USD' | 'SOL' | 'USDC';
    distribution: {
      winner: number;
      runner_up: number;
      participation: number;
    };
  };
  sponsor: {
    id: string;
    name: string;
    logo: string;
    tier: 'startup' | 'growth' | 'enterprise';
    rating: number;
    verified: boolean;
  };
  status: 'active' | 'starting_soon' | 'ending_soon' | 'full';
  timeline: {
    starts: string;
    submissions_due: string;
    judging_complete: string;
  };
  metrics: {
    views: number;
    applications: number;
    slots_filled: number;
    max_participants: number;
  };
  requirements: string[];
  tags: string[];
  featured: boolean;
}

const questCategories = [
  { id: 'all', label: 'All Categories', icon: '🚀', color: 'bg-gray-500' },
  { id: 'fintech', label: 'FinTech', icon: '💰', color: 'bg-green-500' },
  { id: 'healthcare', label: 'HealthTech', icon: '🏥', color: 'bg-red-500' },
  { id: 'edtech', label: 'EdTech', icon: '📚', color: 'bg-blue-500' },
  { id: 'climate', label: 'Climate Tech', icon: '🌱', color: 'bg-green-600' },
  { id: 'ai', label: 'AI/ML', icon: '🤖', color: 'bg-purple-500' },
  { id: 'web3', label: 'Web3/Crypto', icon: '⛓️', color: 'bg-orange-500' },
  { id: 'other', label: 'Other', icon: '✨', color: 'bg-gray-500' }
];

const difficultyLevels = [
  { id: 'all', label: 'All Levels' },
  { id: 'beginner', label: 'Beginner', color: 'text-green-400' },
  { id: 'intermediate', label: 'Intermediate', color: 'text-yellow-400' },
  { id: 'advanced', label: 'Advanced', color: 'text-orange-400' },
  { id: 'expert', label: 'Expert', color: 'text-red-400' }
];

export const QuestMarketplace: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [sortBy, setSortBy] = useState<'newest' | 'budget' | 'deadline' | 'popularity'>('newest');
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);
  
  const { user } = useAuth();

  // Mock quest data
  const mockQuests: Quest[] = [
    {
      id: 'quest_1',
      title: 'AI-Powered Personal Finance Assistant',
      description: 'Build an intelligent personal finance application that helps users optimize their spending, savings, and investments using AI/ML algorithms. The solution should provide personalized insights and actionable recommendations.',
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
      sponsor: {
        id: 'sponsor_1',
        name: 'TechVentures Inc.',
        logo: '/api/placeholder/32/32',
        tier: 'enterprise',
        rating: 4.8,
        verified: true
      },
      status: 'active',
      timeline: {
        starts: '2025-01-15T00:00:00Z',
        submissions_due: '2025-02-14T23:59:59Z',
        judging_complete: '2025-02-21T23:59:59Z'
      },
      metrics: {
        views: 1240,
        applications: 28,
        slots_filled: 25,
        max_participants: 50
      },
      requirements: [
        'AI/ML integration for financial insights',
        'Real-time data processing',
        'Mobile-responsive web application',
        'User authentication and security'
      ],
      tags: ['AI', 'FinTech', 'Machine Learning', 'Personal Finance'],
      featured: true
    },
    {
      id: 'quest_2',
      title: 'Decentralized Healthcare Records',
      description: 'Create a blockchain-based system for secure, patient-controlled medical records that enables seamless sharing between healthcare providers while maintaining privacy.',
      category: 'healthcare',
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
      sponsor: {
        id: 'sponsor_2',
        name: 'HealthChain Solutions',
        logo: '/api/placeholder/32/32',
        tier: 'growth',
        rating: 4.6,
        verified: true
      },
      status: 'starting_soon',
      timeline: {
        starts: '2025-01-20T00:00:00Z',
        submissions_due: '2025-03-05T23:59:59Z',
        judging_complete: '2025-03-12T23:59:59Z'
      },
      metrics: {
        views: 856,
        applications: 12,
        slots_filled: 15,
        max_participants: 30
      },
      requirements: [
        'Blockchain/Web3 expertise',
        'Healthcare compliance knowledge',
        'Privacy-preserving technologies',
        'Interoperability standards'
      ],
      tags: ['Blockchain', 'Healthcare', 'Privacy', 'Web3'],
      featured: true
    },
    {
      id: 'quest_3',
      title: 'Gamified Learning Platform for Kids',
      description: 'Design an interactive educational platform that uses game mechanics to teach STEM subjects to children aged 8-14, with adaptive learning algorithms.',
      category: 'edtech',
      difficulty: 'intermediate',
      duration: 25,
      budget: {
        total: 35000,
        currency: 'USD',
        distribution: {
          winner: 20000,
          runner_up: 10000,
          participation: 5000
        }
      },
      sponsor: {
        id: 'sponsor_3',
        name: 'EduInnovate',
        logo: '/api/placeholder/32/32',
        tier: 'startup',
        rating: 4.4,
        verified: false
      },
      status: 'ending_soon',
      timeline: {
        starts: '2024-12-20T00:00:00Z',
        submissions_due: '2025-01-20T23:59:59Z',
        judging_complete: '2025-01-27T23:59:59Z'
      },
      metrics: {
        views: 645,
        applications: 35,
        slots_filled: 40,
        max_participants: 40
      },
      requirements: [
        'Game design principles',
        'Educational content development',
        'Child-friendly UX/UI',
        'Progress tracking systems'
      ],
      tags: ['Education', 'Gaming', 'STEM', 'Children'],
      featured: false
    },
    {
      id: 'quest_4',
      title: 'Carbon Credit Marketplace',
      description: 'Build a transparent marketplace for carbon credits using blockchain technology, enabling small businesses to participate in carbon offset programs.',
      category: 'climate',
      difficulty: 'advanced',
      duration: 35,
      budget: {
        total: 60000,
        currency: 'USD',
        distribution: {
          winner: 35000,
          runner_up: 18000,
          participation: 7000
        }
      },
      sponsor: {
        id: 'sponsor_4',
        name: 'GreenTech Ventures',
        logo: '/api/placeholder/32/32',
        tier: 'enterprise',
        rating: 4.7,
        verified: true
      },
      status: 'active',
      timeline: {
        starts: '2025-01-10T00:00:00Z',
        submissions_due: '2025-02-15T23:59:59Z',
        judging_complete: '2025-02-22T23:59:59Z'
      },
      metrics: {
        views: 423,
        applications: 18,
        slots_filled: 20,
        max_participants: 25
      },
      requirements: [
        'Blockchain integration',
        'Environmental impact tracking',
        'Verification systems',
        'Marketplace functionality'
      ],
      tags: ['Climate', 'Blockchain', 'Sustainability', 'Marketplace'],
      featured: false
    },
    {
      id: 'quest_5',
      title: 'AI Code Review Assistant',
      description: 'Develop an AI-powered tool that automatically reviews code for bugs, security vulnerabilities, and optimization opportunities.',
      category: 'ai',
      difficulty: 'expert',
      duration: 40,
      budget: {
        total: 80000,
        currency: 'USD',
        distribution: {
          winner: 50000,
          runner_up: 22000,
          participation: 8000
        }
      },
      sponsor: {
        id: 'sponsor_5',
        name: 'DevTools Pro',
        logo: '/api/placeholder/32/32',
        tier: 'growth',
        rating: 4.9,
        verified: true
      },
      status: 'full',
      timeline: {
        starts: '2025-01-05T00:00:00Z',
        submissions_due: '2025-02-14T23:59:59Z',
        judging_complete: '2025-02-21T23:59:59Z'
      },
      metrics: {
        views: 1842,
        applications: 60,
        slots_filled: 50,
        max_participants: 50
      },
      requirements: [
        'Advanced AI/ML knowledge',
        'Code analysis expertise',
        'Security vulnerability detection',
        'Developer tool experience'
      ],
      tags: ['AI', 'Developer Tools', 'Security', 'Code Analysis'],
      featured: true
    }
  ];

  const filteredQuests = useMemo(() => {
    let filtered = mockQuests.filter(quest => {
      const matchesSearch = quest.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           quest.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           quest.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'all' || quest.category === selectedCategory;
      const matchesDifficulty = selectedDifficulty === 'all' || quest.difficulty === selectedDifficulty;
      const matchesFeatured = !showFeaturedOnly || quest.featured;
      
      return matchesSearch && matchesCategory && matchesDifficulty && matchesFeatured;
    });

    // Sort quests
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'budget':
          return b.budget.total - a.budget.total;
        case 'deadline':
          return new Date(a.timeline.submissions_due).getTime() - new Date(b.timeline.submissions_due).getTime();
        case 'popularity':
          return b.metrics.views - a.metrics.views;
        case 'newest':
        default:
          return new Date(b.timeline.starts).getTime() - new Date(a.timeline.starts).getTime();
      }
    });

    return filtered;
  }, [mockQuests, searchQuery, selectedCategory, selectedDifficulty, sortBy, showFeaturedOnly]);

  const getStatusColor = (status: Quest['status']) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'starting_soon': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'ending_soon': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'full': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getDaysUntilDeadline = (deadline: string) => {
    const days = Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const handleApplyToQuest = useCallback((questId: string) => {
    // In production, this would make an API call
    toast.success('Application submitted successfully!');
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Target className="w-8 h-8 text-blue-400" />
            <h1 className="text-4xl font-bold text-white">Quest Marketplace</h1>
          </div>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Discover exciting challenges from top sponsors and build the future of startups
          </p>
        </div>

        {/* Filters */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-white/10 rounded-lg p-6 mb-8">
          <div className="flex flex-wrap items-center gap-4">
            {/* Search */}
            <div className="flex items-center gap-2 min-w-[300px]">
              <Search className="w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search quests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white min-w-[150px]"
              >
                {questCategories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Difficulty Filter */}
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white min-w-[130px]"
            >
              {difficultyLevels.map(level => (
                <option key={level.id} value={level.id}>
                  {level.label}
                </option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white min-w-[120px]"
            >
              <option value="newest">Newest</option>
              <option value="budget">Highest Budget</option>
              <option value="deadline">Ending Soon</option>
              <option value="popularity">Most Popular</option>
            </select>

            {/* Featured Toggle */}
            <label className="flex items-center gap-2 ml-auto">
              <input
                type="checkbox"
                checked={showFeaturedOnly}
                onChange={(e) => setShowFeaturedOnly(e.target.checked)}
                className="rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-300">Featured only</span>
            </label>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-400">
            Showing {filteredQuests.length} quest{filteredQuests.length !== 1 ? 's' : ''}
            {searchQuery && ` for "${searchQuery}"`}
            {selectedCategory !== 'all' && ` in ${questCategories.find(c => c.id === selectedCategory)?.label}`}
          </p>
        </div>

        {/* Quest Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredQuests.map((quest) => {
            const daysLeft = getDaysUntilDeadline(quest.timeline.submissions_due);
            const category = questCategories.find(c => c.id === quest.category)!;
            const difficulty = difficultyLevels.find(d => d.id === quest.difficulty)!;

            return (
              <div
                key={quest.id}
                className={`bg-gray-800/50 backdrop-blur-sm border rounded-lg overflow-hidden hover:border-blue-500/50 transition-all ${
                  quest.featured 
                    ? 'border-yellow-500/30 shadow-lg shadow-yellow-500/10' 
                    : 'border-white/10'
                }`}
              >
                {/* Card Header */}
                <div className="p-6 pb-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${category.color}`}></div>
                      <span className="text-sm text-gray-400 capitalize">{category.label}</span>
                      {quest.featured && (
                        <div className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded border border-yellow-500/30">
                          Featured
                        </div>
                      )}
                    </div>
                    
                    <div className={`px-2 py-1 rounded border text-xs ${getStatusColor(quest.status)}`}>
                      {quest.status.replace('_', ' ').charAt(0).toUpperCase() + quest.status.replace('_', ' ').slice(1)}
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">
                    {quest.title}
                  </h3>
                  
                  <p className="text-gray-300 text-sm mb-4 line-clamp-3">
                    {quest.description}
                  </p>

                  {/* Sponsor */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                      <Building2 className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-white">{quest.sponsor.name}</span>
                        {quest.sponsor.verified && (
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-400" />
                          <span className="text-xs text-gray-400">{quest.sponsor.rating}</span>
                        </div>
                        <span className="text-xs text-gray-500 capitalize">{quest.sponsor.tier}</span>
                      </div>
                    </div>
                  </div>

                  {/* Quest Details */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="text-xs text-gray-400 mb-1">Difficulty</div>
                      <div className={`text-sm font-medium ${difficulty.color || 'text-white'} capitalize`}>
                        {quest.difficulty}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400 mb-1">Duration</div>
                      <div className="text-sm font-medium text-white">{quest.duration} days</div>
                    </div>
                  </div>

                  {/* Budget */}
                  <div className="bg-gray-700/30 rounded-lg p-3 mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-400">Total Prize Pool</span>
                      <span className="text-lg font-bold text-green-400">
                        ${quest.budget.total.toLocaleString()}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <div className="text-gray-400">1st</div>
                        <div className="text-white font-medium">${quest.budget.distribution.winner.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-gray-400">2nd</div>
                        <div className="text-white font-medium">${quest.budget.distribution.runner_up.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-gray-400">Participation</div>
                        <div className="text-white font-medium">${quest.budget.distribution.participation.toLocaleString()}</div>
                      </div>
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-3 gap-4 mb-4 text-center">
                    <div>
                      <div className="text-lg font-bold text-blue-400">{quest.metrics.views}</div>
                      <div className="text-xs text-gray-400">Views</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-green-400">{quest.metrics.applications}</div>
                      <div className="text-xs text-gray-400">Applications</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-purple-400">
                        {quest.metrics.slots_filled}/{quest.metrics.max_participants}
                      </div>
                      <div className="text-xs text-gray-400">Participants</div>
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-400">
                        {daysLeft > 0 
                          ? `${daysLeft} day${daysLeft !== 1 ? 's' : ''} left`
                          : 'Deadline passed'
                        }
                      </span>
                    </div>
                    {quest.status === 'ending_soon' && (
                      <div className="flex items-center gap-2 mt-2">
                        <AlertTriangle className="w-4 h-4 text-yellow-400" />
                        <span className="text-sm text-yellow-400">Ending soon!</span>
                      </div>
                    )}
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {quest.tags.slice(0, 3).map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-gray-700/50 text-xs text-gray-300 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                    {quest.tags.length > 3 && (
                      <span className="px-2 py-1 bg-gray-700/50 text-xs text-gray-400 rounded">
                        +{quest.tags.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="px-6 pb-6 pt-0">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                    
                    <Button
                      onClick={() => handleApplyToQuest(quest.id)}
                      disabled={quest.status === 'full'}
                      size="sm"
                      className={`flex-1 ${
                        quest.status === 'full'
                          ? 'bg-gray-600 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700'
                      }`}
                    >
                      {quest.status === 'full' ? (
                        <>
                          <Users className="w-4 h-4 mr-2" />
                          Full
                        </>
                      ) : (
                        <>
                          <ArrowRight className="w-4 h-4 mr-2" />
                          Apply
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Escrow Indicator */}
                <div className="px-6 pb-6">
                  <div className="flex items-center justify-center gap-2 p-2 bg-green-500/10 border border-green-500/20 rounded text-sm">
                    <Shield className="w-4 h-4 text-green-400" />
                    <span className="text-green-400">Escrow Protected</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredQuests.length === 0 && (
          <div className="text-center py-12">
            <Target className="w-16 h-16 mx-auto text-gray-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-400 mb-2">No Quests Found</h3>
            <p className="text-sm text-gray-500 mb-4">
              Try adjusting your search filters to find more quests
            </p>
            <Button onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              setSelectedDifficulty('all');
              setShowFeaturedOnly(false);
            }}>
              Clear Filters
            </Button>
          </div>
        )}

        {/* Load More */}
        {filteredQuests.length > 0 && (
          <div className="text-center mt-8">
            <Button variant="outline">
              Load More Quests
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};