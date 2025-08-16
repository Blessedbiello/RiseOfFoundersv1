export interface LearningPath {
  id: string;
  title: string;
  description: string;
  category: 'technical' | 'business' | 'leadership' | 'product' | 'design' | 'marketing';
  difficulty: 1 | 2 | 3 | 4 | 5;
  estimatedHours: number;
  prerequisites: string[];
  outcomes: string[];
  skills: string[];
  missions: string[];
  milestones: {
    id: string;
    title: string;
    description: string;
    requiredMissions: string[];
    rewards: {
      xp: number;
      badges: string[];
      resources: string[];
    };
  }[];
  certificateEligible: boolean;
  mentorSupport: boolean;
  peerCollaboration: boolean;
  realWorldProjects: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const learningPaths: LearningPath[] = [
  {
    id: 'tech_founder_path',
    title: 'Technical Founder Journey',
    description: 'Master the technical skills needed to build and scale technology companies from idea to IPO',
    category: 'technical',
    difficulty: 4,
    estimatedHours: 120,
    prerequisites: [],
    outcomes: [
      'Build and deploy full-stack web applications',
      'Understand cloud architecture and DevOps practices',
      'Lead technical teams and make architectural decisions',
      'Implement security and scalability best practices',
      'Navigate technical due diligence and fundraising'
    ],
    skills: [
      'full_stack_development',
      'cloud_architecture',
      'technical_leadership',
      'system_design',
      'security',
      'devops',
      'api_design',
      'database_design'
    ],
    missions: [
      'sv_mvp_building_mission',
      'sv_scaling_operations',
      'advanced_fullstack_mission',
      'cloud_architecture_mission',
      'security_best_practices_mission'
    ],
    milestones: [
      {
        id: 'tech_milestone_1',
        title: 'MVP Builder',
        description: 'Successfully build and deploy your first minimum viable product',
        requiredMissions: ['sv_mvp_building_mission'],
        rewards: {
          xp: 500,
          badges: ['mvp_master'],
          resources: ['deployment_toolkit', 'user_feedback_templates']
        }
      },
      {
        id: 'tech_milestone_2',
        title: 'Architecture Expert',
        description: 'Design scalable systems that handle millions of users',
        requiredMissions: ['cloud_architecture_mission', 'system_design_mission'],
        rewards: {
          xp: 1000,
          badges: ['system_architect'],
          resources: ['architecture_patterns', 'scalability_playbook']
        }
      },
      {
        id: 'tech_milestone_3',
        title: 'Technical Leader',
        description: 'Lead engineering teams and make strategic technical decisions',
        requiredMissions: ['technical_leadership_mission', 'team_management_mission'],
        rewards: {
          xp: 1500,
          badges: ['tech_leader'],
          resources: ['leadership_framework', 'hiring_playbook']
        }
      }
    ],
    certificateEligible: true,
    mentorSupport: true,
    peerCollaboration: true,
    realWorldProjects: true,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },

  {
    id: 'web3_entrepreneur_path',
    title: 'Web3 Entrepreneur Mastery',
    description: 'Build the next generation of decentralized applications and blockchain-based businesses',
    category: 'technical',
    difficulty: 5,
    estimatedHours: 150,
    prerequisites: ['basic_programming', 'blockchain_fundamentals'],
    outcomes: [
      'Develop and deploy smart contracts on multiple blockchains',
      'Build DeFi protocols and NFT marketplaces',
      'Design tokenomics and governance systems',
      'Navigate Web3 fundraising and token launches',
      'Build and lead decentralized communities'
    ],
    skills: [
      'solidity',
      'smart_contracts',
      'defi',
      'nft',
      'tokenomics',
      'dao_governance',
      'web3_frontend',
      'blockchain_analysis'
    ],
    missions: [
      'cv_blockchain_basics_mission',
      'cv_smart_contracts_mission',
      'cv_defi_protocols',
      'cv_nft_marketplace',
      'cv_dao_governance'
    ],
    milestones: [
      {
        id: 'web3_milestone_1',
        title: 'Smart Contract Developer',
        description: 'Write, test, and deploy secure smart contracts',
        requiredMissions: ['cv_smart_contracts_mission'],
        rewards: {
          xp: 600,
          badges: ['smart_contract_expert'],
          resources: ['security_audit_checklist', 'gas_optimization_guide']
        }
      },
      {
        id: 'web3_milestone_2',
        title: 'DeFi Architect',
        description: 'Build complex DeFi protocols with advanced features',
        requiredMissions: ['cv_defi_protocols', 'advanced_defi_mission'],
        rewards: {
          xp: 1200,
          badges: ['defi_master'],
          resources: ['protocol_templates', 'liquidity_strategies']
        }
      },
      {
        id: 'web3_milestone_3',
        title: 'Ecosystem Builder',
        description: 'Launch and grow thriving Web3 communities and ecosystems',
        requiredMissions: ['cv_dao_governance', 'community_building_mission'],
        rewards: {
          xp: 2000,
          badges: ['ecosystem_founder'],
          resources: ['community_playbook', 'governance_frameworks']
        }
      }
    ],
    certificateEligible: true,
    mentorSupport: true,
    peerCollaboration: true,
    realWorldProjects: true,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },

  {
    id: 'business_strategy_path',
    title: 'Strategic Business Leadership',
    description: 'Master the business strategy, operations, and leadership skills to build billion-dollar companies',
    category: 'business',
    difficulty: 4,
    estimatedHours: 100,
    prerequisites: [],
    outcomes: [
      'Develop winning business strategies and competitive advantages',
      'Master fundraising, financial modeling, and investor relations',
      'Build and scale high-performance teams and culture',
      'Navigate market expansion and international growth',
      'Execute successful exits through IPO or acquisition'
    ],
    skills: [
      'strategic_planning',
      'competitive_analysis',
      'financial_modeling',
      'fundraising',
      'team_building',
      'operations',
      'market_expansion',
      'exit_strategy'
    ],
    missions: [
      'sv_idea_validation_mission',
      'sv_fundraising',
      'sv_team_building',
      'sv_scaling_operations',
      'sv_exit_strategy'
    ],
    milestones: [
      {
        id: 'business_milestone_1',
        title: 'Validated Entrepreneur',
        description: 'Prove product-market fit with paying customers',
        requiredMissions: ['sv_idea_validation_mission', 'customer_validation_mission'],
        rewards: {
          xp: 400,
          badges: ['market_validator'],
          resources: ['validation_frameworks', 'customer_research_tools']
        }
      },
      {
        id: 'business_milestone_2',
        title: 'Funding Expert',
        description: 'Successfully raise significant venture capital funding',
        requiredMissions: ['sv_fundraising', 'investor_relations_mission'],
        rewards: {
          xp: 800,
          badges: ['fundraising_master'],
          resources: ['pitch_deck_templates', 'investor_networks']
        }
      },
      {
        id: 'business_milestone_3',
        title: 'Scale Master',
        description: 'Build systems and teams that scale to millions of customers',
        requiredMissions: ['sv_scaling_operations', 'team_scaling_mission'],
        rewards: {
          xp: 1200,
          badges: ['scale_expert'],
          resources: ['operations_playbook', 'scaling_frameworks']
        }
      }
    ],
    certificateEligible: true,
    mentorSupport: true,
    peerCollaboration: true,
    realWorldProjects: true,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },

  {
    id: 'product_leadership_path',
    title: 'Product Leadership Excellence',
    description: 'Build world-class products that customers love and drive massive business growth',
    category: 'product',
    difficulty: 3,
    estimatedHours: 80,
    prerequisites: [],
    outcomes: [
      'Master product strategy and roadmap planning',
      'Design exceptional user experiences and interfaces',
      'Implement data-driven product development processes',
      'Lead cross-functional product teams effectively',
      'Scale products to millions of users globally'
    ],
    skills: [
      'product_strategy',
      'user_research',
      'ux_design',
      'data_analysis',
      'a_b_testing',
      'product_marketing',
      'agile_development',
      'team_leadership'
    ],
    missions: [
      'sv_user_testing',
      'product_strategy_mission',
      'ux_design_mission',
      'growth_optimization_mission',
      'product_leadership_mission'
    ],
    milestones: [
      {
        id: 'product_milestone_1',
        title: 'User-Centric Designer',
        description: 'Master user research and create delightful user experiences',
        requiredMissions: ['sv_user_testing', 'ux_design_mission'],
        rewards: {
          xp: 500,
          badges: ['ux_master'],
          resources: ['design_systems', 'user_research_toolkit']
        }
      },
      {
        id: 'product_milestone_2',
        title: 'Growth Optimizer',
        description: 'Use data and experimentation to drive exponential product growth',
        requiredMissions: ['growth_optimization_mission', 'analytics_mission'],
        rewards: {
          xp: 800,
          badges: ['growth_hacker'],
          resources: ['experimentation_platform', 'analytics_dashboard']
        }
      },
      {
        id: 'product_milestone_3',
        title: 'Product Visionary',
        description: 'Define and execute product strategies that transform industries',
        requiredMissions: ['product_strategy_mission', 'product_leadership_mission'],
        rewards: {
          xp: 1200,
          badges: ['product_visionary'],
          resources: ['strategy_frameworks', 'leadership_tools']
        }
      }
    ],
    certificateEligible: true,
    mentorSupport: true,
    peerCollaboration: true,
    realWorldProjects: true,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },

  {
    id: 'marketing_growth_path',
    title: 'Marketing & Growth Hacking',
    description: 'Master digital marketing, brand building, and viral growth strategies for startups',
    category: 'marketing',
    difficulty: 3,
    estimatedHours: 90,
    prerequisites: [],
    outcomes: [
      'Build strong brands that resonate with target audiences',
      'Master performance marketing across all digital channels',
      'Implement viral growth mechanisms and referral systems',
      'Create content strategies that drive organic growth',
      'Scale marketing operations and attribution systems'
    ],
    skills: [
      'brand_strategy',
      'content_marketing',
      'performance_marketing',
      'growth_hacking',
      'social_media',
      'seo_sem',
      'email_marketing',
      'marketing_analytics'
    ],
    missions: [
      'sv_growth_hacking',
      'brand_building_mission',
      'content_strategy_mission',
      'performance_marketing_mission',
      'viral_growth_mission'
    ],
    milestones: [
      {
        id: 'marketing_milestone_1',
        title: 'Brand Builder',
        description: 'Create compelling brand identity and messaging that converts',
        requiredMissions: ['brand_building_mission', 'messaging_mission'],
        rewards: {
          xp: 400,
          badges: ['brand_master'],
          resources: ['brand_guidelines', 'messaging_frameworks']
        }
      },
      {
        id: 'marketing_milestone_2',
        title: 'Growth Hacker',
        description: 'Implement viral growth loops and exponential user acquisition',
        requiredMissions: ['sv_growth_hacking', 'viral_growth_mission'],
        rewards: {
          xp: 800,
          badges: ['viral_architect'],
          resources: ['growth_playbook', 'referral_systems']
        }
      },
      {
        id: 'marketing_milestone_3',
        title: 'Marketing Strategist',
        description: 'Build full-funnel marketing systems that scale efficiently',
        requiredMissions: ['performance_marketing_mission', 'marketing_automation_mission'],
        rewards: {
          xp: 1000,
          badges: ['marketing_strategist'],
          resources: ['attribution_models', 'automation_tools']
        }
      }
    ],
    certificateEligible: true,
    mentorSupport: true,
    peerCollaboration: true,
    realWorldProjects: true,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
];

// Specialized learning tracks for specific industries
export const industryTracks = {
  fintech: {
    id: 'fintech_track',
    title: 'FinTech Innovation Track',
    description: 'Build the future of financial services with regulatory compliance and cutting-edge technology',
    specializations: [
      'Digital Banking & Payments',
      'Investment & Wealth Management',
      'Insurance Technology',
      'Regulatory Technology (RegTech)',
      'Blockchain & Cryptocurrency'
    ],
    additionalSkills: [
      'financial_regulations',
      'compliance',
      'payment_processing',
      'risk_management',
      'kyc_aml',
      'open_banking'
    ]
  },
  healthtech: {
    id: 'healthtech_track',
    title: 'HealthTech Innovation Track',
    description: 'Transform healthcare delivery with technology while navigating complex regulatory requirements',
    specializations: [
      'Digital Health Platforms',
      'Medical Devices & IoT',
      'Telemedicine & Remote Care',
      'Health Data Analytics',
      'Pharmaceutical Technology'
    ],
    additionalSkills: [
      'hipaa_compliance',
      'medical_regulations',
      'clinical_trials',
      'health_data_security',
      'interoperability',
      'evidence_based_medicine'
    ]
  },
  cleantech: {
    id: 'cleantech_track',
    title: 'CleanTech & Sustainability Track',
    description: 'Build sustainable technologies that address climate change and environmental challenges',
    specializations: [
      'Renewable Energy Systems',
      'Energy Storage & Grid Tech',
      'Carbon Capture & Removal',
      'Sustainable Transportation',
      'Circular Economy Solutions'
    ],
    additionalSkills: [
      'energy_systems',
      'environmental_impact',
      'sustainability_metrics',
      'regulatory_frameworks',
      'carbon_accounting',
      'lifecycle_assessment'
    ]
  }
};

// Utility functions for learning paths
export const getLearningPathById = (pathId: string): LearningPath | undefined => {
  return learningPaths.find(path => path.id === pathId);
};

export const getLearningPathsByCategory = (category: LearningPath['category']): LearningPath[] => {
  return learningPaths.filter(path => path.category === category);
};

export const getLearningPathsByDifficulty = (difficulty: LearningPath['difficulty']): LearningPath[] => {
  return learningPaths.filter(path => path.difficulty === difficulty);
};

export const getRecommendedPaths = (userSkills: string[], userInterests: string[]): LearningPath[] => {
  return learningPaths
    .map(path => ({
      path,
      relevanceScore: calculatePathRelevance(path, userSkills, userInterests)
    }))
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, 3)
    .map(item => item.path);
};

export const calculatePathProgress = (pathId: string, completedMissions: string[]): number => {
  const path = getLearningPathById(pathId);
  if (!path) return 0;
  
  const totalMissions = path.missions.length;
  const completed = path.missions.filter(missionId => completedMissions.includes(missionId)).length;
  
  return totalMissions > 0 ? (completed / totalMissions) * 100 : 0;
};

export const getNextMilestone = (pathId: string, completedMissions: string[]) => {
  const path = getLearningPathById(pathId);
  if (!path) return null;
  
  return path.milestones.find(milestone => {
    const isCompleted = milestone.requiredMissions.every(missionId => 
      completedMissions.includes(missionId)
    );
    return !isCompleted;
  });
};

export const getEarnedMilestones = (pathId: string, completedMissions: string[]) => {
  const path = getLearningPathById(pathId);
  if (!path) return [];
  
  return path.milestones.filter(milestone => {
    return milestone.requiredMissions.every(missionId => 
      completedMissions.includes(missionId)
    );
  });
};

// Helper function to calculate path relevance based on user profile
function calculatePathRelevance(path: LearningPath, userSkills: string[], userInterests: string[]): number {
  let score = 0;
  
  // Skills overlap
  const skillOverlap = path.skills.filter(skill => userSkills.includes(skill)).length;
  score += skillOverlap * 2;
  
  // Category interest
  if (userInterests.includes(path.category)) {
    score += 5;
  }
  
  // Difficulty appropriateness (prefer paths that are challenging but not overwhelming)
  const avgUserSkillLevel = userSkills.length / 10; // Rough approximation
  const difficultyMatch = Math.abs(path.difficulty - avgUserSkillLevel);
  score += (5 - difficultyMatch);
  
  return score;
}