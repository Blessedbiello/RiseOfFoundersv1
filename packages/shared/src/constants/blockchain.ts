export const SOLANA_NETWORKS = {
  MAINNET: 'mainnet-beta',
  DEVNET: 'devnet',
  TESTNET: 'testnet',
  LOCALNET: 'localnet',
} as const;

export const RPC_ENDPOINTS = {
  MAINNET: 'https://api.mainnet-beta.solana.com',
  DEVNET: 'https://api.devnet.solana.com',
  TESTNET: 'https://api.testnet.solana.com',
  LOCALNET: 'http://127.0.0.1:8899',
} as const;

export const TOKEN_ADDRESSES = {
  // Devnet addresses (update for mainnet)
  USDC_DEVNET: 'Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr',
  SOL: '11111111111111111111111111111111',
  
  // Custom tokens (to be deployed)
  ROF_TOKEN: '', // Rise of Founders utility token
  MENTOR_TOKEN: '', // Mentor session credits
} as const;

export const PROGRAM_IDS = {
  // System programs
  SYSTEM_PROGRAM: '11111111111111111111111111111111',
  TOKEN_PROGRAM: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
  ASSOCIATED_TOKEN_PROGRAM: 'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL',
  
  // Custom programs (to be deployed)
  TEAM_VAULT: '',
  SPONSOR_ESCROW: '',
  TERRITORY_NFT: '',
  ACHIEVEMENT_NFT: '',
} as const;

export const TRANSACTION_FEES = {
  BASE_FEE: 5000, // lamports
  PRIORITY_FEE: 1000, // lamports
  CREATE_ACCOUNT: 2039280, // lamports for rent-exempt account
} as const;

export const WALLET_ADAPTERS = {
  PHANTOM: 'phantom',
  SOLFLARE: 'solflare',
  BACKPACK: 'backpack',
  GLOW: 'glow',
  SLOPE: 'slope',
  SOLLET: 'sollet',
} as const;

export const NFT_STANDARDS = {
  METAPLEX: 'metaplex',
  COMPRESSED: 'compressed',
  CORE: 'core',
} as const;

export const HONEYCOMB_CONFIG = {
  DEVNET_PROJECT_ID: '', // To be configured
  MAINNET_PROJECT_ID: '', // To be configured
  API_ENDPOINT: 'https://api.honeycombprotocol.com',
} as const;

export const VERIFICATION_SIGNATURES = {
  MISSION_COMPLETION: 'mission_complete_',
  TRAIT_UPDATE: 'trait_update_',
  TEAM_FORMATION: 'team_formed_',
  CHALLENGE_ACCEPTED: 'challenge_accepted_',
  SPONSOR_QUEST: 'sponsor_quest_',
} as const;

export const BLOCKCHAIN_TIMEOUTS = {
  TRANSACTION_CONFIRMATION: 30000, // 30 seconds
  BLOCK_CONFIRMATION: 400, // milliseconds
  MAX_RETRIES: 3,
} as const;