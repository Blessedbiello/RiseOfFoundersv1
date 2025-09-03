import { Router, Response } from 'express';
import { body, param, validationResult } from 'express-validator';
import { AuthenticatedRequest, validateAuth } from '../middleware/auth';
import { ApiError, asyncHandler } from '../middleware/errorHandler';
import { honeycombEnhancedMissionService } from '../services/honeycomb/enhancedMissions';
import { prisma } from '../config/database';

const router: any = Router();

// All enhanced mission routes require authentication
router.use(validateAuth as any);

// Validation rules
const missionStartValidation = [
  body('missionId')
    .isString()
    .withMessage('Mission ID is required'),
];

const missionCompleteValidation = [
  body('artifacts')
    .isArray()
    .withMessage('Artifacts must be an array'),
  body('artifacts.*.type')
    .isString()
    .withMessage('Each artifact must have a type'),
];

// GET /api/missions/enhanced/available - Get all available enhanced missions
router.get('/available', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;

  try {
    const missions = await honeycombEnhancedMissionService.getAvailableMissions(userId);
    
    // Get user's active missions for context
    const activeMissions = await honeycombEnhancedMissionService.getUserActiveTimedMissions(userId);
    
    res.json({
      success: true,
      data: {
        ...missions,
        activeMissions,
        summary: {
          totalAvailable: missions.daily.length + missions.weekly.length + missions.timed.length + missions.team.length,
          dailyAvailable: missions.daily.length,
          weeklyAvailable: missions.weekly.length,
          timedAvailable: missions.timed.length,
          teamAvailable: missions.team.length,
          activeCount: activeMissions.length
        }
      }
    });
  } catch (error: any) {
    throw new ApiError(error.message || 'Failed to get available missions', 500);
  }
}));

// GET /api/missions/enhanced/active - Get user's active timed missions
router.get('/active', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;

  try {
    const activeMissions = await honeycombEnhancedMissionService.getUserActiveTimedMissions(userId);
    
    // Separate by type and add urgency indicators
    const categorized = {
      urgent: activeMissions.filter(m => m.timeRemaining < 3600 && m.timeRemaining > 0), // < 1 hour
      active: activeMissions.filter(m => m.timeRemaining >= 3600),
      expired: activeMissions.filter(m => m.isExpired)
    };

    res.json({
      success: true,
      data: {
        activeMissions,
        categorized,
        counts: {
          total: activeMissions.length,
          urgent: categorized.urgent.length,
          active: categorized.active.length,
          expired: categorized.expired.length
        }
      }
    });
  } catch (error: any) {
    throw new ApiError(error.message || 'Failed to get active missions', 500);
  }
}));

// POST /api/missions/enhanced/start - Start a timed mission
router.post('/start', missionStartValidation, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError('Validation failed', 400, errors.array());
  }

  const userId = req.user!.id;
  const { missionId } = req.body;

  try {
    const result = await honeycombEnhancedMissionService.startTimedMission(userId, missionId);

    if (!result.success) {
      throw new ApiError(result.error || 'Failed to start mission', 400);
    }

    // Get mission details for response
    const mission = await prisma.mission.findUnique({
      where: { slug: missionId },
      select: {
        id: true,
        slug: true,
        title: true,
        description: true,
        type: true,
        rewards: true,
        metadata: true
      }
    });

    res.json({
      success: true,
      data: {
        missionStart: result.missionStart,
        mission,
        message: `Started ${mission?.type?.toLowerCase()} mission: ${mission?.title}`
      }
    });

  } catch (error: any) {
    throw new ApiError(error.message || 'Failed to start mission', 500);
  }
}));

// POST /api/missions/enhanced/:submissionId/complete - Complete a timed mission
router.post('/:submissionId/complete', [
  param('submissionId').isString().withMessage('Submission ID is required'),
  ...missionCompleteValidation
], asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError('Validation failed', 400, errors.array());
  }

  const { submissionId } = req.params;
  const { artifacts } = req.body;
  const userId = req.user!.id;

  try {
    // Verify submission belongs to user
    const submission = await prisma.submission.findFirst({
      where: { id: submissionId, userId },
      include: { mission: true }
    });

    if (!submission) {
      throw new ApiError('Mission submission not found', 404);
    }

    const result = await honeycombEnhancedMissionService.completeTimedMission(submissionId, artifacts);

    if (!result.success) {
      throw new ApiError(result.error || 'Failed to complete mission', 400);
    }

    // Calculate total reward values for display
    const rewardSummary = result.rewards?.reduce((acc, reward) => {
      if (reward.type === 'XP') {
        acc.totalXP += reward.amount || 0;
      } else if (reward.type === 'RESOURCE' && reward.resourceType) {
        acc.resources[reward.resourceType] = (acc.resources[reward.resourceType] || 0) + (reward.amount || 0);
      }
      return acc;
    }, { totalXP: 0, resources: {} as Record<string, number> });

    res.json({
      success: true,
      data: {
        missionCompleted: {
          id: submission.id,
          title: submission.mission.title,
          type: submission.mission.type,
          completedAt: new Date()
        },
        rewards: result.rewards,
        rewardSummary,
        message: `🎉 Congratulations! You completed "${submission.mission.title}" and earned amazing rewards!`
      }
    });

  } catch (error: any) {
    throw new ApiError(error.message || 'Failed to complete mission', 500);
  }
}));

// GET /api/missions/enhanced/types - Get mission types with descriptions
router.get('/types', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const missionTypes = [
    {
      type: 'DAILY',
      name: 'Daily Missions',
      description: 'Short, repeatable tasks that reset every 24 hours',
      icon: '📅',
      color: 'text-blue-400',
      duration: '24 hours cooldown',
      difficulty: 'Easy to Medium'
    },
    {
      type: 'WEEKLY',
      name: 'Weekly Challenges', 
      description: 'Comprehensive challenges that test your founder skills over a week',
      icon: '🗓️',
      color: 'text-green-400',
      duration: '7 days to complete',
      difficulty: 'Medium to Hard'
    },
    {
      type: 'TIMED',
      name: 'Timed Missions',
      description: 'Special limited-time opportunities with unique rewards',
      icon: '⏰',
      color: 'text-orange-400',
      duration: 'Varies (2-5 days)',
      difficulty: 'Hard'
    },
    {
      type: 'CHAIN',
      name: 'Mission Chains',
      description: 'Progressive storylines that unlock as you advance',
      icon: '🔗',
      color: 'text-purple-400',
      duration: 'Multiple missions',
      difficulty: 'Varied'
    },
    {
      type: 'TEAM',
      name: 'Team Missions',
      description: 'Collaborative challenges requiring teamwork and coordination',
      icon: '👥',
      color: 'text-pink-400',
      duration: '3-14 days',
      difficulty: 'Medium to Hard'
    }
  ];

  res.json({
    success: true,
    data: { missionTypes }
  });
}));

// GET /api/missions/enhanced/history - Get user's mission completion history
router.get('/history', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const { page = 1, limit = 20, type, status } = req.query;

  try {
    const skip = (Number(page) - 1) * Number(limit);
    
    const where: any = {
      userId,
      mission: {
        category: 'ENHANCED'
      }
    };

    if (type) {
      where.mission.type = type;
    }

    if (status) {
      where.status = status;
    }

    const submissions = await prisma.submission.findMany({
      where,
      include: {
        mission: {
          select: {
            id: true,
            slug: true,
            title: true,
            description: true,
            type: true,
            rewards: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: Number(limit),
      skip
    });

    const total = await prisma.submission.count({ where });

    // Calculate statistics
    const stats = {
      totalSubmissions: total,
      completed: submissions.filter(s => s.status === 'APPROVED').length,
      inProgress: submissions.filter(s => s.status === 'IN_PROGRESS').length,
      expired: submissions.filter(s => s.status === 'EXPIRED').length,
      failed: submissions.filter(s => s.status === 'REJECTED').length
    };

    // Group by mission type
    const byType = submissions.reduce((acc, submission) => {
      const type = submission.mission.type || 'OTHER';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    res.json({
      success: true,
      data: {
        submissions: submissions.map(s => ({
          id: s.id,
          mission: s.mission,
          status: s.status,
          startedAt: s.createdAt,
          completedAt: s.completedAt,
          updatedAt: s.updatedAt,
          artifacts: s.artifacts,
          metadata: s.metadata
        })),
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        },
        statistics: stats,
        byType
      }
    });

  } catch (error: any) {
    throw new ApiError(error.message || 'Failed to get mission history', 500);
  }
}));

// GET /api/missions/enhanced/chains - Get available mission chains
router.get('/chains', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;

  try {
    // Get user's completed missions to show chain progress
    const completedMissions = await prisma.submission.findMany({
      where: {
        userId,
        status: 'APPROVED',
        mission: {
          category: 'ENHANCED'
        }
      },
      include: {
        mission: { select: { slug: true } }
      }
    });

    const completedSlugs = completedMissions.map(s => s.mission.slug);

    // Mock chain data (in production this would come from database)
    const chains = [
      {
        id: 'founder_journey_chain',
        name: 'The Complete Founder Journey',
        description: 'Experience the full startup lifecycle from idea to exit',
        totalMissions: 8,
        completedMissions: completedSlugs.filter(slug => 
          ['chain_idea_validation', 'chain_mvp_development', 'chain_first_customers', 
           'chain_team_building', 'chain_funding_round', 'chain_scale_operations',
           'chain_market_expansion', 'chain_exit_strategy'].includes(slug)
        ).length,
        rewards: [
          { type: 'BADGE', name: 'Complete Founder' },
          { type: 'CHARACTER_EVOLUTION', name: 'Founder Mastery' },
          { type: 'RESOURCE', amount: 1000, resourceType: 'FUNDING_TOKENS' }
        ],
        nextMission: 'chain_idea_validation',
        isComplete: false
      },
      {
        id: 'tech_mastery_chain',
        name: 'Technical Excellence Path',
        description: 'Master the technical aspects of building scalable products',
        totalMissions: 6,
        completedMissions: completedSlugs.filter(slug => 
          ['chain_first_commit', 'chain_architecture_design', 'chain_performance_optimization',
           'chain_security_implementation', 'chain_deployment_automation', 'chain_monitoring_setup'].includes(slug)
        ).length,
        rewards: [
          { type: 'BADGE', name: 'Tech Architect' },
          { type: 'EQUIPMENT', name: 'Legendary Tech Stack' },
          { type: 'RESOURCE', amount: 800, resourceType: 'CODE_POINTS' }
        ],
        nextMission: 'chain_first_commit',
        isComplete: false
      }
    ];

    // Calculate progress and completion status
    const chainsWithProgress = chains.map(chain => ({
      ...chain,
      progressPercent: Math.floor((chain.completedMissions / chain.totalMissions) * 100),
      isComplete: chain.completedMissions >= chain.totalMissions
    }));

    res.json({
      success: true,
      data: {
        chains: chainsWithProgress,
        summary: {
          totalChains: chains.length,
          completedChains: chainsWithProgress.filter(c => c.isComplete).length,
          inProgressChains: chainsWithProgress.filter(c => c.completedMissions > 0 && !c.isComplete).length,
          averageProgress: Math.floor(chainsWithProgress.reduce((acc, c) => acc + c.progressPercent, 0) / chains.length)
        }
      }
    });

  } catch (error: any) {
    throw new ApiError(error.message || 'Failed to get mission chains', 500);
  }
}));

// GET /api/missions/enhanced/daily-refresh - Get time until daily missions refresh
router.get('/daily-refresh', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0); // Start of next day

  const timeUntilRefresh = tomorrow.getTime() - now.getTime();
  const hoursUntilRefresh = Math.floor(timeUntilRefresh / (1000 * 60 * 60));
  const minutesUntilRefresh = Math.floor((timeUntilRefresh % (1000 * 60 * 60)) / (1000 * 60));

  res.json({
    success: true,
    data: {
      timeUntilRefresh: Math.floor(timeUntilRefresh / 1000), // in seconds
      hoursUntilRefresh,
      minutesUntilRefresh,
      refreshTime: tomorrow.toISOString(),
      message: `Daily missions refresh in ${hoursUntilRefresh}h ${minutesUntilRefresh}m`
    }
  });
}));

// POST /api/missions/enhanced/admin/initialize - Initialize enhanced missions (admin only)
router.post('/admin/initialize', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  
  if (user.role !== 'ADMIN') {
    throw new ApiError('Admin access required', 403);
  }

  try {
    await honeycombEnhancedMissionService.initializeEnhancedMissions();
    
    res.json({
      success: true,
      data: {
        message: 'Enhanced mission system initialized successfully!',
        features: [
          'Daily missions with 24h cooldowns',
          'Weekly challenges with extended duration',
          'Timed missions with limited availability', 
          'Mission chains with progressive rewards',
          'Team missions for collaborative gameplay'
        ]
      }
    });
  } catch (error: any) {
    throw new ApiError(error.message || 'Failed to initialize enhanced missions', 500);
  }
}));

export default router;