'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Crown, 
  Zap, 
  Target, 
  Coins, 
  Users, 
  Clock, 
  TrendingUp, 
  Award,
  Sword,
  Shield,
  Hammer,
  Sparkles
} from 'lucide-react';

interface Character {
  id: string;
  name: string;
  kingdom: string;
  characterClass: string;
  level: number;
  experience: number;
  nextLevelXP: number;
  stats: {
    technical: number;
    business: number;
    marketing: number;
    community: number;
    design: number;
    product: number;
  };
  equipment: any[];
}

interface ResourceInventory {
  [key: string]: number;
}

interface Mission {
  id: string;
  title: string;
  description: string;
  type: 'DAILY' | 'WEEKLY' | 'TIMED' | 'CHAIN' | 'TEAM';
  rewards: any[];
  timeRemaining?: number;
  isCompleted: boolean;
  isExpired: boolean;
}

interface StakingPool {
  id: string;
  name: string;
  type: string;
  apy: number;
  minStake: number;
  userStaked: number;
  totalStaked: number;
  rewards: number;
}

interface DashboardData {
  character: Character | null;
  resources: ResourceInventory;
  missions: {
    daily: Mission[];
    weekly: Mission[];
    timed: Mission[];
    active: Mission[];
  };
  staking: {
    pools: StakingPool[];
    totalStaked: number;
    totalRewards: number;
  };
  summary: {
    totalXP: number;
    totalResources: number;
    completedMissions: number;
    activeStakes: number;
  };
}

export default function HoneycombDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Parallel fetch all dashboard data
      const [characterRes, resourcesRes, missionsRes, stakingRes] = await Promise.all([
        fetch('/api/characters/profile'),
        fetch('/api/resources/inventory'),
        fetch('/api/missions/enhanced/available'),
        fetch('/api/staking/pools')
      ]);

      const character = characterRes.ok ? await characterRes.json() : null;
      const resources = resourcesRes.ok ? await resourcesRes.json() : { data: { inventory: {} } };
      const missions = missionsRes.ok ? await missionsRes.json() : { data: { daily: [], weekly: [], timed: [], active: [] } };
      const staking = stakingRes.ok ? await stakingRes.json() : { data: { pools: [], userPools: [] } };

      // Calculate summary statistics
      const totalResources = Object.values(resources.data.inventory).reduce((sum: number, amount: any) => sum + amount, 0);
      const completedMissionsCount = [...missions.data.daily, ...missions.data.weekly, ...missions.data.timed]
        .filter((m: Mission) => m.isCompleted).length;
      const totalStaked = staking.data.userPools?.reduce((sum: number, pool: any) => sum + pool.userStaked, 0) || 0;
      const totalRewards = staking.data.userPools?.reduce((sum: number, pool: any) => sum + pool.rewards, 0) || 0;

      setDashboardData({
        character: character?.data || null,
        resources: resources.data.inventory || {},
        missions: {
          daily: missions.data.daily || [],
          weekly: missions.data.weekly || [],
          timed: missions.data.timed || [],
          active: missions.data.activeMissions || []
        },
        staking: {
          pools: staking.data.pools || [],
          totalStaked,
          totalRewards
        },
        summary: {
          totalXP: character?.data?.experience || 0,
          totalResources,
          completedMissions: completedMissionsCount,
          activeStakes: staking.data.userPools?.length || 0
        }
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatTimeRemaining = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const getKingdomIcon = (kingdom: string) => {
    switch (kingdom) {
      case 'SILICON_VALLEY': return '🏙️';
      case 'DIGITAL_NOMADS': return '🌍';
      case 'CRYPTO_PIONEERS': return '₿';
      case 'GREEN_INNOVATORS': return '🌱';
      case 'HEALTH_REVOLUTIONARIES': return '🏥';
      default: return '👑';
    }
  };

  const getMissionTypeColor = (type: string) => {
    switch (type) {
      case 'DAILY': return 'text-blue-400 bg-blue-900/20';
      case 'WEEKLY': return 'text-green-400 bg-green-900/20';
      case 'TIMED': return 'text-orange-400 bg-orange-900/20';
      case 'CHAIN': return 'text-purple-400 bg-purple-900/20';
      case 'TEAM': return 'text-pink-400 bg-pink-900/20';
      default: return 'text-gray-400 bg-gray-900/20';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <Alert className="max-w-2xl mx-auto mt-8">
        <AlertDescription>
          {error || 'Failed to load dashboard data'}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Sparkles className="h-8 w-8 text-yellow-500" />
          <h1 className="text-3xl font-bold">Honeycomb Protocol Dashboard</h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Your complete Rise of Founders journey powered by Honeycomb Protocol
        </p>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="bg-gradient-to-br from-blue-900/20 to-blue-800/10 border-blue-800/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Zap className="h-6 w-6 text-blue-400" />
              <div>
                <p className="text-sm text-muted-foreground">Total XP</p>
                <p className="text-xl font-bold">{dashboardData.summary.totalXP.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-900/20 to-green-800/10 border-green-800/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Hammer className="h-6 w-6 text-green-400" />
              <div>
                <p className="text-sm text-muted-foreground">Resources</p>
                <p className="text-xl font-bold">{dashboardData.summary.totalResources.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-900/20 to-orange-800/10 border-orange-800/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Target className="h-6 w-6 text-orange-400" />
              <div>
                <p className="text-sm text-muted-foreground">Missions</p>
                <p className="text-xl font-bold">{dashboardData.summary.completedMissions}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-900/20 to-purple-800/10 border-purple-800/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Coins className="h-6 w-6 text-purple-400" />
              <div>
                <p className="text-sm text-muted-foreground">Active Stakes</p>
                <p className="text-xl font-bold">{dashboardData.summary.activeStakes}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 bg-muted/50">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Crown className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="character" className="flex items-center gap-2">
            <Sword className="h-4 w-4" />
            Character
          </TabsTrigger>
          <TabsTrigger value="resources" className="flex items-center gap-2">
            <Hammer className="h-4 w-4" />
            Resources
          </TabsTrigger>
          <TabsTrigger value="missions" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Missions
          </TabsTrigger>
          <TabsTrigger value="staking" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Staking
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Character Summary */}
            {dashboardData.character && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-2xl">{getKingdomIcon(dashboardData.character.kingdom)}</span>
                    Your Character
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <p className="font-semibold text-lg">{dashboardData.character.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Level {dashboardData.character.level} {dashboardData.character.characterClass}
                      </p>
                    </div>
                    <Badge variant="outline">{dashboardData.character.kingdom.replace('_', ' ')}</Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>XP Progress</span>
                      <span>{dashboardData.character.experience} / {dashboardData.character.nextLevelXP}</span>
                    </div>
                    <Progress 
                      value={(dashboardData.character.experience / dashboardData.character.nextLevelXP) * 100} 
                      className="h-2"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Technical:</span>
                      <span className="font-medium">{dashboardData.character.stats.technical}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Business:</span>
                      <span className="font-medium">{dashboardData.character.stats.business}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dashboardData.missions.active.slice(0, 3).map((mission, index) => (
                    <div key={mission.id} className="flex items-center gap-3 p-2 rounded-md bg-muted/30">
                      <Badge className={getMissionTypeColor(mission.type)} variant="outline">
                        {mission.type}
                      </Badge>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{mission.title}</p>
                        {mission.timeRemaining && (
                          <p className="text-xs text-muted-foreground">
                            {formatTimeRemaining(mission.timeRemaining)} remaining
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                  {dashboardData.missions.active.length === 0 && (
                    <p className="text-muted-foreground text-center py-4">No active missions</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Resource Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hammer className="h-5 w-5" />
                Resource Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                {Object.entries(dashboardData.resources).map(([resourceType, amount]) => (
                  <div key={resourceType} className="text-center p-3 rounded-md bg-muted/30">
                    <p className="text-2xl font-bold text-blue-400">{amount}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {resourceType.replace('_', ' ')}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Staking Summary */}
          {dashboardData.staking.totalStaked > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Staking Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 rounded-md bg-purple-900/20">
                    <p className="text-2xl font-bold text-purple-400">
                      {dashboardData.staking.totalStaked.toLocaleString()}
                    </p>
                    <p className="text-sm text-muted-foreground">Total Staked</p>
                  </div>
                  <div className="text-center p-4 rounded-md bg-green-900/20">
                    <p className="text-2xl font-bold text-green-400">
                      {dashboardData.staking.totalRewards.toFixed(2)}
                    </p>
                    <p className="text-sm text-muted-foreground">Pending Rewards</p>
                  </div>
                  <div className="text-center p-4 rounded-md bg-blue-900/20">
                    <p className="text-2xl font-bold text-blue-400">{dashboardData.summary.activeStakes}</p>
                    <p className="text-sm text-muted-foreground">Active Pools</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Character Tab */}
        <TabsContent value="character">
          {dashboardData.character ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Character Profile</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-6xl mb-2">{getKingdomIcon(dashboardData.character.kingdom)}</div>
                    <h3 className="text-xl font-bold">{dashboardData.character.name}</h3>
                    <p className="text-muted-foreground">
                      Level {dashboardData.character.level} {dashboardData.character.characterClass}
                    </p>
                    <Badge variant="outline" className="mt-2">
                      {dashboardData.character.kingdom.replace('_', ' ')}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Experience Progress</span>
                      <span>{dashboardData.character.experience} / {dashboardData.character.nextLevelXP}</span>
                    </div>
                    <Progress 
                      value={(dashboardData.character.experience / dashboardData.character.nextLevelXP) * 100} 
                      className="h-3"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Character Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(dashboardData.character.stats).map(([stat, value]) => (
                      <div key={stat} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="capitalize">{stat}</span>
                          <span className="font-medium">{value}/100</span>
                        </div>
                        <Progress value={value} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground mb-4">No character found</p>
                <Button>Create Character</Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Resources Tab */}
        <TabsContent value="resources">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Resource Inventory</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(dashboardData.resources).map(([resourceType, amount]) => (
                    <div key={resourceType} className="flex items-center justify-between p-3 rounded-md bg-muted/30">
                      <span className="capitalize">{resourceType.replace('_', ' ')}</span>
                      <Badge variant="outline" className="font-mono">
                        {amount.toLocaleString()}
                      </Badge>
                    </div>
                  ))}
                  {Object.keys(dashboardData.resources).length === 0 && (
                    <p className="text-center text-muted-foreground py-4">No resources available</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" variant="outline">
                  <Hammer className="h-4 w-4 mr-2" />
                  Craft Items
                </Button>
                <Button className="w-full" variant="outline">
                  <Users className="h-4 w-4 mr-2" />
                  Trade Resources
                </Button>
                <Button className="w-full" variant="outline">
                  <Award className="h-4 w-4 mr-2" />
                  Upgrade Equipment
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Missions Tab */}
        <TabsContent value="missions">
          <div className="space-y-6">
            {['daily', 'weekly', 'timed'].map((missionType) => (
              <Card key={missionType}>
                <CardHeader>
                  <CardTitle className="capitalize flex items-center gap-2">
                    {missionType === 'daily' && <Clock className="h-5 w-5 text-blue-400" />}
                    {missionType === 'weekly' && <Target className="h-5 w-5 text-green-400" />}
                    {missionType === 'timed' && <Zap className="h-5 w-5 text-orange-400" />}
                    {missionType} Missions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3">
                    {dashboardData.missions[missionType as keyof typeof dashboardData.missions].map((mission) => (
                      <div key={mission.id} className="flex items-center gap-4 p-4 rounded-md bg-muted/30">
                        <div className="flex-1">
                          <h4 className="font-medium">{mission.title}</h4>
                          <p className="text-sm text-muted-foreground">{mission.description}</p>
                          {mission.timeRemaining && (
                            <p className="text-xs text-orange-400 mt-1">
                              {formatTimeRemaining(mission.timeRemaining)} remaining
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={mission.isCompleted ? 'default' : mission.isExpired ? 'destructive' : 'outline'}
                          >
                            {mission.isCompleted ? 'Complete' : mission.isExpired ? 'Expired' : 'Available'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                    {dashboardData.missions[missionType as keyof typeof dashboardData.missions].length === 0 && (
                      <p className="text-center text-muted-foreground py-4">
                        No {missionType} missions available
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Staking Tab */}
        <TabsContent value="staking">
          <div className="space-y-6">
            {dashboardData.staking.totalStaked > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Staking Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 rounded-md bg-purple-900/20">
                      <p className="text-3xl font-bold text-purple-400">
                        {dashboardData.staking.totalStaked.toLocaleString()}
                      </p>
                      <p className="text-sm text-muted-foreground">Total Characters Staked</p>
                    </div>
                    <div className="text-center p-4 rounded-md bg-green-900/20">
                      <p className="text-3xl font-bold text-green-400">
                        {dashboardData.staking.totalRewards.toFixed(4)}
                      </p>
                      <p className="text-sm text-muted-foreground">Pending Rewards</p>
                    </div>
                    <div className="text-center p-4 rounded-md bg-blue-900/20">
                      <p className="text-3xl font-bold text-blue-400">{dashboardData.summary.activeStakes}</p>
                      <p className="text-sm text-muted-foreground">Active Pool Participations</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Available Staking Pools</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboardData.staking.pools.map((pool) => (
                    <div key={pool.id} className="flex items-center justify-between p-4 rounded-md bg-muted/30">
                      <div>
                        <h4 className="font-medium">{pool.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {pool.apy}% APY • Min: {pool.minStake} characters
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {pool.userStaked > 0 ? `${pool.userStaked} staked` : 'Not participating'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {pool.totalStaked.toLocaleString()} total
                        </p>
                      </div>
                    </div>
                  ))}
                  {dashboardData.staking.pools.length === 0 && (
                    <p className="text-center text-muted-foreground py-4">No staking pools available</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}