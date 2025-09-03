import { prisma } from '../../config/database';
import { honeycombService } from './client';
import { honeycombResourceService } from './resources';
import { honeycombCharacterService } from './characters';
import type { User, Mission, ResourceType } from '@prisma/client';

export interface TimedMissionData {
  missionId: string;
  name: string;
  description: string;
  type: 'DAILY' | 'WEEKLY' | 'TIMED' | 'CHAIN' | 'TEAM';
  duration?: number; // in seconds
  cooldownPeriod?: number; // cooldown before can repeat
  maxAttempts?: number;
  rewards: MissionReward[];
  requirements?: MissionRequirement[];
  unlockConditions?: UnlockCondition[];
}

export interface MissionReward {
  type: 'XP' | 'RESOURCE' | 'EQUIPMENT' | 'BADGE' | 'CHARACTER_EVOLUTION';
  amount?: number;
  resourceType?: ResourceType;
  itemId?: string;
  metadata?: any;
}

export interface MissionRequirement {
  type: 'LEVEL' | 'KINGDOM' | 'RESOURCE' | 'EQUIPMENT' | 'PREVIOUS_MISSION';
  value: any;
  description: string;
}

export interface UnlockCondition {
  type: 'LEVEL' | 'MISSION_COUNT' | 'TOTAL_XP' | 'RESOURCE_AMOUNT' | 'TEAM_SIZE' | 'TIME_PLAYED';
  value: any;
  description: string;
}

export interface MissionChainData {
  chainId: string;
  name: string;
  description: string;
  missions: string[]; // Array of mission IDs in order
  chainRewards: MissionReward[];
  isSequential: boolean; // Must complete in order vs any order
}

export interface TeamMissionData {
  missionId: string;
  name: string;
  description: string;
  requiredTeamSize: number;
  maxTeamSize: number;
  duration: number;
  teamRewards: MissionReward[];
  individualRewards: MissionReward[];
  coordinationRequired: boolean; // All members must contribute
}

// Enhanced mission definitions with time-based mechanics
const ENHANCED_MISSIONS: TimedMissionData[] = [
  // DAILY MISSIONS
  {
    missionId: 'daily_code_commit',
    name: 'Daily Code Warrior',
    description: 'Make at least 3 meaningful commits to any repository',
    type: 'DAILY',
    cooldownPeriod: 86400, // 24 hours
    maxAttempts: 1,
    rewards: [
      { type: 'RESOURCE', resourceType: 'CODE_POINTS', amount: 50 },
      { type: 'XP', amount: 25 }
    ],
    requirements: [
      { type: 'LEVEL', value: 1, description: 'Must be level 1 or higher' }
    ]
  },
  {
    missionId: 'daily_network_building',
    name: 'Network Expansion',
    description: 'Connect with 2 new professionals or engage meaningfully with 5 contacts',
    type: 'DAILY',
    cooldownPeriod: 86400,
    maxAttempts: 1,
    rewards: [
      { type: 'RESOURCE', resourceType: 'NETWORK_CONNECTIONS', amount: 30 },
      { type: 'RESOURCE', resourceType: 'MARKETING_INFLUENCE', amount: 20 }
    ]
  },
  {
    missionId: 'daily_learning_session',
    name: 'Knowledge Seeker',
    description: 'Complete a learning module, tutorial, or educational content',
    type: 'DAILY',
    cooldownPeriod: 86400,
    maxAttempts: 1,
    rewards: [
      { type: 'RESOURCE', resourceType: 'BUSINESS_ACUMEN', amount: 35 },
      { type: 'CHARACTER_EVOLUTION', metadata: { experience: 15 } }
    ]
  },

  // WEEKLY MISSIONS
  {
    missionId: 'weekly_mvp_iteration',
    name: 'Weekly MVP Progress',
    description: 'Make significant progress on your MVP with measurable improvements',
    type: 'WEEKLY',
    duration: 604800, // 7 days
    cooldownPeriod: 604800,
    maxAttempts: 1,
    rewards: [
      { type: 'RESOURCE', resourceType: 'PRODUCT_VISION', amount: 150 },
      { type: 'RESOURCE', resourceType: 'CODE_POINTS', amount: 100 },
      { type: 'XP', amount: 200 }
    ],
    requirements: [
      { type: 'LEVEL', value: 10, description: 'Must be level 10 or higher' }
    ]
  },
  {
    missionId: 'weekly_market_research',
    name: 'Market Intelligence Gathering',
    description: 'Conduct comprehensive market research and competitor analysis',
    type: 'WEEKLY',
    duration: 604800,
    cooldownPeriod: 604800,
    maxAttempts: 1,
    rewards: [
      { type: 'RESOURCE', resourceType: 'BUSINESS_ACUMEN', amount: 200 },
      { type: 'RESOURCE', resourceType: 'MARKETING_INFLUENCE', amount: 100 },
      { type: 'EQUIPMENT', itemId: 'market_research_report' }
    ],
    requirements: [
      { type: 'KINGDOM', value: ['BUSINESS_STRATEGY', 'MARKETING_MULTIVERSE'], description: 'Business or Marketing kingdom' }
    ]
  },

  // TIMED MISSIONS (Limited availability)
  {
    missionId: 'timed_hackathon_participation',
    name: 'Hackathon Hero',
    description: 'Participate in a hackathon and build something amazing in 48 hours',
    type: 'TIMED',
    duration: 172800, // 48 hours
    cooldownPeriod: 2592000, // 30 days
    maxAttempts: 1,
    rewards: [
      { type: 'RESOURCE', resourceType: 'CODE_POINTS', amount: 300 },
      { type: 'RESOURCE', resourceType: 'PRODUCT_VISION', amount: 200 },
      { type: 'RESOURCE', resourceType: 'NETWORK_CONNECTIONS', amount: 150 },
      { type: 'BADGE', metadata: { badgeId: 'hackathon_champion' } }
    ],
    requirements: [
      { type: 'LEVEL', value: 15, description: 'Must be level 15 or higher' },
      { type: 'KINGDOM', value: ['SILICON_VALLEY', 'CRYPTO_VALLEY'], description: 'Tech-focused kingdom' }
    ]
  },
  {
    missionId: 'timed_funding_pitch',
    name: 'Pitch Perfect Challenge',
    description: 'Present your startup to real investors within 5 days of mission start',
    type: 'TIMED',
    duration: 432000, // 5 days
    cooldownPeriod: 5184000, // 60 days
    maxAttempts: 2,
    rewards: [
      { type: 'RESOURCE', resourceType: 'FUNDING_TOKENS', amount: 500 },
      { type: 'RESOURCE', resourceType: 'BUSINESS_ACUMEN', amount: 250 },
      { type: 'RESOURCE', resourceType: 'NETWORK_CONNECTIONS', amount: 200 },
      { type: 'BADGE', metadata: { badgeId: 'pitch_master' } }
    ],
    requirements: [
      { type: 'LEVEL', value: 20, description: 'Must be level 20 or higher' },
      { type: 'RESOURCE', value: { BUSINESS_ACUMEN: 500 }, description: 'Requires 500 Business Acumen' }
    ]
  }
];

// Mission chains for progressive storytelling
const MISSION_CHAINS: MissionChainData[] = [
  {
    chainId: 'founder_journey_chain',
    name: 'The Complete Founder Journey',
    description: 'Experience the full startup lifecycle from idea to exit',
    missions: [
      'chain_idea_validation',
      'chain_mvp_development', 
      'chain_first_customers',
      'chain_team_building',
      'chain_funding_round',
      'chain_scale_operations',
      'chain_market_expansion',
      'chain_exit_strategy'
    ],
    chainRewards: [
      { type: 'BADGE', metadata: { badgeId: 'complete_founder' } },
      { type: 'CHARACTER_EVOLUTION', metadata: { evolutionType: 'FOUNDER_MASTERY' } },
      { type: 'RESOURCE', resourceType: 'FUNDING_TOKENS', amount: 1000 }
    ],
    isSequential: true
  },
  {
    chainId: 'tech_mastery_chain',
    name: 'Technical Excellence Path',
    description: 'Master the technical aspects of building scalable products',
    missions: [
      'chain_first_commit',
      'chain_architecture_design',
      'chain_performance_optimization',
      'chain_security_implementation',
      'chain_deployment_automation',
      'chain_monitoring_setup'
    ],
    chainRewards: [
      { type: 'BADGE', metadata: { badgeId: 'tech_architect' } },
      { type: 'EQUIPMENT', itemId: 'legendary_tech_stack' },
      { type: 'RESOURCE', resourceType: 'CODE_POINTS', amount: 800 }
    ],
    isSequential: true
  }
];

// Team missions for collaboration
const TEAM_MISSIONS: TeamMissionData[] = [
  {
    missionId: 'team_hackathon_victory',
    name: 'Team Hackathon Domination',
    description: 'Work as a team to win a hackathon or coding competition',
    requiredTeamSize: 2,
    maxTeamSize: 5,
    duration: 259200, // 3 days
    coordinationRequired: true,
    teamRewards: [
      { type: 'BADGE', metadata: { badgeId: 'team_champions' } }
    ],
    individualRewards: [
      { type: 'RESOURCE', resourceType: 'CODE_POINTS', amount: 200 },
      { type: 'RESOURCE', resourceType: 'NETWORK_CONNECTIONS', amount: 100 },
      { type: 'XP', amount: 300 }
    ]
  },
  {
    missionId: 'team_product_launch',
    name: 'Collaborative Product Launch',
    description: 'Launch a product together with defined roles and responsibilities',
    requiredTeamSize: 3,
    maxTeamSize: 8,
    duration: 1209600, // 2 weeks
    coordinationRequired: true,
    teamRewards: [
      { type: 'EQUIPMENT', itemId: 'team_success_trophy' }
    ],
    individualRewards: [
      { type: 'RESOURCE', resourceType: 'PRODUCT_VISION', amount: 250 },
      { type: 'RESOURCE', resourceType: 'MARKETING_INFLUENCE', amount: 150 },
      { type: 'CHARACTER_EVOLUTION', metadata: { experience: 100 } }
    ]
  }
];

class HoneycombEnhancedMissionService {

  /**
   * Initialize enhanced mission system
   */
  async initializeEnhancedMissions(): Promise<void> {
    console.log('🎯 Initializing enhanced mission system...');
    
    // Initialize all enhanced missions
    for (const mission of ENHANCED_MISSIONS) {
      try {
        await this.createTimedMission(mission);
      } catch (error) {
        console.error(`Failed to initialize mission ${mission.missionId}:`, error);
      }
    }

    // Initialize mission chains
    for (const chain of MISSION_CHAINS) {
      try {
        await this.createMissionChain(chain);
      } catch (error) {
        console.error(`Failed to initialize chain ${chain.chainId}:`, error);
      }
    }

    console.log(`✅ Initialized ${ENHANCED_MISSIONS.length} enhanced missions and ${MISSION_CHAINS.length} chains`);
  }

  /**
   * Create a timed mission with cooldowns and duration
   */
  async createTimedMission(data: TimedMissionData): Promise<void> {
    try {
      // Store mission configuration in database
      const mission = await prisma.mission.upsert({
        where: { slug: data.missionId },
        update: {
          title: data.name,
          description: data.description,
          type: data.type,
          status: 'ACTIVE',
          rewards: data.rewards as any,
          requirements: data.requirements as any,
          metadata: {
            duration: data.duration,
            cooldownPeriod: data.cooldownPeriod,
            maxAttempts: data.maxAttempts,
            unlockConditions: data.unlockConditions
          }
        },
        create: {
          slug: data.missionId,
          title: data.name,
          description: data.description,
          type: data.type,
          category: 'ENHANCED',
          difficulty: 'INTERMEDIATE',
          status: 'ACTIVE',
          rewards: data.rewards as any,
          requirements: data.requirements as any,
          metadata: {
            duration: data.duration,
            cooldownPeriod: data.cooldownPeriod,
            maxAttempts: data.maxAttempts,
            unlockConditions: data.unlockConditions
          }
        }
      });

      console.log(`📝 Created/updated timed mission: ${data.name}`);

    } catch (error) {
      console.error(`Failed to create timed mission ${data.missionId}:`, error);
      throw error;
    }
  }

  /**
   * Create mission chain for progressive gameplay
   */
  async createMissionChain(data: MissionChainData): Promise<void> {
    try {
      // Store in separate mission chains table (would need to add to schema)
      console.log(`🔗 Created mission chain: ${data.name} (${data.missions.length} missions)`);
      
      // For now, log the chain creation - in production this would be stored
      // await prisma.missionChain.create({ data: ... });

    } catch (error) {
      console.error(`Failed to create mission chain ${data.chainId}:`, error);
      throw error;
    }
  }

  /**
   * Start a timed mission for a user
   */
  async startTimedMission(userId: string, missionId: string): Promise<{
    success: boolean;
    missionStart?: any;
    error?: string;
  }> {
    try {
      // Get mission configuration
      const mission = await prisma.mission.findUnique({
        where: { slug: missionId }
      });

      if (!mission) {
        return { success: false, error: 'Mission not found' };
      }

      const metadata = mission.metadata as any;

      // Check if user can start this mission
      const canStart = await this.canUserStartMission(userId, mission);
      if (!canStart.allowed) {
        return { success: false, error: canStart.reason };
      }

      // Check cooldown period
      const lastCompletion = await prisma.submission.findFirst({
        where: {
          userId,
          missionId: mission.id,
          status: 'APPROVED'
        },
        orderBy: { updatedAt: 'desc' }
      });

      if (lastCompletion && metadata.cooldownPeriod) {
        const timeSinceCompletion = Date.now() - lastCompletion.updatedAt.getTime();
        const cooldownRemaining = (metadata.cooldownPeriod * 1000) - timeSinceCompletion;
        
        if (cooldownRemaining > 0) {
          return { 
            success: false, 
            error: `Cooldown active. Can retry in ${Math.ceil(cooldownRemaining / 1000)} seconds.` 
          };
        }
      }

      // Create mission start record
      const endTime = metadata.duration 
        ? new Date(Date.now() + (metadata.duration * 1000))
        : null;

      const submission = await prisma.submission.create({
        data: {
          userId,
          missionId: mission.id,
          status: 'IN_PROGRESS',
          artifacts: [],
          metadata: {
            startedAt: new Date(),
            endsAt: endTime,
            missionType: mission.type,
            attemptsUsed: 1
          }
        }
      });

      // Record mission start in Honeycomb
      try {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (user) {
          await honeycombService.completeMission('mission_started', user.walletAddress, [{
            type: 'timed_mission_start',
            missionId,
            missionName: mission.title,
            duration: metadata.duration,
            startTime: new Date().toISOString()
          }]);
        }
      } catch (error) {
        console.error('Failed to record mission start in Honeycomb:', error);
      }

      return {
        success: true,
        missionStart: {
          id: submission.id,
          missionId,
          startedAt: submission.createdAt,
          endsAt: endTime,
          timeRemaining: metadata.duration || 0
        }
      };

    } catch (error) {
      console.error('Failed to start timed mission:', error);
      return { success: false, error: 'Failed to start mission' };
    }
  }

  /**
   * Complete a timed mission with validation
   */
  async completeTimedMission(submissionId: string, artifacts: any[] = []): Promise<{
    success: boolean;
    rewards?: MissionReward[];
    error?: string;
  }> {
    try {
      const submission = await prisma.submission.findUnique({
        where: { id: submissionId },
        include: { mission: true, user: true }
      });

      if (!submission) {
        return { success: false, error: 'Submission not found' };
      }

      if (submission.status !== 'IN_PROGRESS') {
        return { success: false, error: 'Mission is not in progress' };
      }

      const metadata = submission.metadata as any;
      const missionMetadata = submission.mission.metadata as any;

      // Check if mission has expired (for timed missions)
      if (metadata.endsAt && new Date() > new Date(metadata.endsAt)) {
        await prisma.submission.update({
          where: { id: submissionId },
          data: { status: 'EXPIRED' }
        });
        return { success: false, error: 'Mission has expired' };
      }

      // Validate artifacts/evidence
      const isValid = await this.validateMissionCompletion(submission.mission, artifacts);
      if (!isValid.valid) {
        return { success: false, error: isValid.reason };
      }

      // Complete the mission
      await prisma.submission.update({
        where: { id: submissionId },
        data: {
          status: 'APPROVED',
          artifacts: artifacts as any,
          completedAt: new Date()
        }
      });

      // Award rewards
      const missionRewards = submission.mission.rewards as MissionReward[];
      const awardedRewards = [];

      for (const reward of missionRewards) {
        try {
          await this.awardMissionReward(submission.userId, reward);
          awardedRewards.push(reward);
        } catch (error) {
          console.error('Failed to award reward:', error);
        }
      }

      // Record completion in Honeycomb
      try {
        await honeycombService.completeMission(submission.mission.slug, submission.user.walletAddress, artifacts);
      } catch (error) {
        console.error('Failed to record mission completion in Honeycomb:', error);
      }

      // Check for mission chain progression
      await this.checkChainProgression(submission.userId, submission.mission.slug);

      return {
        success: true,
        rewards: awardedRewards
      };

    } catch (error) {
      console.error('Failed to complete timed mission:', error);
      return { success: false, error: 'Failed to complete mission' };
    }
  }

  /**
   * Get available missions for a user
   */
  async getAvailableMissions(userId: string): Promise<{
    daily: any[];
    weekly: any[];
    timed: any[];
    chains: any[];
    team: any[];
  }> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { character: true }
      });

      if (!user) {
        throw new Error('User not found');
      }

      const missions = await prisma.mission.findMany({
        where: {
          status: 'ACTIVE',
          category: 'ENHANCED'
        }
      });

      const availableMissions = {
        daily: [],
        weekly: [],
        timed: [],
        chains: [],
        team: []
      };

      for (const mission of missions) {
        const canStart = await this.canUserStartMission(userId, mission);
        if (canStart.allowed) {
          const missionData = {
            id: mission.id,
            slug: mission.slug,
            title: mission.title,
            description: mission.description,
            type: mission.type,
            rewards: mission.rewards,
            requirements: mission.requirements,
            metadata: mission.metadata,
            canStart: true
          };

          switch (mission.type) {
            case 'DAILY':
              availableMissions.daily.push(missionData);
              break;
            case 'WEEKLY':
              availableMissions.weekly.push(missionData);
              break;
            case 'TIMED':
              availableMissions.timed.push(missionData);
              break;
            case 'TEAM':
              availableMissions.team.push(missionData);
              break;
          }
        }
      }

      return availableMissions;

    } catch (error) {
      console.error('Failed to get available missions:', error);
      throw error;
    }
  }

  /**
   * Check if user can start a specific mission
   */
  private async canUserStartMission(userId: string, mission: any): Promise<{
    allowed: boolean;
    reason?: string;
  }> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { character: true }
      });

      if (!user) {
        return { allowed: false, reason: 'User not found' };
      }

      const requirements = mission.requirements as MissionRequirement[] || [];

      // Check level requirement
      const levelReq = requirements.find(r => r.type === 'LEVEL');
      if (levelReq && (user.level || 1) < levelReq.value) {
        return { allowed: false, reason: `Level ${levelReq.value} required` };
      }

      // Check kingdom requirement
      const kingdomReq = requirements.find(r => r.type === 'KINGDOM');
      if (kingdomReq && user.character) {
        const allowedKingdoms = Array.isArray(kingdomReq.value) ? kingdomReq.value : [kingdomReq.value];
        if (!allowedKingdoms.includes(user.character.kingdom)) {
          return { allowed: false, reason: 'Wrong kingdom for this mission' };
        }
      }

      // Check resource requirements
      const resourceReq = requirements.find(r => r.type === 'RESOURCE');
      if (resourceReq) {
        const resourceCheck = await honeycombResourceService.checkResourceBalance(userId, resourceReq.value);
        if (!resourceCheck.hasEnough) {
          return { allowed: false, reason: 'Insufficient resources' };
        }
      }

      return { allowed: true };

    } catch (error) {
      console.error('Failed to check mission requirements:', error);
      return { allowed: false, reason: 'Failed to validate requirements' };
    }
  }

  /**
   * Award mission reward to user
   */
  private async awardMissionReward(userId: string, reward: MissionReward): Promise<void> {
    try {
      switch (reward.type) {
        case 'XP':
          await prisma.user.update({
            where: { id: userId },
            data: { xpTotal: { increment: reward.amount || 0 } }
          });
          break;

        case 'RESOURCE':
          if (reward.resourceType && reward.amount) {
            await honeycombResourceService.awardResources({
              userId,
              resourceType: reward.resourceType,
              amount: reward.amount,
              source: 'MISSION',
              description: `Mission reward: ${reward.resourceType}`
            });
          }
          break;

        case 'CHARACTER_EVOLUTION':
          if (reward.metadata?.experience) {
            const character = await prisma.founderCharacter.findUnique({ where: { userId } });
            if (character) {
              await honeycombCharacterService.awardExperience(
                character.id, 
                reward.metadata.experience, 
                'mission_completion'
              );
            }
          }
          break;

        case 'BADGE':
          // Badge creation would be handled here
          console.log(`Badge reward: ${reward.metadata?.badgeId}`);
          break;

        case 'EQUIPMENT':
          // Equipment creation would be handled here
          console.log(`Equipment reward: ${reward.itemId}`);
          break;
      }

    } catch (error) {
      console.error('Failed to award mission reward:', error);
      throw error;
    }
  }

  /**
   * Validate mission completion artifacts
   */
  private async validateMissionCompletion(mission: any, artifacts: any[]): Promise<{
    valid: boolean;
    reason?: string;
  }> {
    // Basic validation - in production this would be more sophisticated
    if (!artifacts || artifacts.length === 0) {
      return { valid: false, reason: 'Evidence required for mission completion' };
    }

    // Specific validation based on mission type
    const missionSlug = mission.slug;
    
    switch (missionSlug) {
      case 'daily_code_commit':
        // Validate GitHub commits
        if (!artifacts.some(a => a.type === 'github_commits' && a.count >= 3)) {
          return { valid: false, reason: 'At least 3 commits required' };
        }
        break;

      case 'weekly_mvp_iteration':
        // Validate MVP progress
        if (!artifacts.some(a => a.type === 'mvp_demo' || a.type === 'deployment_url')) {
          return { valid: false, reason: 'MVP demo or deployment URL required' };
        }
        break;

      default:
        // Generic validation
        break;
    }

    return { valid: true };
  }

  /**
   * Check and progress mission chains
   */
  private async checkChainProgression(userId: string, completedMissionSlug: string): Promise<void> {
    try {
      // Find chains that include this mission
      const relevantChains = MISSION_CHAINS.filter(chain => 
        chain.missions.includes(completedMissionSlug)
      );

      for (const chain of relevantChains) {
        // Check if all missions in chain are completed
        const completedSubmissions = await prisma.submission.findMany({
          where: {
            userId,
            status: 'APPROVED',
            mission: {
              slug: { in: chain.missions }
            }
          },
          include: { mission: { select: { slug: true } } }
        });

        const completedMissionSlugs = completedSubmissions.map(s => s.mission.slug);
        const chainCompleted = chain.missions.every(missionSlug => 
          completedMissionSlugs.includes(missionSlug)
        );

        if (chainCompleted) {
          // Award chain completion rewards
          for (const reward of chain.chainRewards) {
            await this.awardMissionReward(userId, reward);
          }

          console.log(`🏆 User ${userId} completed mission chain: ${chain.name}`);
        }
      }

    } catch (error) {
      console.error('Failed to check chain progression:', error);
    }
  }

  /**
   * Get user's active timed missions
   */
  async getUserActiveTimedMissions(userId: string): Promise<any[]> {
    try {
      const activeSubmissions = await prisma.submission.findMany({
        where: {
          userId,
          status: 'IN_PROGRESS',
          mission: {
            type: { in: ['DAILY', 'WEEKLY', 'TIMED'] }
          }
        },
        include: {
          mission: {
            select: {
              id: true,
              slug: true,
              title: true,
              description: true,
              type: true,
              metadata: true
            }
          }
        }
      });

      return activeSubmissions.map(submission => {
        const metadata = submission.metadata as any;
        const timeRemaining = metadata.endsAt 
          ? Math.max(0, new Date(metadata.endsAt).getTime() - Date.now())
          : 0;

        return {
          id: submission.id,
          mission: submission.mission,
          startedAt: submission.createdAt,
          endsAt: metadata.endsAt,
          timeRemaining: Math.floor(timeRemaining / 1000), // in seconds
          isExpired: timeRemaining <= 0
        };
      });

    } catch (error) {
      console.error('Failed to get active timed missions:', error);
      throw error;
    }
  }
}

export const honeycombEnhancedMissionService = new HoneycombEnhancedMissionService();
export default honeycombEnhancedMissionService;