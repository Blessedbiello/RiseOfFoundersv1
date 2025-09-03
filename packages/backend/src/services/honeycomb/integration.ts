import { prisma } from '../../config/database';
import { honeycombCharacterService } from './characters';
import { honeycombResourceService } from './resources';
import { honeycombEnhancedMissionService } from './enhancedMissions';
import { honeycombStakingService } from './staking';

interface IntegrationEvent {
  type: 'MISSION_COMPLETED' | 'CHARACTER_LEVEL_UP' | 'RESOURCE_EARNED' | 'STAKING_REWARD' | 'ACHIEVEMENT_UNLOCKED';
  userId: string;
  data: any;
  timestamp: Date;
}

interface CrossSystemReward {
  type: 'XP' | 'RESOURCE' | 'BADGE' | 'EQUIPMENT';
  amount?: number;
  resourceType?: string;
  itemId?: string;
  multiplier?: number;
}

interface IntegrationConfig {
  enableCrossSystemBonuses: boolean;
  stakingXPMultiplier: number;
  missionResourceBonus: number;
  kingdomSpecializationBonus: number;
  dailyLoginBonus: number;
}

class HoneycombIntegrationService {
  private config: IntegrationConfig = {
    enableCrossSystemBonuses: true,
    stakingXPMultiplier: 1.1, // 10% XP bonus for staked characters
    missionResourceBonus: 1.2, // 20% resource bonus for high-level characters
    kingdomSpecializationBonus: 1.15, // 15% bonus for kingdom-aligned activities
    dailyLoginBonus: 50 // Base daily login bonus
  };

  /**
   * Handle mission completion and trigger cross-system rewards
   */
  async handleMissionCompleted(userId: string, missionId: string, rewards: any[]): Promise<{
    success: boolean;
    crossSystemRewards: CrossSystemReward[];
    bonusesApplied: string[];
  }> {
    try {
      const crossSystemRewards: CrossSystemReward[] = [];
      const bonusesApplied: string[] = [];

      // Get user's character for bonus calculations
      const character = await honeycombCharacterService.getUserCharacter(userId);
      
      if (character.success && character.character) {
        // Apply staking bonuses if character is staked
        const stakingInfo = await honeycombStakingService.getUserStakingOverview(userId);
        
        if (stakingInfo.success && stakingInfo.overview.totalStaked > 0) {
          const xpRewards = rewards.filter(r => r.type === 'XP');
          for (const xpReward of xpRewards) {
            const bonusXP = Math.floor(xpReward.amount * (this.config.stakingXPMultiplier - 1));
            if (bonusXP > 0) {
              await honeycombCharacterService.awardExperience(userId, bonusXP);
              crossSystemRewards.push({ type: 'XP', amount: bonusXP });
              bonusesApplied.push(`Staking Bonus: +${bonusXP} XP`);
            }
          }
        }

        // Apply kingdom specialization bonuses
        const mission = await prisma.mission.findUnique({ where: { slug: missionId } });
        if (mission && this.isKingdomAlignedMission(character.character.kingdom, mission)) {
          const resourceRewards = rewards.filter(r => r.type === 'RESOURCE');
          for (const resourceReward of resourceRewards) {
            const bonusAmount = Math.floor(resourceReward.amount * (this.config.kingdomSpecializationBonus - 1));
            if (bonusAmount > 0) {
              await honeycombResourceService.awardResource(userId, resourceReward.resourceType, bonusAmount);
              crossSystemRewards.push({ 
                type: 'RESOURCE', 
                amount: bonusAmount, 
                resourceType: resourceReward.resourceType 
              });
              bonusesApplied.push(`Kingdom Specialization: +${bonusAmount} ${resourceReward.resourceType}`);
            }
          }
        }

        // High-level character bonus
        if (character.character.level >= 10) {
          const resourceRewards = rewards.filter(r => r.type === 'RESOURCE');
          for (const resourceReward of resourceRewards) {
            const bonusAmount = Math.floor(resourceReward.amount * (this.config.missionResourceBonus - 1));
            if (bonusAmount > 0) {
              await honeycombResourceService.awardResource(userId, resourceReward.resourceType, bonusAmount);
              crossSystemRewards.push({ 
                type: 'RESOURCE', 
                amount: bonusAmount, 
                resourceType: resourceReward.resourceType 
              });
              bonusesApplied.push(`Veteran Founder Bonus: +${bonusAmount} ${resourceReward.resourceType}`);
            }
          }
        }
      }

      // Log integration event
      await this.logIntegrationEvent({
        type: 'MISSION_COMPLETED',
        userId,
        data: { missionId, originalRewards: rewards, crossSystemRewards, bonusesApplied },
        timestamp: new Date()
      });

      return {
        success: true,
        crossSystemRewards,
        bonusesApplied
      };
    } catch (error) {
      console.error('Error handling mission completion integration:', error);
      return {
        success: false,
        crossSystemRewards: [],
        bonusesApplied: []
      };
    }
  }

  /**
   * Handle character level up and award cross-system bonuses
   */
  async handleCharacterLevelUp(userId: string, newLevel: number, character: any): Promise<{
    success: boolean;
    levelUpRewards: CrossSystemReward[];
  }> {
    try {
      const levelUpRewards: CrossSystemReward[] = [];

      // Resource bonuses for reaching certain levels
      if (newLevel % 5 === 0) { // Every 5 levels
        const bonusResources = {
          FUNDING_TOKENS: newLevel * 10,
          CODE_POINTS: newLevel * 8,
          PRODUCT_VISION: newLevel * 6,
          NETWORK_CONNECTIONS: newLevel * 5
        };

        for (const [resourceType, amount] of Object.entries(bonusResources)) {
          await honeycombResourceService.awardResource(userId, resourceType, amount);
          levelUpRewards.push({ type: 'RESOURCE', amount, resourceType });
        }
      }

      // Unlock special staking pools at certain levels
      if (newLevel === 10) {
        levelUpRewards.push({ type: 'BADGE', itemId: 'unlock_elite_staking' });
      } else if (newLevel === 20) {
        levelUpRewards.push({ type: 'BADGE', itemId: 'unlock_legendary_staking' });
      }

      // Kingdom-specific level up bonuses
      const kingdomBonuses = this.getKingdomLevelUpBonus(character.kingdom, newLevel);
      levelUpRewards.push(...kingdomBonuses);

      // Log integration event
      await this.logIntegrationEvent({
        type: 'CHARACTER_LEVEL_UP',
        userId,
        data: { newLevel, character, levelUpRewards },
        timestamp: new Date()
      });

      return {
        success: true,
        levelUpRewards
      };
    } catch (error) {
      console.error('Error handling character level up integration:', error);
      return {
        success: false,
        levelUpRewards: []
      };
    }
  }

  /**
   * Process daily login bonuses with cross-system integration
   */
  async processDailyLoginBonus(userId: string): Promise<{
    success: boolean;
    loginBonus: CrossSystemReward[];
    streakBonus: number;
  }> {
    try {
      const loginBonus: CrossSystemReward[] = [];
      
      // Get user's login streak
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) return { success: false, loginBonus: [], streakBonus: 0 };

      const today = new Date();
      const lastLogin = user.lastLoginAt;
      let streak = user.loginStreak || 0;

      // Calculate streak
      if (lastLogin) {
        const daysSinceLastLogin = Math.floor((today.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24));
        if (daysSinceLastLogin === 1) {
          streak += 1;
        } else if (daysSinceLastLogin > 1) {
          streak = 1; // Reset streak
        }
      } else {
        streak = 1;
      }

      // Update user login info
      await prisma.user.update({
        where: { id: userId },
        data: {
          lastLoginAt: today,
          loginStreak: streak
        }
      });

      // Base daily bonus
      const baseBonus = this.config.dailyLoginBonus;
      await honeycombResourceService.awardResource(userId, 'FUNDING_TOKENS', baseBonus);
      loginBonus.push({ type: 'RESOURCE', amount: baseBonus, resourceType: 'FUNDING_TOKENS' });

      // Streak bonuses
      const streakMultiplier = Math.min(1 + (streak * 0.1), 3.0); // Max 3x multiplier at 20-day streak
      const streakBonus = Math.floor(baseBonus * (streakMultiplier - 1));
      
      if (streakBonus > 0) {
        await honeycombResourceService.awardResource(userId, 'FUNDING_TOKENS', streakBonus);
        loginBonus.push({ type: 'RESOURCE', amount: streakBonus, resourceType: 'FUNDING_TOKENS' });
      }

      // Character XP for login
      const character = await honeycombCharacterService.getUserCharacter(userId);
      if (character.success && character.character) {
        const loginXP = 25 + (streak * 5); // Base 25 XP + 5 per streak day
        await honeycombCharacterService.awardExperience(userId, loginXP);
        loginBonus.push({ type: 'XP', amount: loginXP });
      }

      // Special milestone rewards
      if (streak === 7) {
        await honeycombResourceService.awardResource(userId, 'DESIGN_CREATIVITY', 100);
        loginBonus.push({ type: 'RESOURCE', amount: 100, resourceType: 'DESIGN_CREATIVITY' });
      } else if (streak === 30) {
        loginBonus.push({ type: 'BADGE', itemId: 'monthly_dedication' });
      }

      // Log integration event
      await this.logIntegrationEvent({
        type: 'RESOURCE_EARNED',
        userId,
        data: { type: 'daily_login', streak, loginBonus },
        timestamp: new Date()
      });

      return {
        success: true,
        loginBonus,
        streakBonus: streak
      };
    } catch (error) {
      console.error('Error processing daily login bonus:', error);
      return {
        success: false,
        loginBonus: [],
        streakBonus: 0
      };
    }
  }

  /**
   * Calculate compound rewards across all systems
   */
  async calculateCompoundRewards(userId: string): Promise<{
    success: boolean;
    compoundRewards: {
      stakingBonusXP: number;
      missionEfficiencyBonus: number;
      resourceGenerationRate: number;
      kingdomSynergyBonus: number;
    };
  }> {
    try {
      const character = await honeycombCharacterService.getUserCharacter(userId);
      const stakingOverview = await honeycombStakingService.getUserStakingOverview(userId);
      
      if (!character.success || !character.character) {
        return {
          success: false,
          compoundRewards: {
            stakingBonusXP: 0,
            missionEfficiencyBonus: 0,
            resourceGenerationRate: 0,
            kingdomSynergyBonus: 0
          }
        };
      }

      const char = character.character;
      const staking = stakingOverview.success ? stakingOverview.overview : { totalStaked: 0, totalRewards: 0 };

      // Staking XP bonus (based on staked characters and level)
      const stakingBonusXP = staking.totalStaked > 0 ? 
        Math.floor(char.level * staking.totalStaked * 0.1) : 0;

      // Mission efficiency bonus (reduces mission time/increases success rate)
      const missionEfficiencyBonus = Math.min(char.level * 0.02, 0.5); // Max 50% efficiency

      // Resource generation rate multiplier
      const resourceGenerationRate = 1 + (char.level * 0.01) + (staking.totalStaked * 0.005);

      // Kingdom synergy bonus
      const kingdomSynergyBonus = this.calculateKingdomSynergyBonus(char);

      return {
        success: true,
        compoundRewards: {
          stakingBonusXP,
          missionEfficiencyBonus,
          resourceGenerationRate,
          kingdomSynergyBonus
        }
      };
    } catch (error) {
      console.error('Error calculating compound rewards:', error);
      return {
        success: false,
        compoundRewards: {
          stakingBonusXP: 0,
          missionEfficiencyBonus: 0,
          resourceGenerationRate: 0,
          kingdomSynergyBonus: 0
        }
      };
    }
  }

  /**
   * Get comprehensive user progress across all systems
   */
  async getUserProgressSummary(userId: string): Promise<{
    success: boolean;
    summary: {
      character: any;
      resources: any;
      missions: any;
      staking: any;
      achievements: any[];
      nextMilestones: string[];
      overallProgress: number;
    };
  }> {
    try {
      // Fetch data from all systems
      const [characterResult, resourceResult, stakingResult] = await Promise.all([
        honeycombCharacterService.getUserCharacter(userId),
        honeycombResourceService.getUserInventory(userId),
        honeycombStakingService.getUserStakingOverview(userId)
      ]);

      // Get mission history
      const missionHistory = await prisma.submission.count({
        where: {
          userId,
          status: 'APPROVED',
          mission: { category: 'ENHANCED' }
        }
      });

      // Calculate next milestones
      const nextMilestones = [];
      const char = characterResult.success ? characterResult.character : null;
      
      if (char) {
        if (char.level < 10) nextMilestones.push(`Reach Level 10 (${10 - char.level} levels to go)`);
        if (char.level < 20) nextMilestones.push(`Reach Level 20 (${20 - char.level} levels to go)`);
        
        const totalResources = Object.values(resourceResult.success ? resourceResult.inventory : {})
          .reduce((sum: number, amount: any) => sum + amount, 0);
        
        if (totalResources < 1000) {
          nextMilestones.push(`Collect 1000 resources (${1000 - totalResources} to go)`);
        }
        
        if (missionHistory < 10) {
          nextMilestones.push(`Complete 10 missions (${10 - missionHistory} to go)`);
        }
      }

      // Calculate overall progress (0-100)
      let progressScore = 0;
      if (char) {
        progressScore += Math.min(char.level * 5, 50); // Max 50 points for level
        progressScore += Math.min(missionHistory * 2, 25); // Max 25 points for missions
        
        const totalResources = Object.values(resourceResult.success ? resourceResult.inventory : {})
          .reduce((sum: number, amount: any) => sum + amount, 0);
        progressScore += Math.min(totalResources / 100, 15); // Max 15 points for resources
        
        if (stakingResult.success && stakingResult.overview.totalStaked > 0) {
          progressScore += 10; // 10 points for staking participation
        }
      }

      return {
        success: true,
        summary: {
          character: characterResult.success ? characterResult.character : null,
          resources: resourceResult.success ? resourceResult.inventory : {},
          missions: { completed: missionHistory },
          staking: stakingResult.success ? stakingResult.overview : { totalStaked: 0, totalRewards: 0 },
          achievements: [], // TODO: Implement achievement system
          nextMilestones,
          overallProgress: Math.min(progressScore, 100)
        }
      };
    } catch (error) {
      console.error('Error getting user progress summary:', error);
      return {
        success: false,
        summary: {
          character: null,
          resources: {},
          missions: { completed: 0 },
          staking: { totalStaked: 0, totalRewards: 0 },
          achievements: [],
          nextMilestones: [],
          overallProgress: 0
        }
      };
    }
  }

  // Helper methods

  private isKingdomAlignedMission(kingdom: string, mission: any): boolean {
    // Define kingdom-mission alignments
    const alignments: Record<string, string[]> = {
      SILICON_VALLEY: ['tech', 'startup', 'mvp', 'coding'],
      DIGITAL_NOMADS: ['remote', 'travel', 'networking', 'community'],
      CRYPTO_PIONEERS: ['blockchain', 'defi', 'crypto', 'web3'],
      GREEN_INNOVATORS: ['sustainability', 'environment', 'green', 'clean'],
      HEALTH_REVOLUTIONARIES: ['health', 'medical', 'wellness', 'biotech']
    };

    const keywords = alignments[kingdom] || [];
    const missionText = `${mission.title} ${mission.description}`.toLowerCase();
    
    return keywords.some(keyword => missionText.includes(keyword));
  }

  private getKingdomLevelUpBonus(kingdom: string, level: number): CrossSystemReward[] {
    const bonuses: CrossSystemReward[] = [];

    // Kingdom-specific bonuses every 5 levels
    if (level % 5 === 0) {
      switch (kingdom) {
        case 'SILICON_VALLEY':
          bonuses.push({ type: 'RESOURCE', amount: level * 15, resourceType: 'CODE_POINTS' });
          bonuses.push({ type: 'RESOURCE', amount: level * 12, resourceType: 'PRODUCT_VISION' });
          break;
        case 'DIGITAL_NOMADS':
          bonuses.push({ type: 'RESOURCE', amount: level * 20, resourceType: 'NETWORK_CONNECTIONS' });
          bonuses.push({ type: 'RESOURCE', amount: level * 8, resourceType: 'MARKET_INSIGHTS' });
          break;
        case 'CRYPTO_PIONEERS':
          bonuses.push({ type: 'RESOURCE', amount: level * 25, resourceType: 'FUNDING_TOKENS' });
          bonuses.push({ type: 'RESOURCE', amount: level * 5, resourceType: 'CODE_POINTS' });
          break;
        case 'GREEN_INNOVATORS':
          bonuses.push({ type: 'RESOURCE', amount: level * 18, resourceType: 'DESIGN_CREATIVITY' });
          bonuses.push({ type: 'RESOURCE', amount: level * 10, resourceType: 'MARKET_INSIGHTS' });
          break;
        case 'HEALTH_REVOLUTIONARIES':
          bonuses.push({ type: 'RESOURCE', amount: level * 22, resourceType: 'RESEARCH_DATA' });
          bonuses.push({ type: 'RESOURCE', amount: level * 15, resourceType: 'FUNDING_TOKENS' });
          break;
      }
    }

    return bonuses;
  }

  private calculateKingdomSynergyBonus(character: any): number {
    // Calculate synergy based on character stats alignment with kingdom
    const kingdomStatWeights: Record<string, Record<string, number>> = {
      SILICON_VALLEY: { technical: 2, product: 1.5, business: 1, marketing: 0.8, community: 0.7, design: 1 },
      DIGITAL_NOMADS: { community: 2, marketing: 1.5, business: 1, technical: 0.8, product: 0.7, design: 1 },
      CRYPTO_PIONEERS: { technical: 1.8, business: 1.3, product: 1, marketing: 1.2, community: 0.9, design: 0.8 },
      GREEN_INNOVATORS: { design: 2, product: 1.5, technical: 1, business: 1.2, marketing: 1.1, community: 0.9 },
      HEALTH_REVOLUTIONARIES: { product: 1.8, technical: 1.4, business: 1.3, community: 1, marketing: 0.9, design: 1 }
    };

    const weights = kingdomStatWeights[character.kingdom] || {};
    let synergyScore = 0;

    Object.entries(character.stats).forEach(([stat, value]: [string, any]) => {
      const weight = weights[stat] || 1;
      synergyScore += value * weight;
    });

    // Normalize to percentage bonus (0-50% max)
    return Math.min(synergyScore / 1000, 0.5);
  }

  private async logIntegrationEvent(event: IntegrationEvent): Promise<void> {
    try {
      // In a production environment, you might want to store these in a separate events table
      // For now, we'll log them and could store in a JSON metadata field
      console.log('Integration Event:', JSON.stringify(event, null, 2));
    } catch (error) {
      console.error('Error logging integration event:', error);
    }
  }

  /**
   * Process all pending integration tasks for a user
   */
  async processPendingIntegrations(userId: string): Promise<{
    success: boolean;
    processedEvents: number;
    errors: string[];
  }> {
    const errors: string[] = [];
    let processedEvents = 0;

    try {
      // Process daily login if applicable
      const loginResult = await this.processDailyLoginBonus(userId);
      if (loginResult.success) {
        processedEvents++;
      } else {
        errors.push('Failed to process daily login bonus');
      }

      // Calculate and apply compound rewards
      const compoundResult = await this.calculateCompoundRewards(userId);
      if (compoundResult.success) {
        // Apply any pending compound bonuses
        processedEvents++;
      }

      return {
        success: errors.length === 0,
        processedEvents,
        errors
      };
    } catch (error) {
      console.error('Error processing pending integrations:', error);
      return {
        success: false,
        processedEvents,
        errors: [...errors, 'Unexpected error during integration processing']
      };
    }
  }
}

export const honeycombIntegrationService = new HoneycombIntegrationService();