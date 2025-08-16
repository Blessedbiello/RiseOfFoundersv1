'use client';

import { useState, useMemo } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { 
  FileText,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  Copy,
  Map,
  Target,
  Trophy,
  Users,
  Calendar,
  Globe,
  Star,
  CheckCircle,
  XCircle,
  Clock,
  MoreHorizontal,
  Filter,
  BookOpen,
  Flag,
  Zap
} from 'lucide-react';

interface ContentItem {
  id: string;
  type: 'mission' | 'territory' | 'quest' | 'achievement' | 'node';
  title: string;
  description: string;
  status: 'draft' | 'published' | 'archived' | 'pending_review';
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  xpReward: number;
  estimatedTime: number; // minutes
  prerequisites: string[];
  tags: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  stats: {
    views: number;
    completions: number;
    likes: number;
    reports: number;
  };
  metadata: {
    version: string;
    language: string;
    featured: boolean;
  };
}

export const ContentManagement: React.FC = () => {
  const [content, setContent] = useState<ContentItem[]>([
    {
      id: 'content_1',
      type: 'mission',
      title: 'Product Strategy Fundamentals',
      description: 'Learn the basics of product strategy, market research, and user validation techniques.',
      status: 'published',
      category: 'Product Development',
      difficulty: 'beginner',
      xpReward: 250,
      estimatedTime: 45,
      prerequisites: [],
      tags: ['strategy', 'product', 'validation'],
      createdBy: 'Admin',
      createdAt: '2025-01-10T00:00:00Z',
      updatedAt: '2025-01-12T00:00:00Z',
      publishedAt: '2025-01-12T00:00:00Z',
      stats: {
        views: 1247,
        completions: 189,
        likes: 156,
        reports: 0
      },
      metadata: {
        version: '1.2',
        language: 'en',
        featured: true
      }
    },
    {
      id: 'content_2',
      type: 'territory',
      title: 'Silicon Valley',
      description: 'The tech capital of the world. High competition, high rewards.',
      status: 'published',
      category: 'Geographic',
      difficulty: 'expert',
      xpReward: 0,
      estimatedTime: 0,
      prerequisites: ['Level 10'],
      tags: ['tech', 'venture-capital', 'startups'],
      createdBy: 'Admin',
      createdAt: '2025-01-08T00:00:00Z',
      updatedAt: '2025-01-10T00:00:00Z',
      publishedAt: '2025-01-10T00:00:00Z',
      stats: {
        views: 2156,
        completions: 0,
        likes: 234,
        reports: 1
      },
      metadata: {
        version: '1.0',
        language: 'en',
        featured: true
      }
    },
    {
      id: 'content_3',
      type: 'quest',
      title: 'Customer Discovery Challenge',
      description: 'Interview 10 potential customers and validate your startup idea.',
      status: 'draft',
      category: 'Customer Development',
      difficulty: 'intermediate',
      xpReward: 500,
      estimatedTime: 480, // 8 hours
      prerequisites: ['Product Strategy Fundamentals'],
      tags: ['customer-development', 'interviews', 'validation'],
      createdBy: 'Sarah Chen',
      createdAt: '2025-01-13T00:00:00Z',
      updatedAt: '2025-01-13T00:00:00Z',
      stats: {
        views: 45,
        completions: 0,
        likes: 3,
        reports: 0
      },
      metadata: {
        version: '0.1',
        language: 'en',
        featured: false
      }
    },
    {
      id: 'content_4',
      type: 'achievement',
      title: 'First Million Users',
      description: 'Reach 1 million active users for your product',
      status: 'published',
      category: 'Growth Milestones',
      difficulty: 'expert',
      xpReward: 2500,
      estimatedTime: 0,
      prerequisites: ['Launch Product', 'Growth Strategy'],
      tags: ['growth', 'users', 'milestone'],
      createdBy: 'Admin',
      createdAt: '2025-01-05T00:00:00Z',
      updatedAt: '2025-01-05T00:00:00Z',
      publishedAt: '2025-01-05T00:00:00Z',
      stats: {
        views: 5678,
        completions: 12,
        likes: 892,
        reports: 0
      },
      metadata: {
        version: '1.0',
        language: 'en',
        featured: true
      }
    }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'title' | 'createdAt' | 'updatedAt' | 'views' | 'completions'>('updatedAt');
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const filteredContent = useMemo(() => {
    let filtered = content.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesType = typeFilter === 'all' || item.type === typeFilter;
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      const matchesDifficulty = difficultyFilter === 'all' || item.difficulty === difficultyFilter;
      
      return matchesSearch && matchesType && matchesStatus && matchesDifficulty;
    });

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'createdAt':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'updatedAt':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        case 'views':
          return b.stats.views - a.stats.views;
        case 'completions':
          return b.stats.completions - a.stats.completions;
        default:
          return 0;
      }
    });

    return filtered;
  }, [content, searchQuery, typeFilter, statusFilter, difficultyFilter, sortBy]);

  const getStatusColor = (status: ContentItem['status']) => {
    switch (status) {
      case 'published': return 'text-green-400 bg-green-500/20';
      case 'draft': return 'text-yellow-400 bg-yellow-500/20';
      case 'pending_review': return 'text-blue-400 bg-blue-500/20';
      case 'archived': return 'text-gray-400 bg-gray-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getTypeIcon = (type: ContentItem['type']) => {
    switch (type) {
      case 'mission': return <Target className="w-4 h-4" />;
      case 'territory': return <Map className="w-4 h-4" />;
      case 'quest': return <Flag className="w-4 h-4" />;
      case 'achievement': return <Trophy className="w-4 h-4" />;
      case 'node': return <Globe className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getDifficultyColor = (difficulty: ContentItem['difficulty']) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-400';
      case 'intermediate': return 'text-yellow-400';
      case 'advanced': return 'text-orange-400';
      case 'expert': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const handleContentAction = (action: string, contentId: string) => {
    console.log(`${action} content:`, contentId);
    // Implement content actions
  };

  const openCreateModal = () => {
    setSelectedContent(null);
    setShowCreateModal(true);
  };

  const openEditModal = (item: ContentItem) => {
    setSelectedContent(item);
    setShowEditModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Content Management</h1>
          <p className="text-gray-400 mt-1">
            Manage missions, territories, quests, and achievements
          </p>
        </div>
        
        <Button onClick={openCreateModal} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Create Content
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Search */}
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
          </div>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
          >
            <option value="all">All Types</option>
            <option value="mission">Missions</option>
            <option value="territory">Territories</option>
            <option value="quest">Quests</option>
            <option value="achievement">Achievements</option>
            <option value="node">Nodes</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
          >
            <option value="all">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="pending_review">Pending Review</option>
            <option value="archived">Archived</option>
          </select>

          {/* Difficulty Filter */}
          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
          >
            <option value="all">All Difficulties</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
            <option value="expert">Expert</option>
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
          >
            <option value="updatedAt">Last Updated</option>
            <option value="title">Title</option>
            <option value="createdAt">Created Date</option>
            <option value="views">Most Viewed</option>
            <option value="completions">Most Completed</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-400" />
            <span className="text-sm text-gray-400">Missions</span>
          </div>
          <div className="text-2xl font-bold text-white mt-1">
            {content.filter(c => c.type === 'mission').length}
          </div>
        </div>
        
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Map className="w-5 h-5 text-green-400" />
            <span className="text-sm text-gray-400">Territories</span>
          </div>
          <div className="text-2xl font-bold text-white mt-1">
            {content.filter(c => c.type === 'territory').length}
          </div>
        </div>
        
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Flag className="w-5 h-5 text-purple-400" />
            <span className="text-sm text-gray-400">Quests</span>
          </div>
          <div className="text-2xl font-bold text-white mt-1">
            {content.filter(c => c.type === 'quest').length}
          </div>
        </div>
        
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            <span className="text-sm text-gray-400">Achievements</span>
          </div>
          <div className="text-2xl font-bold text-white mt-1">
            {content.filter(c => c.type === 'achievement').length}
          </div>
        </div>
        
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-orange-400" />
            <span className="text-sm text-gray-400">Pending Review</span>
          </div>
          <div className="text-2xl font-bold text-white mt-1">
            {content.filter(c => c.status === 'pending_review').length}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="text-sm text-gray-400">
        Showing {filteredContent.length} of {content.length} items
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredContent.map((item) => (
          <div key={item.id} className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                {getTypeIcon(item.type)}
                <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${getStatusColor(item.status)}`}>
                  {item.status.replace('_', ' ')}
                </span>
                {item.metadata.featured && (
                  <Star className="w-4 h-4 text-yellow-400" />
                )}
              </div>
              
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleContentAction('view', item.id)}
                  className="p-1 text-gray-400 hover:text-white"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => openEditModal(item)}
                  className="p-1 text-gray-400 hover:text-white"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button className="p-1 text-gray-400 hover:text-white">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="mb-4">
              <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
              <p className="text-sm text-gray-300 line-clamp-2 mb-3">
                {item.description}
              </p>
              
              <div className="flex items-center gap-4 text-xs text-gray-400">
                <div className="flex items-center gap-1">
                  <span className={getDifficultyColor(item.difficulty)}>
                    {item.difficulty}
                  </span>
                </div>
                <div>{item.category}</div>
                {item.xpReward > 0 && (
                  <div className="text-yellow-400">{item.xpReward} XP</div>
                )}
                {item.estimatedTime > 0 && (
                  <div>{item.estimatedTime}min</div>
                )}
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1 mb-4">
              {item.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded"
                >
                  {tag}
                </span>
              ))}
              {item.tags.length > 3 && (
                <span className="px-2 py-1 bg-gray-700 text-gray-400 text-xs rounded">
                  +{item.tags.length - 3}
                </span>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-4 text-center">
              <div>
                <div className="text-sm font-bold text-blue-400">{item.stats.views}</div>
                <div className="text-xs text-gray-400">Views</div>
              </div>
              <div>
                <div className="text-sm font-bold text-green-400">{item.stats.completions}</div>
                <div className="text-xs text-gray-400">Completions</div>
              </div>
              <div>
                <div className="text-sm font-bold text-purple-400">{item.stats.likes}</div>
                <div className="text-xs text-gray-400">Likes</div>
              </div>
            </div>

            {/* Footer */}
            <div className="text-xs text-gray-500">
              <div>Created by {item.createdBy}</div>
              <div>Updated {new Date(item.updatedAt).toLocaleDateString()}</div>
              {item.stats.reports > 0 && (
                <div className="text-red-400 mt-1">
                  {item.stats.reports} report{item.stats.reports > 1 ? 's' : ''}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg border border-gray-700 w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <h2 className="text-xl font-bold text-white">
                {showCreateModal ? 'Create Content' : 'Edit Content'}
              </h2>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setShowEditModal(false);
                }}
                className="text-gray-400 hover:text-white"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              {/* Content creation/editing form would go here */}
              <div className="space-y-4">
                <div className="text-gray-400">
                  Complete content creation and editing form would be implemented here...
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Content Type</Label>
                    <select className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white mt-1">
                      <option value="mission">Mission</option>
                      <option value="territory">Territory</option>
                      <option value="quest">Quest</option>
                      <option value="achievement">Achievement</option>
                      <option value="node">Node</option>
                    </select>
                  </div>
                  
                  <div>
                    <Label>Difficulty</Label>
                    <select className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white mt-1">
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                      <option value="expert">Expert</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <Label>Title</Label>
                  <Input 
                    placeholder="Content title..." 
                    defaultValue={selectedContent?.title}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label>Description</Label>
                  <Textarea 
                    placeholder="Content description..."
                    defaultValue={selectedContent?.description}
                    rows={3}
                    className="mt-1"
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <Button variant="outline" className="flex-1">
                    Save as Draft
                  </Button>
                  <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
                    {showCreateModal ? 'Create Content' : 'Update Content'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};