import { SubmissionStatus, Timestamps, Metadata } from './common';

export interface Mission extends Timestamps {
  id: string;
  nodeId: string;
  honeycombMissionId?: string;
  name: string;
  description: string;
  objectives: MissionObjective[];
  requirements: MissionRequirement[];
  rewards: MissionRewards;
  timeLimit?: number; // minutes
  maxAttempts?: number;
  isActive: boolean;
  metadata: Metadata;
}

export interface MissionObjective {
  id: string;
  description: string;
  isRequired: boolean;
  points: number;
  verificationMethod: 'automatic' | 'peer_review' | 'mentor_review';
}

export interface MissionRequirement {
  type: 'skill_level' | 'prerequisite_mission' | 'team_size' | 'tool_access';
  value: string;
  description: string;
}

export interface MissionRewards {
  xp: number;
  skillPoints: { [skill: string]: number };
  badges: string[];
  tokens?: number;
  nftEligible: boolean;
  mentorCredits?: number;
}

export interface Submission extends Timestamps {
  id: string;
  missionId: string;
  submitterType: 'user' | 'team';
  submitterId: string;
  status: SubmissionStatus;
  score?: number;
  maxScore: number;
  
  // Artifacts
  artifacts: SubmissionArtifact[];
  
  // Review
  reviewerId?: string;
  reviewNotes?: string;
  reviewedAt?: Date;
  
  // Verification
  verificationResults: VerificationResult[];
  honeycombResult?: HoneycombMissionResult;
  
  // Attempt tracking
  attemptNumber: number;
  timeSpent: number; // seconds
  
  metadata: Metadata;
}

export interface SubmissionArtifact {
  id: string;
  type: 'github_pr' | 'github_repo' | 'solana_tx' | 'url' | 'text' | 'file';
  name: string;
  description?: string;
  value: string; // URL, text content, or file path
  hash?: string; // For integrity verification
  size?: number; // For files
  mimeType?: string; // For files
  uploadedAt: Date;
}

export interface VerificationResult {
  artifactId: string;
  verifierType: 'github' | 'solana' | 'url' | 'plagiarism' | 'code_quality';
  status: 'pending' | 'passed' | 'failed' | 'error';
  score?: number;
  details: VerificationDetails;
  verifiedAt: Date;
}

export interface VerificationDetails {
  message: string;
  data?: any;
  errors?: string[];
  warnings?: string[];
}

export interface HoneycombMissionResult {
  transactionHash?: string;
  missionId: string;
  playerId: string;
  completedAt: Date;
  metadata: any;
  traitUpdates?: TraitUpdate[];
}

export interface TraitUpdate {
  traitId: string;
  oldLevel: number;
  newLevel: number;
  xpGained: number;
}

export interface PeerReview extends Timestamps {
  id: string;
  submissionId: string;
  reviewerId: string;
  score: number;
  maxScore: number;
  feedback: ReviewFeedback;
  status: 'pending' | 'completed' | 'disputed';
  timeSpent: number; // seconds
}

export interface ReviewFeedback {
  overall: string;
  strengths: string[];
  improvements: string[];
  technicalQuality?: number;
  creativity?: number;
  documentation?: number;
  usability?: number;
}

export interface Challenge extends Timestamps {
  id: string;
  nodeId: string;
  challengerId: string;
  defenderId: string;
  challengerType: 'user' | 'team';
  defenderType: 'user' | 'team';
  
  // Challenge details
  type: 'territory' | 'skill' | 'collaboration';
  stakeAmount?: number;
  description: string;
  
  // Status
  status: 'pending' | 'accepted' | 'declined' | 'in_progress' | 'judging' | 'completed' | 'cancelled';
  
  // Timing
  acceptDeadline: Date;
  submissionDeadline?: Date;
  
  // Submissions
  challengerSubmission?: string; // submission ID
  defenderSubmission?: string; // submission ID
  
  // Judging
  judges: ChallengeJudge[];
  verdict?: ChallengeVerdict;
  
  metadata: Metadata;
}

export interface ChallengeJudge {
  userId: string;
  vote?: 'challenger' | 'defender' | 'tie';
  reasoning?: string;
  votedAt?: Date;
}

export interface ChallengeVerdict {
  winnerId: string;
  winnerType: 'user' | 'team';
  decision: 'challenger' | 'defender' | 'tie';
  finalScore: { challenger: number; defender: number };
  reasoning: string;
  decidedAt: Date;
  rewards: ChallengeRewards;
}

export interface ChallengeRewards {
  winner: {
    xp: number;
    reputation: number;
    territoryControl?: string; // node ID
    tokens?: number;
  };
  loser: {
    xp: number;
    reputation: number;
  };
  judges: {
    xp: number;
    tokens?: number;
  };
}