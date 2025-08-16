'use client';

import { useState, useMemo } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { 
  Users,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Ban,
  Shield,
  Star,
  Clock,
  Mail,
  Phone,
  Calendar,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  MessageCircle
} from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'founder' | 'mentor' | 'sponsor' | 'admin';
  status: 'active' | 'suspended' | 'pending' | 'banned';
  level: number;
  xpTotal: number;
  joinDate: string;
  lastActive: string;
  profilePicture?: string;
  githubUsername?: string;
  walletAddress?: string;
  verifiedEmail: boolean;
  verifiedWallet: boolean;
  stats: {
    missionsCompleted?: number;
    teamsCreated?: number;
    sessionsBooked?: number;
    menteesSessions?: number;
    sponsoredQuests?: number;
  };
  flags: {
    hasReports: boolean;
    isVip: boolean;
    needsReview: boolean;
  };
}

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([
    {
      id: 'user_1',
      name: 'Alex Martinez',
      email: 'alex@techstartup.co',
      role: 'founder',
      status: 'active',
      level: 12,
      xpTotal: 2450,
      joinDate: '2025-01-10T00:00:00Z',
      lastActive: '2025-01-13T14:30:00Z',
      profilePicture: '/api/placeholder/40/40',
      githubUsername: 'alexmartinez',
      walletAddress: 'ABC123...XYZ789',
      verifiedEmail: true,
      verifiedWallet: true,
      stats: {
        missionsCompleted: 15,
        teamsCreated: 2
      },
      flags: {
        hasReports: false,
        isVip: false,
        needsReview: false
      }
    },
    {
      id: 'user_2',
      name: 'Sarah Chen',
      email: 'sarah@stripe.com',
      role: 'mentor',
      status: 'active',
      level: 25,
      xpTotal: 8750,
      joinDate: '2025-01-05T00:00:00Z',
      lastActive: '2025-01-13T16:15:00Z',
      profilePicture: '/api/placeholder/40/40',
      githubUsername: 'sarahchen',
      walletAddress: 'DEF456...ABC123',
      verifiedEmail: true,
      verifiedWallet: true,
      stats: {
        menteesSessions: 47
      },
      flags: {
        hasReports: false,
        isVip: true,
        needsReview: false
      }
    },
    {
      id: 'user_3',
      name: 'Jennifer Liu',
      email: 'j.liu@greentech.io',
      role: 'founder',
      status: 'pending',
      level: 3,
      xpTotal: 350,
      joinDate: '2025-01-12T00:00:00Z',
      lastActive: '2025-01-13T10:20:00Z',
      verifiedEmail: false,
      verifiedWallet: false,
      stats: {
        missionsCompleted: 2
      },
      flags: {
        hasReports: false,
        isVip: false,
        needsReview: true
      }
    },
    {
      id: 'user_4',
      name: 'TechCorp Inc',
      email: 'partnerships@techcorp.com',
      role: 'sponsor',
      status: 'active',
      level: 1,
      xpTotal: 0,
      joinDate: '2025-01-08T00:00:00Z',
      lastActive: '2025-01-13T12:45:00Z',
      verifiedEmail: true,
      verifiedWallet: true,
      stats: {
        sponsoredQuests: 8
      },
      flags: {
        hasReports: false,
        isVip: true,
        needsReview: false
      }
    },
    {
      id: 'user_5',
      name: 'David Kim',
      email: 'david@aiinnovations.com',
      role: 'founder',
      status: 'suspended',
      level: 8,
      xpTotal: 1200,
      joinDate: '2025-01-01T00:00:00Z',
      lastActive: '2025-01-11T09:30:00Z',
      githubUsername: 'davidkim',
      verifiedEmail: true,
      verifiedWallet: false,
      stats: {
        missionsCompleted: 8,
        teamsCreated: 1
      },
      flags: {
        hasReports: true,
        isVip: false,
        needsReview: true
      }
    }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'joinDate' | 'lastActive' | 'level'>('lastActive');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);

  const filteredUsers = useMemo(() => {
    let filtered = users.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           user.githubUsername?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
      
      return matchesSearch && matchesRole && matchesStatus;
    });

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'joinDate':
          return new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime();
        case 'lastActive':
          return new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime();
        case 'level':
          return b.level - a.level;
        default:
          return 0;
      }
    });

    return filtered;
  }, [users, searchQuery, roleFilter, statusFilter, sortBy]);

  const getStatusColor = (status: User['status']) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-500/20';
      case 'pending': return 'text-yellow-400 bg-yellow-500/20';
      case 'suspended': return 'text-orange-400 bg-orange-500/20';
      case 'banned': return 'text-red-400 bg-red-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getRoleColor = (role: User['role']) => {
    switch (role) {
      case 'founder': return 'text-blue-400 bg-blue-500/20';
      case 'mentor': return 'text-purple-400 bg-purple-500/20';
      case 'sponsor': return 'text-green-400 bg-green-500/20';
      case 'admin': return 'text-red-400 bg-red-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const handleUserAction = (action: string, userId: string) => {
    console.log(`${action} user:`, userId);
    // Implement user actions
  };

  const openUserModal = (user: User) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">User Management</h1>
          <p className="text-gray-400 mt-1">
            Manage platform users, roles, and permissions
          </p>
        </div>
        
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Users className="w-4 h-4 mr-2" />
          Invite User
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
          </div>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
          >
            <option value="all">All Roles</option>
            <option value="founder">Founders</option>
            <option value="mentor">Mentors</option>
            <option value="sponsor">Sponsors</option>
            <option value="admin">Admins</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="suspended">Suspended</option>
            <option value="banned">Banned</option>
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
          >
            <option value="lastActive">Last Active</option>
            <option value="name">Name</option>
            <option value="joinDate">Join Date</option>
            <option value="level">Level</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-400" />
            <span className="text-sm text-gray-400">Total Users</span>
          </div>
          <div className="text-2xl font-bold text-white mt-1">1,247</div>
        </div>
        
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-green-400" />
            <span className="text-sm text-gray-400">Active Today</span>
          </div>
          <div className="text-2xl font-bold text-white mt-1">341</div>
        </div>
        
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
            <span className="text-sm text-gray-400">Pending Review</span>
          </div>
          <div className="text-2xl font-bold text-white mt-1">12</div>
        </div>
        
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Ban className="w-5 h-5 text-red-400" />
            <span className="text-sm text-gray-400">Suspended</span>
          </div>
          <div className="text-2xl font-bold text-white mt-1">8</div>
        </div>
      </div>

      {/* Results */}
      <div className="text-sm text-gray-400">
        Showing {filteredUsers.length} of {users.length} users
      </div>

      {/* Users Table */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700 border-b border-gray-600">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-gray-300">User</th>
                <th className="text-left p-4 text-sm font-medium text-gray-300">Role</th>
                <th className="text-left p-4 text-sm font-medium text-gray-300">Status</th>
                <th className="text-left p-4 text-sm font-medium text-gray-300">Level</th>
                <th className="text-left p-4 text-sm font-medium text-gray-300">Last Active</th>
                <th className="text-left p-4 text-sm font-medium text-gray-300">Stats</th>
                <th className="text-right p-4 text-sm font-medium text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-700/50">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                        {user.profilePicture ? (
                          <img src={user.profilePicture} alt={user.name} className="w-full h-full rounded-full object-cover" />
                        ) : (
                          <Users className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-white">{user.name}</span>
                          {user.flags.isVip && (
                            <Star className="w-4 h-4 text-yellow-400" />
                          )}
                          {user.flags.hasReports && (
                            <AlertTriangle className="w-4 h-4 text-red-400" />
                          )}
                        </div>
                        <div className="text-sm text-gray-400">{user.email}</div>
                        <div className="flex items-center gap-2 mt-1">
                          {user.verifiedEmail && (
                            <div className="flex items-center gap-1">
                              <Mail className="w-3 h-3 text-green-400" />
                              <CheckCircle className="w-3 h-3 text-green-400" />
                            </div>
                          )}
                          {user.verifiedWallet && (
                            <div className="flex items-center gap-1">
                              <Shield className="w-3 h-3 text-blue-400" />
                              <CheckCircle className="w-3 h-3 text-green-400" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${getRoleColor(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${getStatusColor(user.status)}`}>
                      {user.status}
                    </span>
                  </td>
                  
                  <td className="p-4">
                    <div className="text-white font-medium">Level {user.level}</div>
                    <div className="text-xs text-gray-400">{user.xpTotal} XP</div>
                  </td>
                  
                  <td className="p-4">
                    <div className="text-sm text-white">
                      {new Date(user.lastActive).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(user.lastActive).toLocaleTimeString()}
                    </div>
                  </td>
                  
                  <td className="p-4">
                    <div className="text-sm space-y-1">
                      {user.stats.missionsCompleted && (
                        <div className="text-blue-400">{user.stats.missionsCompleted} missions</div>
                      )}
                      {user.stats.menteesSessions && (
                        <div className="text-purple-400">{user.stats.menteesSessions} sessions</div>
                      )}
                      {user.stats.sponsoredQuests && (
                        <div className="text-green-400">{user.stats.sponsoredQuests} quests</div>
                      )}
                      {user.stats.teamsCreated && (
                        <div className="text-yellow-400">{user.stats.teamsCreated} teams</div>
                      )}
                    </div>
                  </td>
                  
                  <td className="p-4">
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        onClick={() => openUserModal(user)}
                        className="p-1 text-gray-400 hover:text-white"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleUserAction('message', user.id)}
                        className="p-1 text-gray-400 hover:text-white"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleUserAction('edit', user.id)}
                        className="p-1 text-gray-400 hover:text-white"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
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

      {/* User Detail Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg border border-gray-700 w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <h2 className="text-xl font-bold text-white">User Details</h2>
              <button
                onClick={() => setShowUserModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              {/* User details content would go here */}
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center">
                    {selectedUser.profilePicture ? (
                      <img src={selectedUser.profilePicture} alt={selectedUser.name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <Users className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{selectedUser.name}</h3>
                    <p className="text-gray-400">{selectedUser.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${getRoleColor(selectedUser.role)}`}>
                        {selectedUser.role}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${getStatusColor(selectedUser.status)}`}>
                        {selectedUser.status}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Additional user details would be implemented here */}
                <div className="text-gray-400">
                  Complete user profile and activity details would be displayed here...
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};