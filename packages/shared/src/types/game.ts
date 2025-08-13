import { Coordinates, Difficulty, NodeType, Status, Timestamps, Metadata } from './common';

export interface GameMap extends Timestamps {
  id: string;
  name: string;
  description: string;
  skillTag: string;
  backgroundImageUrl: string;
  isActive: boolean;
  order: number;
  prerequisites: string[];
  nodes: MapNode[];
  metadata: Metadata;
}

export interface MapNode extends Timestamps {
  id: string;
  mapId: string;
  title: string;
  description: string;
  position: Coordinates;
  difficulty: Difficulty;
  nodeType: NodeType;
  order: number;
  estimatedTime: number; // minutes
  isLocked: boolean;
  isPvpEnabled: boolean;
  sponsorId?: string;
  
  // Requirements
  prerequisites: string[];
  artifactRequirements: ArtifactRequirement[];
  
  // Rewards
  rewards: NodeRewards;
  
  // Content
  content: NodeContent;
  
  // State
  completionCount: number;
  averageRating: number;
  metadata: Metadata;
}

export interface ArtifactRequirement {
  type: 'github_pr' | 'github_commit' | 'solana_tx' | 'url' | 'text' | 'file';
  description: string;
  validation: ValidationRule[];
  isRequired: boolean;
}

export interface ValidationRule {
  type: 'regex' | 'url_accessible' | 'github_ownership' | 'solana_signature' | 'min_length';
  value: string;
  errorMessage: string;
}

export interface NodeRewards {
  xp: number;
  skillPoints: SkillPointRewards;
  badges: string[];
  tokens?: TokenReward;
  nft?: NFTReward;
  mentorCredits?: number;
  sponsorRewards?: SponsorReward[];
}

export interface SkillPointRewards {
  technical?: number;
  business?: number;
  marketing?: number;
  community?: number;
  design?: number;
  product?: number;
}

export interface TokenReward {
  amount: number;
  tokenAddress: string;
  tokenSymbol: string;
}

export interface NFTReward {
  name: string;
  description: string;
  imageUrl: string;
  isSoulbound: boolean;
  metadata: Metadata;
}

export interface SponsorReward {
  type: 'credits' | 'access' | 'merchandise' | 'mentorship';
  value: string;
  description: string;
}

export interface NodeContent {
  lesson?: LessonContent;
  quiz?: QuizContent;
  challenge?: ChallengeContent;
}

export interface LessonContent {
  videoUrl?: string;
  textContent?: string;
  codeExamples?: CodeExample[];
  resources: Resource[];
}

export interface QuizContent {
  questions: QuizQuestion[];
  passingScore: number;
  timeLimit?: number; // seconds
}

export interface ChallengeContent {
  instructions: string;
  starterCode?: string;
  testCases?: TestCase[];
  hints: string[];
}

export interface CodeExample {
  language: string;
  code: string;
  explanation: string;
}

export interface Resource {
  title: string;
  url: string;
  type: 'documentation' | 'tutorial' | 'tool' | 'example';
}

export interface QuizQuestion {
  id: string;
  question: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer';
  options?: string[];
  correctAnswer: string | string[];
  explanation: string;
  points: number;
}

export interface TestCase {
  input: any;
  expectedOutput: any;
  description: string;
}

export interface NodeProgress {
  nodeId: string;
  userId: string;
  status: Status;
  score?: number;
  completedAt?: Date;
  attempts: number;
  timeSpent: number; // seconds
  lastAttemptAt: Date;
}

export interface Territory {
  nodeId: string;
  controllerId: string; // user or team ID
  controllerType: 'user' | 'team';
  controlledAt: Date;
  expiresAt?: Date;
  defenseCount: number;
  metadata: Metadata;
}