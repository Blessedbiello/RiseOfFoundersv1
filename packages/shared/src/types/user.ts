import { UserRole, Timestamps, Metadata } from './common';

export interface User extends Timestamps {
  id: string;
  walletAddress: string;
  email?: string;
  githubId?: string;
  githubUsername?: string;
  displayName: string;
  avatarUrl?: string;
  bio?: string;
  role: UserRole;
  xpTotal: number;
  reputationScore: number;
  skillScores: SkillScores;
  preferences: UserPreferences;
  isVerified: boolean;
  lastActive: Date;
  metadata: Metadata;
}

export interface SkillScores {
  technical: number;
  business: number;
  marketing: number;
  community: number;
  design: number;
  product: number;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  notifications: NotificationSettings;
  privacy: PrivacySettings;
  gameplay: GameplaySettings;
}

export interface NotificationSettings {
  email: boolean;
  discord: boolean;
  inApp: boolean;
  missions: boolean;
  teams: boolean;
  mentorship: boolean;
  competitions: boolean;
}

export interface PrivacySettings {
  showProfile: boolean;
  showProgress: boolean;
  showTeams: boolean;
  allowMentorRequests: boolean;
}

export interface GameplaySettings {
  autoAcceptTeamInvites: boolean;
  allowPvpChallenges: boolean;
  preferredDifficulty: 'bronze' | 'silver' | 'gold' | 'adaptive';
}

export interface UserProfile extends User {
  badges: Badge[];
  traits: Trait[];
  achievements: Achievement[];
  stats: UserStats;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  earnedAt: Date;
  metadata: Metadata;
}

export interface Trait {
  id: string;
  key: string;
  name: string;
  level: number;
  maxLevel: number;
  description: string;
  honeycombTraitId?: string;
  metadata: Metadata;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  iconUrl: string;
  unlockedAt: Date;
  progress: number;
  maxProgress: number;
}

export interface UserStats {
  missionsCompleted: number;
  teamsJoined: number;
  pvpWins: number;
  pvpLosses: number;
  mentorSessions: number;
  codeContributions: number;
  socialShares: number;
  totalEarnings: number;
  streakDays: number;
  longestStreak: number;
}