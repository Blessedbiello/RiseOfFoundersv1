import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { ApiError } from './errors';

// Base validation schemas
export const objectIdSchema = z.string().min(1, 'ID is required');
export const emailSchema = z.string().email('Invalid email format');
export const urlSchema = z.string().url('Invalid URL format');
export const uuidSchema = z.string().uuid('Invalid UUID format');

// User validation schemas
export const createUserSchema = z.object({
  email: emailSchema,
  username: z.string().min(3, 'Username must be at least 3 characters').max(30, 'Username must be less than 30 characters'),
  walletAddress: z.string().min(32, 'Invalid wallet address').max(64, 'Invalid wallet address'),
  githubId: z.string().optional(),
  avatarUrl: urlSchema.optional(),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional()
});

export const updateUserSchema = createUserSchema.partial().extend({
  id: objectIdSchema
});

// Mission validation schemas
export const completeMissionSchema = z.object({
  missionId: objectIdSchema,
  artifactType: z.enum(['github', 'url', 'text', 'file', 'solana_tx']),
  artifactUrl: z.union([urlSchema, z.string().min(1)]),
  metadata: z.record(z.any()).optional(),
  submissionNotes: z.string().max(1000, 'Notes must be less than 1000 characters').optional()
});

export const createMissionSchema = z.object({
  nodeId: objectIdSchema,
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().min(1, 'Description is required').max(1000, 'Description must be less than 1000 characters'),
  objectives: z.array(z.string()).min(1, 'At least one objective is required'),
  category: z.enum(['technical', 'business', 'leadership', 'product', 'design', 'marketing']),
  difficulty: z.number().int().min(1).max(5),
  estimatedTimeMinutes: z.number().int().min(1).max(480),
  xpReward: z.number().int().min(0).max(10000),
  badgeRewards: z.array(z.string()),
  resourceRewards: z.array(z.string()),
  prerequisites: z.array(objectIdSchema),
  skills: z.array(z.string()),
  isActive: z.boolean().default(true)
});

// Team validation schemas
export const createTeamSchema = z.object({
  name: z.string().min(1, 'Team name is required').max(100, 'Team name must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  vision: z.string().max(1000, 'Vision must be less than 1000 characters').optional(),
  foundingDate: z.string().datetime().optional(),
  industry: z.string().max(100, 'Industry must be less than 100 characters').optional(),
  stage: z.enum(['idea', 'mvp', 'launched', 'growing', 'scaling']),
  maxMembers: z.number().int().min(1).max(20).default(10),
  isPublic: z.boolean().default(true)
});

export const inviteTeamMemberSchema = z.object({
  teamId: objectIdSchema,
  email: emailSchema,
  role: z.enum(['founder', 'co-founder', 'advisor', 'employee']),
  message: z.string().max(500, 'Message must be less than 500 characters').optional()
});

// PvP validation schemas
export const createPvpChallengeSchema = z.object({
  challengerId: objectIdSchema,
  challengedId: objectIdSchema,
  territoryId: objectIdSchema,
  challengeType: z.enum(['pitch_battle', 'code_duel', 'growth_hack', 'design_sprint']),
  wager: z.number().int().min(0).max(1000000),
  expiresAt: z.string().datetime(),
  rules: z.record(z.any()).optional()
});

export const submitPvpResultSchema = z.object({
  challengeId: objectIdSchema,
  submissionUrl: urlSchema,
  description: z.string().max(1000, 'Description must be less than 1000 characters'),
  metrics: z.record(z.number()).optional()
});

// Mentor validation schemas
export const createMentorSessionSchema = z.object({
  mentorId: objectIdSchema,
  sessionType: z.enum(['1on1', 'group', 'workshop', 'code_review']),
  scheduledAt: z.string().datetime(),
  duration: z.number().int().min(15).max(240), // 15 minutes to 4 hours
  topic: z.string().min(1, 'Topic is required').max(200, 'Topic must be less than 200 characters'),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
  paymentType: z.enum(['credits', 'crypto', 'fiat']),
  amount: z.number().min(0)
});

export const rateMentorSessionSchema = z.object({
  sessionId: objectIdSchema,
  rating: z.number().int().min(1).max(5),
  feedback: z.string().max(1000, 'Feedback must be less than 1000 characters').optional(),
  publicReview: z.boolean().default(false)
});

// Sponsor validation schemas
export const createSponsorQuestSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().min(1, 'Description is required').max(2000, 'Description must be less than 2000 characters'),
  requirements: z.array(z.string()).min(1, 'At least one requirement is needed'),
  rewards: z.object({
    amount: z.number().min(0),
    currency: z.enum(['USD', 'SOL', 'USDC', 'credits']),
    additionalBenefits: z.array(z.string()).optional()
  }),
  timeline: z.object({
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
    milestones: z.array(z.object({
      title: z.string(),
      dueDate: z.string().datetime(),
      percentage: z.number().min(0).max(100)
    })).optional()
  }),
  eligibilityCriteria: z.object({
    minLevel: z.number().int().min(1).optional(),
    requiredSkills: z.array(z.string()).optional(),
    maxParticipants: z.number().int().min(1).optional()
  }),
  category: z.enum(['technical', 'business', 'research', 'marketing', 'design'])
});

// Admin validation schemas
export const moderateContentSchema = z.object({
  contentType: z.enum(['user', 'team', 'mission_submission', 'pvp_challenge', 'comment']),
  contentId: objectIdSchema,
  action: z.enum(['approve', 'reject', 'flag', 'ban', 'warn']),
  reason: z.string().min(1, 'Reason is required').max(500, 'Reason must be less than 500 characters'),
  notes: z.string().max(1000, 'Notes must be less than 1000 characters').optional()
});

// Query parameter validation schemas
export const paginationSchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).refine(n => n >= 1, 'Page must be >= 1').optional().default('1'),
  limit: z.string().regex(/^\d+$/).transform(Number).refine(n => n >= 1 && n <= 100, 'Limit must be 1-100').optional().default('20'),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc')
});

export const filterSchema = z.object({
  category: z.string().optional(),
  difficulty: z.string().regex(/^[1-5]$/).transform(Number).optional(),
  status: z.string().optional(),
  search: z.string().max(100, 'Search term must be less than 100 characters').optional()
});

// Validation middleware factory
export function validateBody<T extends z.ZodType>(schema: T) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = await schema.parseAsync(req.body);
      req.body = validated;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }));
        throw new ApiError('Validation failed', 400, errorMessages);
      }
      next(error);
    }
  };
}

export function validateQuery<T extends z.ZodType>(schema: T) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = await schema.parseAsync(req.query);
      req.query = validated as any;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }));
        throw new ApiError('Query validation failed', 400, errorMessages);
      }
      next(error);
    }
  };
}

export function validateParams<T extends z.ZodType>(schema: T) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = await schema.parseAsync(req.params);
      req.params = validated;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }));
        throw new ApiError('Parameter validation failed', 400, errorMessages);
      }
      next(error);
    }
  };
}

// Sanitization utilities
export function sanitizeHtml(input: string): string {
  // Basic HTML sanitization - in production, use a library like DOMPurify
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=\s*"[^"]*"/gi, '')
    .replace(/on\w+\s*=\s*'[^']*'/gi, '');
}

export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_{2,}/g, '_')
    .substring(0, 255);
}

// Rate limiting schemas
export const rateLimitSchema = z.object({
  windowMs: z.number().int().min(1000).max(86400000), // 1 second to 24 hours
  max: z.number().int().min(1).max(10000),
  message: z.string().optional(),
  standardHeaders: z.boolean().default(true),
  legacyHeaders: z.boolean().default(false)
});

// Security configuration schema
export const securityConfigSchema = z.object({
  jwtSecret: z.string().min(32, 'JWT secret must be at least 32 characters'),
  jwtExpiresIn: z.string().default('7d'),
  bcryptRounds: z.number().int().min(10).max(15).default(12),
  corsOrigins: z.array(z.string()).default(['http://localhost:3000']),
  trustedProxies: z.array(z.string()).default([]),
  sessionSecret: z.string().min(32, 'Session secret must be at least 32 characters'),
  encryptionKey: z.string().length(32, 'Encryption key must be exactly 32 characters')
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type CompleteMissionInput = z.infer<typeof completeMissionSchema>;
export type CreateMissionInput = z.infer<typeof createMissionSchema>;
export type CreateTeamInput = z.infer<typeof createTeamSchema>;
export type InviteTeamMemberInput = z.infer<typeof inviteTeamMemberSchema>;
export type CreatePvpChallengeInput = z.infer<typeof createPvpChallengeSchema>;
export type SubmitPvpResultInput = z.infer<typeof submitPvpResultSchema>;
export type CreateMentorSessionInput = z.infer<typeof createMentorSessionSchema>;
export type RateMentorSessionInput = z.infer<typeof rateMentorSessionSchema>;
export type CreateSponsorQuestInput = z.infer<typeof createSponsorQuestSchema>;
export type ModerateContentInput = z.infer<typeof moderateContentSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
export type FilterInput = z.infer<typeof filterSchema>;
export type SecurityConfigInput = z.infer<typeof securityConfigSchema>;