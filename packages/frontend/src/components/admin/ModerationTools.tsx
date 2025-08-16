'use client';

import { useState, useMemo } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { 
  AlertTriangle,
  Search,
  Filter,
  Eye,
  Check,
  X,
  Flag,
  MessageSquare,
  User,
  FileText,
  Clock,
  Shield,
  Ban,
  UserX,
  Mail,
  Phone,
  Calendar,
  MoreHorizontal,
  Star,
  Target,
  BookOpen
} from 'lucide-react';

interface ModerationItem {
  id: string;
  type: 'user_report' | 'content_review' | 'session_dispute' | 'spam_detection' | 'payment_issue';
  title: string;
  description: string;
  status: 'pending' | 'in_review' | 'resolved' | 'escalated' | 'dismissed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  reportedBy: {
    id: string;
    name: string;
    role: string;
  };
  targetUser?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  targetContent?: {
    id: string;
    title: string;
    type: string;
  };
  createdAt: string;
  updatedAt: string;
  assignedTo?: string;
  evidence: Array<{
    type: 'screenshot' | 'log' | 'message' | 'transaction';
    description: string;
    timestamp: string;
  }>;
  actions: Array<{
    action: string;
    performedBy: string;
    timestamp: string;
    note?: string;
  }>;
}

export const ModerationTools: React.FC = () => {
  const [moderationQueue, setModerationQueue] = useState<ModerationItem[]>([
    {
      id: 'mod_1',
      type: 'user_report',
      title: 'Inappropriate behavior in mentor session',
      description: 'User reported unprofessional conduct during 1-on-1 mentoring session. Claims mentor was dismissive and provided poor advice.',
      status: 'pending',
      priority: 'high',
      reportedBy: {
        id: 'user_123',
        name: 'Jennifer Liu',
        role: 'founder'
      },
      targetUser: {
        id: 'mentor_456',
        name: 'David Kim',
        email: 'david@example.com',
        role: 'mentor'
      },
      createdAt: '2025-01-13T10:30:00Z',
      updatedAt: '2025-01-13T10:30:00Z',
      evidence: [
        {
          type: 'message',
          description: 'Chat log from mentoring session',
          timestamp: '2025-01-12T14:00:00Z'
        },
        {
          type: 'screenshot',
          description: 'Screenshot of session feedback form',
          timestamp: '2025-01-12T15:30:00Z'
        }
      ],
      actions: []
    },
    {
      id: 'mod_2',
      type: 'content_review',
      title: 'Mission content flagged for review',
      description: 'Automated system flagged mission content for potentially outdated information and broken external links.',
      status: 'in_review',
      priority: 'medium',
      reportedBy: {
        id: 'system',
        name: 'Automated System',
        role: 'system'
      },
      targetContent: {
        id: 'mission_789',
        title: 'Product Strategy Fundamentals',
        type: 'mission'
      },
      createdAt: '2025-01-13T08:15:00Z',
      updatedAt: '2025-01-13T12:45:00Z',
      assignedTo: 'Admin',
      evidence: [
        {
          type: 'log',
          description: 'Broken link detection log',
          timestamp: '2025-01-13T08:15:00Z'
        }
      ],
      actions: [
        {
          action: 'Assigned for review',
          performedBy: 'System',
          timestamp: '2025-01-13T08:15:00Z'
        },
        {
          action: 'Started review process',
          performedBy: 'Admin',
          timestamp: '2025-01-13T12:45:00Z'
        }
      ]
    },
    {
      id: 'mod_3',
      type: 'session_dispute',
      title: 'Payment dispute for mentor session',
      description: 'Founder disputes charge for mentor session, claiming session was cut short and poor quality.',
      status: 'escalated',
      priority: 'high',
      reportedBy: {
        id: 'user_234',
        name: 'Alex Martinez',
        role: 'founder'
      },
      targetUser: {
        id: 'mentor_567',
        name: 'Dr. Lisa Wang',
        email: 'lisa@example.com',
        role: 'mentor'
      },
      createdAt: '2025-01-12T16:20:00Z',
      updatedAt: '2025-01-13T09:30:00Z',
      assignedTo: 'Senior Admin',
      evidence: [
        {
          type: 'transaction',
          description: 'Payment transaction details',
          timestamp: '2025-01-12T15:00:00Z'
        },
        {
          type: 'log',
          description: 'Session duration logs',
          timestamp: '2025-01-12T15:00:00Z'
        }
      ],
      actions: [
        {
          action: 'Initial review completed',
          performedBy: 'Admin',
          timestamp: '2025-01-12T18:00:00Z',
          note: 'Escalating to senior admin for payment dispute resolution'
        }
      ]
    },
    {
      id: 'mod_4',
      type: 'spam_detection',
      title: 'Suspicious account activity detected',
      description: 'Multiple accounts created from same IP address with similar usernames, potential spam or fake accounts.',
      status: 'pending',
      priority: 'medium',
      reportedBy: {
        id: 'system',
        name: 'Security System',
        role: 'system'
      },
      createdAt: '2025-01-13T14:00:00Z',
      updatedAt: '2025-01-13T14:00:00Z',
      evidence: [
        {
          type: 'log',
          description: 'IP address analysis and account creation logs',
          timestamp: '2025-01-13T14:00:00Z'
        }
      ],
      actions: []
    }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'priority' | 'createdAt' | 'updatedAt'>('priority');
  const [selectedItem, setSelectedItem] = useState<ModerationItem | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const filteredItems = useMemo(() => {
    let filtered = moderationQueue.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           item.reportedBy.name.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesType = typeFilter === 'all' || item.type === typeFilter;
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || item.priority === priorityFilter;
      
      return matchesSearch && matchesType && matchesStatus && matchesPriority;
    });

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'priority':
          const priorityOrder = { 'critical': 4, 'high': 3, 'medium': 2, 'low': 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case 'createdAt':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'updatedAt':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        default:
          return 0;
      }
    });

    return filtered;
  }, [moderationQueue, searchQuery, typeFilter, statusFilter, priorityFilter, sortBy]);

  const getStatusColor = (status: ModerationItem['status']) => {
    switch (status) {
      case 'pending': return 'text-yellow-400 bg-yellow-500/20';
      case 'in_review': return 'text-blue-400 bg-blue-500/20';
      case 'resolved': return 'text-green-400 bg-green-500/20';
      case 'escalated': return 'text-red-400 bg-red-500/20';
      case 'dismissed': return 'text-gray-400 bg-gray-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getPriorityColor = (priority: ModerationItem['priority']) => {
    switch (priority) {
      case 'critical': return 'text-red-500 bg-red-500/20';
      case 'high': return 'text-orange-400 bg-orange-500/20';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20';
      case 'low': return 'text-green-400 bg-green-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getTypeIcon = (type: ModerationItem['type']) => {
    switch (type) {
      case 'user_report': return <User className="w-4 h-4" />;
      case 'content_review': return <FileText className="w-4 h-4" />;
      case 'session_dispute': return <MessageSquare className="w-4 h-4" />;
      case 'spam_detection': return <Shield className="w-4 h-4" />;
      case 'payment_issue': return <AlertTriangle className="w-4 h-4" />;
      default: return <Flag className="w-4 h-4" />;
    }
  };

  const handleModerationAction = (action: 'approve' | 'dismiss' | 'escalate' | 'ban', itemId: string) => {
    console.log(`${action} item:`, itemId);
    // Implement moderation actions
  };

  const openDetailModal = (item: ModerationItem) => {
    setSelectedItem(item);
    setShowDetailModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Moderation Tools</h1>
          <p className="text-gray-400 mt-1">
            Review and manage platform content and user behavior
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Search */}
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search reports..."
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
            <option value="user_report">User Reports</option>
            <option value="content_review">Content Reviews</option>
            <option value="session_dispute">Session Disputes</option>
            <option value="spam_detection">Spam Detection</option>
            <option value="payment_issue">Payment Issues</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in_review">In Review</option>
            <option value="resolved">Resolved</option>
            <option value="escalated">Escalated</option>
            <option value="dismissed">Dismissed</option>
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
          >
            <option value="all">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
          >
            <option value="priority">Priority</option>
            <option value="createdAt">Created Date</option>
            <option value="updatedAt">Last Updated</option>
          </select>
        </div>
      </div>

      {/* Queue Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-yellow-400" />
            <span className="text-sm text-gray-400">Pending</span>
          </div>
          <div className="text-2xl font-bold text-white mt-1">
            {moderationQueue.filter(item => item.status === 'pending').length}
          </div>
        </div>
        
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-blue-400" />
            <span className="text-sm text-gray-400">In Review</span>
          </div>
          <div className="text-2xl font-bold text-white mt-1">
            {moderationQueue.filter(item => item.status === 'in_review').length}
          </div>
        </div>
        
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <span className="text-sm text-gray-400">Escalated</span>
          </div>
          <div className="text-2xl font-bold text-white mt-1">
            {moderationQueue.filter(item => item.status === 'escalated').length}
          </div>
        </div>
        
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5 text-green-400" />
            <span className="text-sm text-gray-400">Resolved Today</span>
          </div>
          <div className="text-2xl font-bold text-white mt-1">12</div>
        </div>
        
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Flag className="w-5 h-5 text-orange-400" />
            <span className="text-sm text-gray-400">High Priority</span>
          </div>
          <div className="text-2xl font-bold text-white mt-1">
            {moderationQueue.filter(item => item.priority === 'high' || item.priority === 'critical').length}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="text-sm text-gray-400">
        Showing {filteredItems.length} of {moderationQueue.length} items
      </div>

      {/* Moderation Queue */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700 border-b border-gray-600">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-gray-300">Report</th>
                <th className="text-left p-4 text-sm font-medium text-gray-300">Type</th>
                <th className="text-left p-4 text-sm font-medium text-gray-300">Priority</th>
                <th className="text-left p-4 text-sm font-medium text-gray-300">Status</th>
                <th className="text-left p-4 text-sm font-medium text-gray-300">Reporter</th>
                <th className="text-left p-4 text-sm font-medium text-gray-300">Date</th>
                <th className="text-right p-4 text-sm font-medium text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-gray-700/50">
                  <td className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-gray-700 rounded">
                        {getTypeIcon(item.type)}
                      </div>
                      
                      <div className="flex-1">
                        <div className="font-medium text-white">{item.title}</div>
                        <div className="text-sm text-gray-400 line-clamp-2 mt-1">
                          {item.description}
                        </div>
                        {item.targetUser && (
                          <div className="text-xs text-blue-400 mt-1">
                            Target: {item.targetUser.name} ({item.targetUser.role})
                          </div>
                        )}
                        {item.targetContent && (
                          <div className="text-xs text-purple-400 mt-1">
                            Content: {item.targetContent.title}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  
                  <td className="p-4">
                    <span className="capitalize text-sm text-gray-300">
                      {item.type.replace('_', ' ')}
                    </span>
                  </td>
                  
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${getPriorityColor(item.priority)}`}>
                      {item.priority}
                    </span>
                  </td>
                  
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${getStatusColor(item.status)}`}>
                      {item.status.replace('_', ' ')}
                    </span>
                  </td>
                  
                  <td className="p-4">
                    <div className="text-sm text-white">{item.reportedBy.name}</div>
                    <div className="text-xs text-gray-400">{item.reportedBy.role}</div>
                  </td>
                  
                  <td className="p-4">
                    <div className="text-sm text-white">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(item.createdAt).toLocaleTimeString()}
                    </div>
                  </td>
                  
                  <td className="p-4">
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        onClick={() => openDetailModal(item)}
                        className="p-1 text-gray-400 hover:text-white"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      
                      {item.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleModerationAction('approve', item.id)}
                            className="p-1 text-green-400 hover:text-green-300"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleModerationAction('dismiss', item.id)}
                            className="p-1 text-red-400 hover:text-red-300"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      
                      <button className="p-1 text-gray-400 hover:text-white">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedItem && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg border border-gray-700 w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <h2 className="text-xl font-bold text-white">Moderation Details</h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-8rem)]">
              <div className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-bold text-white mb-3">Report Information</h3>
                    <div className="space-y-2">
                      <div>
                        <span className="text-gray-400">Title: </span>
                        <span className="text-white">{selectedItem.title}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Type: </span>
                        <span className="text-white capitalize">{selectedItem.type.replace('_', ' ')}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Priority: </span>
                        <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${getPriorityColor(selectedItem.priority)}`}>
                          {selectedItem.priority}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400">Status: </span>
                        <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${getStatusColor(selectedItem.status)}`}>
                          {selectedItem.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-bold text-white mb-3">Timeline</h3>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-gray-400">Created: </span>
                        <span className="text-white">{new Date(selectedItem.createdAt).toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Updated: </span>
                        <span className="text-white">{new Date(selectedItem.updatedAt).toLocaleString()}</span>
                      </div>
                      {selectedItem.assignedTo && (
                        <div>
                          <span className="text-gray-400">Assigned to: </span>
                          <span className="text-white">{selectedItem.assignedTo}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h3 className="text-lg font-bold text-white mb-3">Description</h3>
                  <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                    <p className="text-gray-300">{selectedItem.description}</p>
                  </div>
                </div>

                {/* Evidence */}
                {selectedItem.evidence.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold text-white mb-3">Evidence</h3>
                    <div className="space-y-2">
                      {selectedItem.evidence.map((evidence, index) => (
                        <div key={index} className="bg-gray-800 border border-gray-700 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-white capitalize">
                              {evidence.type}
                            </span>
                            <span className="text-xs text-gray-400">
                              {new Date(evidence.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-300">{evidence.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions History */}
                {selectedItem.actions.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold text-white mb-3">Action History</h3>
                    <div className="space-y-2">
                      {selectedItem.actions.map((action, index) => (
                        <div key={index} className="bg-gray-800 border border-gray-700 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-white">{action.action}</span>
                            <span className="text-xs text-gray-400">by {action.performedBy}</span>
                            <span className="text-xs text-gray-500">
                              {new Date(action.timestamp).toLocaleString()}
                            </span>
                          </div>
                          {action.note && (
                            <p className="text-sm text-gray-300">{action.note}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-gray-700">
                  <Button className="bg-green-600 hover:bg-green-700">
                    <Check className="w-4 h-4 mr-2" />
                    Resolve
                  </Button>
                  <Button variant="outline" className="text-yellow-400 border-yellow-400 hover:bg-yellow-500/10">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Escalate
                  </Button>
                  <Button variant="outline" className="text-red-400 border-red-400 hover:bg-red-500/10">
                    <X className="w-4 h-4 mr-2" />
                    Dismiss
                  </Button>
                  {selectedItem.targetUser && (
                    <Button variant="outline" className="text-orange-400 border-orange-400 hover:bg-orange-500/10">
                      <Ban className="w-4 h-4 mr-2" />
                      Suspend User
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};