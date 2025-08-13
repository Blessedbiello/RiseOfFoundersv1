export const HONEYCOMB_MISSIONS = {
  // Coding Missions
  FIRST_COMMIT: 'first_commit',
  CREATE_REPO: 'create_repo',
  MERGE_PR: 'merge_pr',
  DEPLOY_CONTRACT: 'deploy_contract',
  BUILD_DAPP: 'build_dapp',
  CODE_REVIEW: 'code_review',
  
  // Business Missions
  WRITE_BUSINESS_PLAN: 'write_business_plan',
  MARKET_RESEARCH: 'market_research',
  CUSTOMER_INTERVIEW: 'customer_interview',
  PITCH_DECK: 'pitch_deck',
  MVP_LAUNCH: 'mvp_launch',
  USER_FEEDBACK: 'user_feedback',
  
  // Marketing Missions
  SOCIAL_POST: 'social_post',
  CONTENT_CREATION: 'content_creation',
  COMMUNITY_BUILDING: 'community_building',
  INFLUENCER_OUTREACH: 'influencer_outreach',
  PRODUCT_HUNT: 'product_hunt',
  PR_CAMPAIGN: 'pr_campaign',
  
  // Team Missions
  TEAM_FORMATION: 'team_formation',
  ROLE_DEFINITION: 'role_definition',
  TEAM_COLLABORATION: 'team_collaboration',
  CONFLICT_RESOLUTION: 'conflict_resolution',
  TEAM_BUILDING: 'team_building',
  
  // Capstone Missions
  STARTUP_LAUNCH: 'startup_launch',
  FUNDING_ROUND: 'funding_round',
  ENTERPRISE_CLIENT: 'enterprise_client',
  TEAM_SCALE: 'team_scale',
  EXIT_STRATEGY: 'exit_strategy',
} as const;

export const HONEYCOMB_TRAITS = {
  // Technical Traits
  BUILDER: 'builder',
  ARCHITECT: 'architect',
  DEPLOYER: 'deployer',
  DEBUGGER: 'debugger',
  INNOVATOR: 'innovator',
  
  // Business Traits
  STRATEGIST: 'strategist',
  ANALYST: 'analyst',
  NEGOTIATOR: 'negotiator',
  VISIONARY: 'visionary',
  EXECUTOR: 'executor',
  
  // Marketing Traits
  STORYTELLER: 'storyteller',
  INFLUENCER: 'influencer',
  BRAND_BUILDER: 'brand_builder',
  GROWTH_HACKER: 'growth_hacker',
  COMMUNITY_LEADER: 'community_leader',
  
  // Leadership Traits
  MENTOR: 'mentor',
  COLLABORATOR: 'collaborator',
  MOTIVATOR: 'motivator',
  DECISION_MAKER: 'decision_maker',
  CULTURE_BUILDER: 'culture_builder',
  
  // Product Traits
  USER_ADVOCATE: 'user_advocate',
  DESIGN_THINKER: 'design_thinker',
  PROBLEM_SOLVER: 'problem_solver',
  QUALITY_CHAMPION: 'quality_champion',
  ITERATION_MASTER: 'iteration_master',
} as const;

export const TRAIT_LEVELS = {
  NOVICE: 1,
  APPRENTICE: 2,
  PRACTITIONER: 3,
  EXPERT: 4,
  MASTER: 5,
  GRANDMASTER: 6,
  LEGEND: 7,
} as const;

export const TRAIT_XP_REQUIREMENTS = {
  [TRAIT_LEVELS.NOVICE]: 0,
  [TRAIT_LEVELS.APPRENTICE]: 100,
  [TRAIT_LEVELS.PRACTITIONER]: 300,
  [TRAIT_LEVELS.EXPERT]: 700,
  [TRAIT_LEVELS.MASTER]: 1500,
  [TRAIT_LEVELS.GRANDMASTER]: 3000,
  [TRAIT_LEVELS.LEGEND]: 6000,
} as const;

export const HONEYCOMB_ATTESTATION_TYPES = {
  MISSION_COMPLETION: 'mission_completion',
  TRAIT_MILESTONE: 'trait_milestone',
  TEAM_ACHIEVEMENT: 'team_achievement',
  CAPSTONE_PROJECT: 'capstone_project',
  SPONSOR_CERTIFICATION: 'sponsor_certification',
  MENTOR_ENDORSEMENT: 'mentor_endorsement',
  COMPETITION_WIN: 'competition_win',
  COMMUNITY_CONTRIBUTION: 'community_contribution',
} as const;

export const MISSION_CATEGORIES = {
  TECHNICAL: 'technical',
  BUSINESS: 'business',
  MARKETING: 'marketing',
  PRODUCT: 'product',
  TEAM: 'team',
  COMMUNITY: 'community',
  CAPSTONE: 'capstone',
} as const;

export const MISSION_COMPLEXITY = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced',
  EXPERT: 'expert',
} as const;

export const HONEYCOMB_REWARDS = {
  XP_MULTIPLIERS: {
    BRONZE: 1,
    SILVER: 1.5,
    GOLD: 2.5,
    BOSS: 5,
  },
  TRAIT_XP_BONUSES: {
    FIRST_TIME: 50,
    STREAK_BONUS: 25,
    PERFECT_SCORE: 100,
    TEAM_COLLABORATION: 30,
    MENTOR_GUIDANCE: 20,
  },
  ATTESTATION_TRIGGERS: {
    TRAIT_LEVEL_UP: true,
    MISSION_STREAK: 5,
    PERFECT_SUBMISSIONS: 3,
    TEAM_MILESTONE: true,
    SPONSOR_RECOGNITION: true,
  },
} as const;

export const HONEYCOMB_METADATA_SCHEMAS = {
  MISSION: {
    difficulty: 'string',
    category: 'string',
    artifacts: 'array',
    timeSpent: 'number',
    score: 'number',
  },
  TRAIT: {
    category: 'string',
    level: 'number',
    xp: 'number',
    milestones: 'array',
  },
  ATTESTATION: {
    type: 'string',
    evidence: 'array',
    issuer: 'string',
    validUntil: 'string',
  },
} as const;