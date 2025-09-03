import { Router, Response } from 'express';
import { body, param, validationResult } from 'express-validator';
import { AuthenticatedRequest, validateAuth } from '../middleware/auth';
import { ApiError, asyncHandler } from '../middleware/errorHandler';
import { honeycombStakingService } from '../services/honeycomb/staking';
import { prisma } from '../config/database';

const router: any = Router();

// All staking routes require authentication
router.use(validateAuth as any);

// Validation rules
const stakeCharacterValidation = [
  body('poolId')
    .isString()
    .withMessage('Pool ID is required'),
  body('stakingPeriod')
    .optional()
    .isInt({ min: 86400, max: 31536000 }) // 1 day to 1 year
    .withMessage('Staking period must be between 1 day and 1 year'),
];

// GET /api/staking/pools - Get all available staking pools
router.get('/pools', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    const pools = await honeycombStakingService.getActiveStakingPools();
    
    // Add additional information for each pool
    const poolsWithDetails = pools.map(pool => ({
      id: pool.id,
      name: pool.name,
      description: pool.description,
      poolType: pool.poolType,
      stakingAsset: pool.stakingAsset,
      rewardAsset: pool.rewardAsset,
      stakingAPY: pool.stakingAPY,
      minimumStake: pool.minimumStake,
      stakingPeriod: pool.stakingPeriod,
      compoundingRate: pool.compoundingRate,
      
      // Capacity information
      maxStakers: pool.maxStakers,
      currentStakers: pool.totalStakers,
      availableSlots: pool.maxStakers ? pool.maxStakers - pool.totalStakers : null,
      maxTotalStaked: pool.maxTotalStaked,
      currentStaked: pool.totalStaked,
      utilizationPercent: pool.maxTotalStaked 
        ? Math.floor((pool.totalStaked / pool.maxTotalStaked) * 100)
        : Math.floor((pool.totalStakers / (pool.maxStakers || 1000)) * 100),
      
      // Status
      isActive: pool.isActive,
      isFull: pool.maxStakers ? pool.totalStakers >= pool.maxStakers : false,
      
      // Rewards info
      totalRewardsPaid: pool.totalRewardsPaid,
      
      // Time information
      startDate: pool.startDate,
      endDate: pool.endDate,
      
      // Formatting helpers
      stakingPeriodFormatted: formatDuration(pool.stakingPeriod),
      rewardRateFormatted: `${(pool.rewardRate * 100).toFixed(1)}% APY`,
    }));

    res.json({
      success: true,
      data: {
        pools: poolsWithDetails,
        summary: {
          totalPools: pools.length,
          totalStakers: pools.reduce((sum, pool) => sum + pool.totalStakers, 0),
          totalValueLocked: pools.reduce((sum, pool) => sum + pool.totalStaked, 0),
          averageAPY: pools.reduce((sum, pool) => sum + pool.stakingAPY, 0) / pools.length
        }
      }
    });

  } catch (error: any) {
    throw new ApiError(error.message || 'Failed to get staking pools', 500);
  }
}));

// GET /api/staking/pools/:poolId - Get specific pool details
router.get('/pools/:poolId', [
  param('poolId').isString().withMessage('Pool ID is required'),
], asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError('Validation failed', 400, errors.array());
  }

  const { poolId } = req.params;

  try {
    const pool = await prisma.stakingPool.findUnique({
      where: { id: poolId },
      include: {
        stakes: {
          where: { isActive: true },
          include: {
            character: {
              select: {
                name: true,
                level: true,
                kingdom: true,
                user: {
                  select: {
                    displayName: true
                  }
                }
              }
            }
          },
          orderBy: { stakedAt: 'desc' },
          take: 10 // Recent stakers
        }
      }
    });

    if (!pool) {
      throw new ApiError('Staking pool not found', 404);
    }

    // Calculate pool statistics
    const avgStakingTime = pool.stakes.length > 0 
      ? pool.stakes.reduce((sum, stake) => {
          const timeStaked = Date.now() - stake.stakedAt.getTime();
          return sum + timeStaked;
        }, 0) / pool.stakes.length / (1000 * 60 * 60 * 24) // in days
      : 0;

    const recentActivity = pool.stakes.map(stake => ({
      characterName: stake.character.name,
      founderName: stake.character.user.displayName,
      stakedAt: stake.stakedAt,
      timeStaked: formatDuration((Date.now() - stake.stakedAt.getTime()) / 1000),
      unlockAt: stake.unlockAt,
      isUnlocked: new Date() > stake.unlockAt
    }));

    res.json({
      success: true,
      data: {
        pool: {
          ...pool,
          stakingAPY: pool.rewardRate * 100,
          stakingPeriodFormatted: formatDuration(pool.stakingPeriod),
          utilizationPercent: pool.maxTotalStaked 
            ? Math.floor((pool.totalStaked / pool.maxTotalStaked) * 100)
            : Math.floor((pool.totalStakers / (pool.maxStakers || 1000)) * 100),
        },
        statistics: {
          averageStakingTime: Math.floor(avgStakingTime),
          totalValueLocked: pool.totalStaked,
          totalRewardsPaid: pool.totalRewardsPaid,
          activeStakers: pool.stakes.length
        },
        recentActivity
      }
    });

  } catch (error: any) {
    throw new ApiError(error.message || 'Failed to get pool details', 500);
  }
}));

// POST /api/staking/stake - Stake character in a pool
router.post('/stake', stakeCharacterValidation, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError('Validation failed', 400, errors.array());
  }

  const userId = req.user!.id;
  const { poolId, stakingPeriod } = req.body;

  try {
    // Get user's character
    const character = await prisma.founderCharacter.findUnique({
      where: { userId }
    });

    if (!character) {
      throw new ApiError('No character found. Create a character first.', 400);
    }

    if (character.isStaked) {
      throw new ApiError('Character is already staked in another pool', 400);
    }

    // Get pool details for validation
    const pool = await prisma.stakingPool.findUnique({
      where: { id: poolId }
    });

    if (!pool) {
      throw new ApiError('Staking pool not found', 404);
    }

    const result = await honeycombStakingService.stakeCharacter({
      characterId: character.id,
      poolId,
      stakingPeriod
    });

    res.json({
      success: true,
      data: {
        stake: {
          id: result.stake.id,
          poolName: pool.name,
          poolType: pool.poolType,
          stakedAt: result.stake.stakedAt,
          unlockDate: result.unlockDate,
          stakingPeriod: pool.stakingPeriod,
          stakingPeriodFormatted: formatDuration(pool.stakingPeriod)
        },
        estimatedRewards: result.estimatedRewards,
        character: {
          id: character.id,
          name: character.name,
          level: character.level,
          kingdom: character.kingdom
        },
        message: `Successfully staked ${character.name} in ${pool.name}! Rewards will be available in ${formatDuration(pool.stakingPeriod)}.`
      }
    });

  } catch (error: any) {
    throw new ApiError(error.message || 'Failed to stake character', 500);
  }
}));

// POST /api/staking/:stakeId/unstake - Unstake character
router.post('/:stakeId/unstake', [
  param('stakeId').isString().withMessage('Stake ID is required'),
], asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError('Validation failed', 400, errors.array());
  }

  const { stakeId } = req.params;
  const userId = req.user!.id;

  try {
    // Verify stake belongs to user
    const stake = await prisma.characterStake.findFirst({
      where: { 
        id: stakeId,
        character: { userId }
      },
      include: { 
        pool: true,
        character: true 
      }
    });

    if (!stake) {
      throw new ApiError('Stake not found or does not belong to you', 404);
    }

    const isEarlyUnstake = new Date() < stake.unlockAt;
    
    const result = await honeycombStakingService.unstakeCharacter(stakeId);

    const timeStaked = Date.now() - stake.stakedAt.getTime();

    res.json({
      success: true,
      data: {
        unstake: {
          characterName: stake.character.name,
          poolName: stake.pool.name,
          stakedAt: stake.stakedAt,
          unstakedAt: new Date(),
          timeStaked: formatDuration(timeStaked / 1000),
          wasEarlyUnstake: result.penaltyApplied
        },
        rewards: result.rewards,
        penalties: result.penaltyApplied ? {
          applied: true,
          penaltyRate: 0.25,
          message: 'Early unstake penalty of 25% was applied to rewards'
        } : {
          applied: false
        },
        message: result.penaltyApplied 
          ? `Character unstaked early with 25% penalty. Received ${result.rewards.totalReward} rewards.`
          : `Character unstaked successfully! Received ${result.rewards.totalReward} rewards.`
      }
    });

  } catch (error: any) {
    throw new ApiError(error.message || 'Failed to unstake character', 500);
  }
}));

// POST /api/staking/:stakeId/claim - Claim rewards without unstaking
router.post('/:stakeId/claim', [
  param('stakeId').isString().withMessage('Stake ID is required'),
], asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError('Validation failed', 400, errors.array());
  }

  const { stakeId } = req.params;
  const userId = req.user!.id;

  try {
    // Verify stake belongs to user
    const stake = await prisma.characterStake.findFirst({
      where: { 
        id: stakeId,
        character: { userId }
      },
      include: { pool: true }
    });

    if (!stake) {
      throw new ApiError('Stake not found or does not belong to you', 404);
    }

    const result = await honeycombStakingService.claimStakingRewards(stakeId);

    res.json({
      success: true,
      data: {
        claim: {
          poolName: stake.pool.name,
          claimedAt: new Date(),
          nextClaimTime: result.nextClaimTime,
          claimInterval: stake.pool.compoundingRate,
          claimIntervalFormatted: formatClaimInterval(stake.pool.compoundingRate)
        },
        rewards: result.rewards,
        message: `Successfully claimed ${result.rewards.totalReward} rewards! Next claim available in ${formatClaimInterval(stake.pool.compoundingRate)}.`
      }
    });

  } catch (error: any) {
    throw new ApiError(error.message || 'Failed to claim rewards', 500);
  }
}));

// GET /api/staking/my-stakes - Get user's active stakes
router.get('/my-stakes', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;

  try {
    const stakes = await honeycombStakingService.getUserStakes(userId);

    // Calculate totals
    const summary = {
      totalActiveStakes: stakes.length,
      totalEarned: stakes.reduce((sum, stake) => sum + stake.totalEarned, 0),
      totalCurrentRewards: stakes.reduce((sum, stake) => sum + stake.currentRewards.totalReward, 0),
      stakesReadyToUnstake: stakes.filter(stake => stake.canUnstake).length,
      stakesWithClaimableRewards: stakes.filter(stake => {
        if (!stake.lastClaim) return true;
        const timeSinceClaim = Date.now() - new Date(stake.lastClaim).getTime();
        const claimInterval = getClaimIntervalMs(stake.pool.compoundingRate);
        return timeSinceClaim >= claimInterval;
      }).length
    };

    // Sort stakes by unlock time
    const sortedStakes = stakes.sort((a, b) => a.timeRemaining - b.timeRemaining);

    res.json({
      success: true,
      data: {
        stakes: sortedStakes.map(stake => ({
          ...stake,
          timeRemainingFormatted: formatDuration(stake.timeRemaining),
          timeStakedFormatted: formatDuration(stake.timeStaked),
          canClaimRewards: !stake.lastClaim || 
            (Date.now() - new Date(stake.lastClaim).getTime()) >= getClaimIntervalMs(stake.pool.compoundingRate)
        })),
        summary
      }
    });

  } catch (error: any) {
    throw new ApiError(error.message || 'Failed to get user stakes', 500);
  }
}));

// GET /api/staking/history - Get user's staking history
router.get('/history', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const { page = 1, limit = 20, status } = req.query;

  try {
    const skip = (Number(page) - 1) * Number(limit);
    
    const character = await prisma.founderCharacter.findUnique({
      where: { userId },
      select: { id: true }
    });

    if (!character) {
      return res.json({
        success: true,
        data: { stakes: [], pagination: { total: 0, pages: 0 } }
      });
    }

    const where: any = { characterId: character.id };
    
    if (status === 'active') {
      where.isActive = true;
    } else if (status === 'completed') {
      where.isActive = false;
      where.isUnstaked = true;
    }

    const [stakes, total] = await Promise.all([
      prisma.characterStake.findMany({
        where,
        include: {
          pool: {
            select: {
              name: true,
              poolType: true,
              rewardAsset: true,
              stakingPeriod: true
            }
          }
        },
        orderBy: { stakedAt: 'desc' },
        take: Number(limit),
        skip
      }),
      prisma.characterStake.count({ where })
    ]);

    const stakesWithDetails = stakes.map(stake => {
      const duration = stake.unstakedAt 
        ? stake.unstakedAt.getTime() - stake.stakedAt.getTime()
        : Date.now() - stake.stakedAt.getTime();
      
      return {
        id: stake.id,
        pool: stake.pool,
        stakedAt: stake.stakedAt,
        unlockAt: stake.unlockAt,
        unstakedAt: stake.unstakedAt,
        isActive: stake.isActive,
        rewardsEarned: stake.rewardsEarned,
        duration: Math.floor(duration / 1000), // in seconds
        durationFormatted: formatDuration(duration / 1000),
        wasEarlyUnstake: stake.unstakedAt && stake.unstakedAt < stake.unlockAt
      };
    });

    // Calculate statistics
    const stats = {
      totalStakes: total,
      activeStakes: stakes.filter(s => s.isActive).length,
      completedStakes: stakes.filter(s => !s.isActive).length,
      totalRewardsEarned: stakes.reduce((sum, s) => sum + s.rewardsEarned, 0),
      averageStakingTime: stakes.length > 0 
        ? Math.floor(stakes.reduce((sum, s) => {
            const duration = s.unstakedAt 
              ? s.unstakedAt.getTime() - s.stakedAt.getTime()
              : Date.now() - s.stakedAt.getTime();
            return sum + duration;
          }, 0) / stakes.length / (1000 * 60 * 60 * 24)) // in days
        : 0
    };

    res.json({
      success: true,
      data: {
        stakes: stakesWithDetails,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        },
        statistics: stats
      }
    });

  } catch (error: any) {
    throw new ApiError(error.message || 'Failed to get staking history', 500);
  }
}));

// GET /api/staking/rewards-calculator - Calculate potential rewards
router.get('/rewards-calculator', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { poolId, stakingPeriod = 604800 } = req.query; // Default 7 days
  const userId = req.user!.id;

  if (!poolId) {
    throw new ApiError('Pool ID is required', 400);
  }

  try {
    const [pool, character] = await Promise.all([
      prisma.stakingPool.findUnique({ where: { id: poolId as string } }),
      prisma.founderCharacter.findUnique({ where: { userId } })
    ]);

    if (!pool) {
      throw new ApiError('Staking pool not found', 404);
    }

    if (!character) {
      throw new ApiError('Character not found', 404);
    }

    // Calculate rewards for different time periods
    const periods = [
      { name: '1 Day', seconds: 86400 },
      { name: '1 Week', seconds: 604800 },
      { name: '2 Weeks', seconds: 1209600 },
      { name: '1 Month', seconds: 2592000 },
      { name: 'Custom', seconds: Number(stakingPeriod) }
    ];

    const rewardCalculations = periods.map(period => {
      // Mock reward calculation (using simplified version)
      const annualRate = pool.rewardRate;
      const periodRate = (period.seconds / (365 * 24 * 60 * 60)) * annualRate;
      const baseReward = Math.floor(100 * periodRate);
      const levelBonus = Math.floor(character.level * 0.1);
      const totalReward = baseReward + levelBonus;

      return {
        period: period.name,
        duration: period.seconds,
        durationFormatted: formatDuration(period.seconds),
        baseReward,
        levelBonus,
        totalReward,
        dailyRate: Math.floor(totalReward / (period.seconds / 86400)),
        apy: Math.floor(annualRate * 100)
      };
    });

    res.json({
      success: true,
      data: {
        pool: {
          name: pool.name,
          apy: Math.floor(pool.rewardRate * 100),
          compoundingRate: pool.compoundingRate
        },
        character: {
          name: character.name,
          level: character.level,
          kingdom: character.kingdom
        },
        calculations: rewardCalculations,
        notes: [
          'Rewards are estimates based on current pool parameters',
          'Actual rewards may vary based on pool performance',
          'Early unstaking incurs a 25% penalty',
          'Character level provides bonus rewards',
          `Rewards compound ${pool.compoundingRate.toLowerCase()}`
        ]
      }
    });

  } catch (error: any) {
    throw new ApiError(error.message || 'Failed to calculate rewards', 500);
  }
}));

// POST /api/staking/admin/initialize - Initialize staking pools (admin only)
router.post('/admin/initialize', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  
  if (user.role !== 'ADMIN') {
    throw new ApiError('Admin access required', 403);
  }

  try {
    await honeycombStakingService.initializeStakingPools();
    
    res.json({
      success: true,
      data: {
        message: 'Staking system initialized successfully!',
        pools: [
          'Territory Defense Pool - 15% APY, 7 days',
          'Founder Development Pool - 25% APY, 14 days', 
          'Guild Treasury Pool - 35% APY, 30 days',
          'Resource Generation Pool - 12% APY, 5 days',
          'Elite Founders Circle - 50% APY, 60 days'
        ]
      }
    });
  } catch (error: any) {
    throw new ApiError(error.message || 'Failed to initialize staking system', 500);
  }
}));

// Helper functions
function formatDuration(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (days > 0) {
    return `${days}d ${hours}h`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
}

function formatClaimInterval(compoundingRate: string): string {
  switch (compoundingRate) {
    case 'DAILY':
      return '24 hours';
    case 'WEEKLY':
      return '7 days';
    case 'MONTHLY':
      return '30 days';
    default:
      return '24 hours';
  }
}

function getClaimIntervalMs(compoundingRate: string): number {
  switch (compoundingRate) {
    case 'DAILY':
      return 24 * 60 * 60 * 1000;
    case 'WEEKLY':
      return 7 * 24 * 60 * 60 * 1000;
    case 'MONTHLY':
      return 30 * 24 * 60 * 60 * 1000;
    default:
      return 24 * 60 * 60 * 1000;
  }
}

export default router;