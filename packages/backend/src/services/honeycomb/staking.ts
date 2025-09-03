import { prisma } from '../../config/database';
import { honeycombService } from './client';
import { honeycombResourceService } from './resources';
import type { 
  StakingPool, 
  CharacterStake, 
  StakingPoolType,
  FounderCharacter,
  ResourceType 
} from '@prisma/client';

export interface StakingPoolCreationData {
  name: string;
  description: string;
  poolType: StakingPoolType;
  stakingAsset: 'CHARACTERS' | 'RESOURCES' | 'TERRITORIES';
  rewardAsset: 'XP' | 'RESOURCES' | 'TOKENS';
  minimumStake: number;
  stakingPeriod: number; // in seconds
  rewardRate: number; // annual percentage as decimal (0.1 = 10%)
  compoundingRate: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  maxStakers?: number;
  maxTotalStaked?: number;
  startDate?: Date;
  endDate?: Date;
}

export interface StakeCharacterData {
  characterId: string;
  poolId: string;
  stakingPeriod?: number; // Override default if allowed
}

export interface StakeRewards {
  baseReward: number;
  compoundedReward: number;
  bonusReward: number;
  totalReward: number;
  resourceRewards?: Record<ResourceType, number>;
}

// Pre-defined staking pools for different purposes
const DEFAULT_STAKING_POOLS: StakingPoolCreationData[] = [
  {
    name: 'Territory Defense Pool',
    description: 'Stake your character to defend and earn rewards from territory control',
    poolType: 'TERRITORY_CONTROL',
    stakingAsset: 'CHARACTERS',
    rewardAsset: 'RESOURCES',
    minimumStake: 1,
    stakingPeriod: 604800, // 7 days
    rewardRate: 0.15, // 15% annual
    compoundingRate: 'DAILY',
    maxStakers: 100
  },
  {
    name: 'Founder Development Pool', 
    description: 'Long-term character staking for accelerated growth and evolution',
    poolType: 'CHARACTER_DEVELOPMENT',
    stakingAsset: 'CHARACTERS',
    rewardAsset: 'XP',
    minimumStake: 1,
    stakingPeriod: 1209600, // 14 days
    rewardRate: 0.25, // 25% annual
    compoundingRate: 'WEEKLY',
    maxStakers: 200
  },
  {
    name: 'Guild Treasury Pool',
    description: 'Team staking pool for guild benefits and collective rewards',
    poolType: 'GUILD_TREASURY',
    stakingAsset: 'CHARACTERS',
    rewardAsset: 'TOKENS',
    minimumStake: 3, // Requires team coordination
    stakingPeriod: 2592000, // 30 days
    rewardRate: 0.35, // 35% annual
    compoundingRate: 'MONTHLY',
    maxStakers: 50,
    maxTotalStaked: 500
  },
  {
    name: 'Resource Generation Pool',
    description: 'Stake to generate passive income from various startup resources',
    poolType: 'RESOURCE_GENERATION',
    stakingAsset: 'CHARACTERS',
    rewardAsset: 'RESOURCES',
    minimumStake: 1,
    stakingPeriod: 432000, // 5 days
    rewardRate: 0.12, // 12% annual
    compoundingRate: 'DAILY',
    maxStakers: 500
  },
  {
    name: 'Elite Founders Circle',
    description: 'Exclusive high-level staking for legendary founders only',
    poolType: 'CHARACTER_DEVELOPMENT',
    stakingAsset: 'CHARACTERS',
    rewardAsset: 'TOKENS',
    minimumStake: 1,
    stakingPeriod: 5184000, // 60 days
    rewardRate: 0.50, // 50% annual
    compoundingRate: 'WEEKLY',
    maxStakers: 25,
    maxTotalStaked: 100
  }
];

class HoneycombStakingService {

  /**
   * Initialize default staking pools
   */
  async initializeStakingPools(): Promise<void> {
    console.log('🏦 Initializing staking pools...');

    for (const poolData of DEFAULT_STAKING_POOLS) {
      try {
        await this.createStakingPool(poolData);
      } catch (error) {
        console.error(`Failed to initialize pool ${poolData.name}:`, error);
      }
    }

    console.log(`✅ Initialized ${DEFAULT_STAKING_POOLS.length} staking pools`);
  }

  /**
   * Create a new staking pool
   */
  async createStakingPool(data: StakingPoolCreationData): Promise<StakingPool> {
    try {
      const pool = await prisma.stakingPool.upsert({
        where: { name: data.name },
        update: {
          description: data.description,
          poolType: data.poolType,
          stakingAsset: data.stakingAsset,
          rewardAsset: data.rewardAsset,
          minimumStake: data.minimumStake,
          stakingPeriod: data.stakingPeriod,
          rewardRate: data.rewardRate,
          compoundingRate: data.compoundingRate,
          maxStakers: data.maxStakers,
          maxTotalStaked: data.maxTotalStaked,
          startDate: data.startDate || new Date(),
          endDate: data.endDate,
          isActive: true
        },
        create: {
          name: data.name,
          description: data.description,
          poolType: data.poolType,
          stakingAsset: data.stakingAsset,
          rewardAsset: data.rewardAsset,
          minimumStake: data.minimumStake,
          stakingPeriod: data.stakingPeriod,
          rewardRate: data.rewardRate,
          compoundingRate: data.compoundingRate,
          maxStakers: data.maxStakers,
          maxTotalStaked: data.maxTotalStaked,
          startDate: data.startDate || new Date(),
          endDate: data.endDate,
          isActive: true,
          totalStaked: 0,
          totalStakers: 0,
          totalRewardsPaid: 0
        }
      });

      console.log(`🏦 Created/updated staking pool: ${data.name}`);
      return pool;

    } catch (error) {
      console.error('Failed to create staking pool:', error);
      throw new Error(`Failed to create staking pool: ${error.message}`);
    }
  }

  /**
   * Stake a character in a pool
   */
  async stakeCharacter(data: StakeCharacterData): Promise<{
    stake: CharacterStake;
    estimatedRewards: StakeRewards;
    unlockDate: Date;
  }> {
    const { characterId, poolId, stakingPeriod } = data;

    try {
      // Get pool and character details
      const [pool, character] = await Promise.all([
        prisma.stakingPool.findUnique({ where: { id: poolId } }),
        prisma.founderCharacter.findUnique({ 
          where: { id: characterId },
          include: { user: true }
        })
      ]);

      if (!pool) {
        throw new Error('Staking pool not found');
      }

      if (!character) {
        throw new Error('Character not found');
      }

      if (!pool.isActive) {
        throw new Error('Staking pool is not active');
      }

      // Check if pool has capacity
      if (pool.maxStakers && pool.totalStakers >= pool.maxStakers) {
        throw new Error('Staking pool is at maximum capacity');
      }

      if (pool.maxTotalStaked && pool.totalStaked >= pool.maxTotalStaked) {
        throw new Error('Staking pool is at maximum stake limit');
      }

      // Check if character is already staked
      const existingStake = await prisma.characterStake.findFirst({
        where: { characterId, isActive: true }
      });

      if (existingStake) {
        throw new Error('Character is already staked in another pool');
      }

      // Check minimum requirements based on pool type
      const canStake = await this.checkStakingRequirements(character, pool);
      if (!canStake.allowed) {
        throw new Error(canStake.reason);
      }

      // Calculate staking period and unlock date
      const finalStakingPeriod = stakingPeriod || pool.stakingPeriod;
      const unlockDate = new Date(Date.now() + (finalStakingPeriod * 1000));

      // Create stake record
      const stake = await prisma.characterStake.create({
        data: {
          poolId,
          characterId,
          amountStaked: 1, // For characters, this is always 1
          stakedAt: new Date(),
          unlockAt: unlockDate,
          rewardsEarned: 0,
          compoundedRewards: 0,
          isActive: true
        }
      });

      // Update pool statistics
      await prisma.stakingPool.update({
        where: { id: poolId },
        data: {
          totalStaked: { increment: 1 },
          totalStakers: { increment: 1 }
        }
      });

      // Update character staking status
      await prisma.founderCharacter.update({
        where: { id: characterId },
        data: {
          isStaked: true,
          stakedUntil: unlockDate
        }
      });

      // Calculate estimated rewards
      const estimatedRewards = this.calculateEstimatedRewards(
        pool,
        finalStakingPeriod,
        character
      );

      // Record in Honeycomb Protocol
      try {
        await this.recordStakeInHoneycomb(character.user.walletAddress, {
          poolName: pool.name,
          characterId,
          stakingPeriod: finalStakingPeriod,
          estimatedRewards
        });
      } catch (error) {
        console.error('Failed to record stake in Honeycomb:', error);
      }

      console.log(`🔒 Staked character ${character.name} in pool ${pool.name}`);

      return {
        stake,
        estimatedRewards,
        unlockDate
      };

    } catch (error) {
      console.error('Failed to stake character:', error);
      throw new Error(`Failed to stake character: ${error.message}`);
    }
  }

  /**
   * Unstake a character and claim rewards
   */
  async unstakeCharacter(stakeId: string): Promise<{
    success: boolean;
    rewards: StakeRewards;
    penaltyApplied: boolean;
  }> {
    try {
      const stake = await prisma.characterStake.findUnique({
        where: { id: stakeId },
        include: {
          pool: true,
          character: {
            include: { user: true }
          }
        }
      });

      if (!stake) {
        throw new Error('Stake not found');
      }

      if (!stake.isActive) {
        throw new Error('Stake is not active');
      }

      const now = new Date();
      const isEarlyUnstake = now < stake.unlockAt;
      
      // Calculate final rewards (with penalty if early unstake)
      const timeStaked = now.getTime() - stake.stakedAt.getTime();
      const rewards = this.calculateFinalRewards(
        stake.pool,
        timeStaked,
        stake.character,
        isEarlyUnstake
      );

      // Update stake record
      await prisma.characterStake.update({
        where: { id: stakeId },
        data: {
          isActive: false,
          isUnstaked: true,
          unstakedAt: now,
          rewardsEarned: rewards.totalReward
        }
      });

      // Update pool statistics
      await prisma.stakingPool.update({
        where: { id: stake.poolId },
        data: {
          totalStaked: { decrement: 1 },
          totalStakers: { decrement: 1 },
          totalRewardsPaid: { increment: rewards.totalReward }
        }
      });

      // Update character staking status
      await prisma.founderCharacter.update({
        where: { id: stake.characterId },
        data: {
          isStaked: false,
          stakedUntil: null
        }
      });

      // Award rewards based on pool type
      await this.distributeStakingRewards(stake.character.userId, stake.pool, rewards);

      // Record in Honeycomb Protocol
      try {
        await this.recordUnstakeInHoneycomb(stake.character.user.walletAddress, {
          poolName: stake.pool.name,
          characterId: stake.characterId,
          rewards,
          isEarlyUnstake
        });
      } catch (error) {
        console.error('Failed to record unstake in Honeycomb:', error);
      }

      console.log(`🔓 Unstaked character ${stake.character.name} from ${stake.pool.name}`);

      return {
        success: true,
        rewards,
        penaltyApplied: isEarlyUnstake
      };

    } catch (error) {
      console.error('Failed to unstake character:', error);
      throw new Error(`Failed to unstake character: ${error.message}`);
    }
  }

  /**
   * Claim accumulated rewards without unstaking
   */
  async claimStakingRewards(stakeId: string): Promise<{
    success: boolean;
    rewards: StakeRewards;
    nextClaimTime: Date;
  }> {
    try {
      const stake = await prisma.characterStake.findUnique({
        where: { id: stakeId },
        include: {
          pool: true,
          character: { include: { user: true } }
        }
      });

      if (!stake) {
        throw new Error('Stake not found');
      }

      if (!stake.isActive) {
        throw new Error('Stake is not active');
      }

      // Check if rewards are available to claim
      const lastClaim = stake.lastRewardClaim || stake.stakedAt;
      const timeSinceLastClaim = Date.now() - lastClaim.getTime();
      const minClaimInterval = this.getClaimInterval(stake.pool.compoundingRate);

      if (timeSinceLastClaim < minClaimInterval) {
        throw new Error(`Can claim rewards every ${stake.pool.compoundingRate.toLowerCase()}`);
      }

      // Calculate claimable rewards
      const rewards = this.calculateClaimableRewards(stake.pool, timeSinceLastClaim, stake.character);

      // Update stake record
      await prisma.characterStake.update({
        where: { id: stakeId },
        data: {
          rewardsEarned: { increment: rewards.totalReward },
          compoundedRewards: { increment: rewards.compoundedReward },
          lastRewardClaim: new Date()
        }
      });

      // Update pool statistics
      await prisma.stakingPool.update({
        where: { id: stake.poolId },
        data: {
          totalRewardsPaid: { increment: rewards.totalReward }
        }
      });

      // Distribute rewards
      await this.distributeStakingRewards(stake.character.userId, stake.pool, rewards);

      const nextClaimTime = new Date(Date.now() + minClaimInterval);

      console.log(`💰 Claimed ${rewards.totalReward} rewards from ${stake.pool.name}`);

      return {
        success: true,
        rewards,
        nextClaimTime
      };

    } catch (error) {
      console.error('Failed to claim staking rewards:', error);
      throw new Error(`Failed to claim rewards: ${error.message}`);
    }
  }

  /**
   * Get all active staking pools
   */
  async getActiveStakingPools(): Promise<(StakingPool & { stakingAPY: number })[]> {
    try {
      const pools = await prisma.stakingPool.findMany({
        where: { isActive: true },
        include: { stakes: { where: { isActive: true } } }
      });

      return pools.map(pool => ({
        ...pool,
        stakingAPY: pool.rewardRate * 100, // Convert to percentage
        availableSlots: pool.maxStakers ? pool.maxStakers - pool.totalStakers : null,
        utilizationPercent: pool.maxTotalStaked 
          ? Math.floor((pool.totalStaked / pool.maxTotalStaked) * 100)
          : Math.floor((pool.totalStakers / (pool.maxStakers || 1000)) * 100)
      }));

    } catch (error) {
      console.error('Failed to get staking pools:', error);
      throw new Error(`Failed to get staking pools: ${error.message}`);
    }
  }

  /**
   * Get user's active stakes
   */
  async getUserStakes(userId: string): Promise<any[]> {
    try {
      const character = await prisma.founderCharacter.findUnique({
        where: { userId }
      });

      if (!character) {
        return [];
      }

      const stakes = await prisma.characterStake.findMany({
        where: {
          characterId: character.id,
          isActive: true
        },
        include: {
          pool: true,
          character: {
            select: {
              id: true,
              name: true,
              level: true,
              kingdom: true
            }
          }
        }
      });

      return stakes.map(stake => {
        const now = new Date();
        const timeRemaining = Math.max(0, stake.unlockAt.getTime() - now.getTime());
        const timeStaked = now.getTime() - stake.stakedAt.getTime();
        
        // Calculate current rewards
        const currentRewards = this.calculateClaimableRewards(
          stake.pool,
          timeStaked,
          stake.character as any
        );

        return {
          id: stake.id,
          pool: stake.pool,
          character: stake.character,
          stakedAt: stake.stakedAt,
          unlockAt: stake.unlockAt,
          timeRemaining: Math.floor(timeRemaining / 1000), // in seconds
          timeStaked: Math.floor(timeStaked / 1000), // in seconds
          canUnstake: timeRemaining <= 0,
          currentRewards,
          totalEarned: stake.rewardsEarned,
          lastClaim: stake.lastRewardClaim
        };
      });

    } catch (error) {
      console.error('Failed to get user stakes:', error);
      throw new Error(`Failed to get user stakes: ${error.message}`);
    }
  }

  /**
   * Check if character meets staking requirements
   */
  private async checkStakingRequirements(character: FounderCharacter, pool: StakingPool): Promise<{
    allowed: boolean;
    reason?: string;
  }> {
    // Check character level requirements based on pool type
    const minLevels = {
      TERRITORY_CONTROL: 10,
      CHARACTER_DEVELOPMENT: 5,
      GUILD_TREASURY: 15,
      RESOURCE_GENERATION: 1
    };

    const requiredLevel = minLevels[pool.poolType] || 1;
    if (character.level < requiredLevel) {
      return {
        allowed: false,
        reason: `Character must be level ${requiredLevel} or higher for this pool`
      };
    }

    // Special requirements for elite pools
    if (pool.name.includes('Elite')) {
      if (character.level < 50 || character.reputationScore < 1000) {
        return {
          allowed: false,
          reason: 'Elite pools require level 50+ and 1000+ reputation'
        };
      }
    }

    return { allowed: true };
  }

  /**
   * Calculate estimated rewards for a staking period
   */
  private calculateEstimatedRewards(
    pool: StakingPool,
    stakingPeriod: number,
    character: FounderCharacter
  ): StakeRewards {
    const annualRate = pool.rewardRate;
    const periodRate = (stakingPeriod / (365 * 24 * 60 * 60)) * annualRate;
    
    // Base reward calculation
    const baseReward = Math.floor(100 * periodRate); // Base 100 points

    // Character bonuses
    const levelBonus = Math.floor(character.level * 0.1);
    const reputationBonus = Math.floor(character.reputationScore * 0.01);
    const bonusReward = levelBonus + reputationBonus;

    // Compounding calculation (simplified)
    const compoundingMultiplier = this.getCompoundingMultiplier(pool.compoundingRate, stakingPeriod);
    const compoundedReward = Math.floor(baseReward * compoundingMultiplier);

    const totalReward = baseReward + bonusReward + compoundedReward;

    return {
      baseReward,
      compoundedReward,
      bonusReward,
      totalReward
    };
  }

  /**
   * Calculate final rewards with penalties for early unstaking
   */
  private calculateFinalRewards(
    pool: StakingPool,
    timeStaked: number,
    character: FounderCharacter,
    isEarlyUnstake: boolean
  ): StakeRewards {
    const rewards = this.calculateEstimatedRewards(pool, timeStaked / 1000, character);
    
    if (isEarlyUnstake) {
      // Apply 25% penalty for early unstaking
      const penalty = 0.25;
      rewards.baseReward = Math.floor(rewards.baseReward * (1 - penalty));
      rewards.compoundedReward = Math.floor(rewards.compoundedReward * (1 - penalty));
      rewards.totalReward = rewards.baseReward + rewards.bonusReward + rewards.compoundedReward;
    }

    return rewards;
  }

  /**
   * Calculate claimable rewards for a time period
   */
  private calculateClaimableRewards(
    pool: StakingPool,
    timeStaked: number,
    character: FounderCharacter
  ): StakeRewards {
    // Calculate rewards for the specific time period
    const periodInSeconds = timeStaked / 1000;
    return this.calculateEstimatedRewards(pool, periodInSeconds, character);
  }

  /**
   * Get compounding multiplier based on frequency
   */
  private getCompoundingMultiplier(rate: string, stakingPeriod: number): number {
    const periodInDays = stakingPeriod / (24 * 60 * 60);
    
    switch (rate) {
      case 'DAILY':
        return 1 + (periodInDays * 0.01); // 1% per day compounding
      case 'WEEKLY':
        return 1 + (Math.floor(periodInDays / 7) * 0.05); // 5% per week
      case 'MONTHLY':
        return 1 + (Math.floor(periodInDays / 30) * 0.15); // 15% per month
      default:
        return 1;
    }
  }

  /**
   * Get minimum claim interval in milliseconds
   */
  private getClaimInterval(compoundingRate: string): number {
    switch (compoundingRate) {
      case 'DAILY':
        return 24 * 60 * 60 * 1000; // 24 hours
      case 'WEEKLY':
        return 7 * 24 * 60 * 60 * 1000; // 7 days
      case 'MONTHLY':
        return 30 * 24 * 60 * 60 * 1000; // 30 days
      default:
        return 24 * 60 * 60 * 1000;
    }
  }

  /**
   * Distribute staking rewards to user
   */
  private async distributeStakingRewards(
    userId: string,
    pool: StakingPool,
    rewards: StakeRewards
  ): Promise<void> {
    try {
      switch (pool.rewardAsset) {
        case 'XP':
          await prisma.user.update({
            where: { id: userId },
            data: { xpTotal: { increment: rewards.totalReward } }
          });
          break;

        case 'RESOURCES':
          // Distribute resources based on pool type
          const resourceDistribution = this.getResourceDistribution(pool.poolType, rewards.totalReward);
          for (const [resourceType, amount] of Object.entries(resourceDistribution)) {
            await honeycombResourceService.awardResources({
              userId,
              resourceType: resourceType as ResourceType,
              amount,
              source: 'STAKING',
              description: `Staking rewards from ${pool.name}`
            });
          }
          break;

        case 'TOKENS':
          // Award funding tokens
          await honeycombResourceService.awardResources({
            userId,
            resourceType: 'FUNDING_TOKENS',
            amount: rewards.totalReward,
            source: 'STAKING',
            description: `Staking rewards from ${pool.name}`
          });
          break;
      }

    } catch (error) {
      console.error('Failed to distribute staking rewards:', error);
      throw error;
    }
  }

  /**
   * Get resource distribution based on pool type
   */
  private getResourceDistribution(poolType: StakingPoolType, totalReward: number): Record<string, number> {
    const baseAmount = Math.floor(totalReward / 3);
    
    switch (poolType) {
      case 'TERRITORY_CONTROL':
        return {
          'NETWORK_CONNECTIONS': baseAmount,
          'MARKETING_INFLUENCE': baseAmount,
          'BUSINESS_ACUMEN': baseAmount
        };
      case 'CHARACTER_DEVELOPMENT':
        return {
          'CODE_POINTS': baseAmount,
          'PRODUCT_VISION': baseAmount,
          'DESIGN_CREATIVITY': baseAmount
        };
      case 'RESOURCE_GENERATION':
        return {
          'CODE_POINTS': baseAmount * 0.4,
          'BUSINESS_ACUMEN': baseAmount * 0.3,
          'MARKETING_INFLUENCE': baseAmount * 0.2,
          'FUNDING_TOKENS': baseAmount * 0.1
        };
      default:
        return {
          'BUSINESS_ACUMEN': totalReward
        };
    }
  }

  /**
   * Record stake in Honeycomb Protocol
   */
  private async recordStakeInHoneycomb(walletAddress: string, data: any): Promise<void> {
    try {
      await honeycombService.completeMission('character_staked', walletAddress, [{
        type: 'staking_action',
        action: 'stake',
        poolName: data.poolName,
        characterId: data.characterId,
        stakingPeriod: data.stakingPeriod,
        estimatedRewards: data.estimatedRewards,
        timestamp: new Date().toISOString()
      }]);
    } catch (error) {
      console.error('Failed to record stake in Honeycomb:', error);
    }
  }

  /**
   * Record unstake in Honeycomb Protocol
   */
  private async recordUnstakeInHoneycomb(walletAddress: string, data: any): Promise<void> {
    try {
      await honeycombService.completeMission('character_unstaked', walletAddress, [{
        type: 'staking_action',
        action: 'unstake',
        poolName: data.poolName,
        characterId: data.characterId,
        rewards: data.rewards,
        isEarlyUnstake: data.isEarlyUnstake,
        timestamp: new Date().toISOString()
      }]);
    } catch (error) {
      console.error('Failed to record unstake in Honeycomb:', error);
    }
  }
}

export const honeycombStakingService = new HoneycombStakingService();
export default honeycombStakingService;