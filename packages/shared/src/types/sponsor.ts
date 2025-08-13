import { Timestamps, Metadata } from './common';

export interface Sponsor extends Timestamps {
  id: string;
  organizationName: string;
  contactEmail: string;
  contactName: string;
  website?: string;
  logoUrl?: string;
  description: string;
  
  // Blockchain
  sponsorWallet: string;
  balance: number;
  
  // Branding
  brandColors: BrandColors;
  brandAssets: BrandAssets;
  
  // Settings
  isActive: boolean;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  
  // Stats
  totalQuestsCreated: number;
  totalRewardsDistributed: number;
  totalParticipants: number;
  averageCompletion: number;
  
  metadata: Metadata;
}

export interface BrandColors {
  primary: string;
  secondary: string;
  accent: string;
  background?: string;
}

export interface BrandAssets {
  logo: string;
  banner?: string;
  icon: string;
  customBadges?: CustomBadge[];
}

export interface CustomBadge {
  name: string;
  imageUrl: string;
  description: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface SponsorQuest extends Timestamps {
  id: string;
  sponsorId: string;
  nodeId?: string; // If attached to existing node
  
  // Basic info
  title: string;
  description: string;
  objectives: QuestObjective[];
  
  // Constraints
  maxParticipants?: number;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  
  // Requirements
  requirements: QuestRequirement[];
  eligibilityCriteria: EligibilityCriteria;
  
  // Rewards
  rewardPool: RewardPool;
  rewardDistribution: RewardDistribution;
  
  // Verification
  verificationMethod: 'automatic' | 'manual' | 'hybrid';
  reviewers: string[]; // User IDs of designated reviewers
  
  // Analytics
  participantCount: number;
  completionCount: number;
  totalRewardsDistributed: number;
  
  metadata: Metadata;
}

export interface QuestObjective {
  id: string;
  description: string;
  weight: number; // For scoring
  isRequired: boolean;
  verificationCriteria: VerificationCriteria;
}

export interface VerificationCriteria {
  type: 'github_pr' | 'social_post' | 'deployment' | 'content_creation' | 'custom';
  parameters: { [key: string]: any };
  automatedChecks: AutomatedCheck[];
}

export interface AutomatedCheck {
  type: 'url_check' | 'github_check' | 'blockchain_check' | 'api_call';
  endpoint?: string;
  expectedResponse?: any;
  validationRules: ValidationRule[];
}

export interface ValidationRule {
  field: string;
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'regex';
  value: any;
}

export interface QuestRequirement {
  type: 'skill_level' | 'completed_missions' | 'team_size' | 'geographic' | 'custom';
  value: string | number;
  description: string;
}

export interface EligibilityCriteria {
  minimumXp?: number;
  requiredSkills?: { [skill: string]: number };
  requiredBadges?: string[];
  excludePreviousWinners?: boolean;
  geographicRestrictions?: string[];
  customCriteria?: CustomCriteria[];
}

export interface CustomCriteria {
  name: string;
  description: string;
  validationFunction: string; // JavaScript function as string
}

export interface RewardPool {
  totalBudget: number;
  currency: 'USDC' | 'SOL' | 'CUSTOM';
  customTokenAddress?: string;
  
  // Additional rewards
  nftRewards: NFTRewardConfig[];
  physicalRewards: PhysicalReward[];
  serviceRewards: ServiceReward[];
}

export interface NFTRewardConfig {
  name: string;
  description: string;
  imageUrl: string;
  supply: number;
  isSoulbound: boolean;
  metadata: Metadata;
}

export interface PhysicalReward {
  name: string;
  description: string;
  value: number;
  quantity: number;
  shippingIncluded: boolean;
}

export interface ServiceReward {
  type: 'mentorship' | 'tool_credits' | 'api_access' | 'consulting' | 'custom';
  name: string;
  description: string;
  value: number;
  duration?: string; // e.g., "3 months"
  quantity: number;
}

export interface RewardDistribution {
  type: 'winner_takes_all' | 'top_performers' | 'all_completers' | 'random_lottery' | 'custom';
  positions?: number; // Number of winning positions
  percentages?: number[]; // Percentage distribution for each position
  minimumScore?: number; // Minimum score to be eligible
  customDistribution?: CustomDistribution;
}

export interface CustomDistribution {
  rules: DistributionRule[];
  description: string;
}

export interface DistributionRule {
  condition: string; // JavaScript expression
  reward: RewardAllocation;
}

export interface RewardAllocation {
  percentage: number;
  fixedAmount?: number;
  nftIds?: string[];
  serviceRewardIds?: string[];
}

export interface QuestSubmission extends Timestamps {
  id: string;
  questId: string;
  participantId: string;
  participantType: 'user' | 'team';
  
  // Submission data
  artifacts: QuestArtifact[];
  description: string;
  
  // Scoring
  score?: number;
  maxScore: number;
  objectiveScores: ObjectiveScore[];
  
  // Review
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'needs_revision';
  reviewerId?: string;
  reviewNotes?: string;
  reviewedAt?: Date;
  
  // Verification
  verificationResults: QuestVerificationResult[];
  automatedScore?: number;
  manualScore?: number;
  
  metadata: Metadata;
}

export interface QuestArtifact {
  objectiveId: string;
  type: 'url' | 'file' | 'text' | 'github' | 'transaction';
  name: string;
  value: string;
  description?: string;
  hash?: string;
}

export interface ObjectiveScore {
  objectiveId: string;
  score: number;
  maxScore: number;
  feedback?: string;
}

export interface QuestVerificationResult {
  objectiveId: string;
  artifactId: string;
  method: 'automated' | 'manual';
  status: 'passed' | 'failed' | 'warning';
  score: number;
  details: string;
  verifiedAt: Date;
  verifierId?: string;
}

export interface QuestReward extends Timestamps {
  id: string;
  questId: string;
  submissionId: string;
  recipientId: string;
  recipientType: 'user' | 'team';
  
  // Reward details
  rewardType: 'token' | 'nft' | 'service' | 'physical';
  amount?: number;
  tokenAddress?: string;
  nftId?: string;
  serviceRewardId?: string;
  
  // Distribution
  status: 'pending' | 'distributed' | 'claimed' | 'expired';
  distributionTx?: string;
  claimedAt?: Date;
  expiresAt?: Date;
  
  metadata: Metadata;
}

export interface SponsorAnalytics {
  questId: string;
  period: 'day' | 'week' | 'month' | 'all_time';
  
  // Participation metrics
  totalViews: number;
  totalParticipants: number;
  totalSubmissions: number;
  completionRate: number;
  
  // Quality metrics
  averageScore: number;
  topScore: number;
  averageCompletionTime: number;
  
  // Engagement metrics
  socialShares: number;
  communityFeedback: number;
  participantRating: number;
  
  // Geographic data
  participantsByCountry: { [country: string]: number };
  participantsByRegion: { [region: string]: number };
  
  // Skill distribution
  participantsBySkill: { [skill: string]: number };
  skillLevelDistribution: { [level: string]: number };
  
  // ROI metrics
  costPerParticipant: number;
  costPerCompletion: number;
  brandReachEstimate: number;
  
  metadata: Metadata;
}