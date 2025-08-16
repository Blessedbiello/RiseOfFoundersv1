'use client';

import { useState, useCallback } from 'react';
import { TeamFormData } from './TeamCreation';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { 
  Send, 
  Mail, 
  Github, 
  Users, 
  Plus, 
  X,
  CheckCircle,
  Clock,
  AlertTriangle,
  Copy,
  ExternalLink
} from 'lucide-react';
import toast from 'react-hot-toast';

interface TeamInvite {
  id: string;
  email: string;
  role: string;
  status: 'pending' | 'sent' | 'accepted' | 'declined';
  invitedAt: string;
  message?: string;
}

interface TeamInviteSystemProps {
  teamData: TeamFormData;
  onMembersInvited: (inviteEmails: string[]) => void;
  invitedMembers: string[];
}

export const TeamInviteSystem: React.FC<TeamInviteSystemProps> = ({
  teamData,
  onMembersInvited,
  invitedMembers
}) => {
  const [invites, setInvites] = useState<TeamInvite[]>([]);
  const [newInvite, setNewInvite] = useState({ email: '', role: '', message: '' });
  const [isSending, setIsSending] = useState(false);
  const [inviteMode, setInviteMode] = useState<'email' | 'link'>('email');
  
  const { user } = useAuth();

  const suggestedRoles = [
    'Co-Founder & CTO',
    'Co-Founder & CMO', 
    'Co-Founder & CPO',
    'Lead Developer',
    'Head of Marketing',
    'Head of Design',
    'Business Development',
    'Operations Lead'
  ];

  const generateInviteLink = useCallback(() => {
    const baseUrl = window.location.origin;
    const inviteCode = Math.random().toString(36).substring(2, 15);
    return `${baseUrl}/teams/join/${inviteCode}`;
  }, []);

  const sendInvite = useCallback(async () => {
    if (!newInvite.email.trim() || !newInvite.role.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Check if already invited
    if (invites.some(invite => invite.email === newInvite.email)) {
      toast.error('This person has already been invited');
      return;
    }

    setIsSending(true);

    try {
      const invite: TeamInvite = {
        id: Math.random().toString(36).substring(2, 15),
        email: newInvite.email,
        role: newInvite.role,
        status: 'pending',
        invitedAt: new Date().toISOString(),
        message: newInvite.message
      };

      // Simulate sending invitation
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setInvites(prev => [...prev, { ...invite, status: 'sent' }]);
      onMembersInvited([...invitedMembers, newInvite.email]);
      setNewInvite({ email: '', role: '', message: '' });
      
      toast.success('Invitation sent successfully!');
    } catch (error) {
      toast.error('Failed to send invitation');
    } finally {
      setIsSending(false);
    }
  }, [newInvite, invites, invitedMembers, onMembersInvited]);

  const removeInvite = useCallback((inviteId: string) => {
    const invite = invites.find(inv => inv.id === inviteId);
    if (!invite) return;

    setInvites(prev => prev.filter(inv => inv.id !== inviteId));
    onMembersInvited(invitedMembers.filter(email => email !== invite.email));
    toast.success('Invitation removed');
  }, [invites, invitedMembers, onMembersInvited]);

  const copyInviteLink = useCallback(() => {
    const link = generateInviteLink();
    navigator.clipboard.writeText(link);
    toast.success('Invite link copied to clipboard');
  }, [generateInviteLink]);

  const renderInviteStatus = (status: TeamInvite['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'sent':
        return <Mail className="w-4 h-4 text-blue-400" />;
      case 'accepted':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'declined':
        return <X className="w-4 h-4 text-red-400" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <Users className="w-12 h-12 mx-auto text-purple-500 mb-4" />
        <h2 className="text-2xl font-bold text-white">Assemble Your Team</h2>
        <p className="text-gray-400 mt-2">Invite co-founders to join your venture</p>
      </div>

      {/* Team Info Summary */}
      <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">{teamData.name.charAt(0)}</span>
          </div>
          <div>
            <h3 className="font-semibold text-white">{teamData.name}</h3>
            <p className="text-sm text-gray-400">{teamData.focus.charAt(0).toUpperCase() + teamData.focus.slice(1)} Focus</p>
          </div>
        </div>
        <p className="text-sm text-gray-300">{teamData.description}</p>
      </div>

      {/* Invite Mode Toggle */}
      <div className="flex gap-2 p-1 bg-gray-800 rounded-lg">
        <button
          onClick={() => setInviteMode('email')}
          className={`flex-1 px-3 py-2 rounded text-sm font-medium transition-colors ${
            inviteMode === 'email' 
              ? 'bg-blue-600 text-white' 
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Mail className="w-4 h-4 inline mr-2" />
          Email Invites
        </button>
        <button
          onClick={() => setInviteMode('link')}
          className={`flex-1 px-3 py-2 rounded text-sm font-medium transition-colors ${
            inviteMode === 'link' 
              ? 'bg-blue-600 text-white' 
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Copy className="w-4 h-4 inline mr-2" />
          Invite Link
        </button>
      </div>

      {inviteMode === 'email' ? (
        /* Email Invitation Form */
        <div className="bg-gray-800/50 rounded-lg p-6">
          <h3 className="font-semibold text-white mb-4">Send Email Invitation</h3>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="inviteEmail">Email Address *</Label>
                <Input
                  id="inviteEmail"
                  type="email"
                  value={newInvite.email}
                  onChange={(e) => setNewInvite(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="cofowner@example.com"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="inviteRole">Proposed Role *</Label>
                <div className="relative">
                  <Input
                    id="inviteRole"
                    value={newInvite.role}
                    onChange={(e) => setNewInvite(prev => ({ ...prev, role: e.target.value }))}
                    placeholder="e.g., Co-Founder & CTO"
                    className="mt-1"
                  />
                  <div className="mt-2">
                    <div className="text-xs text-gray-500 mb-1">Suggested roles:</div>
                    <div className="flex flex-wrap gap-1">
                      {suggestedRoles.slice(0, 4).map((role) => (
                        <button
                          key={role}
                          onClick={() => setNewInvite(prev => ({ ...prev, role }))}
                          className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded transition-colors"
                        >
                          {role}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="inviteMessage">Personal Message (Optional)</Label>
              <Textarea
                id="inviteMessage"
                value={newInvite.message}
                onChange={(e) => setNewInvite(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Tell them why you'd like them to join your team..."
                rows={3}
                className="mt-1"
              />
            </div>

            <Button
              onClick={sendInvite}
              disabled={!newInvite.email.trim() || !newInvite.role.trim() || isSending}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {isSending ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Sending Invitation...
                </div>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Invitation
                </>
              )}
            </Button>
          </div>
        </div>
      ) : (
        /* Invite Link Mode */
        <div className="bg-gray-800/50 rounded-lg p-6">
          <h3 className="font-semibold text-white mb-4">Share Invite Link</h3>
          
          <div className="space-y-4">
            <div>
              <Label>Team Invite Link</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  value={generateInviteLink()}
                  readOnly
                  className="flex-1 font-mono text-sm"
                />
                <Button onClick={copyInviteLink}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Share this link with potential co-founders
              </p>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <div className="flex items-center gap-2 text-blue-400 mb-2">
                <ExternalLink className="w-4 h-4" />
                <span className="font-medium">Link Sharing</span>
              </div>
              <p className="text-sm text-gray-300">
                Anyone with this link can request to join your team. You'll be able to 
                review and approve requests before they're added.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Sent Invitations */}
      {invites.length > 0 && (
        <div className="bg-gray-800/50 rounded-lg p-6">
          <h3 className="font-semibold text-white mb-4">
            Sent Invitations ({invites.length})
          </h3>
          
          <div className="space-y-3">
            {invites.map((invite) => (
              <div key={invite.id} className="flex items-center gap-3 p-3 bg-gray-700/30 rounded-lg">
                <div className="flex-shrink-0">
                  {renderInviteStatus(invite.status)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-white truncate">{invite.email}</div>
                  <div className="text-sm text-gray-400">{invite.role}</div>
                  <div className="text-xs text-gray-500">
                    Invited {new Date(invite.invitedAt).toLocaleDateString()}
                  </div>
                </div>
                
                <div className="flex-shrink-0 flex items-center gap-2">
                  <span className="text-xs px-2 py-1 rounded capitalize" 
                        style={{
                          backgroundColor: invite.status === 'accepted' ? '#065f46' :
                                         invite.status === 'declined' ? '#7f1d1d' :
                                         invite.status === 'sent' ? '#1e3a8a' : '#92400e',
                          color: invite.status === 'accepted' ? '#10b981' :
                                invite.status === 'declined' ? '#ef4444' :
                                invite.status === 'sent' ? '#3b82f6' : '#f59e0b'
                        }}>
                    {invite.status}
                  </span>
                  
                  {invite.status === 'pending' || invite.status === 'sent' ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeInvite(invite.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {invites.length === 0 && (
        <div className="text-center py-8">
          <Users className="w-16 h-16 mx-auto text-gray-600 mb-4" />
          <h3 className="text-lg font-medium text-gray-400 mb-2">No Invitations Sent</h3>
          <p className="text-sm text-gray-500 max-w-sm mx-auto">
            Start building your founding team by sending invitations to potential co-founders
          </p>
        </div>
      )}

      {/* Required Members Warning */}
      {invites.length < teamData.size - 1 && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
          <div className="flex items-center gap-2 text-yellow-400">
            <AlertTriangle className="w-4 h-4" />
            <span className="font-medium">Team Size Goal</span>
          </div>
          <p className="text-sm text-gray-300 mt-1">
            You've configured your team for {teamData.size} members. Consider inviting{' '}
            {teamData.size - 1 - invites.length} more co-founder{teamData.size - 1 - invites.length !== 1 ? 's' : ''} to reach your target size.
          </p>
        </div>
      )}
    </div>
  );
};