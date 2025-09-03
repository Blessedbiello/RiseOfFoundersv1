import { prisma } from '../../config/database';
import { honeycombService } from './client';
import type { Kingdom, CharacterClass, FounderCharacter, User, ResourceType } from '@prisma/client';

export interface CharacterCreationData {
  userId: string;
  name: string;
  kingdom: Kingdom;
  characterClass?: CharacterClass;
  customization?: {
    avatarUrl?: string;
    kingdomEmblem?: string;
    theme?: Record<string, any>;
  };
}

export interface CharacterStats {
  technical: number;
  business: number;
  marketing: number;
  community: number;
  design: number;
  product: number;
}

export interface CharacterEvolutionData {
  characterId: string;
  evolutionType: 'LEVEL_UP' | 'SKILL_UNLOCK' | 'CLASS_EVOLUTION';
  triggerType: 'MISSION_COMPLETE' | 'XP_THRESHOLD' | 'SPECIAL_EVENT';
  statChanges: Partial<CharacterStats>;
  newAbilities?: string[];
  triggerData?: Record<string, any>;
}

// Kingdom-specific starting stats and bonuses
const KINGDOM_CONFIGS = {
  SILICON_VALLEY: {
    characterClass: 'TECH_FOUNDER' as CharacterClass,
    startingStats: { technical: 50, business: 20, marketing: 15, community: 20, design: 25, product: 30 },
    statBonuses: { technical: 1.2, product: 1.1 },
    emblem: '💻',
    theme: { primary: '#0066cc', secondary: '#00ccff' }
  },
  CRYPTO_VALLEY: {
    characterClass: 'CRYPTO_FOUNDER' as CharacterClass,
    startingStats: { technical: 45, business: 30, marketing: 20, community: 35, design: 20, product: 25 },
    statBonuses: { technical: 1.15, community: 1.15 },
    emblem: '⛓️',
    theme: { primary: '#8b5cf6', secondary: '#ec4899' }
  },
  BUSINESS_STRATEGY: {
    characterClass: 'BUSINESS_STRATEGIST' as CharacterClass,
    startingStats: { technical: 20, business: 50, marketing: 30, community: 25, design: 15, product: 35 },
    statBonuses: { business: 1.25, marketing: 1.1 },
    emblem: '📈',
    theme: { primary: '#059669', secondary: '#10b981' }
  },
  PRODUCT_OLYMPUS: {
    characterClass: 'PRODUCT_VISIONARY' as CharacterClass,
    startingStats: { technical: 35, business: 25, marketing: 25, community: 20, design: 45, product: 50 },
    statBonuses: { product: 1.25, design: 1.15 },
    emblem: '🎨',
    theme: { primary: '#ea580c', secondary: '#f97316' }
  },
  MARKETING_MULTIVERSE: {
    characterClass: 'MARKETING_MAVERICK' as CharacterClass,
    startingStats: { technical: 15, business: 30, marketing: 50, community: 40, design: 35, product: 25 },
    statBonuses: { marketing: 1.25, community: 1.2 },
    emblem: '🚀',
    theme: { primary: '#dc2626', secondary: '#f59e0b' }
  },
  ALL_KINGDOMS: {
    characterClass: 'RENAISSANCE_FOUNDER' as CharacterClass,
    startingStats: { technical: 30, business: 30, marketing: 30, community: 30, design: 30, product: 30 },
    statBonuses: {}, // No specific bonuses, but balanced across all
    emblem: '👑',
    theme: { primary: '#7c3aed', secondary: '#fbbf24' }
  }
};

class HoneycombCharacterService {

  /**
   * Create a new founder character with kingdom specialization
   */
  async createFounderCharacter(data: CharacterCreationData): Promise<FounderCharacter> {
    const { userId, name, kingdom } = data;
    
    // Get kingdom configuration
    const kingdomConfig = KINGDOM_CONFIGS[kingdom];
    const characterClass = data.characterClass || kingdomConfig.characterClass;
    
    try {
      // Get user's wallet address for Honeycomb integration
      const user = await prisma.user.findUnique({ 
        where: { id: userId },
        select: { walletAddress: true }
      });
      
      if (!user) {
        throw new Error('User not found');
      }

      // Create character in Honeycomb Protocol
      const honeycombCharacter = await this.createHoneycombCharacter({
        walletAddress: user.walletAddress,
        name,
        kingdom,
        characterClass,
        stats: kingdomConfig.startingStats
      });

      // Create character in local database
      const character = await prisma.founderCharacter.create({
        data: {
          userId,
          honeycombCharacterId: honeycombCharacter.id,
          name,
          kingdom,
          characterClass,
          
          // Starting stats based on kingdom
          ...kingdomConfig.startingStats,
          
          // Visual customization
          avatarUrl: data.customization?.avatarUrl,
          kingdomEmblem: data.customization?.kingdomEmblem || kingdomConfig.emblem,
          characterTheme: data.customization?.theme || kingdomConfig.theme,
        },
        include: {
          user: true,
          equipment: true,
          evolutions: true
        }
      });

      // Initialize starting resources based on kingdom
      await this.initializeStartingResources(userId, character.id, kingdom);

      // Award character creation achievement
      try {
        await honeycombService.completeMission('character_creation', user.walletAddress, [
          {
            type: 'character_created',
            kingdom: kingdom,
            characterClass: characterClass,
            characterId: character.id
          }
        ]);

        // Award starting XP
        await prisma.user.update({
          where: { id: userId },
          data: { xpTotal: { increment: 100 } }
        });
      } catch (error) {
        console.error('Failed to award character creation mission:', error);
      }

      console.log(`✅ Created ${kingdom} founder character: ${name} for user ${userId}`);
      return character;

    } catch (error) {
      console.error('Failed to create founder character:', error);
      throw new Error(`Failed to create character: ${error.message}`);
    }
  }

  /**
   * Create character in Honeycomb Protocol
   */
  private async createHoneycombCharacter(data: {
    walletAddress: string;
    name: string;
    kingdom: Kingdom;
    characterClass: CharacterClass;
    stats: CharacterStats;
  }): Promise<{ id: string; publicKey: string }> {
    try {
      // In production, this would use Honeycomb's Character Manager API
      const characterTransaction = await honeycombService.getProjectInfo();
      
      // For now, create a mock character ID that would come from Honeycomb
      const honeycombCharacterId = `hc_char_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      console.log(`🍯 Created Honeycomb character: ${honeycombCharacterId}`);
      console.log(`📊 Character stats:`, data.stats);
      
      return {
        id: honeycombCharacterId,
        publicKey: `char_pk_${honeycombCharacterId}`
      };
    } catch (error) {
      console.error('Failed to create Honeycomb character:', error);
      throw error;
    }
  }

  /**
   * Initialize starting resources based on kingdom selection
   */
  private async initializeStartingResources(
    userId: string, 
    characterId: string, 
    kingdom: Kingdom
  ): Promise<void> {
    const kingdomResourcePackages = {
      SILICON_VALLEY: {
        CODE_POINTS: 100,
        BUSINESS_ACUMEN: 25,
        PRODUCT_VISION: 75,
        DESIGN_CREATIVITY: 50
      },
      CRYPTO_VALLEY: {
        CODE_POINTS: 75,
        NETWORK_CONNECTIONS: 75,
        BUSINESS_ACUMEN: 50,
        MARKETING_INFLUENCE: 25
      },
      BUSINESS_STRATEGY: {
        BUSINESS_ACUMEN: 100,
        FUNDING_TOKENS: 75,
        MARKETING_INFLUENCE: 50,
        NETWORK_CONNECTIONS: 50
      },
      PRODUCT_OLYMPUS: {
        PRODUCT_VISION: 100,
        DESIGN_CREATIVITY: 75,
        CODE_POINTS: 50,
        MARKETING_INFLUENCE: 50
      },
      MARKETING_MULTIVERSE: {
        MARKETING_INFLUENCE: 100,
        NETWORK_CONNECTIONS: 75,
        DESIGN_CREATIVITY: 50,
        BUSINESS_ACUMEN: 25
      },
      ALL_KINGDOMS: {
        CODE_POINTS: 50,
        BUSINESS_ACUMEN: 50,
        MARKETING_INFLUENCE: 50,
        NETWORK_CONNECTIONS: 50,
        FUNDING_TOKENS: 50,
        DESIGN_CREATIVITY: 50,
        PRODUCT_VISION: 50
      }
    };

    const resourcePackage = kingdomResourcePackages[kingdom];
    
    // Create resource inventory entries
    for (const [resourceType, amount] of Object.entries(resourcePackage)) {
      await prisma.userResourceInventory.create({
        data: {
          userId,
          characterId,
          resourceType: resourceType as ResourceType,
          amount,
          totalEarned: amount
        }
      });

      // Create initial transaction record
      const inventory = await prisma.userResourceInventory.findFirst({
        where: { userId, resourceType: resourceType as ResourceType }
      });

      if (inventory) {
        await prisma.resourceTransaction.create({
          data: {
            inventoryId: inventory.id,
            type: 'EARNED',
            amount,
            description: `Starting ${resourceType} for ${kingdom} founder`,
            sourceType: 'CHARACTER_CREATION',
            sourceId: characterId
          }
        });
      }
    }

    console.log(`💰 Initialized starting resources for ${kingdom} character`);
  }

  /**
   * Evolve character (level up, unlock abilities, etc.)
   */
  async evolveCharacter(data: CharacterEvolutionData): Promise<FounderCharacter> {
    const { characterId, evolutionType, statChanges } = data;

    try {
      const character = await prisma.founderCharacter.findUnique({
        where: { id: characterId },
        include: { user: true }
      });

      if (!character) {
        throw new Error('Character not found');
      }

      // Calculate new stats with kingdom bonuses
      const kingdomConfig = KINGDOM_CONFIGS[character.kingdom];
      const newStats: Partial<CharacterStats> = {};
      
      for (const [stat, increase] of Object.entries(statChanges)) {
        const currentValue = character[stat as keyof CharacterStats] || 0;
        const bonus = kingdomConfig.statBonuses[stat as keyof CharacterStats] || 1;
        newStats[stat as keyof CharacterStats] = Math.floor((currentValue + increase) * bonus);
      }

      // Update character with new stats
      const updatedCharacter = await prisma.founderCharacter.update({
        where: { id: characterId },
        data: {
          ...newStats,
          ...(data.evolutionType === 'LEVEL_UP' && { 
            level: { increment: 1 },
            experience: 0,
            experienceToNext: Math.floor(100 * Math.pow(1.5, character.level))
          })
        },
        include: {
          user: true,
          equipment: true,
          evolutions: true
        }
      });

      // Record evolution in database
      await prisma.characterEvolution.create({
        data: {
          characterId,
          fromLevel: character.level,
          toLevel: updatedCharacter.level,
          evolutionType: data.evolutionType,
          statChanges: statChanges as any,
          newAbilities: data.newAbilities || [],
          triggerType: data.triggerType,
          triggerData: data.triggerData || {}
        }
      });

      // Record evolution in Honeycomb Protocol
      try {
        await this.recordHoneycombEvolution(character.user.walletAddress, {
          characterId: character.honeycombCharacterId,
          evolutionType,
          statChanges,
          newLevel: updatedCharacter.level
        });
      } catch (error) {
        console.error('Failed to record evolution in Honeycomb:', error);
      }

      console.log(`🚀 Character ${character.name} evolved: ${evolutionType}`);
      return updatedCharacter;

    } catch (error) {
      console.error('Failed to evolve character:', error);
      throw new Error(`Failed to evolve character: ${error.message}`);
    }
  }

  /**
   * Record character evolution in Honeycomb Protocol
   */
  private async recordHoneycombEvolution(walletAddress: string, data: {
    characterId: string;
    evolutionType: string;
    statChanges: Partial<CharacterStats>;
    newLevel: number;
  }): Promise<void> {
    try {
      // In production, this would update the character's on-chain traits
      await honeycombService.completeMission('character_evolution', walletAddress, [
        {
          type: 'evolution',
          characterId: data.characterId,
          evolutionType: data.evolutionType,
          statChanges: data.statChanges,
          newLevel: data.newLevel
        }
      ]);
      
      console.log(`🍯 Recorded character evolution in Honeycomb`);
    } catch (error) {
      console.error('Failed to record Honeycomb evolution:', error);
      throw error;
    }
  }

  /**
   * Get character with full details
   */
  async getCharacter(userId: string): Promise<FounderCharacter | null> {
    try {
      return await prisma.founderCharacter.findUnique({
        where: { userId },
        include: {
          user: {
            select: {
              displayName: true,
              walletAddress: true,
              xpTotal: true,
              reputationScore: true
            }
          },
          equipment: {
            where: { isEquipped: true },
            orderBy: { createdAt: 'desc' }
          },
          evolutions: {
            orderBy: { evolvedAt: 'desc' },
            take: 10
          },
          resourceInventory: {
            include: {
              transactions: {
                orderBy: { createdAt: 'desc' },
                take: 5
              }
            }
          },
          stakingRecords: {
            where: { isActive: true },
            include: { pool: true }
          }
        }
      });
    } catch (error) {
      console.error('Failed to get character:', error);
      throw new Error(`Failed to get character: ${error.message}`);
    }
  }

  /**
   * Get character stats and progression
   */
  async getCharacterStats(characterId: string): Promise<{
    character: FounderCharacter;
    progression: {
      currentLevel: number;
      experience: number;
      experienceToNext: number;
      progressPercent: number;
    };
    kingdomBonuses: Record<string, number>;
    totalPower: number;
  }> {
    try {
      const character = await prisma.founderCharacter.findUnique({
        where: { id: characterId },
        include: {
          equipment: { where: { isEquipped: true } },
          evolutions: { orderBy: { evolvedAt: 'desc' } }
        }
      });

      if (!character) {
        throw new Error('Character not found');
      }

      // Calculate progression
      const progressPercent = Math.floor((character.experience / character.experienceToNext) * 100);
      
      // Get kingdom bonuses
      const kingdomConfig = KINGDOM_CONFIGS[character.kingdom];
      
      // Calculate total power (weighted sum of all stats)
      const totalPower = Math.floor(
        character.technical * 1.2 +
        character.business * 1.1 +
        character.marketing * 1.0 +
        character.community * 0.9 +
        character.design * 1.0 +
        character.product * 1.15
      );

      return {
        character,
        progression: {
          currentLevel: character.level,
          experience: character.experience,
          experienceToNext: character.experienceToNext,
          progressPercent
        },
        kingdomBonuses: kingdomConfig.statBonuses,
        totalPower
      };

    } catch (error) {
      console.error('Failed to get character stats:', error);
      throw new Error(`Failed to get character stats: ${error.message}`);
    }
  }

  /**
   * Check if character can evolve and trigger evolution if ready
   */
  async checkForEvolution(characterId: string): Promise<{
    canEvolve: boolean;
    evolutionType?: string;
    requirements?: any;
    reward?: any;
  }> {
    try {
      const character = await prisma.founderCharacter.findUnique({
        where: { id: characterId }
      });

      if (!character) {
        throw new Error('Character not found');
      }

      // Check for level up
      if (character.experience >= character.experienceToNext) {
        return {
          canEvolve: true,
          evolutionType: 'LEVEL_UP',
          requirements: {
            experience: character.experienceToNext
          },
          reward: {
            levelIncrease: 1,
            statPoints: 5,
            newAbilities: this.getAbilitiesForLevel(character.level + 1)
          }
        };
      }

      // Check for skill unlocks based on stat thresholds
      const skillUnlocks = this.checkSkillUnlocks(character);
      if (skillUnlocks.length > 0) {
        return {
          canEvolve: true,
          evolutionType: 'SKILL_UNLOCK',
          requirements: skillUnlocks[0].requirements,
          reward: skillUnlocks[0].reward
        };
      }

      return { canEvolve: false };

    } catch (error) {
      console.error('Failed to check for evolution:', error);
      throw new Error(`Failed to check evolution: ${error.message}`);
    }
  }

  /**
   * Get abilities that unlock at specific levels
   */
  private getAbilitiesForLevel(level: number): string[] {
    const abilities = {
      5: ['Kingdom Synergy Boost'],
      10: ['Resource Efficiency', 'Team Formation'],
      15: ['Territory Control'],
      25: ['Advanced Crafting'],
      40: ['Mentor Network Access'],
      60: ['Legendary Missions'],
      80: ['Cross-Kingdom Mastery'],
      100: ['Founder Legend Status']
    };

    return abilities[level] || [];
  }

  /**
   * Check for skill-based unlocks
   */
  private checkSkillUnlocks(character: FounderCharacter): Array<{
    requirements: any;
    reward: any;
  }> {
    const unlocks = [];

    // Check for specialist unlocks (500+ in any stat)
    const stats = {
      technical: character.technical,
      business: character.business,
      marketing: character.marketing,
      community: character.community,
      design: character.design,
      product: character.product
    };

    for (const [stat, value] of Object.entries(stats)) {
      if (value >= 500 && character.level >= 20) {
        unlocks.push({
          requirements: { [stat]: 500, level: 20 },
          reward: {
            title: `${stat.charAt(0).toUpperCase() + stat.slice(1)} Specialist`,
            specialAbility: `${stat}_mastery`,
            statBoost: { [stat]: 100 }
          }
        });
      }
    }

    return unlocks;
  }

  /**
   * Award experience to character and check for evolution
   */
  async awardExperience(characterId: string, amount: number, source: string): Promise<{
    newExperience: number;
    leveledUp: boolean;
    newLevel?: number;
  }> {
    try {
      const character = await prisma.founderCharacter.findUnique({
        where: { id: characterId }
      });

      if (!character) {
        throw new Error('Character not found');
      }

      const newExperience = character.experience + amount;
      let leveledUp = false;
      let newLevel = character.level;

      // Check for level up
      if (newExperience >= character.experienceToNext) {
        leveledUp = true;
        newLevel = character.level + 1;

        // Trigger evolution
        await this.evolveCharacter({
          characterId,
          evolutionType: 'LEVEL_UP',
          triggerType: 'XP_THRESHOLD',
          statChanges: {
            technical: 10,
            business: 10,
            marketing: 10,
            community: 10,
            design: 10,
            product: 10
          },
          triggerData: { source, xpAwarded: amount }
        });
      } else {
        // Just update experience
        await prisma.founderCharacter.update({
          where: { id: characterId },
          data: { experience: newExperience }
        });
      }

      return {
        newExperience,
        leveledUp,
        newLevel: leveledUp ? newLevel : undefined
      };

    } catch (error) {
      console.error('Failed to award experience:', error);
      throw new Error(`Failed to award experience: ${error.message}`);
    }
  }
}

export const honeycombCharacterService = new HoneycombCharacterService();
export default honeycombCharacterService;