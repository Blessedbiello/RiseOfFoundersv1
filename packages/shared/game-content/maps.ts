export interface MapNode {
  id: string;
  name: string;
  description: string;
  type: 'learning' | 'challenge' | 'milestone' | 'pvp' | 'sponsor';
  position: {
    x: number;
    y: number;
    z: number;
  };
  level: number;
  prerequisites: string[];
  rewards: {
    xp: number;
    badges: string[];
    resources: string[];
  };
  difficulty: 1 | 2 | 3 | 4 | 5;
  estimatedTimeMinutes: number;
  skills: string[];
  category: 'technical' | 'business' | 'leadership' | 'product' | 'design' | 'marketing';
  isLocked: boolean;
  completionRate: number;
  isActive: boolean;
}

export interface Territory {
  id: string;
  name: string;
  description: string;
  coordinates: [number, number];
  size: number;
  difficulty: 1 | 2 | 3 | 4 | 5;
  maxTeams: number;
  currentOwner: string | null;
  battlesWon: number;
  battlesLost: number;
  totalRewards: number;
  specialFeatures: string[];
  economicValue: number;
  strategicValue: number;
  defenseBonus: number;
  resourceGeneration: {
    type: string;
    amount: number;
    interval: number;
  }[];
}

export interface GameMap {
  id: string;
  name: string;
  description: string;
  theme: 'silicon_valley' | 'crypto_valley' | 'biotech_hub' | 'fintech_district' | 'ai_labs';
  nodes: MapNode[];
  territories: Territory[];
  connections: Array<{
    from: string;
    to: string;
    type: 'prerequisite' | 'progression' | 'optional';
  }>;
  backgroundImage?: string;
  backgroundMusic?: string;
}

// Silicon Valley Map - Tech Startup Journey
export const siliconValleyMap: GameMap = {
  id: 'silicon_valley',
  name: 'Silicon Valley: The Tech Capital',
  description: 'Master the fundamentals of tech startups in the heart of innovation',
  theme: 'silicon_valley',
  nodes: [
    // Foundation Phase (Level 1-2)
    {
      id: 'sv_welcome',
      name: 'Welcome to the Valley',
      description: 'Your entrepreneurial journey begins here. Learn the Silicon Valley mindset.',
      type: 'learning',
      position: { x: 0, y: 0, z: 0 },
      level: 1,
      prerequisites: [],
      rewards: {
        xp: 100,
        badges: ['valley_newcomer'],
        resources: ['startup_guide', 'networking_tips']
      },
      difficulty: 1,
      estimatedTimeMinutes: 30,
      skills: ['entrepreneurship', 'networking'],
      category: 'business',
      isLocked: false,
      completionRate: 0.95,
      isActive: true
    },
    {
      id: 'sv_idea_validation',
      name: 'Idea Validation Workshop',
      description: 'Learn to validate your startup ideas using lean methodology',
      type: 'challenge',
      position: { x: 150, y: 0, z: 0 },
      level: 1,
      prerequisites: ['sv_welcome'],
      rewards: {
        xp: 200,
        badges: ['idea_validator'],
        resources: ['validation_framework', 'customer_interview_guide']
      },
      difficulty: 2,
      estimatedTimeMinutes: 90,
      skills: ['market_research', 'customer_development'],
      category: 'business',
      isLocked: false,
      completionRate: 0.78,
      isActive: true
    },
    {
      id: 'sv_mvp_building',
      name: 'MVP Development Lab',
      description: 'Build your Minimum Viable Product with modern tools',
      type: 'challenge',
      position: { x: 300, y: 0, z: 0 },
      level: 2,
      prerequisites: ['sv_idea_validation'],
      rewards: {
        xp: 400,
        badges: ['mvp_builder', 'technical_founder'],
        resources: ['dev_toolkit', 'deployment_guide']
      },
      difficulty: 3,
      estimatedTimeMinutes: 180,
      skills: ['full_stack_dev', 'product_design', 'user_experience'],
      category: 'technical',
      isLocked: false,
      completionRate: 0.65,
      isActive: true
    },
    {
      id: 'sv_user_testing',
      name: 'User Testing Arena',
      description: 'Master the art of gathering and analyzing user feedback',
      type: 'learning',
      position: { x: 450, y: 0, z: 0 },
      level: 2,
      prerequisites: ['sv_mvp_building'],
      rewards: {
        xp: 300,
        badges: ['user_whisperer'],
        resources: ['testing_protocols', 'analytics_dashboard']
      },
      difficulty: 2,
      estimatedTimeMinutes: 120,
      skills: ['user_research', 'data_analysis', 'product_iteration'],
      category: 'product',
      isLocked: false,
      completionRate: 0.82,
      isActive: true
    },

    // Growth Phase (Level 3-4)
    {
      id: 'sv_pitch_deck',
      name: 'Pitch Deck Mastery',
      description: 'Craft compelling pitch decks that capture investor attention',
      type: 'challenge',
      position: { x: 600, y: 0, z: 0 },
      level: 3,
      prerequisites: ['sv_user_testing'],
      rewards: {
        xp: 500,
        badges: ['pitch_master', 'storyteller'],
        resources: ['pitch_templates', 'investor_database']
      },
      difficulty: 3,
      estimatedTimeMinutes: 150,
      skills: ['storytelling', 'presentation', 'business_modeling'],
      category: 'business',
      isLocked: false,
      completionRate: 0.71,
      isActive: true
    },
    {
      id: 'sv_team_building',
      name: 'Dream Team Assembly',
      description: 'Learn to recruit, motivate, and manage a world-class team',
      type: 'learning',
      position: { x: 750, y: 0, z: 0 },
      level: 3,
      prerequisites: ['sv_pitch_deck'],
      rewards: {
        xp: 400,
        badges: ['team_builder', 'culture_creator'],
        resources: ['hiring_playbook', 'culture_toolkit']
      },
      difficulty: 2,
      estimatedTimeMinutes: 120,
      skills: ['leadership', 'recruiting', 'team_management'],
      category: 'leadership',
      isLocked: false,
      completionRate: 0.68,
      isActive: true
    },
    {
      id: 'sv_fundraising',
      name: 'Fundraising Battlefield',
      description: 'Navigate the complex world of venture capital and angel investment',
      type: 'challenge',
      position: { x: 900, y: 0, z: 0 },
      level: 4,
      prerequisites: ['sv_team_building'],
      rewards: {
        xp: 700,
        badges: ['fundraising_ninja', 'vc_networker'],
        resources: ['term_sheet_guide', 'investor_intros']
      },
      difficulty: 4,
      estimatedTimeMinutes: 240,
      skills: ['fundraising', 'financial_modeling', 'negotiation'],
      category: 'business',
      isLocked: false,
      completionRate: 0.45,
      isActive: true
    },

    // Scale Phase (Level 4-5)
    {
      id: 'sv_growth_hacking',
      name: 'Growth Hacking Laboratory',
      description: 'Master data-driven growth strategies and viral mechanics',
      type: 'challenge',
      position: { x: 1050, y: 0, z: 0 },
      level: 4,
      prerequisites: ['sv_fundraising'],
      rewards: {
        xp: 600,
        badges: ['growth_hacker', 'viral_architect'],
        resources: ['growth_toolkit', 'analytics_suite']
      },
      difficulty: 4,
      estimatedTimeMinutes: 200,
      skills: ['growth_marketing', 'data_science', 'experimentation'],
      category: 'marketing',
      isLocked: false,
      completionRate: 0.58,
      isActive: true
    },
    {
      id: 'sv_scaling_operations',
      name: 'Scaling Operations Hub',
      description: 'Build systems and processes that scale with hypergrowth',
      type: 'learning',
      position: { x: 1200, y: 0, z: 0 },
      level: 5,
      prerequisites: ['sv_growth_hacking'],
      rewards: {
        xp: 800,
        badges: ['operations_master', 'system_architect'],
        resources: ['ops_playbook', 'automation_tools']
      },
      difficulty: 4,
      estimatedTimeMinutes: 180,
      skills: ['operations', 'process_design', 'automation'],
      category: 'business',
      isLocked: false,
      completionRate: 0.42,
      isActive: true
    },
    {
      id: 'sv_exit_strategy',
      name: 'Exit Strategy Summit',
      description: 'Master IPOs, acquisitions, and building lasting value',
      type: 'milestone',
      position: { x: 1350, y: 0, z: 0 },
      level: 5,
      prerequisites: ['sv_scaling_operations'],
      rewards: {
        xp: 1000,
        badges: ['unicorn_founder', 'valley_legend'],
        resources: ['exit_playbook', 'board_governance']
      },
      difficulty: 5,
      estimatedTimeMinutes: 300,
      skills: ['strategic_planning', 'corporate_finance', 'governance'],
      category: 'leadership',
      isLocked: false,
      completionRate: 0.23,
      isActive: true
    },

    // PvP and Sponsor Nodes
    {
      id: 'sv_pitch_battle',
      name: 'Pitch Battle Arena',
      description: 'Compete against other founders in live pitch competitions',
      type: 'pvp',
      position: { x: 675, y: 200, z: 0 },
      level: 3,
      prerequisites: ['sv_pitch_deck'],
      rewards: {
        xp: 800,
        badges: ['pitch_champion'],
        resources: ['winner_trophy', 'media_coverage']
      },
      difficulty: 4,
      estimatedTimeMinutes: 60,
      skills: ['presentation', 'competitive_analysis', 'quick_thinking'],
      category: 'business',
      isLocked: false,
      completionRate: 0.35,
      isActive: true
    },
    {
      id: 'sv_demo_day',
      name: 'Demo Day Challenge',
      description: 'Present your startup to a panel of real investors and VCs',
      type: 'sponsor',
      position: { x: 1125, y: 200, z: 0 },
      level: 4,
      prerequisites: ['sv_fundraising'],
      rewards: {
        xp: 1200,
        badges: ['demo_day_champion'],
        resources: ['investor_meetings', 'follow_up_intros']
      },
      difficulty: 5,
      estimatedTimeMinutes: 90,
      skills: ['presentation', 'investor_relations', 'product_demo'],
      category: 'business',
      isLocked: false,
      completionRate: 0.28,
      isActive: true
    }
  ],
  territories: [
    {
      id: 'palo_alto_labs',
      name: 'Palo Alto Innovation Labs',
      description: 'The birthplace of legendary tech companies. Control this territory to access exclusive resources.',
      coordinates: [100, 150],
      size: 75,
      difficulty: 3,
      maxTeams: 8,
      currentOwner: null,
      battlesWon: 0,
      battlesLost: 0,
      totalRewards: 0,
      specialFeatures: ['Innovation Boost', 'Prototype Lab Access', 'Mentor Network'],
      economicValue: 1000,
      strategicValue: 800,
      defenseBonus: 15,
      resourceGeneration: [
        { type: 'research_points', amount: 50, interval: 3600000 },
        { type: 'innovation_tokens', amount: 25, interval: 7200000 }
      ]
    },
    {
      id: 'menlo_park_hq',
      name: 'Menlo Park Headquarters',
      description: 'Prime real estate for established startups. Provides scaling bonuses and corporate connections.',
      coordinates: [400, 300],
      size: 100,
      difficulty: 4,
      maxTeams: 6,
      currentOwner: null,
      battlesWon: 0,
      battlesLost: 0,
      totalRewards: 0,
      specialFeatures: ['Scaling Bonus', 'Corporate Partnerships', 'Media Attention'],
      economicValue: 1500,
      strategicValue: 1200,
      defenseBonus: 25,
      resourceGeneration: [
        { type: 'network_points', amount: 75, interval: 3600000 },
        { type: 'influence_tokens', amount: 40, interval: 7200000 }
      ]
    },
    {
      id: 'sand_hill_road',
      name: 'Sand Hill Road VC District',
      description: 'The ultimate prize - control of the venture capital epicenter. Maximum prestige and resources.',
      coordinates: [700, 250],
      size: 125,
      difficulty: 5,
      maxTeams: 4,
      currentOwner: null,
      battlesWon: 0,
      battlesLost: 0,
      totalRewards: 0,
      specialFeatures: ['VC Access', 'Funding Boost', 'Elite Network', 'IPO Fast Track'],
      economicValue: 2500,
      strategicValue: 2000,
      defenseBonus: 40,
      resourceGeneration: [
        { type: 'capital_points', amount: 100, interval: 3600000 },
        { type: 'prestige_tokens', amount: 60, interval: 7200000 }
      ]
    }
  ],
  connections: [
    { from: 'sv_welcome', to: 'sv_idea_validation', type: 'progression' },
    { from: 'sv_idea_validation', to: 'sv_mvp_building', type: 'progression' },
    { from: 'sv_mvp_building', to: 'sv_user_testing', type: 'progression' },
    { from: 'sv_user_testing', to: 'sv_pitch_deck', type: 'progression' },
    { from: 'sv_pitch_deck', to: 'sv_team_building', type: 'progression' },
    { from: 'sv_team_building', to: 'sv_fundraising', type: 'progression' },
    { from: 'sv_fundraising', to: 'sv_growth_hacking', type: 'progression' },
    { from: 'sv_growth_hacking', to: 'sv_scaling_operations', type: 'progression' },
    { from: 'sv_scaling_operations', to: 'sv_exit_strategy', type: 'progression' },
    { from: 'sv_pitch_deck', to: 'sv_pitch_battle', type: 'optional' },
    { from: 'sv_fundraising', to: 'sv_demo_day', type: 'optional' }
  ],
  backgroundImage: '/maps/silicon-valley-bg.jpg',
  backgroundMusic: '/audio/silicon-valley-theme.mp3'
};

// Crypto Valley Map - Web3 and DeFi Journey
export const cryptoValleyMap: GameMap = {
  id: 'crypto_valley',
  name: 'Crypto Valley: Decentralized Future',
  description: 'Navigate the world of Web3, DeFi, and blockchain innovation',
  theme: 'crypto_valley',
  nodes: [
    // Foundation Phase
    {
      id: 'cv_blockchain_basics',
      name: 'Blockchain Fundamentals',
      description: 'Master the core concepts of distributed ledger technology',
      type: 'learning',
      position: { x: 0, y: 0, z: 0 },
      level: 1,
      prerequisites: [],
      rewards: {
        xp: 150,
        badges: ['blockchain_explorer'],
        resources: ['crypto_glossary', 'blockchain_primer']
      },
      difficulty: 2,
      estimatedTimeMinutes: 60,
      skills: ['blockchain', 'cryptography', 'distributed_systems'],
      category: 'technical',
      isLocked: false,
      completionRate: 0.87,
      isActive: true
    },
    {
      id: 'cv_smart_contracts',
      name: 'Smart Contract Academy',
      description: 'Learn to write, deploy, and audit smart contracts on Ethereum',
      type: 'challenge',
      position: { x: 200, y: 0, z: 0 },
      level: 2,
      prerequisites: ['cv_blockchain_basics'],
      rewards: {
        xp: 400,
        badges: ['smart_contract_dev', 'solidity_master'],
        resources: ['solidity_toolkit', 'contract_templates']
      },
      difficulty: 3,
      estimatedTimeMinutes: 180,
      skills: ['solidity', 'smart_contracts', 'ethereum'],
      category: 'technical',
      isLocked: false,
      completionRate: 0.64,
      isActive: true
    },
    {
      id: 'cv_defi_protocols',
      name: 'DeFi Protocol Design',
      description: 'Build decentralized finance applications with AMMs, lending, and yield farming',
      type: 'challenge',
      position: { x: 400, y: 0, z: 0 },
      level: 3,
      prerequisites: ['cv_smart_contracts'],
      rewards: {
        xp: 600,
        badges: ['defi_architect', 'liquidity_master'],
        resources: ['defi_protocols', 'tokenomics_guide']
      },
      difficulty: 4,
      estimatedTimeMinutes: 240,
      skills: ['defi', 'tokenomics', 'amm_design'],
      category: 'technical',
      isLocked: false,
      completionRate: 0.48,
      isActive: true
    },
    {
      id: 'cv_nft_marketplace',
      name: 'NFT Marketplace Builder',
      description: 'Create and launch your own NFT marketplace with royalties and governance',
      type: 'challenge',
      position: { x: 600, y: 0, z: 0 },
      level: 3,
      prerequisites: ['cv_smart_contracts'],
      rewards: {
        xp: 500,
        badges: ['nft_creator', 'marketplace_founder'],
        resources: ['nft_standards', 'marketplace_template']
      },
      difficulty: 3,
      estimatedTimeMinutes: 200,
      skills: ['nft', 'ipfs', 'web3_frontend'],
      category: 'technical',
      isLocked: false,
      completionRate: 0.55,
      isActive: true
    },
    {
      id: 'cv_dao_governance',
      name: 'DAO Governance Lab',
      description: 'Design and implement decentralized autonomous organization structures',
      type: 'learning',
      position: { x: 800, y: 0, z: 0 },
      level: 4,
      prerequisites: ['cv_defi_protocols', 'cv_nft_marketplace'],
      rewards: {
        xp: 700,
        badges: ['dao_architect', 'governance_expert'],
        resources: ['dao_frameworks', 'governance_tokens']
      },
      difficulty: 4,
      estimatedTimeMinutes: 180,
      skills: ['dao_design', 'governance', 'token_economics'],
      category: 'business',
      isLocked: false,
      completionRate: 0.41,
      isActive: true
    },
    {
      id: 'cv_layer2_scaling',
      name: 'Layer 2 Scaling Solutions',
      description: 'Master Polygon, Arbitrum, and other scaling solutions for DApps',
      type: 'challenge',
      position: { x: 1000, y: 0, z: 0 },
      level: 4,
      prerequisites: ['cv_dao_governance'],
      rewards: {
        xp: 800,
        badges: ['scaling_master', 'l2_expert'],
        resources: ['l2_deployment_guide', 'cross_chain_bridges']
      },
      difficulty: 4,
      estimatedTimeMinutes: 220,
      skills: ['layer2', 'scaling', 'cross_chain'],
      category: 'technical',
      isLocked: false,
      completionRate: 0.37,
      isActive: true
    },
    {
      id: 'cv_web3_unicorn',
      name: 'Web3 Unicorn Status',
      description: 'Build a billion-dollar Web3 company with global impact',
      type: 'milestone',
      position: { x: 1200, y: 0, z: 0 },
      level: 5,
      prerequisites: ['cv_layer2_scaling'],
      rewards: {
        xp: 1200,
        badges: ['web3_unicorn', 'crypto_legend'],
        resources: ['unicorn_status', 'ecosystem_leadership']
      },
      difficulty: 5,
      estimatedTimeMinutes: 360,
      skills: ['ecosystem_building', 'crypto_economics', 'regulatory_navigation'],
      category: 'leadership',
      isLocked: false,
      completionRate: 0.15,
      isActive: true
    }
  ],
  territories: [
    {
      id: 'ethereum_mainnet',
      name: 'Ethereum Mainnet Control',
      description: 'Dominance over the primary Ethereum ecosystem. Massive influence and gas fee bonuses.',
      coordinates: [300, 200],
      size: 150,
      difficulty: 5,
      maxTeams: 3,
      currentOwner: null,
      battlesWon: 0,
      battlesLost: 0,
      totalRewards: 0,
      specialFeatures: ['Gas Optimization', 'Miner Relations', 'Protocol Governance'],
      economicValue: 3000,
      strategicValue: 2500,
      defenseBonus: 50,
      resourceGeneration: [
        { type: 'eth_rewards', amount: 150, interval: 3600000 },
        { type: 'governance_power', amount: 100, interval: 7200000 }
      ]
    },
    {
      id: 'defi_district',
      name: 'DeFi Innovation District',
      description: 'Hub of decentralized finance protocols. Provides liquidity bonuses and yield farming advantages.',
      coordinates: [600, 300],
      size: 100,
      difficulty: 4,
      maxTeams: 5,
      currentOwner: null,
      battlesWon: 0,
      battlesLost: 0,
      totalRewards: 0,
      specialFeatures: ['Liquidity Mining', 'Yield Optimization', 'Protocol Integrations'],
      economicValue: 2000,
      strategicValue: 1800,
      defenseBonus: 30,
      resourceGeneration: [
        { type: 'defi_tokens', amount: 100, interval: 3600000 },
        { type: 'yield_points', amount: 80, interval: 7200000 }
      ]
    }
  ],
  connections: [
    { from: 'cv_blockchain_basics', to: 'cv_smart_contracts', type: 'progression' },
    { from: 'cv_smart_contracts', to: 'cv_defi_protocols', type: 'progression' },
    { from: 'cv_smart_contracts', to: 'cv_nft_marketplace', type: 'progression' },
    { from: 'cv_defi_protocols', to: 'cv_dao_governance', type: 'prerequisite' },
    { from: 'cv_nft_marketplace', to: 'cv_dao_governance', type: 'prerequisite' },
    { from: 'cv_dao_governance', to: 'cv_layer2_scaling', type: 'progression' },
    { from: 'cv_layer2_scaling', to: 'cv_web3_unicorn', type: 'progression' }
  ],
  backgroundImage: '/maps/crypto-valley-bg.jpg',
  backgroundMusic: '/audio/crypto-valley-theme.mp3'
};

// Export all maps
export const gameMaps: GameMap[] = [
  siliconValleyMap,
  cryptoValleyMap
];

// Utility functions
export const getMapById = (mapId: string): GameMap | undefined => {
  return gameMaps.find(map => map.id === mapId);
};

export const getNodeById = (mapId: string, nodeId: string): MapNode | undefined => {
  const map = getMapById(mapId);
  return map?.nodes.find(node => node.id === nodeId);
};

export const getTerritoryById = (mapId: string, territoryId: string): Territory | undefined => {
  const map = getMapById(mapId);
  return map?.territories.find(territory => territory.id === territoryId);
};

export const getNodesForLevel = (mapId: string, level: number): MapNode[] => {
  const map = getMapById(mapId);
  return map?.nodes.filter(node => node.level === level) || [];
};

export const getUnlockedNodes = (mapId: string, completedNodes: string[]): MapNode[] => {
  const map = getMapById(mapId);
  if (!map) return [];
  
  return map.nodes.filter(node => {
    if (!node.isLocked) return true;
    return node.prerequisites.every(prereq => completedNodes.includes(prereq));
  });
};

export const calculateMapProgress = (mapId: string, completedNodes: string[]): number => {
  const map = getMapById(mapId);
  if (!map) return 0;
  
  const totalNodes = map.nodes.length;
  const completed = completedNodes.length;
  
  return totalNodes > 0 ? (completed / totalNodes) * 100 : 0;
};