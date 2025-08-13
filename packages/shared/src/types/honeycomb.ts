import { Metadata } from './common';

// Honeycomb Protocol integration types
export interface HoneycombConfig {
  apiKey: string;
  projectId: string;
  environment: 'development' | 'production';
  rpcUrl: string;
}

export interface HoneycombMission {
  id: string;
  name: string;
  description: string;
  requirements: HoneycombRequirement[];
  rewards: HoneycombReward[];
  delegateAuthority?: string;
  metadata: Metadata;
}

export interface HoneycombRequirement {
  type: 'trait_level' | 'mission_completion' | 'time_elapsed' | 'custom';
  value: string | number;
  description: string;
}

export interface HoneycombReward {
  type: 'xp' | 'trait_update' | 'badge' | 'custom';
  amount?: number;
  traitId?: string;
  metadata?: Metadata;
}

export interface HoneycombTrait {
  id: string;
  name: string;
  description: string;
  category: string;
  maxLevel: number;
  leveling: TraitLevelingConfig;
  metadata: Metadata;
}

export interface TraitLevelingConfig {
  type: 'linear' | 'exponential' | 'custom';
  baseXp: number;
  multiplier?: number;
  customLevels?: number[];
}

export interface HoneycombPlayer {
  id: string;
  walletAddress: string;
  traits: PlayerTrait[];
  missions: PlayerMission[];
  attestations: PlayerAttestation[];
  metadata: Metadata;
}

export interface PlayerTrait {
  traitId: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  unlockedAt: Date;
  lastUpdated: Date;
}

export interface PlayerMission {
  missionId: string;
  status: 'available' | 'in_progress' | 'completed' | 'failed';
  startedAt?: Date;
  completedAt?: Date;
  attempts: number;
  score?: number;
  metadata: Metadata;
}

export interface PlayerAttestation {
  id: string;
  type: 'mission_completion' | 'trait_milestone' | 'achievement' | 'custom';
  data: AttestationData;
  transactionHash?: string;
  createdAt: Date;
  metadata: Metadata;
}

export interface AttestationData {
  title: string;
  description: string;
  evidence: EvidenceItem[];
  issuer: string;
  recipient: string;
  validFrom: Date;
  validTo?: Date;
}

export interface EvidenceItem {
  type: 'url' | 'hash' | 'transaction' | 'metadata';
  value: string;
  description: string;
}

// Client interface for Honeycomb operations
export interface HoneycombClient {
  // Mission operations
  createMission(mission: Omit<HoneycombMission, 'id'>): Promise<HoneycombMission>;
  getMission(id: string): Promise<HoneycombMission>;
  completeMission(missionId: string, playerId: string, evidence?: EvidenceItem[]): Promise<MissionCompletionResult>;
  
  // Trait operations
  createTrait(trait: Omit<HoneycombTrait, 'id'>): Promise<HoneycombTrait>;
  updatePlayerTrait(playerId: string, traitId: string, xpGain: number): Promise<TraitUpdateResult>;
  getPlayerTrait(playerId: string, traitId: string): Promise<PlayerTrait>;
  
  // Player operations
  createPlayer(walletAddress: string, metadata?: Metadata): Promise<HoneycombPlayer>;
  getPlayer(playerId: string): Promise<HoneycombPlayer>;
  updatePlayer(playerId: string, updates: Partial<HoneycombPlayer>): Promise<HoneycombPlayer>;
  
  // Attestation operations
  createAttestation(attestation: Omit<PlayerAttestation, 'id' | 'createdAt'>): Promise<PlayerAttestation>;
  getAttestations(playerId: string): Promise<PlayerAttestation[]>;
  
  // Bulk operations
  batchCreateMissions(missions: Omit<HoneycombMission, 'id'>[]): Promise<HoneycombMission[]>;
  batchUpdateTraits(updates: TraitBatchUpdate[]): Promise<TraitUpdateResult[]>;
}

export interface MissionCompletionResult {
  success: boolean;
  transactionHash?: string;
  rewards: RewardResult[];
  traitUpdates: TraitUpdateResult[];
  errors?: string[];
}

export interface TraitUpdateResult {
  traitId: string;
  playerId: string;
  oldLevel: number;
  newLevel: number;
  xpGained: number;
  totalXp: number;
  leveledUp: boolean;
  transactionHash?: string;
}

export interface RewardResult {
  type: string;
  amount?: number;
  description: string;
  transactionHash?: string;
  metadata?: Metadata;
}

export interface TraitBatchUpdate {
  playerId: string;
  traitId: string;
  xpGain: number;
  metadata?: Metadata;
}

// Configuration for different mission types
export interface MissionTypeConfig {
  code: {
    requiredFiles: string[];
    allowedLanguages: string[];
    testFramework?: string;
    qualityThreshold: number;
  };
  social: {
    platforms: string[];
    minimumEngagement: number;
    hashtagRequirements: string[];
  };
  deploy: {
    networks: string[];
    contractTypes: string[];
    verificationRequired: boolean;
  };
  content: {
    minimumWordCount: number;
    requiredSections: string[];
    plagiarismThreshold: number;
  };
}

// Events emitted by Honeycomb integration
export interface HoneycombEvent {
  type: 'mission_completed' | 'trait_updated' | 'attestation_created' | 'player_created';
  playerId: string;
  data: any;
  timestamp: Date;
  transactionHash?: string;
}