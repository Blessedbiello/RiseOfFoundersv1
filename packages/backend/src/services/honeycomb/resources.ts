import { prisma } from '../../config/database';
import { honeycombService } from './client';
import type { 
  ResourceType, 
  UserResourceInventory, 
  ResourceTransaction, 
  CraftingRecipe, 
  CraftingJob,
  User 
} from '@prisma/client';

export interface ResourceEarningData {
  userId: string;
  resourceType: ResourceType;
  amount: number;
  source: 'MISSION' | 'CRAFTING' | 'TRADE' | 'STAKING' | 'EVENT' | 'ADMIN';
  sourceId?: string;
  description: string;
}

export interface ResourceSpendingData {
  userId: string;
  resources: Record<ResourceType, number>; // { CODE_POINTS: 100, BUSINESS_ACUMEN: 50 }
  reason: string;
  sourceType: 'CRAFTING' | 'TRADE' | 'UPGRADE' | 'MISSION';
  sourceId?: string;
}

export interface CraftingJobData {
  userId: string;
  recipeId: string;
}

export interface ResourceTransferData {
  fromUserId: string;
  toUserId: string;
  resourceType: ResourceType;
  amount: number;
  reason: string;
}

// Startup artifact crafting recipes
const STARTUP_RECIPES = [
  {
    name: 'MVP Prototype',
    category: 'MVP',
    description: 'Create your Minimum Viable Product to test market fit',
    requiredResources: {
      CODE_POINTS: 200,
      PRODUCT_VISION: 150,
      DESIGN_CREATIVITY: 100
    },
    requiredLevel: 5,
    craftingTime: 3600, // 1 hour
    resultType: 'EQUIPMENT',
    resultMetadata: {
      equipmentType: 'DEVELOPMENT_TOOLS',
      name: 'MVP Prototype',
      rarity: 'COMMON',
      statBoosts: { technical: 25, product: 35 },
      description: 'Your first working prototype - proof that your idea has legs!'
    }
  },
  {
    name: 'Pitch Deck',
    category: 'PITCH_DECK',
    description: 'Professional presentation to win over investors and partners',
    requiredResources: {
      BUSINESS_ACUMEN: 150,
      MARKETING_INFLUENCE: 100,
      DESIGN_CREATIVITY: 75
    },
    requiredLevel: 8,
    craftingTime: 2700, // 45 minutes
    resultType: 'EQUIPMENT',
    resultMetadata: {
      equipmentType: 'BUSINESS_ARTIFACTS',
      name: 'Professional Pitch Deck',
      rarity: 'UNCOMMON',
      statBoosts: { business: 40, marketing: 25 },
      description: 'Compelling presentation that opens doors and minds!'
    }
  },
  {
    name: 'Business Plan',
    category: 'BUSINESS_PLAN',
    description: 'Comprehensive strategy document for your startup journey',
    requiredResources: {
      BUSINESS_ACUMEN: 300,
      NETWORK_CONNECTIONS: 100,
      FUNDING_TOKENS: 50
    },
    requiredLevel: 12,
    craftingTime: 7200, // 2 hours
    resultType: 'EQUIPMENT',
    resultMetadata: {
      equipmentType: 'BUSINESS_ARTIFACTS',
      name: 'Strategic Business Plan',
      rarity: 'RARE',
      statBoosts: { business: 75, marketing: 35, product: 20 },
      description: 'Your roadmap to success, investors love this!'
    }
  },
  {
    name: 'Brand Identity Kit',
    category: 'BRANDING',
    description: 'Complete visual identity and messaging framework',
    requiredResources: {
      DESIGN_CREATIVITY: 200,
      MARKETING_INFLUENCE: 150,
      BUSINESS_ACUMEN: 75
    },
    requiredLevel: 10,
    craftingTime: 5400, // 1.5 hours
    resultType: 'EQUIPMENT',
    resultMetadata: {
      equipmentType: 'MARKETING_ASSETS',
      name: 'Brand Identity Kit',
      rarity: 'UNCOMMON',
      statBoosts: { marketing: 50, design: 40 },
      description: 'Cohesive brand that customers remember and trust!'
    }
  },
  {
    name: 'Tech Stack Architecture',
    category: 'ARCHITECTURE',
    description: 'Scalable technical foundation for your product',
    requiredResources: {
      CODE_POINTS: 400,
      PRODUCT_VISION: 200,
      BUSINESS_ACUMEN: 100
    },
    requiredLevel: 15,
    craftingTime: 10800, // 3 hours
    resultType: 'EQUIPMENT',
    resultMetadata: {
      equipmentType: 'DEVELOPMENT_TOOLS',
      name: 'Enterprise Tech Stack',
      rarity: 'EPIC',
      statBoosts: { technical: 100, product: 75, business: 25 },
      description: 'Production-ready architecture that scales to millions!'
    }
  },
  {
    name: 'Market Research Report',
    category: 'RESEARCH',
    description: 'Deep analysis of your market, competitors, and opportunities',
    requiredResources: {
      BUSINESS_ACUMEN: 250,
      NETWORK_CONNECTIONS: 150,
      MARKETING_INFLUENCE: 100
    },
    requiredLevel: 7,
    craftingTime: 4500, // 1.25 hours
    resultType: 'EQUIPMENT',
    resultMetadata: {
      equipmentType: 'BUSINESS_ARTIFACTS',
      name: 'Market Intelligence Report',
      rarity: 'UNCOMMON',
      statBoosts: { business: 60, marketing: 30 },
      description: 'Know your battlefield better than anyone else!'
    }
  },
  {
    name: 'Community Platform',
    category: 'COMMUNITY',
    description: 'Digital space to build and engage your user community',
    requiredResources: {
      CODE_POINTS: 300,
      NETWORK_CONNECTIONS: 250,
      MARKETING_INFLUENCE: 200
    },
    requiredLevel: 18,
    craftingTime: 14400, // 4 hours
    resultType: 'EQUIPMENT',
    resultMetadata: {
      equipmentType: 'MARKETING_ASSETS',
      name: 'Community Hub',
      rarity: 'EPIC',
      statBoosts: { community: 100, marketing: 60, technical: 40 },
      description: 'Where your users become evangelists and co-creators!'
    }
  },
  {
    name: 'Investment Proposal',
    category: 'FUNDING',
    description: 'Professional funding request with financial projections',
    requiredResources: {
      FUNDING_TOKENS: 200,
      BUSINESS_ACUMEN: 400,
      NETWORK_CONNECTIONS: 150
    },
    requiredLevel: 20,
    requiredKingdom: 'BUSINESS_STRATEGY',
    craftingTime: 18000, // 5 hours
    successRate: 0.85,
    resultType: 'EQUIPMENT',
    resultMetadata: {
      equipmentType: 'FUNDING_INSTRUMENTS',
      name: 'Series A Proposal',
      rarity: 'LEGENDARY',
      statBoosts: { business: 150, network: 100, funding: 200 },
      description: 'The golden ticket to serious funding rounds!'
    }
  }
];

class HoneycombResourceService {

  /**
   * Initialize default crafting recipes in database
   */
  async initializeCraftingRecipes(): Promise<void> {
    console.log('🔧 Initializing startup crafting recipes...');
    
    for (const recipe of STARTUP_RECIPES) {
      try {
        await prisma.craftingRecipe.upsert({
          where: { name: recipe.name },
          update: recipe,
          create: recipe
        });
      } catch (error) {
        console.error(`Failed to initialize recipe ${recipe.name}:`, error);
      }
    }
    
    console.log(`✅ Initialized ${STARTUP_RECIPES.length} crafting recipes`);
  }

  /**
   * Award resources to a user (mission completion, events, etc.)
   */
  async awardResources(data: ResourceEarningData): Promise<{
    newBalance: number;
    totalEarned: number;
    transaction: ResourceTransaction;
  }> {
    const { userId, resourceType, amount, source, sourceId, description } = data;

    try {
      // Get or create resource inventory
      const inventory = await prisma.userResourceInventory.upsert({
        where: {
          userId_resourceType: { userId, resourceType }
        },
        update: {
          amount: { increment: amount },
          totalEarned: { increment: amount },
          lastEarned: new Date()
        },
        create: {
          userId,
          resourceType,
          amount,
          totalEarned: amount,
          lastEarned: new Date()
        }
      });

      // Create transaction record
      const transaction = await prisma.resourceTransaction.create({
        data: {
          inventoryId: inventory.id,
          type: 'EARNED',
          amount,
          description,
          sourceType: source,
          sourceId,
        }
      });

      // Record in Honeycomb Protocol for on-chain verification
      try {
        const user = await prisma.user.findUnique({ 
          where: { id: userId },
          select: { walletAddress: true }
        });

        if (user) {
          await this.recordResourceTransaction(user.walletAddress, {
            type: 'EARNED',
            resourceType,
            amount,
            source,
            description
          });
        }
      } catch (error) {
        console.error('Failed to record resource earning in Honeycomb:', error);
      }

      console.log(`💰 Awarded ${amount} ${resourceType} to user ${userId}`);

      return {
        newBalance: inventory.amount,
        totalEarned: inventory.totalEarned,
        transaction
      };

    } catch (error) {
      console.error('Failed to award resources:', error);
      throw new Error(`Failed to award ${amount} ${resourceType}: ${error.message}`);
    }
  }

  /**
   * Spend resources for crafting, upgrades, etc.
   */
  async spendResources(data: ResourceSpendingData): Promise<{
    success: boolean;
    newBalances: Record<ResourceType, number>;
    transactions: ResourceTransaction[];
  }> {
    const { userId, resources, reason, sourceType, sourceId } = data;

    try {
      // Check if user has enough resources
      const balanceCheck = await this.checkResourceBalance(userId, resources);
      if (!balanceCheck.hasEnough) {
        throw new Error(`Insufficient resources: missing ${balanceCheck.missing.join(', ')}`);
      }

      const transactions: ResourceTransaction[] = [];
      const newBalances: Record<ResourceType, number> = {} as any;

      // Process each resource spending in a transaction
      await prisma.$transaction(async (tx) => {
        for (const [resourceType, amount] of Object.entries(resources) as [ResourceType, number][]) {
          // Update inventory
          const inventory = await tx.userResourceInventory.update({
            where: {
              userId_resourceType: { userId, resourceType }
            },
            data: {
              amount: { decrement: amount },
              totalSpent: { increment: amount }
            }
          });

          newBalances[resourceType] = inventory.amount;

          // Create transaction record
          const transaction = await tx.resourceTransaction.create({
            data: {
              inventoryId: inventory.id,
              type: 'SPENT',
              amount: -amount,
              description: reason,
              sourceType,
              sourceId,
            }
          });

          transactions.push(transaction);
        }
      });

      // Record in Honeycomb Protocol
      try {
        const user = await prisma.user.findUnique({ 
          where: { id: userId },
          select: { walletAddress: true }
        });

        if (user) {
          for (const [resourceType, amount] of Object.entries(resources) as [ResourceType, number][]) {
            await this.recordResourceTransaction(user.walletAddress, {
              type: 'SPENT',
              resourceType: resourceType as ResourceType,
              amount,
              source: sourceType,
              description: reason
            });
          }
        }
      } catch (error) {
        console.error('Failed to record resource spending in Honeycomb:', error);
      }

      console.log(`💸 User ${userId} spent resources for: ${reason}`);

      return {
        success: true,
        newBalances,
        transactions
      };

    } catch (error) {
      console.error('Failed to spend resources:', error);
      throw new Error(`Resource spending failed: ${error.message}`);
    }
  }

  /**
   * Check if user has enough resources for a transaction
   */
  async checkResourceBalance(userId: string, requiredResources: Record<string, number>): Promise<{
    hasEnough: boolean;
    balances: Record<string, number>;
    missing: string[];
  }> {
    try {
      const inventories = await prisma.userResourceInventory.findMany({
        where: { userId }
      });

      const balances: Record<string, number> = {};
      const missing: string[] = [];

      // Check each required resource
      for (const [resourceType, requiredAmount] of Object.entries(requiredResources)) {
        const inventory = inventories.find(inv => inv.resourceType === resourceType);
        const currentAmount = inventory?.amount || 0;
        
        balances[resourceType] = currentAmount;
        
        if (currentAmount < requiredAmount) {
          missing.push(`${resourceType} (need ${requiredAmount}, have ${currentAmount})`);
        }
      }

      return {
        hasEnough: missing.length === 0,
        balances,
        missing
      };

    } catch (error) {
      console.error('Failed to check resource balance:', error);
      throw new Error(`Balance check failed: ${error.message}`);
    }
  }

  /**
   * Get user's complete resource inventory
   */
  async getUserInventory(userId: string): Promise<UserResourceInventory[]> {
    try {
      return await prisma.userResourceInventory.findMany({
        where: { userId },
        include: {
          transactions: {
            orderBy: { createdAt: 'desc' },
            take: 5 // Recent transactions
          }
        },
        orderBy: { resourceType: 'asc' }
      });
    } catch (error) {
      console.error('Failed to get user inventory:', error);
      throw new Error(`Failed to get inventory: ${error.message}`);
    }
  }

  /**
   * Start a crafting job
   */
  async startCrafting(data: CraftingJobData): Promise<CraftingJob> {
    const { userId, recipeId } = data;

    try {
      // Get recipe details
      const recipe = await prisma.craftingRecipe.findUnique({
        where: { id: recipeId }
      });

      if (!recipe) {
        throw new Error('Recipe not found');
      }

      if (!recipe.isActive) {
        throw new Error('Recipe is not available');
      }

      // Check user level requirement
      const user = await prisma.user.findUnique({ where: { id: userId } });
      const userLevel = user?.level || 1;

      if (userLevel < recipe.requiredLevel) {
        throw new Error(`Level ${recipe.requiredLevel} required (current: ${userLevel})`);
      }

      // Check kingdom requirement if any
      if (recipe.requiredKingdom) {
        const character = await prisma.founderCharacter.findUnique({ where: { userId } });
        if (!character || character.kingdom !== recipe.requiredKingdom) {
          throw new Error(`${recipe.requiredKingdom} kingdom required`);
        }
      }

      // Check and spend required resources
      const requiredResources = recipe.requiredResources as Record<string, number>;
      const spendResult = await this.spendResources({
        userId,
        resources: requiredResources as Record<ResourceType, number>,
        reason: `Crafting ${recipe.name}`,
        sourceType: 'CRAFTING',
        sourceId: recipeId
      });

      if (!spendResult.success) {
        throw new Error('Failed to spend required resources');
      }

      // Create crafting job
      const completedAt = new Date(Date.now() + (recipe.craftingTime * 1000));
      
      const craftingJob = await prisma.craftingJob.create({
        data: {
          userId,
          recipeId,
          status: recipe.craftingTime > 0 ? 'IN_PROGRESS' : 'COMPLETED',
          resourcesSpent: requiredResources,
          completedAt: recipe.craftingTime > 0 ? completedAt : new Date(),
          progressPercent: recipe.craftingTime > 0 ? 0 : 100
        }
      });

      // If instant crafting (0 time), complete immediately
      if (recipe.craftingTime === 0) {
        await this.completeCrafting(craftingJob.id);
      }

      console.log(`🔨 Started crafting ${recipe.name} for user ${userId}`);
      return craftingJob;

    } catch (error) {
      console.error('Failed to start crafting:', error);
      throw new Error(`Crafting failed: ${error.message}`);
    }
  }

  /**
   * Complete a crafting job and award the result
   */
  async completeCrafting(craftingJobId: string): Promise<{
    success: boolean;
    result?: any;
    equipment?: any;
  }> {
    try {
      const job = await prisma.craftingJob.findUnique({
        where: { id: craftingJobId },
        include: { recipe: true, user: true }
      });

      if (!job) {
        throw new Error('Crafting job not found');
      }

      if (job.status === 'COMPLETED') {
        throw new Error('Job already completed');
      }

      const recipe = job.recipe;
      const resultMetadata = recipe.resultMetadata as any;

      // Check success rate if applicable
      const success = Math.random() <= recipe.successRate;
      
      if (!success) {
        await prisma.craftingJob.update({
          where: { id: craftingJobId },
          data: {
            status: 'FAILED',
            completedAt: new Date(),
            progressPercent: 100
          }
        });

        return { success: false };
      }

      // Create equipment if result is equipment
      let equipment;
      if (recipe.resultType === 'EQUIPMENT') {
        equipment = await prisma.characterEquipment.create({
          data: {
            characterId: job.user.character?.id, // Assuming character relationship exists
            name: resultMetadata.name,
            type: resultMetadata.equipmentType,
            rarity: resultMetadata.rarity,
            description: resultMetadata.description,
            statBoosts: resultMetadata.statBoosts,
            acquiredFrom: 'CRAFTING',
            acquiredAt: new Date()
          }
        });
      }

      // Update job as completed
      const completedJob = await prisma.craftingJob.update({
        where: { id: craftingJobId },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
          progressPercent: 100,
          resultReceived: equipment ? { equipmentId: equipment.id } : resultMetadata
        }
      });

      // Record in Honeycomb Protocol
      try {
        await this.recordCraftingCompletion(job.user.walletAddress, {
          recipeName: recipe.name,
          resultType: recipe.resultType,
          equipment: equipment
        });
      } catch (error) {
        console.error('Failed to record crafting completion in Honeycomb:', error);
      }

      console.log(`✅ Completed crafting ${recipe.name} for user ${job.userId}`);

      return {
        success: true,
        result: completedJob.resultReceived,
        equipment
      };

    } catch (error) {
      console.error('Failed to complete crafting:', error);
      throw new Error(`Crafting completion failed: ${error.message}`);
    }
  }

  /**
   * Transfer resources between users
   */
  async transferResources(data: ResourceTransferData): Promise<{
    success: boolean;
    senderNewBalance: number;
    receiverNewBalance: number;
  }> {
    const { fromUserId, toUserId, resourceType, amount, reason } = data;

    try {
      // Check if sender has enough resources
      const balanceCheck = await this.checkResourceBalance(fromUserId, { [resourceType]: amount });
      if (!balanceCheck.hasEnough) {
        throw new Error('Insufficient resources for transfer');
      }

      let senderNewBalance = 0;
      let receiverNewBalance = 0;

      // Perform transfer in transaction
      await prisma.$transaction(async (tx) => {
        // Deduct from sender
        const senderInventory = await tx.userResourceInventory.update({
          where: {
            userId_resourceType: { userId: fromUserId, resourceType }
          },
          data: {
            amount: { decrement: amount },
            totalSpent: { increment: amount }
          }
        });
        senderNewBalance = senderInventory.amount;

        // Add to receiver
        const receiverInventory = await tx.userResourceInventory.upsert({
          where: {
            userId_resourceType: { userId: toUserId, resourceType }
          },
          update: {
            amount: { increment: amount },
            totalEarned: { increment: amount }
          },
          create: {
            userId: toUserId,
            resourceType,
            amount,
            totalEarned: amount
          }
        });
        receiverNewBalance = receiverInventory.amount;

        // Create transaction records
        await tx.resourceTransaction.create({
          data: {
            inventoryId: senderInventory.id,
            type: 'TRADED',
            amount: -amount,
            description: `Transfer to user: ${reason}`,
            sourceType: 'TRADE',
            sourceId: toUserId
          }
        });

        await tx.resourceTransaction.create({
          data: {
            inventoryId: receiverInventory.id,
            type: 'TRADED',
            amount,
            description: `Transfer from user: ${reason}`,
            sourceType: 'TRADE',
            sourceId: fromUserId
          }
        });
      });

      console.log(`🔄 Transferred ${amount} ${resourceType} from ${fromUserId} to ${toUserId}`);

      return {
        success: true,
        senderNewBalance,
        receiverNewBalance
      };

    } catch (error) {
      console.error('Failed to transfer resources:', error);
      throw new Error(`Transfer failed: ${error.message}`);
    }
  }

  /**
   * Get available crafting recipes for a user
   */
  async getAvailableRecipes(userId: string): Promise<Array<CraftingRecipe & { canCraft: boolean; missingResources?: string[] }>> {
    try {
      const user = await prisma.user.findUnique({ 
        where: { id: userId },
        include: { character: true }
      });

      if (!user) {
        throw new Error('User not found');
      }

      const recipes = await prisma.craftingRecipe.findMany({
        where: { isActive: true }
      });

      const userInventory = await this.getUserInventory(userId);
      const userLevel = user.level || 1;
      const userKingdom = user.character?.kingdom;

      const availableRecipes = [];

      for (const recipe of recipes) {
        // Check level requirement
        const meetsLevel = userLevel >= recipe.requiredLevel;
        
        // Check kingdom requirement
        const meetsKingdom = !recipe.requiredKingdom || userKingdom === recipe.requiredKingdom;
        
        // Check resource requirements
        const requiredResources = recipe.requiredResources as Record<string, number>;
        const resourceCheck = await this.checkResourceBalance(userId, requiredResources);
        
        const canCraft = meetsLevel && meetsKingdom && resourceCheck.hasEnough;

        availableRecipes.push({
          ...recipe,
          canCraft,
          missingResources: !canCraft ? resourceCheck.missing : undefined
        });
      }

      return availableRecipes;

    } catch (error) {
      console.error('Failed to get available recipes:', error);
      throw new Error(`Failed to get recipes: ${error.message}`);
    }
  }

  /**
   * Record resource transaction in Honeycomb Protocol
   */
  private async recordResourceTransaction(walletAddress: string, data: {
    type: 'EARNED' | 'SPENT' | 'TRADED';
    resourceType: ResourceType;
    amount: number;
    source: string;
    description: string;
  }): Promise<void> {
    try {
      // Record resource transaction in Honeycomb for on-chain verification
      await honeycombService.completeMission('resource_transaction', walletAddress, [
        {
          type: 'resource_activity',
          transactionType: data.type,
          resourceType: data.resourceType,
          amount: data.amount,
          source: data.source,
          description: data.description,
          timestamp: new Date().toISOString()
        }
      ]);
    } catch (error) {
      console.error('Failed to record Honeycomb resource transaction:', error);
      // Don't throw error - this is supplementary recording
    }
  }

  /**
   * Record crafting completion in Honeycomb Protocol
   */
  private async recordCraftingCompletion(walletAddress: string, data: {
    recipeName: string;
    resultType: string;
    equipment?: any;
  }): Promise<void> {
    try {
      await honeycombService.completeMission('crafting_completion', walletAddress, [
        {
          type: 'crafting_success',
          recipeName: data.recipeName,
          resultType: data.resultType,
          equipmentId: data.equipment?.id,
          timestamp: new Date().toISOString()
        }
      ]);
    } catch (error) {
      console.error('Failed to record Honeycomb crafting completion:', error);
    }
  }
}

export const honeycombResourceService = new HoneycombResourceService();
export default honeycombResourceService;