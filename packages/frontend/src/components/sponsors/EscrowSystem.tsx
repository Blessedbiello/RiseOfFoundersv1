'use client';

import { useState, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { 
  Shield,
  Wallet,
  DollarSign,
  Clock,
  CheckCircle,
  AlertTriangle,
  Eye,
  ExternalLink,
  ArrowRight,
  Lock,
  Unlock,
  RefreshCw,
  Download,
  FileText,
  Users,
  Award,
  TrendingUp
} from 'lucide-react';
import toast from 'react-hot-toast';

interface EscrowContract {
  id: string;
  questId: string;
  questTitle: string;
  sponsor: {
    id: string;
    name: string;
    walletAddress: string;
  };
  contractAddress: string;
  status: 'pending' | 'funded' | 'locked' | 'judging' | 'released' | 'disputed' | 'refunded';
  amounts: {
    total: number;
    deposited: number;
    released: number;
    remaining: number;
    currency: 'USD' | 'SOL' | 'USDC';
  };
  milestones: Array<{
    id: string;
    description: string;
    amount: number;
    status: 'pending' | 'completed' | 'released';
    completedAt?: string;
    releasedAt?: string;
  }>;
  participants: Array<{
    teamId: string;
    teamName: string;
    walletAddress: string;
    status: 'pending' | 'winner' | 'runner_up' | 'participant';
    allocation?: number;
  }>;
  timeline: {
    created: string;
    funded?: string;
    locked?: string;
    judging_started?: string;
    results_announced?: string;
    fully_released?: string;
  };
  conditions: {
    auto_release: boolean;
    dispute_period_days: number;
    required_signatures: number;
    arbitrators: string[];
  };
  transactions: Array<{
    id: string;
    type: 'deposit' | 'release' | 'refund' | 'dispute';
    amount: number;
    recipient?: string;
    txHash: string;
    timestamp: string;
    status: 'pending' | 'confirmed' | 'failed';
  }>;
}

interface EscrowSystemProps {
  questId?: string;
  mode?: 'sponsor' | 'participant' | 'admin';
}

export const EscrowSystem: React.FC<EscrowSystemProps> = ({ 
  questId, 
  mode = 'participant' 
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'milestones' | 'transactions' | 'disputes'>('overview');
  const [selectedContract, setSelectedContract] = useState<string>('');
  
  const { user } = useAuth();

  // Mock escrow data
  const mockContracts: EscrowContract[] = [
    {
      id: 'escrow_1',
      questId: 'quest_1',
      questTitle: 'AI-Powered Personal Finance Assistant',
      sponsor: {
        id: 'sponsor_1',
        name: 'TechVentures Inc.',
        walletAddress: '8x9y7z6w5v4u3t2s1r0q9p8o7n6m5l4k3j2h1g0f'
      },
      contractAddress: 'Es7rQ9mKnR2pL8vT4aF6yC3uX1nM9sH5bG2dJ7kW',
      status: 'judging',
      amounts: {
        total: 50000,
        deposited: 50000,
        released: 0,
        remaining: 50000,
        currency: 'USDC'
      },
      milestones: [
        {
          id: 'milestone_1',
          description: 'Quest launch and team applications',
          amount: 5000,
          status: 'released',
          completedAt: '2025-01-15T00:00:00Z',
          releasedAt: '2025-01-15T12:00:00Z'
        },
        {
          id: 'milestone_2',
          description: 'Submission deadline reached',
          amount: 10000,
          status: 'completed',
          completedAt: '2025-02-14T23:59:59Z'
        },
        {
          id: 'milestone_3',
          description: 'Judging completed and winners announced',
          amount: 35000,
          status: 'pending'
        }
      ],
      participants: [
        {
          teamId: 'team_alpha',
          teamName: 'Alpha Ventures',
          walletAddress: '7y6x5w4v3u2t1s0r9q8p7o6n5m4l3k2j1h0g9f8e',
          status: 'pending'
        },
        {
          teamId: 'team_beta', 
          teamName: 'Beta Innovations',
          walletAddress: '6x5w4v3u2t1s0r9q8p7o6n5m4l3k2j1h0g9f8e7d',
          status: 'pending'
        },
        {
          teamId: 'team_gamma',
          teamName: 'Gamma Corp',
          walletAddress: '5w4v3u2t1s0r9q8p7o6n5m4l3k2j1h0g9f8e7d6c',
          status: 'pending'
        }
      ],
      timeline: {
        created: '2025-01-10T00:00:00Z',
        funded: '2025-01-12T14:30:00Z',
        locked: '2025-01-15T00:00:00Z',
        judging_started: '2025-02-15T00:00:00Z'
      },
      conditions: {
        auto_release: true,
        dispute_period_days: 7,
        required_signatures: 2,
        arbitrators: ['arbitrator_1', 'arbitrator_2', 'arbitrator_3']
      },
      transactions: [
        {
          id: 'tx_1',
          type: 'deposit',
          amount: 50000,
          txHash: '4m3n2b1v0c9x8z7y6w5t4r3e2q1a0s9d8f7g6h5j4k',
          timestamp: '2025-01-12T14:30:00Z',
          status: 'confirmed'
        },
        {
          id: 'tx_2',
          type: 'release',
          amount: 5000,
          recipient: 'platform_treasury',
          txHash: '3n2b1v0c9x8z7y6w5t4r3e2q1a0s9d8f7g6h5j4k3l',
          timestamp: '2025-01-15T12:00:00Z',
          status: 'confirmed'
        }
      ]
    }
  ];

  const contract = mockContracts.find(c => c.id === selectedContract) || mockContracts[0];

  const getStatusColor = (status: EscrowContract['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'funded': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'locked': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'judging': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'released': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'disputed': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'refunded': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const handleReleasePayment = useCallback(async (milestoneId: string) => {
    try {
      // Mock API call to release milestone payment
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('Payment released successfully!');
    } catch (error) {
      toast.error('Failed to release payment');
    }
  }, []);

  const handleDisputeEscrow = useCallback(async () => {
    try {
      // Mock API call to initiate dispute
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success('Dispute initiated. Arbitrators will be notified.');
    } catch (error) {
      toast.error('Failed to initiate dispute');
    }
  }, []);

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Contract Summary */}
      <div className="bg-gray-800/50 rounded-lg p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-white mb-2">{contract.questTitle}</h3>
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <div className="flex items-center gap-1">
                <Shield className="w-4 h-4" />
                Contract: {contract.contractAddress.slice(0, 8)}...{contract.contractAddress.slice(-8)}
              </div>
              <div className="flex items-center gap-1">
                <ExternalLink className="w-4 h-4" />
                <a href="#" className="hover:text-blue-400">View on Explorer</a>
              </div>
            </div>
          </div>
          
          <div className={`px-3 py-1 rounded border text-sm font-medium ${getStatusColor(contract.status)}`}>
            {contract.status.charAt(0).toUpperCase() + contract.status.slice(1)}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-700/30 rounded">
            <div className="text-2xl font-bold text-green-400">
              {contract.amounts.total.toLocaleString()} {contract.amounts.currency}
            </div>
            <div className="text-sm text-gray-400">Total Amount</div>
          </div>
          
          <div className="text-center p-4 bg-gray-700/30 rounded">
            <div className="text-2xl font-bold text-blue-400">
              {contract.amounts.deposited.toLocaleString()} {contract.amounts.currency}
            </div>
            <div className="text-sm text-gray-400">Deposited</div>
          </div>
          
          <div className="text-center p-4 bg-gray-700/30 rounded">
            <div className="text-2xl font-bold text-purple-400">
              {contract.amounts.released.toLocaleString()} {contract.amounts.currency}
            </div>
            <div className="text-sm text-gray-400">Released</div>
          </div>
          
          <div className="text-center p-4 bg-gray-700/30 rounded">
            <div className="text-2xl font-bold text-yellow-400">
              {contract.amounts.remaining.toLocaleString()} {contract.amounts.currency}
            </div>
            <div className="text-sm text-gray-400">Remaining</div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-gray-800/50 rounded-lg p-6">
        <h4 className="text-lg font-bold text-white mb-4">Timeline</h4>
        
        <div className="space-y-4">
          {Object.entries(contract.timeline).map(([event, timestamp], index) => {
            if (!timestamp) return null;
            
            return (
              <div key={event} className="flex items-center gap-4">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <div className="text-white font-medium capitalize">
                    {event.replace(/_/g, ' ')}
                  </div>
                  <div className="text-sm text-gray-400">
                    {new Date(timestamp).toLocaleString()}
                  </div>
                </div>
              </div>
            );
          })}
          
          {/* Future events */}
          {!contract.timeline.results_announced && (
            <div className="flex items-center gap-4 opacity-50">
              <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                <Clock className="w-4 h-4 text-gray-400" />
              </div>
              <div className="flex-1">
                <div className="text-gray-400 font-medium">Results Announced</div>
                <div className="text-sm text-gray-500">Pending judging completion</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Participants */}
      <div className="bg-gray-800/50 rounded-lg p-6">
        <h4 className="text-lg font-bold text-white mb-4">
          Participants ({contract.participants.length})
        </h4>
        
        <div className="space-y-3">
          {contract.participants.map((participant) => (
            <div key={participant.teamId} className="flex items-center justify-between p-3 bg-gray-700/30 rounded">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-blue-400" />
                <div>
                  <div className="text-white font-medium">{participant.teamName}</div>
                  <div className="text-sm text-gray-400">
                    {participant.walletAddress.slice(0, 8)}...{participant.walletAddress.slice(-8)}
                  </div>
                </div>
              </div>
              
              <div className={`px-2 py-1 rounded text-xs ${
                participant.status === 'winner' ? 'bg-green-500/20 text-green-400' :
                participant.status === 'runner_up' ? 'bg-yellow-500/20 text-yellow-400' :
                participant.status === 'participant' ? 'bg-blue-500/20 text-blue-400' :
                'bg-gray-500/20 text-gray-400'
              }`}>
                {participant.status === 'pending' ? 'Judging' : participant.status.replace('_', ' ')}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Contract Conditions */}
      <div className="bg-gray-800/50 rounded-lg p-6">
        <h4 className="text-lg font-bold text-white mb-4">Contract Conditions</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Auto Release</span>
              <span className="text-white">
                {contract.conditions.auto_release ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Dispute Period</span>
              <span className="text-white">{contract.conditions.dispute_period_days} days</span>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Required Signatures</span>
              <span className="text-white">{contract.conditions.required_signatures}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Arbitrators</span>
              <span className="text-white">{contract.conditions.arbitrators.length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMilestones = () => (
    <div className="space-y-4">
      {contract.milestones.map((milestone, index) => (
        <div key={milestone.id} className="bg-gray-800/50 rounded-lg p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                milestone.status === 'released' ? 'bg-green-500' :
                milestone.status === 'completed' ? 'bg-blue-500' :
                'bg-gray-600'
              }`}>
                {milestone.status === 'released' ? (
                  <CheckCircle className="w-5 h-5 text-white" />
                ) : milestone.status === 'completed' ? (
                  <Clock className="w-5 h-5 text-white" />
                ) : (
                  <Lock className="w-5 h-5 text-white" />
                )}
              </div>
              
              <div className="flex-1">
                <h4 className="text-lg font-bold text-white mb-2">
                  Milestone {index + 1}
                </h4>
                <p className="text-gray-300 mb-3">{milestone.description}</p>
                
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4" />
                    {milestone.amount.toLocaleString()} {contract.amounts.currency}
                  </div>
                  
                  {milestone.completedAt && (
                    <div className="flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      Completed {new Date(milestone.completedAt).toLocaleDateString()}
                    </div>
                  )}
                  
                  {milestone.releasedAt && (
                    <div className="flex items-center gap-1">
                      <Unlock className="w-4 h-4" />
                      Released {new Date(milestone.releasedAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex flex-col gap-2">
              <div className={`px-3 py-1 rounded text-sm font-medium ${
                milestone.status === 'released' ? 'bg-green-500/20 text-green-400' :
                milestone.status === 'completed' ? 'bg-blue-500/20 text-blue-400' :
                'bg-gray-500/20 text-gray-400'
              }`}>
                {milestone.status.charAt(0).toUpperCase() + milestone.status.slice(1)}
              </div>
              
              {mode === 'sponsor' && milestone.status === 'completed' && (
                <Button
                  onClick={() => handleReleasePayment(milestone.id)}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Unlock className="w-4 h-4 mr-2" />
                  Release
                </Button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderTransactions = () => (
    <div className="space-y-4">
      {contract.transactions.map((tx) => (
        <div key={tx.id} className="bg-gray-800/50 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                tx.type === 'deposit' ? 'bg-blue-500' :
                tx.type === 'release' ? 'bg-green-500' :
                tx.type === 'refund' ? 'bg-yellow-500' :
                'bg-red-500'
              }`}>
                {tx.type === 'deposit' ? (
                  <ArrowRight className="w-5 h-5 text-white rotate-180" />
                ) : tx.type === 'release' ? (
                  <ArrowRight className="w-5 h-5 text-white" />
                ) : tx.type === 'refund' ? (
                  <RefreshCw className="w-5 h-5 text-white" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-white" />
                )}
              </div>
              
              <div>
                <div className="text-white font-medium capitalize mb-1">
                  {tx.type} Transaction
                </div>
                <div className="text-sm text-gray-400 mb-2">
                  {tx.amount.toLocaleString()} {contract.amounts.currency}
                  {tx.recipient && ` to ${tx.recipient}`}
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(tx.timestamp).toLocaleString()}
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className={`px-2 py-1 rounded text-xs mb-2 ${
                tx.status === 'confirmed' ? 'bg-green-500/20 text-green-400' :
                tx.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-red-500/20 text-red-400'
              }`}>
                {tx.status}
              </div>
              
              <a
                href={`https://solscan.io/tx/${tx.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 text-xs flex items-center gap-1"
              >
                <ExternalLink className="w-3 h-3" />
                View Tx
              </a>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderDisputes = () => (
    <div className="space-y-6">
      <div className="bg-gray-800/50 rounded-lg p-6">
        <h4 className="text-lg font-bold text-white mb-4">Dispute Resolution</h4>
        
        <div className="space-y-4">
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
              <span className="font-medium text-yellow-400">Dispute Process</span>
            </div>
            <div className="text-sm text-gray-300">
              If there are issues with the quest results or payment distribution, 
              you can initiate a dispute within {contract.conditions.dispute_period_days} days 
              of the results announcement.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-700/30 rounded">
              <Users className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <div className="text-lg font-bold text-white">
                {contract.conditions.arbitrators.length}
              </div>
              <div className="text-sm text-gray-400">Available Arbitrators</div>
            </div>
            
            <div className="text-center p-4 bg-gray-700/30 rounded">
              <FileText className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <div className="text-lg font-bold text-white">
                {contract.conditions.required_signatures}
              </div>
              <div className="text-sm text-gray-400">Required Signatures</div>
            </div>
            
            <div className="text-center p-4 bg-gray-700/30 rounded">
              <Clock className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <div className="text-lg font-bold text-white">
                {contract.conditions.dispute_period_days}
              </div>
              <div className="text-sm text-gray-400">Days to Dispute</div>
            </div>
          </div>

          {contract.status !== 'disputed' && (
            <div className="flex justify-center pt-4">
              <Button
                onClick={handleDisputeEscrow}
                variant="outline"
                className="border-red-500/50 text-red-400 hover:bg-red-500/10"
              >
                <AlertTriangle className="w-4 h-4 mr-2" />
                Initiate Dispute
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Dispute History (if any) */}
      <div className="text-center py-8">
        <FileText className="w-12 h-12 mx-auto text-gray-600 mb-4" />
        <h4 className="text-lg font-medium text-gray-400 mb-2">No Active Disputes</h4>
        <p className="text-sm text-gray-500">
          All payments are proceeding according to schedule
        </p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="w-6 h-6 text-blue-400" />
          <h2 className="text-2xl font-bold text-white">Escrow Protection</h2>
        </div>
        
        {mode === 'sponsor' && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
            <Button variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        )}
      </div>

      {/* Contract Selection */}
      {mockContracts.length > 1 && (
        <div className="bg-gray-800/50 rounded-lg p-4">
          <Label htmlFor="contractSelect">Select Contract</Label>
          <select
            id="contractSelect"
            value={selectedContract}
            onChange={(e) => setSelectedContract(e.target.value)}
            className="mt-1 w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
          >
            {mockContracts.map((contract) => (
              <option key={contract.id} value={contract.id}>
                {contract.questTitle} - {contract.amounts.total.toLocaleString()} {contract.amounts.currency}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-gray-700">
        {(['overview', 'milestones', 'transactions', 'disputes'] as const).map((tab) => (
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
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'milestones' && renderMilestones()}
      {activeTab === 'transactions' && renderTransactions()}
      {activeTab === 'disputes' && renderDisputes()}
    </div>
  );
};