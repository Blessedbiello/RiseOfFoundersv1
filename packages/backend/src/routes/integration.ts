import { Router, Response } from 'express';
import { AuthenticatedRequest, validateAuth } from '../middleware/auth';
import { ApiError, asyncHandler } from '../middleware/errorHandler';
import { honeycombIntegrationService } from '../services/honeycomb/integration';

const router: any = Router();

// All integration routes require authentication
router.use(validateAuth as any);

// GET /api/integration/progress - Get user's comprehensive progress across all systems
router.get('/progress', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;

  try {
    const progressSummary = await honeycombIntegrationService.getUserProgressSummary(userId);

    if (!progressSummary.success) {
      throw new ApiError('Failed to get progress summary', 500);
    }

    res.json({
      success: true,
      data: {
        ...progressSummary.summary,
        lastUpdated: new Date().toISOString(),
        recommendations: generateProgressRecommendations(progressSummary.summary)
      }
    });

  } catch (error: any) {
    throw new ApiError(error.message || 'Failed to get progress summary', 500);
  }
}));

// POST /api/integration/daily-login - Process daily login bonuses
router.post('/daily-login', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;

  try {
    const loginResult = await honeycombIntegrationService.processDailyLoginBonus(userId);

    if (!loginResult.success) {
      throw new ApiError('Failed to process daily login bonus', 500);
    }

    res.json({
      success: true,
      data: {
        loginBonus: loginResult.loginBonus,
        streakBonus: loginResult.streakBonus,
        message: loginResult.streakBonus > 1 
          ? `🔥 ${loginResult.streakBonus}-day streak! Keep it up!`
          : '🎉 Welcome back! Daily bonus claimed!',
        nextStreakReward: getNextStreakReward(loginResult.streakBonus)
      }
    });

  } catch (error: any) {
    throw new ApiError(error.message || 'Failed to process daily login bonus', 500);
  }
}));

// GET /api/integration/compound-rewards - Get compound rewards calculation
router.get('/compound-rewards', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;

  try {
    const compoundRewards = await honeycombIntegrationService.calculateCompoundRewards(userId);

    if (!compoundRewards.success) {
      throw new ApiError('Failed to calculate compound rewards', 500);
    }

    res.json({
      success: true,
      data: {
        ...compoundRewards.compoundRewards,
        explanation: {
          stakingBonusXP: 'Extra XP earned from staking characters',
          missionEfficiencyBonus: 'Reduced mission completion time and increased success rates',
          resourceGenerationRate: 'Multiplier for all resource generation',
          kingdomSynergyBonus: 'Bonus based on character stats alignment with kingdom specialization'
        },
        tips: generateOptimizationTips(compoundRewards.compoundRewards)
      }
    });

  } catch (error: any) {
    throw new ApiError(error.message || 'Failed to calculate compound rewards', 500);
  }
}));

// POST /api/integration/sync-systems - Sync all systems and process pending integrations
router.post('/sync-systems', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;

  try {
    const syncResult = await honeycombIntegrationService.processPendingIntegrations(userId);

    res.json({
      success: syncResult.success,
      data: {
        processedEvents: syncResult.processedEvents,
        errors: syncResult.errors,
        timestamp: new Date().toISOString(),
        message: syncResult.success 
          ? `✅ Successfully synchronized ${syncResult.processedEvents} system events`
          : `⚠️ Sync completed with ${syncResult.errors.length} errors`
      }
    });

  } catch (error: any) {
    throw new ApiError(error.message || 'Failed to sync systems', 500);
  }
}));

// GET /api/integration/dashboard-data - Get unified dashboard data
router.get('/dashboard-data', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;

  try {
    // Process daily login bonus first (if applicable)
    await honeycombIntegrationService.processDailyLoginBonus(userId);
    
    // Get comprehensive progress
    const progressSummary = await honeycombIntegrationService.getUserProgressSummary(userId);
    const compoundRewards = await honeycombIntegrationService.calculateCompoundRewards(userId);

    if (!progressSummary.success) {
      throw new ApiError('Failed to get dashboard data', 500);
    }

    // Calculate engagement metrics
    const engagementMetrics = calculateEngagementMetrics(progressSummary.summary);

    res.json({
      success: true,
      data: {
        progress: progressSummary.summary,
        compoundRewards: compoundRewards.success ? compoundRewards.compoundRewards : null,
        engagementMetrics,
        recommendations: generateProgressRecommendations(progressSummary.summary),
        notifications: generateNotifications(progressSummary.summary),
        lastSync: new Date().toISOString()
      }
    });

  } catch (error: any) {
    throw new ApiError(error.message || 'Failed to get dashboard data', 500);
  }
}));

// GET /api/integration/achievements - Get user achievements and milestones
router.get('/achievements', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;

  try {
    const progressSummary = await honeycombIntegrationService.getUserProgressSummary(userId);

    if (!progressSummary.success) {
      throw new ApiError('Failed to get achievements', 500);
    }

    const achievements = calculateAchievements(progressSummary.summary);
    const milestones = generateMilestones(progressSummary.summary);

    res.json({
      success: true,
      data: {
        achievements: achievements.unlocked,
        lockedAchievements: achievements.locked,
        currentMilestones: milestones.current,
        upcomingMilestones: milestones.upcoming,
        totalAchievementPoints: achievements.totalPoints,
        completionPercentage: achievements.completionPercentage
      }
    });

  } catch (error: any) {
    throw new ApiError(error.message || 'Failed to get achievements', 500);
  }
}));

// POST /api/integration/claim-milestone - Claim a completed milestone reward
router.post('/claim-milestone/:milestoneId', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const { milestoneId } = req.params;

  try {
    // Get progress to validate milestone completion
    const progressSummary = await honeycombIntegrationService.getUserProgressSummary(userId);
    
    if (!progressSummary.success) {
      throw new ApiError('Failed to validate milestone', 500);
    }

    // Validate and claim milestone
    const claimResult = await claimMilestone(userId, milestoneId, progressSummary.summary);

    if (!claimResult.success) {
      throw new ApiError(claimResult.error || 'Failed to claim milestone', 400);
    }

    res.json({
      success: true,
      data: {
        milestone: claimResult.milestone,
        rewards: claimResult.rewards,
        message: `🎉 Congratulations! You've claimed the "${claimResult.milestone.name}" milestone!`
      }
    });

  } catch (error: any) {
    throw new ApiError(error.message || 'Failed to claim milestone', 500);
  }
}));

// GET /api/integration/stats - Get integration statistics
router.get('/stats', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;

  try {
    const progressSummary = await honeycombIntegrationService.getUserProgressSummary(userId);
    const compoundRewards = await honeycombIntegrationService.calculateCompoundRewards(userId);

    if (!progressSummary.success) {
      throw new ApiError('Failed to get integration stats', 500);
    }

    const stats = {
      systemIntegration: {
        charactersActive: progressSummary.summary.character ? 1 : 0,
        resourcesManaged: Object.keys(progressSummary.summary.resources).length,
        missionsCompleted: progressSummary.summary.missions.completed,
        stakingParticipation: progressSummary.summary.staking.totalStaked > 0 ? 'Active' : 'Inactive'
      },
      performanceMultipliers: compoundRewards.success ? compoundRewards.compoundRewards : {},
      engagementScore: calculateEngagementScore(progressSummary.summary),
      systemEfficiency: calculateSystemEfficiency(progressSummary.summary),
      integrationHealth: 'Optimal' // Could be calculated based on system performance
    };

    res.json({
      success: true,
      data: stats
    });

  } catch (error: any) {
    throw new ApiError(error.message || 'Failed to get integration stats', 500);
  }
}));

// Helper functions

function generateProgressRecommendations(summary: any): string[] {
  const recommendations: string[] = [];

  if (!summary.character) {
    recommendations.push("🎯 Create your founder character to unlock the full Rise of Founders experience");
  } else {
    if (summary.character.level < 5) {
      recommendations.push("📈 Complete more missions to level up your character and unlock new features");
    }
    
    if (summary.overallProgress < 30) {
      recommendations.push("🚀 Try different mission types to boost your founder skills across all areas");
    }
    
    if (summary.staking.totalStaked === 0) {
      recommendations.push("💎 Consider staking your character to earn passive rewards and XP bonuses");
    }
    
    const totalResources = Object.values(summary.resources).reduce((sum: number, amount: any) => sum + amount, 0);
    if (totalResources > 500) {
      recommendations.push("🛠️ You have plenty of resources! Try crafting some startup artifacts");
    }
  }

  return recommendations;
}

function getNextStreakReward(currentStreak: number): string {
  const rewards: Record<number, string> = {
    7: "Weekly Dedication Badge + 100 Design Creativity",
    14: "Two-Week Champion Badge + Resource Multiplier",
    30: "Monthly Master Badge + Legendary Equipment",
    100: "Centennial Founder Badge + Special Kingdom Title"
  };

  for (const [streak, reward] of Object.entries(rewards)) {
    if (currentStreak < parseInt(streak)) {
      return `Day ${streak}: ${reward}`;
    }
  }

  return "You've achieved the highest streak rewards! Keep going for daily bonuses!";
}

function generateOptimizationTips(rewards: any): string[] {
  const tips: string[] = [];

  if (rewards.stakingBonusXP < 10) {
    tips.push("💡 Stake more characters to increase your XP bonus multiplier");
  }

  if (rewards.missionEfficiencyBonus < 0.2) {
    tips.push("💡 Level up your character to reduce mission completion times");
  }

  if (rewards.kingdomSynergyBonus < 0.3) {
    tips.push("💡 Focus on missions and activities that align with your kingdom specialization");
  }

  if (rewards.resourceGenerationRate < 1.5) {
    tips.push("💡 Participate in staking and level up to increase resource generation");
  }

  return tips;
}

function calculateEngagementMetrics(summary: any) {
  const totalSystems = 4; // Character, Resources, Missions, Staking
  let activeSystems = 0;

  if (summary.character) activeSystems++;
  if (Object.keys(summary.resources).length > 0) activeSystems++;
  if (summary.missions.completed > 0) activeSystems++;
  if (summary.staking.totalStaked > 0) activeSystems++;

  return {
    systemsEngaged: activeSystems,
    totalSystems,
    engagementPercentage: Math.round((activeSystems / totalSystems) * 100),
    recommendedActions: activeSystems < totalSystems ? 
      ['Explore unused systems for additional rewards'] : 
      ['Maximize your current systems for compound benefits']
  };
}

function calculateAchievements(summary: any) {
  const allAchievements = [
    {
      id: 'first_character',
      name: 'Founder\'s First Step',
      description: 'Create your first founder character',
      points: 100,
      unlocked: !!summary.character
    },
    {
      id: 'level_10',
      name: 'Experienced Founder',
      description: 'Reach character level 10',
      points: 200,
      unlocked: summary.character && summary.character.level >= 10
    },
    {
      id: 'mission_master',
      name: 'Mission Master',
      description: 'Complete 50 missions',
      points: 300,
      unlocked: summary.missions.completed >= 50
    },
    {
      id: 'resource_collector',
      name: 'Resource Collector',
      description: 'Accumulate 1000 total resources',
      points: 150,
      unlocked: Object.values(summary.resources).reduce((sum: number, amount: any) => sum + amount, 0) >= 1000
    },
    {
      id: 'staking_pioneer',
      name: 'Staking Pioneer',
      description: 'Participate in character staking',
      points: 250,
      unlocked: summary.staking.totalStaked > 0
    }
  ];

  const unlocked = allAchievements.filter(a => a.unlocked);
  const locked = allAchievements.filter(a => !a.unlocked);
  const totalPoints = unlocked.reduce((sum, a) => sum + a.points, 0);
  const maxPoints = allAchievements.reduce((sum, a) => sum + a.points, 0);

  return {
    unlocked,
    locked,
    totalPoints,
    completionPercentage: Math.round((unlocked.length / allAchievements.length) * 100)
  };
}

function generateMilestones(summary: any) {
  const current = [];
  const upcoming = [];

  // Character milestones
  if (summary.character) {
    if (summary.character.level < 20) {
      upcoming.push({
        id: 'level_20',
        name: 'Senior Founder',
        description: 'Reach character level 20',
        progress: summary.character.level,
        target: 20,
        reward: 'Unlock Elite Staking Pools'
      });
    }
  }

  // Mission milestones
  if (summary.missions.completed < 100) {
    upcoming.push({
      id: 'mission_century',
      name: 'Century of Success',
      description: 'Complete 100 missions',
      progress: summary.missions.completed,
      target: 100,
      reward: 'Legendary Mission Badge + 500 Funding Tokens'
    });
  }

  return { current, upcoming };
}

function claimMilestone(userId: string, milestoneId: string, summary: any) {
  // This would implement actual milestone claiming logic
  // For now, return a mock successful claim
  return {
    success: true,
    milestone: { id: milestoneId, name: 'Test Milestone' },
    rewards: [{ type: 'XP', amount: 100 }]
  };
}

function calculateEngagementScore(summary: any): number {
  let score = 0;
  
  if (summary.character) score += 25;
  if (summary.missions.completed > 0) score += 25;
  if (Object.keys(summary.resources).length > 0) score += 25;
  if (summary.staking.totalStaked > 0) score += 25;
  
  return score;
}

function calculateSystemEfficiency(summary: any): number {
  // Mock calculation - in production this would be more sophisticated
  return Math.min(95, 60 + summary.overallProgress * 0.35);
}

function generateNotifications(summary: any): Array<{type: string, message: string, priority: 'low' | 'medium' | 'high'}> {
  const notifications = [];

  if (!summary.character) {
    notifications.push({
      type: 'character_creation',
      message: 'Create your founder character to start your journey!',
      priority: 'high' as const
    });
  }

  if (summary.character && summary.character.level >= 10 && summary.staking.totalStaked === 0) {
    notifications.push({
      type: 'staking_opportunity',
      message: 'Your character is ready for staking! Earn passive rewards.',
      priority: 'medium' as const
    });
  }

  const totalResources = Object.values(summary.resources).reduce((sum: number, amount: any) => sum + amount, 0);
  if (totalResources > 1000) {
    notifications.push({
      type: 'crafting_opportunity',
      message: 'You have abundant resources! Consider crafting startup artifacts.',
      priority: 'low' as const
    });
  }

  return notifications;
}

export default router;