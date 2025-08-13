import { TeamRole, Timestamps, Metadata } from './common';

export interface Team extends Timestamps {
  id: string;
  name: string;
  description: string;
  emblemUrl?: string;
  foundedAt: Date;
  isActive: boolean;
  
  // Wallet & Treasury
  teamWallet?: string;
  vaultBalance: number;
  
  // Legal
  agreementId?: string;
  
  // Stats
  totalXp: number;
  memberCount: number;
  completedMissions: number;
  territoriesOwned: number;
  
  // Settings
  isPublic: boolean;
  autoAcceptInvites: boolean;
  maxMembers: number;
  
  metadata: Metadata;
}

export interface TeamMember {
  id: string;
  teamId: string;
  userId: string;
  role: TeamRole;
  joinedAt: Date;
  isActive: boolean;
  equity?: number; // percentage
  contributionScore: number;
  permissions: TeamPermissions;
}

export interface TeamPermissions {
  canInviteMembers: boolean;
  canRemoveMembers: boolean;
  canEditAgreement: boolean;
  canManageVault: boolean;
  canInitiateSplit: boolean;
  canManageQuests: boolean;
}

export interface FounderAgreement extends Timestamps {
  id: string;
  teamId: string;
  version: number;
  content: string; // Legal document content
  ipfsHash?: string; // IPFS hash of the document
  onchainTxHash?: string; // Solana transaction hash
  
  // Agreement Terms
  terms: AgreementTerms;
  
  // Signatures
  signatures: AgreementSignature[];
  isFullySigned: boolean;
  
  // Status
  status: 'draft' | 'pending_signatures' | 'active' | 'amended' | 'terminated';
  
  metadata: Metadata;
}

export interface AgreementTerms {
  equitySplit: EquitySplit[];
  vestingSchedule: VestingSchedule;
  roles: RoleDefinition[];
  ipAssignment: string;
  decisionRules: DecisionRules;
  disputeResolution: string;
  buyoutFormula: string;
  terminationClauses: string[];
}

export interface EquitySplit {
  userId: string;
  percentage: number;
  vestingCliff: number; // months
  vestingPeriod: number; // months
}

export interface VestingSchedule {
  cliffPeriod: number; // months
  vestingPeriod: number; // months
  accelerationTriggers: string[];
}

export interface RoleDefinition {
  userId: string;
  role: TeamRole;
  responsibilities: string[];
  timeCommitment: string;
  compensationStructure?: string;
}

export interface DecisionRules {
  majorityThreshold: number; // percentage
  unanimousDecisions: string[];
  tieBreakerMechanism: string;
}

export interface AgreementSignature {
  userId: string;
  walletSignature: string;
  eSignature?: string;
  signedAt: Date;
  ipAddress: string;
}

export interface TeamInvitation extends Timestamps {
  id: string;
  teamId: string;
  invitedUserId: string;
  invitedByUserId: string;
  proposedRole: TeamRole;
  proposedEquity?: number;
  message?: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  expiresAt: Date;
}

export interface TeamSplit extends Timestamps {
  id: string;
  teamId: string;
  initiatedByUserId: string;
  reason: string;
  status: 'proposed' | 'voting' | 'mediation' | 'approved' | 'rejected' | 'completed';
  
  // Split terms
  proposedSplit: SplitProposal;
  votes: SplitVote[];
  mediatorId?: string;
  
  // Asset settlement
  assetDistribution: AssetDistribution[];
  finalizedAt?: Date;
}

export interface SplitProposal {
  departing: DepartingMember[];
  remaining: RemainingSplit[];
  assetValuation: number;
  contributionWeights: ContributionWeight[];
}

export interface DepartingMember {
  userId: string;
  reason: string;
  proposedCompensation: number;
  assetClaims: string[];
}

export interface RemainingSplit {
  userId: string;
  newEquityPercentage: number;
  additionalResponsibilities: string[];
}

export interface ContributionWeight {
  userId: string;
  xpContribution: number;
  codeContribution: number;
  businessContribution: number;
  timeContribution: number; // hours
  revenueContribution: number;
  overallWeight: number;
}

export interface SplitVote {
  userId: string;
  vote: 'approve' | 'reject' | 'abstain';
  comments?: string;
  votedAt: Date;
}

export interface AssetDistribution {
  userId: string;
  assetType: 'tokens' | 'nft' | 'equity' | 'ip';
  assetIdentifier: string;
  amount: number;
  transferTxHash?: string;
}

export interface TeamQuest {
  id: string;
  teamId: string;
  nodeId: string;
  startedAt: Date;
  completedAt?: Date;
  status: 'active' | 'completed' | 'abandoned';
  progress: TeamQuestProgress;
  contributions: MemberContribution[];
}

export interface TeamQuestProgress {
  totalProgress: number;
  requiredProgress: number;
  milestones: QuestMilestone[];
}

export interface QuestMilestone {
  id: string;
  name: string;
  description: string;
  progress: number;
  requiredProgress: number;
  completedAt?: Date;
  completedBy?: string;
}

export interface MemberContribution {
  userId: string;
  contributionType: 'code' | 'design' | 'content' | 'research' | 'testing';
  amount: number;
  artifacts: string[];
  timestamp: Date;
}