import { Router, Response } from 'express';
import { body, param, validationResult } from 'express-validator';
import { AuthenticatedRequest, validateAuth } from '../middleware/auth';
import { ApiError, asyncHandler } from '../middleware/errorHandler';
import { honeycombResourceService } from '../services/honeycomb/resources';
import { prisma } from '../config/database';
import type { ResourceType } from '@prisma/client';

const router: any = Router();

// All resource routes require authentication
router.use(validateAuth as any);

// Validation rules
const resourceAwardValidation = [
  body('resourceType')
    .isIn(['CODE_POINTS', 'BUSINESS_ACUMEN', 'MARKETING_INFLUENCE', 'NETWORK_CONNECTIONS', 'FUNDING_TOKENS', 'DESIGN_CREATIVITY', 'PRODUCT_VISION'])
    .withMessage('Invalid resource type'),
  body('amount')
    .isInt({ min: 1, max: 100000 })
    .withMessage('Amount must be between 1 and 100000'),
  body('source')
    .isIn(['MISSION', 'CRAFTING', 'TRADE', 'STAKING', 'EVENT', 'ADMIN'])
    .withMessage('Invalid source type'),
  body('description')
    .isString()
    .isLength({ min: 1, max: 200 })
    .withMessage('Description is required and must be less than 200 characters'),
];

const craftingStartValidation = [
  body('recipeId')
    .isString()
    .withMessage('Recipe ID is required'),
];

const resourceTransferValidation = [
  body('toUserId')
    .isString()
    .withMessage('Target user ID is required'),
  body('resourceType')
    .isIn(['CODE_POINTS', 'BUSINESS_ACUMEN', 'MARKETING_INFLUENCE', 'NETWORK_CONNECTIONS', 'FUNDING_TOKENS', 'DESIGN_CREATIVITY', 'PRODUCT_VISION'])
    .withMessage('Invalid resource type'),
  body('amount')
    .isInt({ min: 1, max: 10000 })
    .withMessage('Amount must be between 1 and 10000'),
  body('reason')
    .isString()
    .isLength({ min: 1, max: 100 })
    .withMessage('Reason is required'),
];

// GET /api/resources/inventory - Get user's resource inventory
router.get('/inventory', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;

  try {
    const inventory = await honeycombResourceService.getUserInventory(userId);
    
    // Calculate total wealth
    const totalWealth = inventory.reduce((sum, inv) => sum + inv.amount, 0);
    
    // Get recent transactions across all resources
    const recentTransactions = await prisma.resourceTransaction.findMany({
      where: {
        inventory: { userId }
      },
      include: {
        inventory: { select: { resourceType: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    res.json({
      success: true,
      data: {
        inventory: inventory.map(inv => ({
          resourceType: inv.resourceType,
          amount: inv.amount,
          totalEarned: inv.totalEarned,
          totalSpent: inv.totalSpent,
          lastEarned: inv.lastEarned,
          recentTransactions: inv.transactions
        })),
        totalWealth,
        recentTransactions: recentTransactions.map(tx => ({
          id: tx.id,
          resourceType: tx.inventory.resourceType,
          type: tx.type,
          amount: tx.amount,
          description: tx.description,
          sourceType: tx.sourceType,
          createdAt: tx.createdAt
        }))
      }
    });
  } catch (error: any) {
    throw new ApiError(error.message || 'Failed to get inventory', 500);
  }
}));

// GET /api/resources/balance/:resourceType - Get specific resource balance
router.get('/balance/:resourceType', [
  param('resourceType')
    .isIn(['CODE_POINTS', 'BUSINESS_ACUMEN', 'MARKETING_INFLUENCE', 'NETWORK_CONNECTIONS', 'FUNDING_TOKENS', 'DESIGN_CREATIVITY', 'PRODUCT_VISION'])
    .withMessage('Invalid resource type'),
], asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError('Validation failed', 400, errors.array());
  }

  const userId = req.user!.id;
  const { resourceType } = req.params;

  try {
    const inventory = await prisma.userResourceInventory.findUnique({
      where: {
        userId_resourceType: { userId, resourceType: resourceType as ResourceType }
      },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    });

    res.json({
      success: true,
      data: {
        resourceType,
        balance: inventory?.amount || 0,
        totalEarned: inventory?.totalEarned || 0,
        totalSpent: inventory?.totalSpent || 0,
        lastEarned: inventory?.lastEarned,
        recentTransactions: inventory?.transactions || []
      }
    });
  } catch (error: any) {
    throw new ApiError(error.message || 'Failed to get balance', 500);
  }
}));

// POST /api/resources/award - Award resources to user (admin/system use)
router.post('/award', resourceAwardValidation, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError('Validation failed', 400, errors.array());
  }

  const userId = req.user!.id;
  const { resourceType, amount, source, sourceId, description } = req.body;

  try {
    const result = await honeycombResourceService.awardResources({
      userId,
      resourceType: resourceType as ResourceType,
      amount,
      source,
      sourceId,
      description
    });

    res.json({
      success: true,
      data: {
        resourceType,
        amountAwarded: amount,
        newBalance: result.newBalance,
        totalEarned: result.totalEarned,
        transactionId: result.transaction.id,
        message: `Awarded ${amount} ${resourceType.replace('_', ' ').toLowerCase()}!`
      }
    });
  } catch (error: any) {
    throw new ApiError(error.message || 'Failed to award resources', 500);
  }
}));

// GET /api/resources/crafting/recipes - Get available crafting recipes
router.get('/crafting/recipes', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;

  try {
    const recipes = await honeycombResourceService.getAvailableRecipes(userId);
    
    res.json({
      success: true,
      data: {
        recipes: recipes.map(recipe => ({
          id: recipe.id,
          name: recipe.name,
          description: recipe.description,
          category: recipe.category,
          requiredResources: recipe.requiredResources,
          requiredLevel: recipe.requiredLevel,
          requiredKingdom: recipe.requiredKingdom,
          craftingTime: recipe.craftingTime,
          successRate: recipe.successRate,
          resultType: recipe.resultType,
          resultMetadata: recipe.resultMetadata,
          canCraft: recipe.canCraft,
          missingResources: recipe.missingResources,
          isActive: recipe.isActive
        })),
        totalRecipes: recipes.length,
        availableRecipes: recipes.filter(r => r.canCraft).length
      }
    });
  } catch (error: any) {
    throw new ApiError(error.message || 'Failed to get crafting recipes', 500);
  }
}));

// POST /api/resources/crafting/start - Start crafting job
router.post('/crafting/start', craftingStartValidation, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError('Validation failed', 400, errors.array());
  }

  const userId = req.user!.id;
  const { recipeId } = req.body;

  try {
    const craftingJob = await honeycombResourceService.startCrafting({
      userId,
      recipeId
    });

    const recipe = await prisma.craftingRecipe.findUnique({ where: { id: recipeId } });

    res.json({
      success: true,
      data: {
        craftingJob: {
          id: craftingJob.id,
          recipeId: craftingJob.recipeId,
          status: craftingJob.status,
          startedAt: craftingJob.startedAt,
          completedAt: craftingJob.completedAt,
          progressPercent: craftingJob.progressPercent,
          resourcesSpent: craftingJob.resourcesSpent
        },
        recipe: {
          name: recipe?.name,
          craftingTime: recipe?.craftingTime
        },
        message: craftingJob.status === 'COMPLETED' 
          ? `${recipe?.name} crafted successfully!`
          : `Started crafting ${recipe?.name}. Will complete in ${Math.ceil((recipe?.craftingTime || 0) / 60)} minutes.`
      }
    });
  } catch (error: any) {
    throw new ApiError(error.message || 'Failed to start crafting', 500);
  }
}));

// GET /api/resources/crafting/jobs - Get user's crafting jobs
router.get('/crafting/jobs', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;

  try {
    const jobs = await prisma.craftingJob.findMany({
      where: { userId },
      include: {
        recipe: {
          select: {
            name: true,
            description: true,
            craftingTime: true,
            resultType: true,
            resultMetadata: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    // Calculate progress for in-progress jobs
    const jobsWithProgress = jobs.map(job => {
      let progressPercent = job.progressPercent;
      
      if (job.status === 'IN_PROGRESS' && job.recipe.craftingTime > 0) {
        const elapsed = Date.now() - job.startedAt.getTime();
        const total = job.recipe.craftingTime * 1000;
        progressPercent = Math.min(Math.floor((elapsed / total) * 100), 100);
      }

      return {
        ...job,
        progressPercent,
        timeRemaining: job.status === 'IN_PROGRESS' && job.completedAt
          ? Math.max(0, job.completedAt.getTime() - Date.now())
          : 0
      };
    });

    res.json({
      success: true,
      data: {
        jobs: jobsWithProgress,
        activeJobs: jobsWithProgress.filter(j => j.status === 'IN_PROGRESS').length,
        completedJobs: jobsWithProgress.filter(j => j.status === 'COMPLETED').length
      }
    });
  } catch (error: any) {
    throw new ApiError(error.message || 'Failed to get crafting jobs', 500);
  }
}));

// POST /api/resources/crafting/:jobId/complete - Complete crafting job (if time elapsed)
router.post('/crafting/:jobId/complete', [
  param('jobId').isString().withMessage('Job ID required'),
], asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError('Validation failed', 400, errors.array());
  }

  const { jobId } = req.params;
  const userId = req.user!.id;

  try {
    // Verify job belongs to user
    const job = await prisma.craftingJob.findFirst({
      where: { id: jobId, userId },
      include: { recipe: true }
    });

    if (!job) {
      throw new ApiError('Crafting job not found', 404);
    }

    if (job.status !== 'IN_PROGRESS') {
      throw new ApiError('Job is not in progress', 400);
    }

    // Check if enough time has passed
    const now = new Date();
    if (job.completedAt && now < job.completedAt) {
      const timeRemaining = Math.ceil((job.completedAt.getTime() - now.getTime()) / 1000);
      throw new ApiError(`Crafting not ready yet. ${timeRemaining} seconds remaining.`, 400);
    }

    const result = await honeycombResourceService.completeCrafting(jobId);

    res.json({
      success: true,
      data: {
        ...result,
        message: result.success 
          ? `Successfully crafted ${job.recipe.name}!`
          : `Crafting ${job.recipe.name} failed. Better luck next time!`
      }
    });
  } catch (error: any) {
    throw new ApiError(error.message || 'Failed to complete crafting', 500);
  }
}));

// POST /api/resources/transfer - Transfer resources to another user
router.post('/transfer', resourceTransferValidation, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError('Validation failed', 400, errors.array());
  }

  const fromUserId = req.user!.id;
  const { toUserId, resourceType, amount, reason } = req.body;

  try {
    // Verify target user exists
    const targetUser = await prisma.user.findUnique({ 
      where: { id: toUserId },
      select: { id: true, displayName: true }
    });

    if (!targetUser) {
      throw new ApiError('Target user not found', 404);
    }

    if (fromUserId === toUserId) {
      throw new ApiError('Cannot transfer to yourself', 400);
    }

    const result = await honeycombResourceService.transferResources({
      fromUserId,
      toUserId,
      resourceType: resourceType as ResourceType,
      amount,
      reason
    });

    res.json({
      success: true,
      data: {
        transfer: {
          resourceType,
          amount,
          reason,
          targetUser: targetUser.displayName,
          senderNewBalance: result.senderNewBalance,
          receiverNewBalance: result.receiverNewBalance
        },
        message: `Successfully transferred ${amount} ${resourceType.replace('_', ' ').toLowerCase()} to ${targetUser.displayName}!`
      }
    });
  } catch (error: any) {
    throw new ApiError(error.message || 'Failed to transfer resources', 500);
  }
}));

// GET /api/resources/check-balance - Check if user has enough resources
router.post('/check-balance', [
  body('resources')
    .isObject()
    .withMessage('Resources must be an object with resource types as keys and amounts as values'),
], asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError('Validation failed', 400, errors.array());
  }

  const userId = req.user!.id;
  const { resources } = req.body;

  try {
    const result = await honeycombResourceService.checkResourceBalance(userId, resources);

    res.json({
      success: true,
      data: {
        hasEnough: result.hasEnough,
        balances: result.balances,
        missing: result.missing,
        canAfford: result.hasEnough
      }
    });
  } catch (error: any) {
    throw new ApiError(error.message || 'Failed to check balance', 500);
  }
}));

// GET /api/resources/types - Get all available resource types with descriptions
router.get('/types', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const resourceTypes = [
    {
      type: 'CODE_POINTS',
      name: 'Code Points',
      description: 'Technical expertise and programming prowess',
      icon: '💻',
      color: 'text-blue-400',
      category: 'TECHNICAL'
    },
    {
      type: 'BUSINESS_ACUMEN',
      name: 'Business Acumen',
      description: 'Strategic thinking and business knowledge',
      icon: '📊',
      color: 'text-green-400',
      category: 'BUSINESS'
    },
    {
      type: 'MARKETING_INFLUENCE',
      name: 'Marketing Influence',
      description: 'Brand power and marketing reach',
      icon: '📢',
      color: 'text-yellow-400',
      category: 'MARKETING'
    },
    {
      type: 'NETWORK_CONNECTIONS',
      name: 'Network Connections',
      description: 'Professional relationships and contacts',
      icon: '👥',
      color: 'text-purple-400',
      category: 'COMMUNITY'
    },
    {
      type: 'FUNDING_TOKENS',
      name: 'Funding Tokens',
      description: 'Investment capital and financial resources',
      icon: '💰',
      color: 'text-orange-400',
      category: 'FINANCIAL'
    },
    {
      type: 'DESIGN_CREATIVITY',
      name: 'Design Creativity',
      description: 'Creative vision and aesthetic expertise',
      icon: '🎨',
      color: 'text-pink-400',
      category: 'CREATIVE'
    },
    {
      type: 'PRODUCT_VISION',
      name: 'Product Vision',
      description: 'Product strategy and user experience insight',
      icon: '🚀',
      color: 'text-indigo-400',
      category: 'PRODUCT'
    }
  ];

  res.json({
    success: true,
    data: { resourceTypes }
  });
}));

// POST /api/resources/admin/initialize - Initialize default crafting recipes (admin only)
router.post('/admin/initialize', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  // TODO: Add admin role check
  const user = req.user!;
  
  if (user.role !== 'ADMIN') {
    throw new ApiError('Admin access required', 403);
  }

  try {
    await honeycombResourceService.initializeCraftingRecipes();
    
    res.json({
      success: true,
      data: {
        message: 'Crafting recipes initialized successfully!'
      }
    });
  } catch (error: any) {
    throw new ApiError(error.message || 'Failed to initialize recipes', 500);
  }
}));

export default router;