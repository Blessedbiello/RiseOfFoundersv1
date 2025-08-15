import { honeycombService } from './client';
import { prisma } from '../../config/database';
import { HONEYCOMB_MISSIONS, HONEYCOMB_TRAITS } from '@rise-of-founders/shared';

interface MissionCompletionData {
  missionId: string;
  submitterId: string;
  submitterType: string;
  artifacts?: any[];
  submissionId: string;
  artifactUrl?: string;
  artifactType?: string;
}

interface MissionReward {
  type: 'xp' | 'badge' | 'trait_xp' | 'token';
  amount?: number;
  badgeId?: string;
  traitKey?: string;
  description: string;
}

class HoneycombMissionService {
  /**
   * Initialize all game missions in Honeycomb
   */
  async initializeGameMissions(): Promise<void> {
    console.log('🎯 Initializing game missions in Honeycomb...');

    const missionDefinitions = [
      {
        name: HONEYCOMB_MISSIONS.FIRST_COMMIT,
        description: 'Make your first commit to a repository',
        project: honeycombService.getProjectInfo().publicKey,
        reward: [{ amount: 100, mint: 'XP_TOKEN' }],
      },
      {
        name: HONEYCOMB_MISSIONS.CREATE_REPO,
        description: 'Create your first GitHub repository',
        project: honeycombService.getProjectInfo().publicKey,
        reward: [{ amount: 150, mint: 'XP_TOKEN' }],
      },
      {
        name: HONEYCOMB_MISSIONS.WRITE_BUSINESS_PLAN,
        description: 'Write a comprehensive business plan',
        project: honeycombService.getProjectInfo().publicKey,
        reward: [{ amount: 200, mint: 'XP_TOKEN' }],
      },
      {
        name: HONEYCOMB_MISSIONS.TEAM_FORMATION,
        description: 'Form a team with other founders',
        project: honeycombService.getProjectInfo().publicKey,
        reward: [{ amount: 300, mint: 'XP_TOKEN' }],
      },
      {
        name: HONEYCOMB_MISSIONS.MVP_LAUNCH,
        description: 'Launch your minimum viable product',
        project: honeycombService.getProjectInfo().publicKey,
        reward: [{ amount: 500, mint: 'XP_TOKEN' }],
      },
    ];

    for (const mission of missionDefinitions) {
      try {
        await honeycombService.createMission(mission);
        console.log(`✅ Created mission: ${mission.name}`);
      } catch (error) {
        console.error(`❌ Failed to create mission ${mission.name}:`, error);
      }
    }
  }

  /**
   * Complete a mission for a user
   */
  async completeMission(data: MissionCompletionData): Promise<{
    success: boolean;
    rewards: MissionReward[];
    honeycombTransactionHash?: string;
  }> {
    try {
      // Get user wallet address
      const user = await prisma.user.findUnique({
        where: { id: data.submitterId },
        select: { walletAddress: true, xpTotal: true, skillScores: true },
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Get mission details
      const mission = await prisma.mission.findUnique({
        where: { id: data.missionId },
        include: { node: true },
      });

      if (!mission) {
        throw new Error('Mission not found');
      }

      // Complete mission in Honeycomb
      const honeycombResult = await honeycombService.completeMission(
        mission.honeycombMissionId || mission.id,
        user.walletAddress,
        data.artifacts
      );

      // Calculate rewards based on mission type and difficulty
      const rewards = this.calculateMissionRewards(mission, user);

      // Update user progress in database
      await this.updateUserProgress(data.submitterId, rewards);

      // Update submission with Honeycomb result
      await prisma.submission.update({
        where: { id: data.submissionId },
        data: {
          honeycombResult: honeycombResult,
          status: 'APPROVED',
        },
      });

      console.log(`🎉 Mission ${data.missionId} completed for user ${data.submitterId}`);

      return {
        success: true,
        rewards,
        honeycombTransactionHash: honeycombResult.transactionHash,
      };
    } catch (error) {
      console.error('Failed to complete mission:', error);
      throw new Error('Failed to complete mission in Honeycomb');
    }
  }

  /**
   * Calculate rewards for mission completion
   */
  private calculateMissionRewards(mission: any, user: any): MissionReward[] {
    const rewards: MissionReward[] = [];
    const node = mission.node;

    // Base XP reward
    let xpReward = node.rewards?.xp || 100;

    // Difficulty multiplier
    switch (node.difficulty) {
      case 'SILVER':
        xpReward *= 1.5;
        break;
      case 'GOLD':
        xpReward *= 2.5;
        break;
      case 'BOSS':
        xpReward *= 5;
        break;
    }

    rewards.push({
      type: 'xp',
      amount: Math.floor(xpReward),
      description: `${node.difficulty} mission completion`,
    });

    // Skill-specific XP
    if (node.rewards?.skillPoints) {
      Object.entries(node.rewards.skillPoints).forEach(([skill, points]) => {
        if ((points as number) > 0) {
          rewards.push({
            type: 'trait_xp',
            traitKey: skill,
            amount: points as number,
            description: `${skill} skill improvement`,
          });
        }
      });
    }

    // Badge rewards
    if (node.rewards?.badges?.length > 0) {
      node.rewards.badges.forEach((badgeId: string) => {
        rewards.push({
          type: 'badge',
          badgeId,
          description: `${badgeId} achievement unlocked`,
        });
      });
    }

    return rewards;
  }

  /**
   * Update user progress with mission rewards
   */
  private async updateUserProgress(userId: string, rewards: MissionReward[]): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { xpTotal: true, skillScores: true },
    });

    if (!user) return;

    let totalXpGain = 0;
    const skillScores = user.skillScores as any;

    // Process rewards
    for (const reward of rewards) {
      switch (reward.type) {
        case 'xp':
          totalXpGain += reward.amount || 0;
          break;

        case 'trait_xp':
          if (reward.traitKey && skillScores[reward.traitKey] !== undefined) {
            skillScores[reward.traitKey] += reward.amount || 0;
          }
          break;

        case 'badge':
          // Create badge record
          if (reward.badgeId) {
            await prisma.userBadge.create({
              data: {
                userId,
                name: reward.badgeId,
                description: reward.description,
                imageUrl: `/badges/${reward.badgeId}.png`,
                rarity: 'COMMON',
                earnedAt: new Date(),
                metadata: { source: 'mission_completion' },
              },
            });
          }
          break;
      }
    }

    // Update user totals
    await prisma.user.update({
      where: { id: userId },
      data: {
        xpTotal: user.xpTotal + totalXpGain,
        skillScores,
      },
    });

    console.log(`📈 Updated user ${userId} progress: +${totalXpGain} XP`);
  }

  /**
   * Get mission progress for a user
   */
  async getUserMissionProgress(userId: string): Promise<{
    completedMissions: string[];
    totalXp: number;
    activeMissions: string[];
  }> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        submissions: {
          where: { status: 'APPROVED' },
          include: { mission: true },
        },
        nodeProgress: {
          where: { status: 'IN_PROGRESS' },
          include: { node: { include: { missions: true } } },
        },
      },
    });

    if (!user) {
      return { completedMissions: [], totalXp: 0, activeMissions: [] };
    }

    const completedMissions = user.submissions.map(s => s.mission.honeycombMissionId || s.mission.id);
    const activeMissions = user.nodeProgress
      .flatMap(p => p.node.missions.map(m => m.honeycombMissionId || m.id));

    return {
      completedMissions,
      totalXp: user.xpTotal,
      activeMissions,
    };
  }
}

export const honeycombMissionService = new HoneycombMissionService();