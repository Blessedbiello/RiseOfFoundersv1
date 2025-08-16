'use client';

import { 
  Home,
  Users,
  FileText,
  BarChart3,
  AlertTriangle,
  Settings,
  Shield,
  Map,
  Trophy,
  DollarSign,
  MessageSquare,
  BookOpen,
  Flag
} from 'lucide-react';

interface AdminSidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

const navigationItems = [
  {
    id: 'overview',
    label: 'Overview',
    icon: Home,
    description: 'Platform overview and key metrics'
  },
  {
    id: 'users',
    label: 'User Management',
    icon: Users,
    description: 'Manage users, founders, and mentors'
  },
  {
    id: 'content',
    label: 'Content Management',
    icon: FileText,
    description: 'Manage missions, territories, and quests'
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: BarChart3,
    description: 'Platform analytics and insights'
  },
  {
    id: 'moderation',
    label: 'Moderation',
    icon: AlertTriangle,
    description: 'Content moderation and safety'
  },
  {
    id: 'settings',
    label: 'System Settings',
    icon: Settings,
    description: 'Platform configuration and settings'
  }
];

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ activeView, onViewChange }) => {
  return (
    <div className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-blue-400" />
          <div>
            <h2 className="text-lg font-bold text-white">Admin Panel</h2>
            <p className="text-sm text-gray-400">Rise of Founders</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                <Icon className="w-5 h-5" />
                <div className="flex-1">
                  <div className="font-medium">{item.label}</div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    {item.description}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Quick Stats */}
      <div className="p-4 border-t border-gray-700">
        <div className="bg-gray-700/50 rounded-lg p-3">
          <h3 className="text-sm font-medium text-gray-300 mb-2">Quick Stats</h3>
          <div className="space-y-1 text-xs text-gray-400">
            <div className="flex justify-between">
              <span>Active Users:</span>
              <span className="text-green-400">1,247</span>
            </div>
            <div className="flex justify-between">
              <span>Total Missions:</span>
              <span className="text-blue-400">89</span>
            </div>
            <div className="flex justify-between">
              <span>Pending Reports:</span>
              <span className="text-yellow-400">3</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};