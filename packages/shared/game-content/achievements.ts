export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'progress' | 'skill' | 'social' | 'special' | 'time_based' | 'competitive';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  points: number;
  requirements: {
    type: 'missions_completed' | 'xp_earned' | 'badges_collected' | 'streak_days' | 'pvp_wins' | 'mentor_sessions' | 'community_contributions' | 'special_event';
    value: number;
    conditions?: {
      timeframe?: number; // in days
      category?: string;
      difficulty?: number;
      consecutive?: boolean;
    };
  };
  rewards: {
    xp: number;
    badges: string[];
    resources: string[];
    specialPerks?: string[];
  };
  isSecret: boolean;
  isActive: boolean;
  createdAt: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'technical' | 'business' | 'leadership' | 'product' | 'design' | 'marketing' | 'special';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  earnConditions: string[];
  associatedMissions?: string[];
  associatedPaths?: string[];
  isStackable: boolean; // Can be earned multiple times
  maxStack?: number;
  createdAt: string;
}

// Core Achievement System
export const achievements: Achievement[] = [
  // Progress Achievements
  {
    id: 'first_steps',
    title: 'First Steps',
    description: 'Complete your very first mission in the Rise of Founders journey',
    icon: '🚀',
    category: 'progress',
    rarity: 'common',
    points: 50,
    requirements: {
      type: 'missions_completed',
      value: 1
    },
    rewards: {
      xp: 100,
      badges: ['newcomer'],
      resources: ['welcome_package'],
      specialPerks: ['forum_access']
    },
    isSecret: false,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'mission_marathon',
    title: 'Mission Marathon',
    description: 'Complete 10 missions in a single day',
    icon: '⚡',
    category: 'progress',
    rarity: 'uncommon',
    points: 200,
    requirements: {
      type: 'missions_completed',
      value: 10,
      conditions: {
        timeframe: 1,
        consecutive: false
      }
    },
    rewards: {
      xp: 500,
      badges: ['speed_learner'],
      resources: ['productivity_boost'],
      specialPerks: ['priority_mentor_booking']
    },
    isSecret: false,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'century_club',
    title: 'Century Club',
    description: 'Complete 100 missions across all maps and learning paths',
    icon: '💯',
    category: 'progress',
    rarity: 'rare',
    points: 1000,
    requirements: {
      type: 'missions_completed',
      value: 100
    },
    rewards: {
      xp: 2500,
      badges: ['century_achiever', 'dedicated_learner'],
      resources: ['advanced_toolkit', 'exclusive_content_access'],
      specialPerks: ['vip_community_access', 'monthly_founder_calls']
    },
    isSecret: false,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z'
  },

  // Skill-Based Achievements
  {
    id: 'code_warrior',
    title: 'Code Warrior',
    description: 'Complete all technical missions in Silicon Valley with perfect scores',
    icon: '⚔️',
    category: 'skill',
    rarity: 'epic',
    points: 1500,
    requirements: {
      type: 'missions_completed',
      value: 5,
      conditions: {
        category: 'technical'
      }
    },
    rewards: {
      xp: 3000,
      badges: ['technical_master', 'perfectionist'],
      resources: ['advanced_dev_tools', 'architecture_blueprints'],
      specialPerks: ['technical_advisor_nomination', 'open_source_credits']
    },
    isSecret: false,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'web3_pioneer',
    title: 'Web3 Pioneer',
    description: 'Master all blockchain and Web3 technologies in Crypto Valley',
    icon: '🌐',
    category: 'skill',
    rarity: 'legendary',
    points: 2500,
    requirements: {
      type: 'missions_completed',
      value: 7,
      conditions: {
        category: 'technical'
      }
    },
    rewards: {
      xp: 5000,
      badges: ['web3_legend', 'blockchain_architect', 'defi_master'],
      resources: ['web3_startup_kit', 'dao_governance_framework'],
      specialPerks: ['web3_advisor_network', 'token_launch_support', 'ecosystem_partnerships']
    },
    isSecret: false,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z'
  },

  // Social Achievements
  {
    id: 'team_player',
    title: 'Team Player',
    description: 'Join a team and complete 5 collaborative missions together',
    icon: '🤝',
    category: 'social',
    rarity: 'common',
    points: 300,
    requirements: {
      type: 'community_contributions',
      value: 5
    },
    rewards: {
      xp: 400,
      badges: ['collaborator'],
      resources: ['team_building_guide'],
      specialPerks: ['team_leader_eligibility']
    },
    isSecret: false,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'mentor_magnet',
    title: 'Mentor Magnet',
    description: 'Complete 10 mentor sessions with 5-star ratings',
    icon: '🌟',
    category: 'social',
    rarity: 'uncommon',
    points: 500,
    requirements: {
      type: 'mentor_sessions',
      value: 10
    },
    rewards: {
      xp: 750,
      badges: ['mentee_excellence'],
      resources: ['advanced_learning_materials'],
      specialPerks: ['premium_mentor_access', 'mentor_recommendation_letters']
    },
    isSecret: false,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'community_champion',
    title: 'Community Champion',
    description: 'Help 50 other founders by answering questions and providing guidance',
    icon: '🏆',
    category: 'social',
    rarity: 'rare',
    points: 800,
    requirements: {
      type: 'community_contributions',
      value: 50
    },
    rewards: {
      xp: 1200,
      badges: ['community_leader', 'helpful_founder'],
      resources: ['leadership_toolkit', 'community_management_guide'],
      specialPerks: ['community_moderator_role', 'featured_founder_profile']
    },
    isSecret: false,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z'
  },

  // Competitive Achievements
  {
    id: 'pitch_champion',
    title: 'Pitch Champion',
    description: 'Win 5 pitch battles in PvP competitions',
    icon: '🥇',
    category: 'competitive',
    rarity: 'rare',
    points: 1200,
    requirements: {
      type: 'pvp_wins',
      value: 5
    },
    rewards: {
      xp: 2000,
      badges: ['pitch_master', 'competitor'],
      resources: ['pitch_optimization_toolkit', 'investor_contact_list'],
      specialPerks: ['demo_day_invitation', 'investor_intro_credits']
    },
    isSecret: false,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'territory_conqueror',
    title: 'Territory Conqueror',
    description: 'Control 3 territories simultaneously for 30 days',
    icon: '🏰',
    category: 'competitive',
    rarity: 'epic',
    points: 2000,
    requirements: {
      type: 'special_event',
      value: 1,
      conditions: {
        timeframe: 30
      }
    },
    rewards: {
      xp: 4000,
      badges: ['territory_master', 'strategic_commander'],
      resources: ['empire_building_guide', 'advanced_pvp_strategies'],
      specialPerks: ['territory_naming_rights', 'strategic_advisor_role']
    },
    isSecret: false,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z'
  },

  // Time-Based Achievements
  {
    id: 'consistency_king',
    title: 'Consistency King',
    description: 'Complete at least one mission every day for 30 consecutive days',
    icon: '📅',
    category: 'time_based',
    rarity: 'uncommon',
    points: 600,
    requirements: {
      type: 'streak_days',
      value: 30,
      conditions: {
        consecutive: true
      }
    },
    rewards: {
      xp: 1000,
      badges: ['consistent_learner', 'discipline_master'],
      resources: ['habit_tracker', 'motivation_toolkit'],
      specialPerks: ['streak_protection_shield', 'priority_support']
    },
    isSecret: false,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'lightning_learner',
    title: 'Lightning Learner',
    description: 'Complete any learning path in under 7 days',
    icon: '⚡',
    category: 'time_based',
    rarity: 'rare',
    points: 1000,
    requirements: {
      type: 'special_event',
      value: 1,
      conditions: {
        timeframe: 7
      }
    },
    rewards: {
      xp: 2000,
      badges: ['speed_demon', 'intensive_learner'],
      resources: ['accelerated_learning_techniques', 'time_management_masterclass'],
      specialPerks: ['fast_track_certification', 'learning_efficiency_coach']
    },
    isSecret: false,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z'
  },

  // Special/Secret Achievements
  {
    id: 'easter_egg_hunter',
    title: 'Easter Egg Hunter',
    description: 'Discover all hidden easter eggs throughout the platform',
    icon: '🥚',
    category: 'special',
    rarity: 'legendary',
    points: 1500,
    requirements: {
      type: 'special_event',
      value: 10
    },
    rewards: {
      xp: 3000,
      badges: ['explorer', 'curiosity_master'],
      resources: ['secret_founder_archives', 'hidden_insights_collection'],
      specialPerks: ['easter_egg_creator_role', 'platform_influence']
    },
    isSecret: true,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'midnight_oil',
    title: 'Burning the Midnight Oil',
    description: 'Complete missions between 12 AM and 4 AM for 7 consecutive nights',
    icon: '🌙',
    category: 'special',
    rarity: 'epic',
    points: 800,
    requirements: {
      type: 'special_event',
      value: 7,
      conditions: {
        consecutive: true
      }
    },
    rewards: {
      xp: 1500,
      badges: ['night_owl', 'dedicated_founder'],
      resources: ['productivity_during_sleep_deprivation_guide', 'energy_management_toolkit'],
      specialPerks: ['night_shift_mentor_access', 'insomnia_support_group']
    },
    isSecret: true,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'perfectionist',
    title: 'The Perfectionist',
    description: 'Achieve 100% completion rate on 25 missions with perfect scores',
    icon: '💎',
    category: 'special',
    rarity: 'legendary',
    points: 3000,
    requirements: {
      type: 'missions_completed',
      value: 25,
      conditions: {
        category: 'perfect_score'
      }
    },
    rewards: {
      xp: 5000,
      badges: ['perfectionist', 'excellence_embodied', 'quality_master'],
      resources: ['perfectionist_methodology', 'quality_assurance_frameworks'],
      specialPerks: ['quality_advisor_role', 'perfectionist_community_access', 'beta_testing_privileges']
    },
    isSecret: false,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z'
  }
];

// Badge System
export const badges: Badge[] = [
  // Technical Badges
  {
    id: 'mvp_builder',
    name: 'MVP Builder',
    description: 'Successfully built and deployed a minimum viable product',
    icon: '🏗️',
    category: 'technical',
    rarity: 'common',
    earnConditions: ['Complete MVP Building mission with deployed product'],
    associatedMissions: ['sv_mvp_building_mission'],
    isStackable: false,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'smart_contract_dev',
    name: 'Smart Contract Developer',
    description: 'Mastered Solidity and smart contract development',
    icon: '📜',
    category: 'technical',
    rarity: 'uncommon',
    earnConditions: ['Complete smart contract mission with deployed contract'],
    associatedMissions: ['cv_smart_contracts_mission'],
    isStackable: false,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'full_stack_master',
    name: 'Full Stack Master',
    description: 'Demonstrated expertise in both frontend and backend development',
    icon: '🌐',
    category: 'technical',
    rarity: 'rare',
    earnConditions: ['Complete advanced full-stack development challenges'],
    associatedPaths: ['tech_founder_path'],
    isStackable: false,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'blockchain_architect',
    name: 'Blockchain Architect',
    description: 'Expert in designing and implementing blockchain solutions',
    icon: '⛓️',
    category: 'technical',
    rarity: 'epic',
    earnConditions: ['Complete multiple blockchain projects with advanced features'],
    associatedPaths: ['web3_entrepreneur_path'],
    isStackable: false,
    createdAt: '2024-01-01T00:00:00Z'
  },

  // Business Badges
  {
    id: 'idea_validator',
    name: 'Idea Validator',
    description: 'Proven ability to validate startup ideas through customer research',
    icon: '✅',
    category: 'business',
    rarity: 'common',
    earnConditions: ['Complete idea validation mission with customer interviews'],
    associatedMissions: ['sv_idea_validation_mission'],
    isStackable: false,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'fundraising_ninja',
    name: 'Fundraising Ninja',
    description: 'Successfully raised significant funding for a startup',
    icon: '💰',
    category: 'business',
    rarity: 'rare',
    earnConditions: ['Complete fundraising mission with term sheet'],
    associatedMissions: ['sv_fundraising'],
    isStackable: true,
    maxStack: 5,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'unicorn_founder',
    name: 'Unicorn Founder',
    description: 'Built a company valued at over $1 billion',
    icon: '🦄',
    category: 'business',
    rarity: 'legendary',
    earnConditions: ['Achieve unicorn status in simulation or real world'],
    associatedMissions: ['sv_exit_strategy'],
    isStackable: false,
    createdAt: '2024-01-01T00:00:00Z'
  },

  // Leadership Badges
  {
    id: 'team_builder',
    name: 'Team Builder',
    description: 'Demonstrated excellence in recruiting and building teams',
    icon: '👥',
    category: 'leadership',
    rarity: 'common',
    earnConditions: ['Successfully build and manage a high-performing team'],
    associatedMissions: ['sv_team_building'],
    isStackable: false,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'culture_creator',
    name: 'Culture Creator',
    description: 'Built strong, positive company culture that drives performance',
    icon: '🌱',
    category: 'leadership',
    rarity: 'uncommon',
    earnConditions: ['Establish company culture framework and values'],
    associatedPaths: ['business_strategy_path'],
    isStackable: false,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'visionary_leader',
    name: 'Visionary Leader',
    description: 'Inspiring leader who guides teams toward breakthrough innovation',
    icon: '🔮',
    category: 'leadership',
    rarity: 'epic',
    earnConditions: ['Lead multiple successful projects and inspire team excellence'],
    associatedPaths: ['business_strategy_path'],
    isStackable: false,
    createdAt: '2024-01-01T00:00:00Z'
  },

  // Product Badges
  {
    id: 'user_whisperer',
    name: 'User Whisperer',
    description: 'Expert at understanding and designing for user needs',
    icon: '👂',
    category: 'product',
    rarity: 'common',
    earnConditions: ['Complete user research and testing with insights'],
    associatedMissions: ['sv_user_testing'],
    isStackable: false,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'product_visionary',
    name: 'Product Visionary',
    description: 'Creates products that define new categories and transform industries',
    icon: '🎯',
    category: 'product',
    rarity: 'legendary',
    earnConditions: ['Launch breakthrough product with significant market impact'],
    associatedPaths: ['product_leadership_path'],
    isStackable: false,
    createdAt: '2024-01-01T00:00:00Z'
  },

  // Marketing Badges
  {
    id: 'growth_hacker',
    name: 'Growth Hacker',
    description: 'Mastered viral growth mechanics and exponential user acquisition',
    icon: '📈',
    category: 'marketing',
    rarity: 'uncommon',
    earnConditions: ['Achieve viral growth coefficient > 1.0'],
    associatedMissions: ['sv_growth_hacking'],
    isStackable: false,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'brand_master',
    name: 'Brand Master',
    description: 'Built memorable brand that resonates deeply with target audience',
    icon: '🎨',
    category: 'marketing',
    rarity: 'rare',
    earnConditions: ['Create brand with high recognition and loyalty metrics'],
    associatedPaths: ['marketing_growth_path'],
    isStackable: false,
    createdAt: '2024-01-01T00:00:00Z'
  },

  // Special Event Badges
  {
    id: 'early_adopter',
    name: 'Early Adopter',
    description: 'Joined the Rise of Founders platform in its first month',
    icon: '🌟',
    category: 'special',
    rarity: 'rare',
    earnConditions: ['Register account before February 1, 2024'],
    isStackable: false,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'beta_tester',
    name: 'Beta Tester',
    description: 'Provided valuable feedback during the platform beta phase',
    icon: '🧪',
    category: 'special',
    rarity: 'uncommon',
    earnConditions: ['Participate in beta testing with feedback submission'],
    isStackable: false,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'community_founder',
    name: 'Community Founder',
    description: 'One of the first 100 members to join the Rise of Founders community',
    icon: '👑',
    category: 'special',
    rarity: 'epic',
    earnConditions: ['Be among first 100 community members'],
    isStackable: false,
    createdAt: '2024-01-01T00:00:00Z'
  }
];

// Utility functions
export const getAchievementById = (achievementId: string): Achievement | undefined => {
  return achievements.find(achievement => achievement.id === achievementId);
};

export const getBadgeById = (badgeId: string): Badge | undefined => {
  return badges.find(badge => badge.id === badgeId);
};

export const getAchievementsByCategory = (category: Achievement['category']): Achievement[] => {
  return achievements.filter(achievement => achievement.category === category);
};

export const getBadgesByCategory = (category: Badge['category']): Badge[] => {
  return badges.filter(badge => badge.category === category);
};

export const getAchievementsByRarity = (rarity: Achievement['rarity']): Achievement[] => {
  return achievements.filter(achievement => achievement.rarity === rarity);
};

export const getSecretAchievements = (): Achievement[] => {
  return achievements.filter(achievement => achievement.isSecret);
};

export const calculateAchievementProgress = (achievement: Achievement, userStats: any): number => {
  const { type, value } = achievement.requirements;
  
  switch (type) {
    case 'missions_completed':
      return Math.min((userStats.missionsCompleted || 0) / value * 100, 100);
    case 'xp_earned':
      return Math.min((userStats.totalXp || 0) / value * 100, 100);
    case 'badges_collected':
      return Math.min((userStats.badgesEarned || 0) / value * 100, 100);
    case 'streak_days':
      return Math.min((userStats.currentStreak || 0) / value * 100, 100);
    case 'pvp_wins':
      return Math.min((userStats.pvpWins || 0) / value * 100, 100);
    case 'mentor_sessions':
      return Math.min((userStats.mentorSessions || 0) / value * 100, 100);
    case 'community_contributions':
      return Math.min((userStats.communityContributions || 0) / value * 100, 100);
    default:
      return 0;
  }
};

export const getEligibleAchievements = (userStats: any): Achievement[] => {
  return achievements.filter(achievement => {
    const progress = calculateAchievementProgress(achievement, userStats);
    return progress >= 100 && achievement.isActive;
  });
};

export const getRecentlyEarnedBadges = (userBadges: string[], timeframe: number = 7): Badge[] => {
  // This would need to be implemented with timestamp tracking in the actual system
  return badges.filter(badge => userBadges.includes(badge.id));
};