export const GAME_CONSTANTS = {
  // XP and Leveling
  BASE_XP_PER_LEVEL: 100,
  XP_MULTIPLIER: 1.5,
  MAX_LEVEL: 100,
  
  // Mission System
  MAX_MISSION_ATTEMPTS: 3,
  MISSION_TIMEOUT_HOURS: 24,
  PEER_REVIEW_COUNT: 3,
  
  // Team System
  MAX_TEAM_SIZE: 8,
  MIN_TEAM_SIZE: 2,
  TEAM_CREATION_COST: 100, // XP cost
  
  // PvP System
  TERRITORY_CONTROL_DURATION_HOURS: 168, // 1 week
  CHALLENGE_ACCEPT_TIMEOUT_HOURS: 24,
  PVP_COOLDOWN_HOURS: 72,
  
  // Mentor System
  SESSION_DURATIONS: [30, 60, 90, 120], // minutes
  MAX_ADVANCE_BOOKING_DAYS: 30,
  MENTOR_TOKEN_BASE_VALUE: 10, // USD equivalent
  
  // Sponsor System
  MIN_QUEST_DURATION_DAYS: 1,
  MAX_QUEST_DURATION_DAYS: 90,
  SPONSOR_REVIEW_TIMEOUT_HOURS: 72,
  
  // Reputation System
  REPUTATION_DECAY_RATE: 0.01, // per day
  MIN_REPUTATION_SCORE: 0,
  MAX_REPUTATION_SCORE: 1000,
  
  // Anti-cheat
  MAX_DAILY_SUBMISSIONS: 10,
  PLAGIARISM_THRESHOLD: 0.8,
  SUSPICIOUS_ACTIVITY_THRESHOLD: 5,
} as const;

export const SKILL_CATEGORIES = {
  TECHNICAL: 'technical',
  BUSINESS: 'business',
  MARKETING: 'marketing',
  COMMUNITY: 'community',
  DESIGN: 'design',
  PRODUCT: 'product',
} as const;

export const DIFFICULTY_LEVELS = {
  BRONZE: 'bronze',
  SILVER: 'silver',
  GOLD: 'gold',
  BOSS: 'boss',
} as const;

export const NODE_TYPES = {
  QUIZ: 'quiz',
  CODE: 'code',
  DEPLOY: 'deploy',
  CONTENT: 'content',
  SOCIAL: 'social',
  BOSS: 'boss',
  SPONSORED: 'sponsored',
} as const;

export const USER_ROLES = {
  PLAYER: 'player',
  MENTOR: 'mentor',
  MODERATOR: 'moderator',
  ADMIN: 'admin',
  SPONSOR: 'sponsor',
} as const;

export const TEAM_ROLES = {
  FOUNDER: 'founder',
  CO_FOUNDER: 'co_founder',
  DEVELOPER: 'developer',
  DESIGNER: 'designer',
  MARKETER: 'marketer',
  ADVISOR: 'advisor',
} as const;

export const ARTIFACT_TYPES = {
  GITHUB_PR: 'github_pr',
  GITHUB_REPO: 'github_repo',
  GITHUB_COMMIT: 'github_commit',
  SOLANA_TX: 'solana_tx',
  URL: 'url',
  TEXT: 'text',
  FILE: 'file',
  VIDEO: 'video',
  IMAGE: 'image',
} as const;

export const SUBMISSION_STATUSES = {
  DRAFT: 'draft',
  SUBMITTED: 'submitted',
  UNDER_REVIEW: 'under_review',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  NEEDS_REVISION: 'needs_revision',
} as const;

export const MISSION_STATUSES = {
  AVAILABLE: 'available',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  FAILED: 'failed',
  LOCKED: 'locked',
} as const;

export const CHALLENGE_TYPES = {
  TERRITORY: 'territory',
  SKILL: 'skill',
  COLLABORATION: 'collaboration',
} as const;

export const NOTIFICATION_TYPES = {
  MISSION_COMPLETED: 'mission_completed',
  TEAM_INVITATION: 'team_invitation',
  CHALLENGE_RECEIVED: 'challenge_received',
  MENTOR_SESSION: 'mentor_session',
  SPONSOR_QUEST: 'sponsor_quest',
  LEVEL_UP: 'level_up',
  BADGE_EARNED: 'badge_earned',
  TERRITORY_LOST: 'territory_lost',
} as const;

export const VERIFICATION_METHODS = {
  AUTOMATIC: 'automatic',
  PEER_REVIEW: 'peer_review',
  MENTOR_REVIEW: 'mentor_review',
  ADMIN_REVIEW: 'admin_review',
} as const;