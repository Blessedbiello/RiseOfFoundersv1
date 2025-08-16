'use client';

import { useState, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { 
  Calendar,
  Clock,
  Video,
  MessageCircle,
  Star,
  User,
  FileText,
  Download,
  Upload,
  CheckCircle,
  XCircle,
  AlertTriangle,
  DollarSign,
  Shield,
  Users,
  BookOpen,
  Edit,
  Trash2
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Session {
  id: string;
  mentor: {
    id: string;
    name: string;
    title: string;
    avatar: string;
  };
  founder: {
    id: string;
    name: string;
    company: string;
    avatar: string;
  };
  type: '1-on-1' | 'group' | 'workshop';
  status: 'upcoming' | 'in_progress' | 'completed' | 'cancelled' | 'rescheduled';
  scheduled_at: string;
  duration: number;
  agenda: string;
  meeting_link?: string;
  price: number;
  currency: string;
  payment_status: 'pending' | 'paid' | 'escrowed' | 'released' | 'refunded';
  notes?: string;
  recording_url?: string;
  materials: Array<{
    id: string;
    name: string;
    type: 'pdf' | 'doc' | 'link' | 'video';
    url: string;
    uploaded_by: 'mentor' | 'founder';
  }>;
  feedback?: {
    mentor_rating?: number;
    mentor_review?: string;
    founder_rating?: number;
    founder_review?: string;
    submitted_at?: string;
  };
  created_at: string;
}

interface SessionManagementProps {
  userRole: 'founder' | 'mentor';
}

export const SessionManagement: React.FC<SessionManagementProps> = ({ userRole }) => {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'completed' | 'cancelled'>('upcoming');
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState('');
  
  const { user } = useAuth();

  // Mock sessions data
  const mockSessions: Session[] = [
    {
      id: 'session_1',
      mentor: {
        id: 'mentor_1',
        name: 'Sarah Chen',
        title: 'Former VP Product at Stripe',
        avatar: '/api/placeholder/48/48'
      },
      founder: {
        id: 'founder_1',
        name: 'Alex Martinez',
        company: 'TechStartup Co',
        avatar: '/api/placeholder/48/48'
      },
      type: '1-on-1',
      status: 'upcoming',
      scheduled_at: '2025-01-20T15:00:00Z',
      duration: 60,
      agenda: 'Product-market fit strategy and user feedback analysis',
      meeting_link: 'https://meet.google.com/abc-defg-hij',
      price: 250,
      currency: 'USD',
      payment_status: 'escrowed',
      materials: [
        {
          id: 'material_1',
          name: 'Product Strategy Framework',
          type: 'pdf',
          url: '/materials/product-strategy.pdf',
          uploaded_by: 'mentor'
        }
      ],
      created_at: '2025-01-15T10:30:00Z'
    },
    {
      id: 'session_2',
      mentor: {
        id: 'mentor_2',
        name: 'Marcus Rodriguez',
        title: 'Serial Entrepreneur & VC Partner',
        avatar: '/api/placeholder/48/48'
      },
      founder: {
        id: 'founder_2',
        name: 'Jennifer Liu',
        company: 'GreenTech Solutions',
        avatar: '/api/placeholder/48/48'
      },
      type: '1-on-1',
      status: 'completed',
      scheduled_at: '2025-01-18T14:00:00Z',
      duration: 45,
      agenda: 'Fundraising preparation and investor pitch review',
      price: 225,
      currency: 'USD',
      payment_status: 'released',
      notes: 'Great session! Provided excellent feedback on pitch deck structure and helped refine the value proposition. Recommended focusing on customer acquisition metrics.',
      recording_url: 'https://recordings.mentorplatform.com/session_2',
      materials: [
        {
          id: 'material_2',
          name: 'Pitch Deck Template',
          type: 'doc',
          url: '/materials/pitch-deck-template.docx',
          uploaded_by: 'mentor'
        },
        {
          id: 'material_3',
          name: 'Fundraising Checklist',
          type: 'pdf',
          url: '/materials/fundraising-checklist.pdf',
          uploaded_by: 'mentor'
        }
      ],
      feedback: {
        mentor_rating: 5,
        mentor_review: 'Alex was well-prepared and asked thoughtful questions. Great to work with!',
        founder_rating: 5,
        founder_review: 'Marcus provided incredibly valuable insights. His experience really shows.',
        submitted_at: '2025-01-18T15:30:00Z'
      },
      created_at: '2025-01-16T09:15:00Z'
    },
    {
      id: 'session_3',
      mentor: {
        id: 'mentor_3',
        name: 'Dr. Lisa Wang',
        title: 'Former Head of AI at Tesla',
        avatar: '/api/placeholder/48/48'
      },
      founder: {
        id: 'founder_3',
        name: 'David Kim',
        company: 'AI Innovations',
        avatar: '/api/placeholder/48/48'
      },
      type: 'workshop',
      status: 'cancelled',
      scheduled_at: '2025-01-17T16:00:00Z',
      duration: 120,
      agenda: 'AI strategy workshop for early-stage startups',
      price: 400,
      currency: 'USD',
      payment_status: 'refunded',
      created_at: '2025-01-14T11:00:00Z'
    }
  ];

  const filteredSessions = mockSessions.filter(session => session.status === activeTab);

  const getStatusColor = (status: Session['status']) => {
    switch (status) {
      case 'upcoming': return 'text-blue-400 bg-blue-500/20';
      case 'in_progress': return 'text-green-400 bg-green-500/20';
      case 'completed': return 'text-green-400 bg-green-500/20';
      case 'cancelled': return 'text-red-400 bg-red-500/20';
      case 'rescheduled': return 'text-yellow-400 bg-yellow-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getPaymentStatusColor = (status: Session['payment_status']) => {
    switch (status) {
      case 'paid': return 'text-green-400';
      case 'escrowed': return 'text-blue-400';
      case 'released': return 'text-green-400';
      case 'refunded': return 'text-yellow-400';
      case 'pending': return 'text-orange-400';
      default: return 'text-gray-400';
    }
  };

  const handleSessionAction = useCallback((sessionId: string, action: 'join' | 'reschedule' | 'cancel') => {
    switch (action) {
      case 'join':
        const session = mockSessions.find(s => s.id === sessionId);
        if (session?.meeting_link) {
          window.open(session.meeting_link, '_blank');
        }
        break;
      case 'reschedule':
        toast.info('Reschedule feature coming soon!');
        break;
      case 'cancel':
        toast.info('Cancel feature coming soon!');
        break;
    }
  }, []);

  const handleSubmitFeedback = useCallback(async () => {
    if (!selectedSession || feedbackRating === 0) {
      toast.error('Please provide a rating');
      return;
    }

    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Feedback submitted successfully!');
      setShowFeedbackModal(false);
      setFeedbackRating(0);
      setFeedbackComment('');
      setSelectedSession(null);
    } catch (error) {
      toast.error('Failed to submit feedback');
    }
  }, [selectedSession, feedbackRating, feedbackComment]);

  const renderSessionCard = (session: Session) => {
    const isUpcoming = session.status === 'upcoming';
    const canJoin = isUpcoming && new Date(session.scheduled_at).getTime() - Date.now() <= 15 * 60 * 1000; // 15 minutes before
    const otherParty = userRole === 'mentor' ? session.founder : session.mentor;

    return (
      <div key={session.id} className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-gray-400" />
            </div>
            
            <div>
              <div className="font-bold text-white">{otherParty.name}</div>
              <div className="text-sm text-gray-400">
                {userRole === 'mentor' ? otherParty.company : otherParty.title}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <div className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(session.status)}`}>
                  {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                </div>
                
                {session.type === '1-on-1' && <User className="w-4 h-4 text-blue-400" />}
                {session.type === 'group' && <Users className="w-4 h-4 text-green-400" />}
                {session.type === 'workshop' && <BookOpen className="w-4 h-4 text-purple-400" />}
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-lg font-bold text-green-400">
              ${session.price}
            </div>
            <div className={`text-sm ${getPaymentStatusColor(session.payment_status)}`}>
              {session.payment_status.charAt(0).toUpperCase() + session.payment_status.slice(1)}
            </div>
          </div>
        </div>

        {/* Session Details */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <Calendar className="w-4 h-4 text-blue-400" />
            <span>{new Date(session.scheduled_at).toLocaleDateString()}</span>
            <Clock className="w-4 h-4 text-blue-400 ml-4" />
            <span>{new Date(session.scheduled_at).toLocaleTimeString()}</span>
            <span className="text-gray-500">({session.duration} min)</span>
          </div>
          
          <div>
            <span className="text-sm font-medium text-gray-400">Agenda: </span>
            <span className="text-sm text-gray-300">{session.agenda}</span>
          </div>
        </div>

        {/* Materials */}
        {session.materials.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-400 mb-2">Materials</h4>
            <div className="flex flex-wrap gap-2">
              {session.materials.map((material) => (
                <a
                  key={material.id}
                  href={material.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 px-2 py-1 bg-gray-700/50 rounded text-xs text-gray-300 hover:text-white"
                >
                  <FileText className="w-3 h-3" />
                  {material.name}
                  <Download className="w-3 h-3" />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Notes (for completed sessions) */}
        {session.notes && (
          <div className="mb-4 p-3 bg-gray-700/30 rounded">
            <h4 className="text-sm font-medium text-gray-400 mb-1">Session Notes</h4>
            <p className="text-sm text-gray-300">{session.notes}</p>
          </div>
        )}

        {/* Feedback (for completed sessions) */}
        {session.feedback && (
          <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded">
            <h4 className="text-sm font-medium text-green-400 mb-2">Feedback</h4>
            <div className="space-y-2">
              {userRole === 'mentor' && session.feedback.founder_rating && (
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-gray-400">Your rating:</span>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${
                            i < session.feedback!.founder_rating!
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-500'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  {session.feedback.founder_review && (
                    <p className="text-xs text-gray-300">"{session.feedback.founder_review}"</p>
                  )}
                </div>
              )}
              
              {userRole === 'founder' && session.feedback.mentor_rating && (
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-gray-400">Mentor rating:</span>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${
                            i < session.feedback!.mentor_rating!
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-500'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  {session.feedback.mentor_review && (
                    <p className="text-xs text-gray-300">"{session.feedback.mentor_review}"</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          {isUpcoming && (
            <>
              {canJoin ? (
                <Button
                  onClick={() => handleSessionAction(session.id, 'join')}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Video className="w-4 h-4 mr-2" />
                  Join Session
                </Button>
              ) : (
                <Button
                  onClick={() => handleSessionAction(session.id, 'reschedule')}
                  variant="outline"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Reschedule
                </Button>
              )}
              
              <Button
                onClick={() => handleSessionAction(session.id, 'cancel')}
                variant="outline"
                className="text-red-400 border-red-400 hover:bg-red-500/10"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </>
          )}
          
          {session.status === 'completed' && (
            <>
              {session.recording_url && (
                <Button variant="outline" size="sm">
                  <Video className="w-4 h-4 mr-2" />
                  View Recording
                </Button>
              )}
              
              {!session.feedback?.founder_rating && userRole === 'founder' && (
                <Button
                  onClick={() => {
                    setSelectedSession(session);
                    setShowFeedbackModal(true);
                  }}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Star className="w-4 h-4 mr-2" />
                  Rate Session
                </Button>
              )}
              
              {!session.feedback?.mentor_rating && userRole === 'mentor' && (
                <Button
                  onClick={() => {
                    setSelectedSession(session);
                    setShowFeedbackModal(true);
                  }}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Star className="w-4 h-4 mr-2" />
                  Rate Session
                </Button>
              )}
            </>
          )}
          
          <Button variant="outline" size="sm">
            <MessageCircle className="w-4 h-4 mr-2" />
            Message
          </Button>
        </div>
      </div>
    );
  };

  const renderFeedbackModal = () => (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg border border-gray-700 w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">Rate Session</h2>
          <button
            onClick={() => setShowFeedbackModal(false)}
            className="text-gray-400 hover:text-white"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Rate your experience (1-5 stars)
            </label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setFeedbackRating(star)}
                  className="text-2xl"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= feedbackRating
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-500 hover:text-yellow-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Comments (optional)
            </label>
            <Textarea
              value={feedbackComment}
              onChange={(e) => setFeedbackComment(e.target.value)}
              placeholder="Share your experience..."
              rows={3}
            />
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button
              onClick={() => setShowFeedbackModal(false)}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitFeedback}
              disabled={feedbackRating === 0}
              className="flex-1"
            >
              Submit Feedback
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Your Sessions</h2>
        <p className="text-gray-400">
          Manage your {userRole === 'mentor' ? 'mentoring' : 'learning'} sessions
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-700">
        {(['upcoming', 'completed', 'cancelled'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 font-medium transition-colors capitalize ${
              activeTab === tab
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab}
            {tab === 'upcoming' && filteredSessions.length > 0 && (
              <span className="ml-2 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {mockSessions.filter(s => s.status === 'upcoming').length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Sessions List */}
      <div className="space-y-4">
        {filteredSessions.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 mx-auto text-gray-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-400 mb-2">No {activeTab} sessions</h3>
            <p className="text-sm text-gray-500">
              {activeTab === 'upcoming' 
                ? 'Book a session to get started'
                : `No ${activeTab} sessions yet`
              }
            </p>
          </div>
        ) : (
          filteredSessions.map(renderSessionCard)
        )}
      </div>

      {/* Feedback Modal */}
      {showFeedbackModal && renderFeedbackModal()}
    </div>
  );
};