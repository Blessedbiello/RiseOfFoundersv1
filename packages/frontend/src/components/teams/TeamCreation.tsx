'use client';

import { useState, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { 
  Users, 
  Plus, 
  ArrowRight, 
  ArrowLeft, 
  FileText,
  Shield,
  Wallet,
  CheckCircle,
  AlertTriangle,
  Crown,
  Target,
  Zap
} from 'lucide-react';
import { TeamAgreementGenerator } from './TeamAgreementGenerator';
import { MultiSigWalletSetup } from './MultiSigWalletSetup';
import { TeamInviteSystem } from './TeamInviteSystem';
import toast from 'react-hot-toast';

export interface TeamFormData {
  name: string;
  description: string;
  vision: string;
  focus: 'technical' | 'business' | 'marketing' | 'design' | 'mixed';
  size: number;
  equityDistribution: 'equal' | 'merit' | 'investment' | 'custom';
  decisionMaking: 'democratic' | 'founder_led' | 'consensus' | 'delegated';
  vestingPeriod: '1_year' | '2_years' | '4_years' | 'custom';
  commitmentLevel: 'part_time' | 'full_time' | 'project_based';
}

interface TeamCreationProps {
  onComplete: (teamData: any) => void;
  onCancel: () => void;
}

type CreationStep = 'details' | 'structure' | 'agreement' | 'multisig' | 'invite' | 'complete';

export const TeamCreation: React.FC<TeamCreationProps> = ({
  onComplete,
  onCancel
}) => {
  const [currentStep, setCurrentStep] = useState<CreationStep>('details');
  const [formData, setFormData] = useState<TeamFormData>({
    name: '',
    description: '',
    vision: '',
    focus: 'mixed',
    size: 3,
    equityDistribution: 'equal',
    decisionMaking: 'democratic',
    vestingPeriod: '4_years',
    commitmentLevel: 'full_time'
  });
  const [generatedAgreement, setGeneratedAgreement] = useState<string>('');
  const [multiSigConfig, setMultiSigConfig] = useState<any>(null);
  const [invitedMembers, setInvitedMembers] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  const { user } = useAuth();

  const steps: Record<CreationStep, { title: string; description: string }> = {
    details: {
      title: 'Team Details',
      description: 'Define your team\'s identity and mission'
    },
    structure: {
      title: 'Team Structure',
      description: 'Configure roles, equity, and governance'
    },
    agreement: {
      title: 'Legal Framework',
      description: 'Generate AI-powered founding agreements'
    },
    multisig: {
      title: 'Multi-Sig Wallet',
      description: 'Set up team treasury management'
    },
    invite: {
      title: 'Team Assembly',
      description: 'Invite co-founders to join your team'
    },
    complete: {
      title: 'Launch Team',
      description: 'Finalize and launch your founding team'
    }
  };

  const handleFormChange = useCallback((field: keyof TeamFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleNext = useCallback(() => {
    const stepOrder: CreationStep[] = ['details', 'structure', 'agreement', 'multisig', 'invite', 'complete'];
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex < stepOrder.length - 1) {
      setCurrentStep(stepOrder[currentIndex + 1]);
    }
  }, [currentStep]);

  const handlePrevious = useCallback(() => {
    const stepOrder: CreationStep[] = ['details', 'structure', 'agreement', 'multisig', 'invite', 'complete'];
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(stepOrder[currentIndex - 1]);
    }
  }, [currentStep]);

  const handleCreateTeam = useCallback(async () => {
    setIsCreating(true);
    
    try {
      const teamData = {
        ...formData,
        founderId: user?.id,
        agreement: generatedAgreement,
        multiSigConfig,
        invitedMembers,
        createdAt: new Date().toISOString()
      };

      // TODO: Submit to backend
      console.log('Creating team:', teamData);
      
      toast.success('Team created successfully!');
      await onComplete(teamData);
    } catch (error) {
      console.error('Team creation error:', error);
      toast.error('Failed to create team');
    } finally {
      setIsCreating(false);
    }
  }, [formData, generatedAgreement, multiSigConfig, invitedMembers, user, onComplete]);

  const renderStepContent = () => {
    switch (currentStep) {
      case 'details':
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Users className="w-12 h-12 mx-auto text-blue-500 mb-4" />
              <h2 className="text-2xl font-bold text-white">Create Your Founding Team</h2>
              <p className="text-gray-400 mt-2">Start your entrepreneurial journey together</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Team Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleFormChange('name', e.target.value)}
                  placeholder="Enter your team name"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleFormChange('description', e.target.value)}
                  placeholder="What does your team do? What problem are you solving?"
                  rows={3}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="vision">Vision Statement *</Label>
                <Textarea
                  id="vision"
                  value={formData.vision}
                  onChange={(e) => handleFormChange('vision', e.target.value)}
                  placeholder="What's your long-term vision? Where do you see your team in 5 years?"
                  rows={3}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="focus">Primary Focus</Label>
                <select
                  id="focus"
                  value={formData.focus}
                  onChange={(e) => handleFormChange('focus', e.target.value)}
                  className="mt-1 w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="technical">Technical/Engineering</option>
                  <option value="business">Business Development</option>
                  <option value="marketing">Marketing/Growth</option>
                  <option value="design">Design/UX</option>
                  <option value="mixed">Mixed/Full-Stack</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 'structure':
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Crown className="w-12 h-12 mx-auto text-purple-500 mb-4" />
              <h2 className="text-2xl font-bold text-white">Team Structure</h2>
              <p className="text-gray-400 mt-2">Define how your team will operate</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="size">Team Size</Label>
                <select
                  id="size"
                  value={formData.size}
                  onChange={(e) => handleFormChange('size', parseInt(e.target.value))}
                  className="mt-1 w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value={2}>2 members</option>
                  <option value={3}>3 members</option>
                  <option value={4}>4 members</option>
                  <option value={5}>5 members</option>
                  <option value={6}>6+ members</option>
                </select>
              </div>

              <div>
                <Label htmlFor="commitmentLevel">Commitment Level</Label>
                <select
                  id="commitmentLevel"
                  value={formData.commitmentLevel}
                  onChange={(e) => handleFormChange('commitmentLevel', e.target.value)}
                  className="mt-1 w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="part_time">Part-time (20-30 hrs/week)</option>
                  <option value="full_time">Full-time (40+ hrs/week)</option>
                  <option value="project_based">Project-based</option>
                </select>
              </div>

              <div>
                <Label htmlFor="equityDistribution">Equity Distribution</Label>
                <select
                  id="equityDistribution"
                  value={formData.equityDistribution}
                  onChange={(e) => handleFormChange('equityDistribution', e.target.value)}
                  className="mt-1 w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="equal">Equal splits</option>
                  <option value="merit">Merit-based</option>
                  <option value="investment">Investment-weighted</option>
                  <option value="custom">Custom arrangement</option>
                </select>
              </div>

              <div>
                <Label htmlFor="decisionMaking">Decision Making</Label>
                <select
                  id="decisionMaking"
                  value={formData.decisionMaking}
                  onChange={(e) => handleFormChange('decisionMaking', e.target.value)}
                  className="mt-1 w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="democratic">Democratic (majority vote)</option>
                  <option value="founder_led">Founder-led</option>
                  <option value="consensus">Consensus required</option>
                  <option value="delegated">Delegated authority</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="vestingPeriod">Vesting Period</Label>
                <select
                  id="vestingPeriod"
                  value={formData.vestingPeriod}
                  onChange={(e) => handleFormChange('vestingPeriod', e.target.value)}
                  className="mt-1 w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="1_year">1 year cliff</option>
                  <option value="2_years">2 years with cliff</option>
                  <option value="4_years">4 years standard</option>
                  <option value="custom">Custom terms</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 'agreement':
        return (
          <TeamAgreementGenerator
            formData={formData}
            onAgreementGenerated={setGeneratedAgreement}
            generatedAgreement={generatedAgreement}
          />
        );

      case 'multisig':
        return (
          <MultiSigWalletSetup
            teamSize={formData.size}
            onConfigured={setMultiSigConfig}
            config={multiSigConfig}
          />
        );

      case 'invite':
        return (
          <TeamInviteSystem
            teamData={formData}
            onMembersInvited={setInvitedMembers}
            invitedMembers={invitedMembers}
          />
        );

      case 'complete':
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
              <h2 className="text-2xl font-bold text-white">Ready to Launch!</h2>
              <p className="text-gray-400 mt-2">Review and finalize your team setup</p>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Team Name:</span>
                  <div className="text-white font-medium">{formData.name}</div>
                </div>
                <div>
                  <span className="text-gray-400">Focus:</span>
                  <div className="text-white font-medium capitalize">{formData.focus}</div>
                </div>
                <div>
                  <span className="text-gray-400">Size:</span>
                  <div className="text-white font-medium">{formData.size} members</div>
                </div>
                <div>
                  <span className="text-gray-400">Commitment:</span>
                  <div className="text-white font-medium capitalize">{formData.commitmentLevel.replace('_', ' ')}</div>
                </div>
                <div>
                  <span className="text-gray-400">Equity:</span>
                  <div className="text-white font-medium capitalize">{formData.equityDistribution.replace('_', ' ')}</div>
                </div>
                <div>
                  <span className="text-gray-400">Governance:</span>
                  <div className="text-white font-medium capitalize">{formData.decisionMaking.replace('_', ' ')}</div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-700">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <FileText className="w-6 h-6 mx-auto text-blue-400 mb-1" />
                    <div className="text-white text-xs">Legal Agreement</div>
                    <div className="text-gray-400 text-xs">{generatedAgreement ? 'Generated' : 'Pending'}</div>
                  </div>
                  <div className="text-center">
                    <Shield className="w-6 h-6 mx-auto text-green-400 mb-1" />
                    <div className="text-white text-xs">Multi-Sig Wallet</div>
                    <div className="text-gray-400 text-xs">{multiSigConfig ? 'Configured' : 'Pending'}</div>
                  </div>
                  <div className="text-center">
                    <Users className="w-6 h-6 mx-auto text-purple-400 mb-1" />
                    <div className="text-white text-xs">Team Members</div>
                    <div className="text-gray-400 text-xs">{invitedMembers.length} invited</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <div className="flex items-center gap-2 text-blue-400 mb-2">
                <Target className="w-4 h-4" />
                <span className="font-medium">Next Steps</span>
              </div>
              <ul className="text-sm text-gray-300 space-y-1 ml-6">
                <li>• Team members will receive invitations</li>
                <li>• Multi-sig wallet will be deployed</li>
                <li>• Legal agreements will be stored on-chain</li>
                <li>• Team missions and territory battles will unlock</li>
              </ul>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 'details':
        return formData.name.trim() && formData.description.trim() && formData.vision.trim();
      case 'structure':
        return true; // All fields have defaults
      case 'agreement':
        return generatedAgreement.length > 0;
      case 'multisig':
        return multiSigConfig !== null;
      case 'invite':
        return invitedMembers.length > 0;
      case 'complete':
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden border border-white/10">
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-white">Team Creation</h1>
              <p className="text-gray-400">{steps[currentStep].description}</p>
            </div>
            
            <div className="text-right text-sm">
              <div className="text-gray-400">Step</div>
              <div className="text-white font-medium">
                {Object.keys(steps).indexOf(currentStep) + 1} of {Object.keys(steps).length}
              </div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${((Object.keys(steps).indexOf(currentStep) + 1) / Object.keys(steps).length) * 100}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 max-h-[60vh]">
          {renderStepContent()}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10 bg-gray-800/50">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={currentStep === 'details' ? onCancel : handlePrevious}
              disabled={isCreating}
              className="border-white/30 text-white hover:bg-white/10 hover:text-white font-medium"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {currentStep === 'details' ? 'Cancel' : 'Previous'}
            </Button>
            
            <div className="flex gap-3">
              {currentStep === 'complete' ? (
                <Button
                  onClick={handleCreateTeam}
                  disabled={!canProceed() || isCreating}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isCreating ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Creating Team...
                    </div>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      Launch Team
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium"
                >
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};