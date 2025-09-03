'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Users, 
  AlertTriangle, 
  Vote, 
  Calculator,
  UserPlus,
  Settings,
  Gavel,
  Coins,
  TrendingUp,
  Clock,
  Award,
  FileText,
  ExternalLink
} from 'lucide-react';

interface TeamData {
  team: {
    id: string;
    name: string;
    description: string;
    memberCount: number;
    totalAssets: {
      xp: number;
      resources: Record<string, number>;
      tokens: number;
    };
    teamMembers: Array<{
      id: string;
      userId: string;
      role: string;
      equity: number;
      joinedAt: string;
      user: {
        id: string;
        displayName: string;
        avatarUrl: string;
      };
    }>;
    agreement: {
      agreementType: string;
      terms: any;
    };
  };
  membership: {
    role: string;
    equity: number;
    permissions: any;
  };
  activeDisputes: number;
  pendingSeparations: number;
}

interface Dispute {
  id: string;
  disputeType: string;
  description: string;
  status: string;
  votingDeadline: string;
  initiator: {
    displayName: string;
  };
  votes: Array<{
    vote: string;
    user: {
      displayName: string;
    };
  }>;
}

interface AssetCalculation {
  memberDistribution: Record<string, {
    xp: number;
    tokens: number;
    resources: Record<string, number>;
    contribution: any;
  }>;
  teamAssets: {
    totalXP: number;
    totalTokens: number;
    totalResources: Record<string, number>;
  };
  agreementType: string;
  formula: {
    xp: string;
    resources: string;
    tokens: string;
  };
}

export default function TeamManagementDashboard() {
  const [teamData, setTeamData] = useState<TeamData | null>(null);
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [assetCalculation, setAssetCalculation] = useState<AssetCalculation | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Dialog states
  const [disputeDialogOpen, setDisputeDialogOpen] = useState(false);
  const [separationDialogOpen, setSeparationDialogOpen] = useState(false);
  const [calculatorDialogOpen, setCalculatorDialogOpen] = useState(false);

  // Form states
  const [disputeForm, setDisputeForm] = useState({
    disputeType: '',
    description: '',
    proposedResolution: '',
    affectedMembers: []
  });

  const [separationForm, setSeparationForm] = useState({
    separationType: '',
    reason: '',
    timeline: 30
  });

  useEffect(() => {
    fetchTeamData();
    fetchDisputes();
  }, []);

  const fetchTeamData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/team-management/my-team');
      const data = await response.json();
      
      if (data.success) {
        setTeamData(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch team data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDisputes = async () => {
    try {
      const response = await fetch('/api/team-management/disputes');
      const data = await response.json();
      
      if (data.success) {
        setDisputes(data.data.disputes);
      }
    } catch (error) {
      console.error('Failed to fetch disputes:', error);
    }
  };

  const calculateAssetDistribution = async (separationType: string) => {
    try {
      const response = await fetch('/api/team-management/separation/calculator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ separationType })
      });
      const data = await response.json();
      
      if (data.success) {
        setAssetCalculation(data.data);
      }
    } catch (error) {
      console.error('Failed to calculate asset distribution:', error);
    }
  };

  const initiateDispute = async () => {
    try {
      const response = await fetch('/api/team-management/disputes/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(disputeForm)
      });
      const data = await response.json();
      
      if (data.success) {
        setDisputeDialogOpen(false);
        setDisputeForm({
          disputeType: '',
          description: '',
          proposedResolution: '',
          affectedMembers: []
        });
        fetchDisputes();
        alert('Dispute initiated successfully!');
      }
    } catch (error) {
      console.error('Failed to initiate dispute:', error);
    }
  };

  const proposeSeparation = async () => {
    if (!assetCalculation) {
      alert('Please calculate asset distribution first');
      return;
    }

    try {
      const response = await fetch('/api/team-management/separation/propose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...separationForm,
          assetDistribution: {
            xpAllocation: Object.fromEntries(
              Object.entries(assetCalculation.memberDistribution).map(([userId, dist]) => [userId, dist.xp])
            ),
            resourceAllocation: Object.fromEntries(
              Object.entries(assetCalculation.memberDistribution).map(([userId, dist]) => [userId, dist.resources])
            ),
            tokenAllocation: Object.fromEntries(
              Object.entries(assetCalculation.memberDistribution).map(([userId, dist]) => [userId, dist.tokens])
            )
          }
        })
      });
      const data = await response.json();
      
      if (data.success) {
        setSeparationDialogOpen(false);
        setSeparationForm({ separationType: '', reason: '', timeline: 30 });
        setAssetCalculation(null);
        fetchTeamData();
        alert(data.data.message);
      }
    } catch (error) {
      console.error('Failed to propose separation:', error);
    }
  };

  const voteOnDispute = async (disputeId: string, vote: string) => {
    try {
      const response = await fetch(`/api/team-management/disputes/${disputeId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vote })
      });
      const data = await response.json();
      
      if (data.success) {
        fetchDisputes();
        alert(data.data.message);
      }
    } catch (error) {
      console.error('Failed to vote on dispute:', error);
    }
  };

  const getDisputeTypeColor = (type: string) => {
    switch (type) {
      case 'RESOURCE_ALLOCATION': return 'bg-blue-100 text-blue-800';
      case 'DECISION_MAKING': return 'bg-green-100 text-green-800';
      case 'EQUITY_SPLIT': return 'bg-orange-100 text-orange-800';
      case 'TEAM_SEPARATION': return 'bg-red-100 text-red-800';
      case 'BREACH_OF_AGREEMENT': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!teamData?.team) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <UserPlus className="h-6 w-6" />
              Join or Create a Team
            </CardTitle>
            <CardDescription>
              Rise of Founders is better with teammates! Create or join a team to unlock collaborative features.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button className="h-20 flex-col gap-2">
                <Users className="h-6 w-6" />
                Create New Team
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-2">
                <ExternalLink className="h-6 w-6" />
                Browse Teams
              </Button>
            </div>
            <Alert>
              <AlertDescription>
                Teams enable collaborative missions, shared resources, dispute resolution, and equitable asset distribution when members decide to part ways.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Users className="h-8 w-8 text-blue-500" />
              {teamData.team.name}
            </h1>
            <p className="text-muted-foreground mt-2">{teamData.team.description}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={teamData.membership.role === 'FOUNDER' ? 'default' : 'outline'}>
              {teamData.membership.role}
            </Badge>
            <Badge variant="outline">
              {teamData.membership.equity}% Equity
            </Badge>
          </div>
        </div>

        {/* Alert for active issues */}
        {(teamData.activeDisputes > 0 || teamData.pendingSeparations > 0) && (
          <Alert className="mt-4 border-orange-200 bg-orange-50">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              Your team has {teamData.activeDisputes} active disputes and {teamData.pendingSeparations} pending separations requiring attention.
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-6 w-6 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Team Members</p>
                <p className="text-xl font-bold">{teamData.team.memberCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-6 w-6 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total XP</p>
                <p className="text-xl font-bold">{teamData.team.totalAssets.xp.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Coins className="h-6 w-6 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Tokens</p>
                <p className="text-xl font-bold">{teamData.team.totalAssets.tokens.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Award className="h-6 w-6 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Resources</p>
                <p className="text-xl font-bold">
                  {Object.values(teamData.team.totalAssets.resources).reduce((sum, val) => sum + val, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="disputes">Disputes {teamData.activeDisputes > 0 && `(${teamData.activeDisputes})`}</TabsTrigger>
          <TabsTrigger value="assets">Assets</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Team Agreement</CardTitle>
                <CardDescription>Current agreement structure and terms</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Agreement Type:</span>
                    <Badge variant="outline">{teamData.team.agreement.agreementType.replace('_', ' ')}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Dispute Resolution:</span>
                    <span className="text-sm">Voting</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Your Equity:</span>
                    <span className="text-sm font-bold">{teamData.membership.equity}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Manage your team and resolve issues</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Dialog open={disputeDialogOpen} onOpenChange={setDisputeDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <Gavel className="h-4 w-4 mr-2" />
                      Initiate Dispute
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Initiate Team Dispute</DialogTitle>
                      <DialogDescription>
                        Start a formal dispute resolution process for team issues.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="disputeType">Dispute Type</Label>
                        <Select value={disputeForm.disputeType} onValueChange={(value) => 
                          setDisputeForm(prev => ({ ...prev, disputeType: value }))
                        }>
                          <SelectTrigger>
                            <SelectValue placeholder="Select dispute type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="RESOURCE_ALLOCATION">Resource Allocation</SelectItem>
                            <SelectItem value="DECISION_MAKING">Decision Making</SelectItem>
                            <SelectItem value="EQUITY_SPLIT">Equity Split</SelectItem>
                            <SelectItem value="TEAM_SEPARATION">Team Separation</SelectItem>
                            <SelectItem value="BREACH_OF_AGREEMENT">Breach of Agreement</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          value={disputeForm.description}
                          onChange={(e) => setDisputeForm(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Describe the issue in detail..."
                          rows={3}
                        />
                      </div>
                      <div>
                        <Label htmlFor="proposedResolution">Proposed Resolution</Label>
                        <Textarea
                          value={disputeForm.proposedResolution}
                          onChange={(e) => setDisputeForm(prev => ({ ...prev, proposedResolution: e.target.value }))}
                          placeholder="Describe your proposed solution..."
                          rows={3}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={initiateDispute} disabled={!disputeForm.disputeType || !disputeForm.description}>
                          Initiate Dispute
                        </Button>
                        <Button variant="outline" onClick={() => setDisputeDialogOpen(false)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog open={calculatorDialogOpen} onOpenChange={setCalculatorDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <Calculator className="h-4 w-4 mr-2" />
                      Calculate Asset Split
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Asset Distribution Calculator</DialogTitle>
                      <DialogDescription>
                        Calculate how assets would be distributed in different scenarios.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Select onValueChange={(value) => calculateAssetDistribution(value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select separation type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="AMICABLE_SPLIT">Amicable Split</SelectItem>
                          <SelectItem value="CONTESTED_SPLIT">Contested Split</SelectItem>
                          <SelectItem value="FOUNDER_EXIT">Founder Exit</SelectItem>
                          <SelectItem value="MEMBER_REMOVAL">Member Removal</SelectItem>
                        </SelectContent>
                      </Select>

                      {assetCalculation && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div className="text-center p-3 bg-blue-50 rounded">
                              <p className="font-semibold text-blue-700">Total XP</p>
                              <p className="text-xl font-bold text-blue-900">{assetCalculation.teamAssets.totalXP.toLocaleString()}</p>
                            </div>
                            <div className="text-center p-3 bg-green-50 rounded">
                              <p className="font-semibold text-green-700">Total Tokens</p>
                              <p className="text-xl font-bold text-green-900">{assetCalculation.teamAssets.totalTokens.toLocaleString()}</p>
                            </div>
                            <div className="text-center p-3 bg-orange-50 rounded">
                              <p className="font-semibold text-orange-700">Total Resources</p>
                              <p className="text-xl font-bold text-orange-900">
                                {Object.values(assetCalculation.teamAssets.totalResources).reduce((sum, val) => sum + val, 0).toLocaleString()}
                              </p>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <h4 className="font-semibold">Member Distribution:</h4>
                            {Object.entries(assetCalculation.memberDistribution).map(([userId, distribution]) => {
                              const member = teamData.team.teamMembers.find(m => m.userId === userId);
                              return (
                                <div key={userId} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                                  <div className="flex items-center gap-3">
                                    <img 
                                      src={member?.user.avatarUrl || '/default-avatar.png'} 
                                      alt={member?.user.displayName}
                                      className="w-8 h-8 rounded-full"
                                    />
                                    <span className="font-medium">{member?.user.displayName}</span>
                                  </div>
                                  <div className="text-sm space-x-4">
                                    <span className="text-blue-600">{distribution.xp.toLocaleString()} XP</span>
                                    <span className="text-green-600">{distribution.tokens.toLocaleString()} Tokens</span>
                                    <span className="text-orange-600">
                                      {Object.values(distribution.resources).reduce((sum, val) => sum + val, 0).toLocaleString()} Resources
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          <Alert>
                            <AlertDescription>
                              <strong>Formula:</strong> {assetCalculation.formula.xp}
                            </AlertDescription>
                          </Alert>
                        </div>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog open={separationDialogOpen} onOpenChange={setSeparationDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="destructive" className="w-full justify-start">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Propose Separation
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Propose Team Separation</DialogTitle>
                      <DialogDescription>
                        This will start a formal process to dissolve or restructure the team.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="separationType">Separation Type</Label>
                        <Select value={separationForm.separationType} onValueChange={(value) => {
                          setSeparationForm(prev => ({ ...prev, separationType: value }));
                          calculateAssetDistribution(value);
                        }}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select separation type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="AMICABLE_SPLIT">Amicable Split</SelectItem>
                            <SelectItem value="CONTESTED_SPLIT">Contested Split</SelectItem>
                            <SelectItem value="FOUNDER_EXIT">Founder Exit</SelectItem>
                            <SelectItem value="MEMBER_REMOVAL">Member Removal</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="timeline">Timeline (days)</Label>
                        <Input
                          type="number"
                          value={separationForm.timeline}
                          onChange={(e) => setSeparationForm(prev => ({ ...prev, timeline: parseInt(e.target.value) }))}
                          min="1"
                          max="90"
                        />
                      </div>
                      <div>
                        <Label htmlFor="reason">Reason (optional)</Label>
                        <Textarea
                          value={separationForm.reason}
                          onChange={(e) => setSeparationForm(prev => ({ ...prev, reason: e.target.value }))}
                          placeholder="Explain the reason for separation..."
                          rows={3}
                        />
                      </div>
                      {assetCalculation && (
                        <Alert>
                          <AlertDescription>
                            Asset distribution calculated. Proceeding will distribute assets according to your team agreement.
                          </AlertDescription>
                        </Alert>
                      )}
                      <div className="flex gap-2">
                        <Button 
                          onClick={proposeSeparation} 
                          disabled={!separationForm.separationType || !assetCalculation}
                          variant="destructive"
                        >
                          Propose Separation
                        </Button>
                        <Button variant="outline" onClick={() => setSeparationDialogOpen(false)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Members Tab */}
        <TabsContent value="members">
          <Card>
            <CardHeader>
              <CardTitle>Team Members ({teamData.team.memberCount})</CardTitle>
              <CardDescription>Manage team membership and roles</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {teamData.team.teamMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <img 
                        src={member.user.avatarUrl || '/default-avatar.png'} 
                        alt={member.user.displayName}
                        className="w-12 h-12 rounded-full"
                      />
                      <div>
                        <h4 className="font-semibold">{member.user.displayName}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant={member.role === 'FOUNDER' ? 'default' : 'outline'}>
                            {member.role}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {member.equity}% equity
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      <p>Joined {new Date(member.joinedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Disputes Tab */}
        <TabsContent value="disputes">
          <Card>
            <CardHeader>
              <CardTitle>Team Disputes</CardTitle>
              <CardDescription>Active and resolved disputes requiring team decisions</CardDescription>
            </CardHeader>
            <CardContent>
              {disputes.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Gavel className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No disputes currently active</p>
                  <p className="text-sm mt-2">Your team is working harmoniously! 🎉</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {disputes.map((dispute) => (
                    <div key={dispute.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={getDisputeTypeColor(dispute.disputeType)}>
                              {dispute.disputeType.replace('_', ' ')}
                            </Badge>
                            <Badge variant={dispute.status === 'OPEN' ? 'destructive' : 'outline'}>
                              {dispute.status}
                            </Badge>
                          </div>
                          <h4 className="font-semibold mb-1">Initiated by {dispute.initiator.displayName}</h4>
                          <p className="text-sm text-muted-foreground mb-2">{dispute.description}</p>
                          <p className="text-xs text-muted-foreground">
                            <Clock className="h-3 w-3 inline mr-1" />
                            Voting deadline: {new Date(dispute.votingDeadline).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="text-sm">
                          <span className="font-medium">Votes:</span> {dispute.votes.length} received
                        </div>
                        {dispute.status === 'OPEN' && (
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              onClick={() => voteOnDispute(dispute.id, 'APPROVE')}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Vote className="h-3 w-3 mr-1" />
                              Approve
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => voteOnDispute(dispute.id, 'REJECT')}
                            >
                              <Vote className="h-3 w-3 mr-1" />
                              Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Assets Tab */}
        <TabsContent value="assets">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Team Assets Overview</CardTitle>
                <CardDescription>Combined assets that would be distributed upon separation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-6 border rounded-lg">
                    <TrendingUp className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                    <p className="font-semibold text-blue-700">Total Team XP</p>
                    <p className="text-2xl font-bold">{teamData.team.totalAssets.xp.toLocaleString()}</p>
                  </div>
                  <div className="text-center p-6 border rounded-lg">
                    <Coins className="h-8 w-8 mx-auto mb-2 text-green-500" />
                    <p className="font-semibold text-green-700">Total Tokens</p>
                    <p className="text-2xl font-bold">{teamData.team.totalAssets.tokens.toLocaleString()}</p>
                  </div>
                  <div className="text-center p-6 border rounded-lg">
                    <Award className="h-8 w-8 mx-auto mb-2 text-orange-500" />
                    <p className="font-semibold text-orange-700">Total Resources</p>
                    <p className="text-2xl font-bold">
                      {Object.values(teamData.team.totalAssets.resources).reduce((sum, val) => sum + val, 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resource Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(teamData.team.totalAssets.resources).map(([resourceType, amount]) => (
                    <div key={resourceType} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <span className="capitalize font-medium">{resourceType.replace('_', ' ')}</span>
                      <Badge variant="outline" className="font-mono">
                        {amount.toLocaleString()}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Team Settings</CardTitle>
              <CardDescription>Manage team configuration and agreement terms</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-semibold">Agreement Type</h4>
                    <p className="text-sm text-muted-foreground">
                      {teamData.team.agreement.agreementType.replace('_', ' ')}
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Modify
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-semibold">Dispute Resolution</h4>
                    <p className="text-sm text-muted-foreground">Team voting with simple majority</p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Configure
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-semibold">Team Agreement</h4>
                    <p className="text-sm text-muted-foreground">View complete legal agreement</p>
                  </div>
                  <Button variant="outline" size="sm">
                    <FileText className="h-4 w-4 mr-2" />
                    View Document
                  </Button>
                </div>

                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Changes to team settings require unanimous consent from all team members.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}