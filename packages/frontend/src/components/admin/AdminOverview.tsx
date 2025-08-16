'use client';

import { useState, useEffect } from 'react';
import { 
  Users,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Clock,
  Star,
  Shield,
  Activity,
  Target,
  Trophy,
  BookOpen
} from 'lucide-react';

interface MetricCard {
  title: string;
  value: string | number;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  icon: React.ReactNode;
  color: string;
}

interface ActivityItem {
  id: string;
  type: 'user_signup' | 'mission_completed' | 'team_created' | 'session_booked' | 'report_filed';
  message: string;
  timestamp: string;
  user?: string;
}

export const AdminOverview: React.FC = () => {
  const [metrics, setMetrics] = useState<MetricCard[]>([
    {
      title: 'Total Users',
      value: '1,247',
      change: '+12% this week',
      trend: 'up',
      icon: <Users className="w-6 h-6" />,
      color: 'blue'
    },
    {
      title: 'Active Missions',
      value: '89',
      change: '+5 new today',
      trend: 'up',
      icon: <Target className="w-6 h-6" />,
      color: 'green'
    },
    {
      title: 'Total Revenue',
      value: '$24,580',
      change: '+8.3% this month',
      trend: 'up',
      icon: <DollarSign className="w-6 h-6" />,
      color: 'emerald'
    },
    {
      title: 'Mentor Sessions',
      value: '156',
      change: '+23% this week',
      trend: 'up',
      icon: <BookOpen className="w-6 h-6" />,
      color: 'purple'
    },
    {
      title: 'Completion Rate',
      value: '87.4%',
      change: '+2.1% this month',
      trend: 'up',
      icon: <Trophy className="w-6 h-6" />,
      color: 'yellow'
    },
    {
      title: 'Pending Reports',
      value: '3',
      change: '-2 resolved today',
      trend: 'down',
      icon: <AlertTriangle className="w-6 h-6" />,
      color: 'red'
    }
  ]);

  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([
    {
      id: '1',
      type: 'user_signup',
      message: 'New founder registered: Alex Martinez',
      timestamp: '2 minutes ago',
      user: 'Alex Martinez'
    },
    {
      id: '2',
      type: 'mission_completed',
      message: 'Mission "Product Strategy 101" completed by Sarah Chen',
      timestamp: '15 minutes ago',
      user: 'Sarah Chen'
    },
    {
      id: '3',
      type: 'session_booked',
      message: 'Mentor session booked: "Fundraising Strategy" with Marcus Rodriguez',
      timestamp: '32 minutes ago',
      user: 'Jennifer Liu'
    },
    {
      id: '4',
      type: 'team_created',
      message: 'New team created: "TechStartup Co" by David Kim',
      timestamp: '1 hour ago',
      user: 'David Kim'
    },
    {
      id: '5',
      type: 'report_filed',
      message: 'Content report filed for mission review',
      timestamp: '2 hours ago',
      user: 'System'
    }
  ]);

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'user_signup':
        return <Users className="w-4 h-4 text-blue-400" />;
      case 'mission_completed':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'team_created':
        return <Users className="w-4 h-4 text-purple-400" />;
      case 'session_booked':
        return <BookOpen className="w-4 h-4 text-indigo-400" />;
      case 'report_filed':
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      default:
        return <Activity className="w-4 h-4 text-gray-400" />;
    }
  };

  const getTrendColor = (trend: MetricCard['trend']) => {
    switch (trend) {
      case 'up':
        return 'text-green-400';
      case 'down':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getCardBorderColor = (color: string) => {
    const colorMap: Record<string, string> = {
      blue: 'border-blue-500/20',
      green: 'border-green-500/20',
      emerald: 'border-emerald-500/20',
      purple: 'border-purple-500/20',
      yellow: 'border-yellow-500/20',
      red: 'border-red-500/20'
    };
    return colorMap[color] || 'border-gray-500/20';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Platform Overview</h1>
          <p className="text-gray-400 mt-1">
            Monitor your Rise of Founders platform performance and activity
          </p>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Activity className="w-4 h-4" />
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {metrics.map((metric, index) => (
          <div
            key={index}
            className={`bg-gray-800 border ${getCardBorderColor(metric.color)} rounded-lg p-6`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2 rounded-lg bg-${metric.color}-500/20`}>
                {metric.icon}
              </div>
              <div className={`text-sm font-medium ${getTrendColor(metric.trend)}`}>
                {metric.change}
              </div>
            </div>
            
            <div>
              <div className="text-2xl font-bold text-white mb-1">
                {metric.value}
              </div>
              <div className="text-sm text-gray-400">
                {metric.title}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="xl:col-span-2">
          <div className="bg-gray-800 border border-gray-700 rounded-lg">
            <div className="p-6 border-b border-gray-700">
              <h2 className="text-lg font-bold text-white">Recent Activity</h2>
              <p className="text-sm text-gray-400 mt-1">
                Latest platform events and user actions
              </p>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className="mt-1">
                      {getActivityIcon(activity.type)}
                    </div>
                    
                    <div className="flex-1">
                      <p className="text-sm text-white">
                        {activity.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {activity.timestamp}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 text-center">
                <button className="text-sm text-blue-400 hover:text-blue-300">
                  View all activity →
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="space-y-6">
          {/* Platform Health */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-green-400" />
              <h3 className="text-lg font-bold text-white">System Health</h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">API Status</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-xs text-green-400">Healthy</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Database</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-xs text-green-400">Online</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Blockchain</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <span className="text-xs text-yellow-400">Syncing</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Storage</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-xs text-green-400">Available</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-bold text-white mb-4">Quick Actions</h3>
            
            <div className="space-y-2">
              <button className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded">
                Create New Mission
              </button>
              <button className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded">
                Review Reports
              </button>
              <button className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded">
                Export Analytics
              </button>
              <button className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded">
                System Backup
              </button>
            </div>
          </div>

          {/* Alerts */}
          <div className="bg-gray-800 border border-yellow-500/20 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
              <h3 className="text-lg font-bold text-white">Alerts</h3>
            </div>
            
            <div className="space-y-3">
              <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded">
                <p className="text-sm text-yellow-200">
                  3 content reports require review
                </p>
                <p className="text-xs text-yellow-400 mt-1">
                  Priority: Medium
                </p>
              </div>
              
              <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded">
                <p className="text-sm text-blue-200">
                  Weekly analytics report ready
                </p>
                <p className="text-xs text-blue-400 mt-1">
                  Generated 2 hours ago
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};