import { honeycombService } from './client';
import { prisma } from '../../config/database';
import { HONEYCOMB_TRAITS, TRAIT_LEVELS } from '@rise-of-founders/shared';

interface BadgeDefinition {
  name: string;
  description: string;
  imageUrl: string;
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  criteria: {
    type: 'mission_count' | 'xp_threshold' | 'skill_level' | 'team_achievement' | 'special';
    value: number;
    skill?: string;
    missions?: string[];
  };
}

interface TraitEvolution {
  traitKey: string;
  currentLevel: number;
  newLevel: number;
  xpGained: number;
  milestone?: boolean;
}

class HoneycombBadgeService {
  private badgeDefinitions: BadgeDefinition[] = [
    {
      name: 'First Steps',
      description: 'Complete your first mission',
      imageUrl: '/badges/first-steps.png',
      rarity: 'COMMON',
      criteria: { type: 'mission_count', value: 1 },
    },
    {
      name: 'Builder',
      description: 'Complete 5 technical missions',
      imageUrl: '/badges/builder.png',
      rarity: 'COMMON',
      criteria: { type: 'skill_level', value: 2, skill: 'technical' },
    },
    {
      name: 'Business Minded',
      description: 'Reach business skill level 3',
      imageUrl: '/badges/business-minded.png',
      rarity: 'RARE',
      criteria: { type: 'skill_level', value: 3, skill: 'business' },
    },
    {
      name: 'Team Player',
      description: 'Successfully complete a team mission',
      imageUrl: '/badges/team-player.png',
      rarity: 'RARE',
      criteria: { type: 'team_achievement', value: 1 },
    },
    {
      name: 'XP Master',
      description: 'Reach 1000 total XP',
      imageUrl: '/badges/xp-master.png',
      rarity: 'EPIC',
      criteria: { type: 'xp_threshold', value: 1000 },
    },
    {
      name: 'Startup Guru',
      description: 'Reach level 5 in all skills',
      imageUrl: '/badges/startup-guru.png',
      rarity: 'LEGENDARY',
      criteria: { type: 'special', value: 0 },
    },
  ];

  /**
   * Initialize all badges in Honeycomb
   */
  async initializeGameBadges(): Promise<void> {
    console.log('🏆 Initializing game badges in Honeycomb...');

    for (const badge of this.badgeDefinitions) {
      try {
        // Create metadata JSON for the badge
        const metadata = {
          name: badge.name,
          description: badge.description,
          image: badge.imageUrl,
          attributes: [
            { trait_type: 'Rarity', value: badge.rarity },
            { trait_type: 'Criteria Type', value: badge.criteria.type },
            { trait_type: 'Criteria Value', value: badge.criteria.value.toString() },
          ],
        };

        // In a real implementation, you would upload this to IPFS/Arweave
        const metadataUri = `https://metadata.riseoffounders.com/badges/${badge.name.toLowerCase().replace(/\s+/g, '-')}.json`;

        await honeycombService.createBadge(
          badge.name,
          metadataUri,
          undefined, // No start time restriction
          undefined  // No end time restriction
        );

        console.log(`✅ Created badge: ${badge.name}`);
      } catch (error) {
        console.error(`❌ Failed to create badge ${badge.name}:`, error);
      }
    }
  }

  /**
   * Check and award badges to a user after mission completion
   */
  async checkAndAwardBadges(userId: string): Promise<string[]> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        badges: true,
        submissions: {
          where: { status: 'APPROVED' },
          include: { mission: { include: { node: true } } },
        },
        teamMembers: {
          where: { isActive: true },
          include: { team: true },
        },
      },
    });

    if (!user) return [];

    const earnedBadgeNames = user.badges.map(b => b.name);
    const newBadges: string[] = [];

    for (const badgeDef of this.badgeDefinitions) {
      // Skip if already earned
      if (earnedBadgeNames.includes(badgeDef.name)) continue;

      // Check if criteria is met
      const criteriaMet = await this.checkBadgeCriteria(user, badgeDef);

      if (criteriaMet) {
        try {
          // Award the badge
          await prisma.userBadge.create({
            data: {
              userId,
              name: badgeDef.name,
              description: badgeDef.description,
              imageUrl: badgeDef.imageUrl,
              rarity: badgeDef.rarity,
              earnedAt: new Date(),
              metadata: { criteria: badgeDef.criteria },
            },
          });

          newBadges.push(badgeDef.name);
          console.log(`🏆 Awarded badge "${badgeDef.name}" to user ${userId}`);
        } catch (error) {
          console.error(`Failed to award badge ${badgeDef.name}:`, error);
        }
      }
    }

    return newBadges;
  }

  /**
   * Check if a user meets the criteria for a specific badge
   */
  private async checkBadgeCriteria(user: any, badgeDef: BadgeDefinition): Promise<boolean> {
    const { criteria } = badgeDef;

    switch (criteria.type) {
      case 'mission_count':
        return user.submissions.length >= criteria.value;

      case 'xp_threshold':
        return user.xpTotal >= criteria.value;

      case 'skill_level':
        if (!criteria.skill) return false;
        const skillScores = user.skillScores as any;
        const skillXp = skillScores[criteria.skill] || 0;
        const skillLevel = this.calculateSkillLevel(skillXp);
        return skillLevel >= criteria.value;

      case 'team_achievement':
        const teamMissions = user.submissions.filter((s: any) => 
          s.submitterType === 'TEAM'
        );
        return teamMissions.length >= criteria.value;

      case 'special':
        // Custom logic for special badges
        if (badgeDef.name === 'Startup Guru') {
          return this.checkStartupGuruCriteria(user);
        }
        return false;

      default:
        return false;
    }
  }

  /**
   * Check special criteria for the Startup Guru badge
   */
  private checkStartupGuruCriteria(user: any): boolean {
    const skillScores = user.skillScores as any;
    const requiredSkills = ['technical', 'business', 'marketing', 'community', 'design', 'product'];

    return requiredSkills.every(skill => {
      const skillXp = skillScores[skill] || 0;
      const skillLevel = this.calculateSkillLevel(skillXp);
      return skillLevel >= 5;
    });
  }

  /**
   * Calculate skill level from XP
   */
  private calculateSkillLevel(xp: number): number {
    const levels = Object.entries(require('@rise-of-founders/shared').TRAIT_XP_REQUIREMENTS);
    
    for (let i = levels.length - 1; i >= 0; i--) {
      const [level, requiredXp] = levels[i];
      if (xp >= (requiredXp as number)) {
        return parseInt(level);
      }
    }
    
    return 1;
  }

  /**
   * Update user traits after mission completion
   */
  async updateUserTraits(userId: string, skillPoints: Record<string, number>): Promise<TraitEvolution[]> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { traits: true },
    });

    if (!user) return [];

    const evolutions: TraitEvolution[] = [];
    const skillScores = user.skillScores as any;

    for (const [skillKey, pointsGained] of Object.entries(skillPoints)) {
      if (pointsGained <= 0) continue;

      const currentXp = skillScores[skillKey] || 0;
      const newXp = currentXp + pointsGained;
      const currentLevel = this.calculateSkillLevel(currentXp);
      const newLevel = this.calculateSkillLevel(newXp);

      // Update skill scores
      skillScores[skillKey] = newXp;

      // Check if level increased
      if (newLevel > currentLevel) {
        const evolution: TraitEvolution = {
          traitKey: skillKey,
          currentLevel,
          newLevel,
          xpGained: pointsGained,
          milestone: newLevel >= 5, // Mark levels 5+ as milestones
        };

        evolutions.push(evolution);

        // Update or create trait record
        await prisma.userTrait.upsert({
          where: {
            userId_key: {
              userId,
              key: skillKey,
            },
          },
          create: {
            userId,
            key: skillKey,
            name: this.getTraitName(skillKey),
            level: newLevel,
            description: this.getTraitDescription(skillKey, newLevel),
            honeycombTraitId: `${skillKey}_${newLevel}`,
          },
          update: {
            level: newLevel,
            description: this.getTraitDescription(skillKey, newLevel),
            honeycombTraitId: `${skillKey}_${newLevel}`,
          },
        });

        console.log(`📈 User ${userId} leveled up ${skillKey}: ${currentLevel} → ${newLevel}`);
      }
    }

    // Update user skill scores
    await prisma.user.update({
      where: { id: userId },
      data: { skillScores },
    });

    return evolutions;
  }

  /**
   * Get trait name from key
   */
  private getTraitName(traitKey: string): string {
    const traitNames: Record<string, string> = {
      technical: 'Technical Builder',
      business: 'Business Strategist',
      marketing: 'Growth Hacker',
      community: 'Community Leader',
      design: 'Design Thinker',
      product: 'Product Visionary',
    };
    
    return traitNames[traitKey] || traitKey;
  }

  /**
   * Get trait description for level
   */
  private getTraitDescription(traitKey: string, level: number): string {
    const levelNames = ['Novice', 'Apprentice', 'Practitioner', 'Expert', 'Master', 'Grandmaster', 'Legend'];
    const levelName = levelNames[level - 1] || 'Unknown';
    
    const skillDescriptions: Record<string, string> = {
      technical: `${levelName} in software development and technical implementation`,
      business: `${levelName} in business strategy and operations`,
      marketing: `${levelName} in marketing and growth strategies`,
      community: `${levelName} in community building and engagement`,
      design: `${levelName} in design thinking and user experience`,
      product: `${levelName} in product development and management`,
    };

    return skillDescriptions[traitKey] || `${levelName} level achieved`;
  }

  /**
   * Get all available badges
   */
  getBadgeDefinitions(): BadgeDefinition[] {
    return this.badgeDefinitions;
  }

  /**
   * Get user's earned badges
   */
  async getUserBadges(userId: string): Promise<any[]> {
    try {
      // Mock implementation - would query from database and Honeycomb
      return [];
    } catch (error) {
      console.error('Failed to get user badges:', error);
      return [];
    }
  }
}

export const honeycombBadgeService = new HoneycombBadgeService();