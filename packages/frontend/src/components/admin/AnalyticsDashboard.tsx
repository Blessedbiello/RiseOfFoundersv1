'use client';

import { useState, useMemo } from 'react';
import { 
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Target,
  DollarSign,
  Clock,
  Star,
  Activity,
  Calendar,
  Download,
  RefreshCw,
  Filter,
  Eye,
  MousePointer,
  UserCheck,
  Trophy
} from 'lucide-react';
import { Button } from '../ui/button';

interface MetricData {
  label: string;
  value: number | string;
  change: number;
  trend: 'up' | 'down' | 'neutral';
  period: string;
}

interface ChartData {
  period: string;
  value: number;
  secondary?: number;
}

export const AnalyticsDashboard: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [selectedMetric, setSelectedMetric] = useState<'users' | 'engagement' | 'revenue' | 'content'>('users');

  // Mock analytics data
  const keyMetrics: MetricData[] = [
    {
      label: 'Total Users',
      value: '1,247',
      change: 12.5,
      trend: 'up',
      period: 'vs last month'
    },
    {
      label: 'Active Users (30d)',
      value: '892',
      change: 8.3,
      trend: 'up',
      period: 'vs last period'
    },
    {
      label: 'Session Duration',
      value: '24m 32s',
      change: -2.1,
      trend: 'down',
      period: 'average'
    },
    {
      label: 'Mission Completion Rate',
      value: '87.4%',
      change: 5.2,
      trend: 'up',
      period: 'this month'
    },
    {
      label: 'Revenue (MTD)',
      value: '$24,580',
      change: 15.7,
      trend: 'up',
      period: 'vs last month'
    },
    {
      label: 'Mentor Sessions',
      value: '156',
      change: 23.1,
      trend: 'up',
      period: 'this week'
    }
  ];

  const userGrowthData: ChartData[] = [
    { period: 'Week 1', value: 1120, secondary: 89 },
    { period: 'Week 2', value: 1134, secondary: 95 },
    { period: 'Week 3', value: 1198, secondary: 112 },
    { period: 'Week 4', value: 1247, secondary: 134 }
  ];

  const engagementData: ChartData[] = [
    { period: 'Mon', value: 324 },
    { period: 'Tue', value: 398 },
    { period: 'Wed', value: 445 },
    { period: 'Thu', value: 378 },
    { period: 'Fri', value: 289 },
    { period: 'Sat', value: 156 },
    { period: 'Sun', value: 198 }
  ];

  const contentStats = {
    missions: {
      total: 89,
      published: 67,
      draft: 15,
      pending: 7,
      completionRate: 78.5,
      avgRating: 4.3
    },
    territories: {
      total: 12,
      active: 12,
      avgCompetition: 23.4,
      topTerritory: 'Silicon Valley'
    },
    quests: {
      total: 156,
      active: 98,
      completed: 1247,
      totalReward: 45890
    }
  };

  const userDemographics = [
    { label: 'Founders', value: 67, count: 835 },
    { label: 'Mentors', value: 18, count: 224 },
    { label: 'Sponsors', value: 12, count: 150 },
    { label: 'Admins', value: 3, count: 38 }
  ];

  const topPerformers = [
    {
      type: 'mission',
      title: 'Product Strategy Fundamentals',
      metric: '1,247 completions',
      change: '+23%'
    },
    {
      type: 'territory',
      title: 'Silicon Valley',
      metric: '234 active teams',
      change: '+12%'
    },
    {
      type: 'mentor',
      title: 'Sarah Chen',
      metric: '4.9★ (47 sessions)',
      change: '+8 sessions'
    },
    {
      type: 'quest',
      title: 'Customer Discovery Challenge',
      metric: '$2,450 total rewards',
      change: '+15%'
    }
  ];

  const getTrendColor = (trend: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up': return 'text-green-400';
      case 'down': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4" />;
      case 'down': return <TrendingDown className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Analytics Dashboard</h1>
          <p className="text-gray-400 mt-1">
            Platform insights and performance metrics
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-400">Period:</label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as typeof selectedPeriod)}
              className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
          </div>
          
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          
          <Button variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {keyMetrics.map((metric, index) => (
          <div key={index} className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">{metric.label}</span>
              <div className={`flex items-center gap-1 text-xs ${getTrendColor(metric.trend)}`}>
                {getTrendIcon(metric.trend)}
                {Math.abs(metric.change)}%
              </div>
            </div>
            <div className="text-2xl font-bold text-white mb-1">
              {metric.value}
            </div>
            <div className="text-xs text-gray-500">
              {metric.period}
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-white">User Growth</h3>
              <p className="text-sm text-gray-400">Total users and new signups</p>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                <span className="text-gray-400">Total Users</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span className="text-gray-400">New Users</span>
              </div>
            </div>
          </div>
          
          {/* Simple bar chart representation */}
          <div className="space-y-3">
            {userGrowthData.map((data, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="w-16 text-sm text-gray-400">{data.period}</div>
                <div className="flex-1 flex items-center gap-2">
                  <div className="flex-1 bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${(data.value / 1300) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-white w-12">{data.value}</span>
                </div>
                <div className="w-12 text-sm text-green-400">+{data.secondary}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Daily Engagement */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-white">Daily Active Users</h3>
              <p className="text-sm text-gray-400">Last 7 days</p>
            </div>
          </div>
          
          <div className="space-y-3">
            {engagementData.map((data, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="w-12 text-sm text-gray-400">{data.period}</div>
                <div className="flex-1 flex items-center gap-2">
                  <div className="flex-1 bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-purple-500 h-2 rounded-full"
                      style={{ width: `${(data.value / 500) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-white w-12">{data.value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Content Performance */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-bold text-white mb-4">Content Performance</h3>
          
          <div className="space-y-4">
            <div className="border border-gray-600 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Target className="w-5 h-5 text-blue-400" />
                <span className="font-medium text-white">Missions</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-400">Total</div>
                  <div className="text-white font-bold">{contentStats.missions.total}</div>
                </div>
                <div>
                  <div className="text-gray-400">Published</div>
                  <div className="text-green-400 font-bold">{contentStats.missions.published}</div>
                </div>
                <div>
                  <div className="text-gray-400">Completion</div>
                  <div className="text-blue-400 font-bold">{contentStats.missions.completionRate}%</div>
                </div>
                <div>
                  <div className="text-gray-400">Avg Rating</div>
                  <div className="text-yellow-400 font-bold">{contentStats.missions.avgRating}★</div>
                </div>
              </div>
            </div>

            <div className="border border-gray-600 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Trophy className="w-5 h-5 text-green-400" />
                <span className="font-medium text-white">Quests</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-400">Active</div>
                  <div className="text-white font-bold">{contentStats.quests.active}</div>
                </div>
                <div>
                  <div className="text-gray-400">Completed</div>
                  <div className="text-green-400 font-bold">{contentStats.quests.completed}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* User Demographics */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-bold text-white mb-4">User Demographics</h3>
          
          <div className="space-y-4">
            {userDemographics.map((demo, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-blue-500 rounded"></div>
                  <span className="text-white">{demo.label}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-sm text-gray-400">{demo.count} users</div>
                  <div className="text-sm text-white font-medium">{demo.value}%</div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-600">
            <div className="text-sm text-gray-400 mb-2">Distribution</div>
            <div className="flex rounded-lg overflow-hidden h-2">
              {userDemographics.map((demo, index) => (
                <div
                  key={index}
                  className={`${index === 0 ? 'bg-blue-500' : index === 1 ? 'bg-purple-500' : index === 2 ? 'bg-green-500' : 'bg-yellow-500'}`}
                  style={{ width: `${demo.value}%` }}
                ></div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Performers */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-bold text-white mb-4">Top Performers</h3>
          
          <div className="space-y-4">
            {topPerformers.map((performer, index) => (
              <div key={index} className="flex items-center justify-between py-2">
                <div>
                  <div className="text-white font-medium">{performer.title}</div>
                  <div className="text-sm text-gray-400">{performer.metric}</div>
                </div>
                <div className="text-sm text-green-400 font-medium">
                  {performer.change}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Revenue Analytics */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-white">Revenue Analytics</h3>
            <p className="text-sm text-gray-400">Platform monetization overview</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400 mb-1">$24,580</div>
            <div className="text-sm text-gray-400">Total Revenue (MTD)</div>
            <div className="text-xs text-green-400 mt-1">+15.7%</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400 mb-1">$8,940</div>
            <div className="text-sm text-gray-400">Mentor Sessions</div>
            <div className="text-xs text-blue-400 mt-1">+23.1%</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400 mb-1">$12,450</div>
            <div className="text-sm text-gray-400">Quest Rewards</div>
            <div className="text-xs text-purple-400 mt-1">+18.5%</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400 mb-1">$3,190</div>
            <div className="text-sm text-gray-400">Platform Fees</div>
            <div className="text-xs text-yellow-400 mt-1">+12.3%</div>
          </div>
        </div>
      </div>
    </div>
  );
};