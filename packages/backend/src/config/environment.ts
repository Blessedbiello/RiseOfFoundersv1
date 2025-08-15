import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables
dotenv.config();

// Environment validation schema
const envSchema = z.object({
  // Server
  NODE_ENV: z.enum(['development', 'production', 'test', 'staging']).default('development'),
  PORT: z.string().regex(/^\d+$/).transform(Number).default('8000'),
  API_VERSION: z.string().default('v1'),
  
  // Database
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  DATABASE_POOL_SIZE: z.string().regex(/^\d+$/).transform(Number).default('10'),
  DATABASE_TIMEOUT_MS: z.string().regex(/^\d+$/).transform(Number).default('5000'),
  
  // Security
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRE_TIME: z.string().default('7d'),
  BCRYPT_ROUNDS: z.string().regex(/^\d+$/).transform(Number).default('12'),
  SESSION_SECRET: z.string().min(32, 'SESSION_SECRET must be at least 32 characters'),
  ENCRYPTION_KEY: z.string().length(32, 'ENCRYPTION_KEY must be exactly 32 characters'),
  
  // Solana
  SOLANA_RPC_URL: z.string().default('https://api.devnet.solana.com'),
  SOLANA_NETWORK: z.enum(['mainnet-beta', 'devnet', 'testnet', 'localnet']).default('devnet'),
  
  // Honeycomb
  HONEYCOMB_API_KEY: z.string(),
  HONEYCOMB_PROJECT_ID: z.string(),
  HONEYCOMB_ENVIRONMENT: z.enum(['development', 'production']).default('development'),
  
  // GitHub OAuth
  GITHUB_CLIENT_ID: z.string(),
  GITHUB_CLIENT_SECRET: z.string(),
  GITHUB_CALLBACK_URL: z.string(),
  
  // OpenAI
  OPENAI_API_KEY: z.string(),
  OPENAI_MODEL: z.string().default('gpt-4'),
  
  // Redis
  REDIS_URL: z.string().optional(),
  
  // Email
  EMAIL_HOST: z.string().optional(),
  EMAIL_PORT: z.string().transform(Number).optional(),
  EMAIL_USER: z.string().optional(),
  EMAIL_PASS: z.string().optional(),
  EMAIL_FROM: z.string().optional(),
  
  // File Storage
  UPLOAD_DIR: z.string().default('uploads'),
  MAX_FILE_SIZE: z.string().transform(Number).default('10485760'),
  
  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default('900000'),
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).default('100'),
  
  // CORS and Origins
  FRONTEND_URL: z.string().url().default('http://localhost:3000'),
  ALLOWED_ORIGINS: z.string().default('http://localhost:3000,http://localhost:3001'),
  TRUSTED_PROXIES: z.string().default(''),
  SECURE_COOKIES: z.string().transform(val => val === 'true').default('false'),
  COOKIE_DOMAIN: z.string().optional(),
  
  // Webhooks
  DISCORD_WEBHOOK_URL: z.string().optional(),
  SLACK_WEBHOOK_URL: z.string().optional(),
  
  // Third-party APIs
  COINGECKO_API_KEY: z.string().optional(),
  CHAINLINK_API_KEY: z.string().optional(),
  
  // Feature Flags
  ENABLE_PVP: z.string().transform(val => val === 'true').default('true'),
  ENABLE_TEAMS: z.string().transform(val => val === 'true').default('true'),
  ENABLE_SPONSORS: z.string().transform(val => val === 'true').default('true'),
  ENABLE_MENTORS: z.string().transform(val => val === 'true').default('true'),
  ENABLE_AI_AGREEMENTS: z.string().transform(val => val === 'true').default('true'),
});

// Validate and export configuration
const parseResult = envSchema.safeParse(process.env);

if (!parseResult.success) {
  console.error('❌ Invalid environment variables:');
  parseResult.error.issues.forEach((issue) => {
    console.error(`  ${issue.path.join('.')}: ${issue.message}`);
  });
  process.exit(1);
}

export const config = parseResult.data;

// Derived configurations
export const isDevelopment = config.NODE_ENV === 'development';
export const isProduction = config.NODE_ENV === 'production';
export const isTest = config.NODE_ENV === 'test';

export const allowedOrigins = config.ALLOWED_ORIGINS.split(',').map(origin => origin.trim());

export const honeycombConfig = {
  apiKey: config.HONEYCOMB_API_KEY,
  projectId: config.HONEYCOMB_PROJECT_ID,
  environment: config.HONEYCOMB_ENVIRONMENT,
  rpcUrl: config.SOLANA_RPC_URL,
} as const;

export const solanaConfig = {
  rpcUrl: config.SOLANA_RPC_URL,
  network: config.SOLANA_NETWORK,
} as const;

export const githubConfig = {
  clientId: config.GITHUB_CLIENT_ID,
  clientSecret: config.GITHUB_CLIENT_SECRET,
  callbackUrl: config.GITHUB_CALLBACK_URL,
} as const;

export const openaiConfig = {
  apiKey: config.OPENAI_API_KEY,
  model: config.OPENAI_MODEL,
} as const;

export const emailConfig = {
  host: config.EMAIL_HOST,
  port: config.EMAIL_PORT,
  user: config.EMAIL_USER,
  pass: config.EMAIL_PASS,
  from: config.EMAIL_FROM,
} as const;

export const uploadConfig = {
  dir: config.UPLOAD_DIR,
  maxSize: config.MAX_FILE_SIZE,
} as const;

export const rateLimitConfig = {
  windowMs: config.RATE_LIMIT_WINDOW_MS,
  maxRequests: config.RATE_LIMIT_MAX_REQUESTS,
} as const;

export const featureFlags = {
  pvp: config.ENABLE_PVP,
  teams: config.ENABLE_TEAMS,
  sponsors: config.ENABLE_SPONSORS,
  mentors: config.ENABLE_MENTORS,
  aiAgreements: config.ENABLE_AI_AGREEMENTS,
} as const;