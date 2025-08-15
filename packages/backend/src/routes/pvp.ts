import { Router, Response } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { AuthenticatedRequest } from '../middleware/auth';
import { ApiError, asyncHandler } from '../middleware/errorHandler';

const router: any = Router();

// GET /pvp/territories - Get all territories with current status
router.get('/territories', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Mock territory data - would come from database
    const territories = [
      {
        id: 'startup_hub_1',
        name: 'Silicon Valley Hub',
        position: [0, 0, 0],
        controlledBy: 'team_alpha',
        controllerName: 'Alpha Ventures',
        defenseStrength: 85,
        resources: { xp: 1500, credits: 5000, influence: 250 },
        type: 'startup_hub',
        status: 'controlled',
        reputation: 95,
        lastBattle: '2025-01-12T14:30:00Z'
      },
      {
        id: 'funding_center_1',
        name: 'Venture Capital Plaza',
        position: [8, 0, -5],
        controlledBy: 'team_beta',
        controllerName: 'Beta Innovations',
        defenseStrength: 72,
        resources: { xp: 2000, credits: 8000, influence: 400 },
        type: 'funding_center',
        status: 'controlled',
        reputation: 88,
        lastBattle: '2025-01-10T09:15:00Z'
      },
      {
        id: 'tech_district_1',
        name: 'AI Research District',
        position: [-6, 0, 8],
        defenseStrength: 45,
        resources: { xp: 1200, credits: 3500, influence: 180 },
        type: 'tech_district',
        status: 'neutral',
        reputation: 65
      },
      {
        id: 'market_square_1',
        name: 'Global Markets',
        position: [12, 0, 6],
        controlledBy: 'team_gamma',
        controllerName: 'Gamma Corp',
        defenseStrength: 60,
        resources: { xp: 1800, credits: 6000, influence: 300 },
        type: 'market_square',
        status: 'contested',
        challengeActive: true,
        reputation: 78,
        lastBattle: '2025-01-14T16:45:00Z'
      },
      {
        id: 'innovation_lab_1',
        name: 'Quantum Innovation Lab',
        position: [-10, 0, -8],
        defenseStrength: 90,
        resources: { xp: 2500, credits: 4000, influence: 500 },
        type: 'innovation_lab',
        status: 'neutral',
        reputation: 92
      }
    ];

    res.json({
      success: true,
      data: { territories }
    });
  } catch (error) {
    throw new ApiError('Failed to fetch territories', 500);
  }
}));

// GET /pvp/leaderboard - Get team reputation leaderboard
router.get('/leaderboard', [
  query('tier').isString().optional(),
  query('timeRange').isIn(['weekly', 'monthly', 'season']).optional(),
  query('limit').isInt({ min: 1, max: 100 }).optional(),
], asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError('Validation failed', 400, errors.array());
  }

  const { tier, timeRange = 'weekly', limit = 50 } = req.query;

  try {
    // Mock leaderboard data
    let leaderboard = [
      {
        rank: 1,
        teamId: 'team_alpha',
        teamName: 'Alpha Ventures',
        reputation: 2850,
        tier: 'veteran',
        change: 125,
        territories: 4,
        battlesWon: 18,
        battlesTotal: 21,
        specialAchievements: ['season_champion', 'territory_master'],
        color: '#3b82f6'
      },
      {
        rank: 2,
        teamId: 'team_nexus',
        teamName: 'Nexus Innovations',
        reputation: 2640,
        tier: 'veteran',
        change: 87,
        territories: 3,
        battlesWon: 15,
        battlesTotal: 19,
        specialAchievements: ['innovation_leader'],
        color: '#10b981'
      },
      {
        rank: 3,
        teamId: 'team_phoenix',
        teamName: 'Phoenix Rising',
        reputation: 2380,
        tier: 'veteran',
        change: -42,
        territories: 3,
        battlesWon: 12,
        battlesTotal: 16,
        specialAchievements: ['win_streak_5', 'mentor_veteran'],
        color: '#f59e0b'
      },
      {
        rank: 4,
        teamId: 'team_quantum',
        teamName: 'Quantum Labs',
        reputation: 1950,
        tier: 'established',
        change: 156,
        territories: 2,
        battlesWon: 11,
        battlesTotal: 14,
        specialAchievements: ['first_territory'],
        color: '#8b5cf6'
      },
      {
        rank: 5,
        teamId: 'team_stellar',
        teamName: 'Stellar Dynamics',
        reputation: 1720,
        tier: 'established',
        change: 93,
        territories: 2,
        battlesWon: 9,
        battlesTotal: 13,
        specialAchievements: ['mentor_veteran'],
        color: '#ef4444'
      }
    ];

    // Filter by tier if specified
    if (tier && tier !== 'all') {
      leaderboard = leaderboard.filter(team => team.tier === tier);
    }

    // Apply limit
    leaderboard = leaderboard.slice(0, Number(limit));

    res.json({
      success: true,
      data: {
        leaderboard,
        timeRange,
        totalTeams: 47
      }
    });
  } catch (error) {
    throw new ApiError('Failed to fetch leaderboard', 500);
  }
}));

// POST /pvp/challenges - Create a new challenge
router.post('/challenges', [
  body('territoryId').isString(),
  body('type').isIn(['capture', 'defend', 'duel']),
  body('title').isString().isLength({ min: 5, max: 100 }),
  body('description').isString().isLength({ min: 20, max: 1000 }),
  body('requirements').isArray().optional(),
  body('customStakes').isObject().optional(),
], asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError('Validation failed', 400, errors.array());
  }

  const {
    territoryId,
    type,
    title,
    description,
    requirements = [],
    customStakes
  } = req.body;

  const userId = req.user!.id;

  try {
    // Verify user has a team and permission to create challenges
    const userTeam = await getUserTeam(userId);
    if (!userTeam) {
      throw new ApiError('Must be part of a team to create challenges', 400);
    }

    // Verify territory exists and challenge is valid
    const territory = await getTerritoryById(territoryId);
    if (!territory) {
      throw new ApiError('Territory not found', 404);
    }

    // Validate challenge type against territory status
    if (type === 'defend' && territory.controlledBy !== userTeam.id) {
      throw new ApiError('Can only create defend challenges for territories you control', 400);
    }

    if (type === 'duel' && territory.status === 'neutral') {
      throw new ApiError('Cannot create duel challenges for neutral territories', 400);
    }

    // Create challenge
    const challenge = {
      id: `challenge_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`,
      territoryId,
      territoryName: territory.name,
      challengerTeam: {
        id: userTeam.id,
        name: userTeam.name,
        color: userTeam.color,
        strength: userTeam.strength
      },
      defenderTeam: territory.controlledBy ? {
        id: territory.controlledBy,
        name: territory.controllerName,
        color: territory.controllerColor,
        strength: territory.defenseStrength
      } : undefined,
      type,
      status: 'pending',
      title,
      description,
      requirements: [
        ...getDefaultRequirements(type),
        ...requirements
      ],
      stakes: customStakes || getDefaultStakes(type, territory),
      submissionDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      judgingDeadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days
      createdAt: new Date().toISOString(),
      judging: {
        judges: await assignJudges(type, territory.type),
        submissions: [],
        voting: {}
      }
    };

    // Store challenge (mock implementation)
    console.log('Created challenge:', challenge);

    // Notify defender team if applicable
    if (territory.controlledBy && territory.controlledBy !== userTeam.id) {
      await notifyTeamOfChallenge(territory.controlledBy, challenge);
    }

    res.status(201).json({
      success: true,
      data: { challenge }
    });
  } catch (error: any) {
    if (error instanceof ApiError) throw error;
    throw new ApiError('Failed to create challenge', 500);
  }
}));

// GET /pvp/challenges - Get challenges (active, pending, completed)
router.get('/challenges', [
  query('status').isIn(['pending', 'active', 'submission', 'judging', 'completed']).optional(),
  query('territoryId').isString().optional(),
  query('teamId').isString().optional(),
], asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { status, territoryId, teamId } = req.query;

  try {
    // Mock challenges data
    let challenges = [
      {
        id: 'challenge_1',
        territoryId: 'market_square_1',
        territoryName: 'Global Markets',
        challengerTeam: {
          id: 'team_alpha',
          name: 'Alpha Ventures',
          color: '#3b82f6',
          strength: 85
        },
        defenderTeam: {
          id: 'team_gamma',
          name: 'Gamma Corp',
          color: '#f59e0b',
          strength: 60
        },
        type: 'duel',
        status: 'judging',
        title: 'AI-Powered Startup Analytics Platform',
        description: 'Build a comprehensive analytics platform for startup metrics, funding tracking, and growth predictions using AI/ML.',
        requirements: [
          'Implement real-time data visualization',
          'Create ML models for growth prediction',
          'Build user authentication and team management',
          'Deploy on cloud infrastructure'
        ],
        stakes: {
          winner: { xp: 2500, credits: 10000, reputation: 500 },
          loser: { xp: 500, credits: 2000, reputation: -100 }
        },
        submissionDeadline: '2025-01-20T23:59:59Z',
        judgingDeadline: '2025-01-25T23:59:59Z',
        createdAt: '2025-01-15T10:00:00Z',
        judging: {
          judges: [
            { id: 'judge_1', name: 'Sarah Chen', expertise: 'AI/ML Expert', reputation: 950 },
            { id: 'judge_2', name: 'Marcus Rodriguez', expertise: 'Startup Founder', reputation: 880 },
            { id: 'judge_3', name: 'Dr. Kim Park', expertise: 'Technical Architect', reputation: 920 }
          ],
          submissions: [
            {
              teamId: 'team_alpha',
              teamName: 'Alpha Ventures',
              artifacts: [
                {
                  type: 'github',
                  title: 'StartupAnalytics Platform',
                  url: 'https://github.com/alpha-ventures/startup-analytics',
                  description: 'Full-stack analytics platform with React frontend and Python backend'
                }
              ],
              submittedAt: '2025-01-19T15:30:00Z'
            }
          ],
          voting: {
            judge_1: { teamId: 'team_alpha', score: 8.5, feedback: 'Excellent UI/UX and solid ML implementation' }
          }
        }
      }
    ];

    // Apply filters
    if (status) {
      challenges = challenges.filter(c => c.status === status);
    }

    if (territoryId) {
      challenges = challenges.filter(c => c.territoryId === territoryId);
    }

    if (teamId) {
      challenges = challenges.filter(c => 
        c.challengerTeam.id === teamId || 
        (c.defenderTeam && c.defenderTeam.id === teamId)
      );
    }

    res.json({
      success: true,
      data: { challenges }
    });
  } catch (error) {
    throw new ApiError('Failed to fetch challenges', 500);
  }
}));

// POST /pvp/challenges/:challengeId/submit - Submit solution for a challenge
router.post('/challenges/:challengeId/submit', [
  param('challengeId').isString(),
  body('artifacts').isArray(),
  body('description').isString().optional(),
], asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError('Validation failed', 400, errors.array());
  }

  const { challengeId } = req.params;
  const { artifacts, description } = req.body;
  const userId = req.user!.id;

  try {
    // Verify user's team is participating in this challenge
    const challenge = await getChallengeById(challengeId);
    if (!challenge) {
      throw new ApiError('Challenge not found', 404);
    }

    const userTeam = await getUserTeam(userId);
    if (!userTeam) {
      throw new ApiError('Must be part of a team to submit', 400);
    }

    const isParticipating = challenge.challengerTeam.id === userTeam.id || 
                           (challenge.defenderTeam && challenge.defenderTeam.id === userTeam.id);

    if (!isParticipating) {
      throw new ApiError('Team is not participating in this challenge', 403);
    }

    // Check if submission deadline has passed
    if (new Date() > new Date(challenge.submissionDeadline)) {
      throw new ApiError('Submission deadline has passed', 400);
    }

    // Validate artifacts
    for (const artifact of artifacts) {
      if (!artifact.type || !artifact.title) {
        throw new ApiError('Each artifact must have type and title', 400);
      }
    }

    // Create submission
    const submission = {
      teamId: userTeam.id,
      teamName: userTeam.name,
      artifacts,
      description: description || '',
      submittedAt: new Date().toISOString(),
      submittedBy: userId
    };

    // Store submission (mock implementation)
    console.log('Challenge submission:', submission);

    // Update challenge status if all teams have submitted
    const allSubmitted = await checkAllTeamsSubmitted(challengeId);
    if (allSubmitted) {
      await updateChallengeStatus(challengeId, 'judging');
    }

    res.json({
      success: true,
      data: { submission }
    });
  } catch (error: any) {
    if (error instanceof ApiError) throw error;
    throw new ApiError('Failed to submit solution', 500);
  }
}));

// GET /pvp/reputation/:teamId - Get detailed reputation info for a team
router.get('/reputation/:teamId', [
  param('teamId').isString(),
], asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { teamId } = req.params;

  try {
    // Mock reputation data
    const reputationData = {
      teamId,
      currentReputation: 1250,
      tier: 'established',
      rank: 12,
      totalTeams: 47,
      reputationHistory: [
        { date: '2025-01-15', reputation: 1250, change: 50, reason: 'Challenge victory' },
        { date: '2025-01-14', reputation: 1200, change: -25, reason: 'Challenge defeat' },
        { date: '2025-01-13', reputation: 1225, change: 75, reason: 'Territory capture' },
        { date: '2025-01-12', reputation: 1150, change: 30, reason: 'Mission completion' }
      ],
      achievements: [
        {
          id: 'first_territory',
          title: 'Territory Pioneer',
          unlockedAt: '2025-01-10T15:30:00Z',
          reputationReward: 50
        },
        {
          id: 'mentor_veteran',
          title: 'Mentor Veteran',
          unlockedAt: '2025-01-05T09:20:00Z',
          reputationReward: 300
        }
      ],
      battleStats: {
        totalBattles: 8,
        battlesWon: 6,
        battlesLost: 2,
        winRate: 75,
        territoriesControlled: 1,
        averageScore: 8.2
      }
    };

    res.json({
      success: true,
      data: reputationData
    });
  } catch (error) {
    throw new ApiError('Failed to fetch reputation data', 500);
  }
}));

// POST /pvp/territories/:territoryId/fortify - Fortify a controlled territory
router.post('/territories/:territoryId/fortify', [
  param('territoryId').isString(),
  body('investmentType').isIn(['credits', 'resources', 'time']),
  body('amount').isInt({ min: 1 }),
], asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError('Validation failed', 400, errors.array());
  }

  const { territoryId } = req.params;
  const { investmentType, amount } = req.body;
  const userId = req.user!.id;

  try {
    // Verify user's team controls this territory
    const territory = await getTerritoryById(territoryId);
    if (!territory) {
      throw new ApiError('Territory not found', 404);
    }

    const userTeam = await getUserTeam(userId);
    if (!userTeam) {
      throw new ApiError('Must be part of a team', 400);
    }

    if (territory.controlledBy !== userTeam.id) {
      throw new ApiError('Can only fortify territories your team controls', 403);
    }

    // Calculate fortification bonus
    const fortificationBonus = calculateFortificationBonus(investmentType, amount);

    // Apply fortification (mock implementation)
    const newDefenseStrength = territory.defenseStrength + fortificationBonus;

    console.log(`Territory ${territoryId} fortified: ${territory.defenseStrength} -> ${newDefenseStrength}`);

    res.json({
      success: true,
      data: {
        territory: {
          ...territory,
          defenseStrength: newDefenseStrength,
          lastFortified: new Date().toISOString()
        },
        fortificationBonus,
        cost: {
          type: investmentType,
          amount
        }
      }
    });
  } catch (error: any) {
    if (error instanceof ApiError) throw error;
    throw new ApiError('Failed to fortify territory', 500);
  }
}));

// Mock helper functions (would be replaced with actual database/service calls)
async function getUserTeam(userId: string) {
  // Mock team data
  return {
    id: 'team_user',
    name: 'User Team',
    color: '#3b82f6',
    strength: 75
  };
}

async function getTerritoryById(territoryId: string) {
  // Mock territory lookup
  const territories = [
    {
      id: 'startup_hub_1',
      name: 'Silicon Valley Hub',
      controlledBy: 'team_alpha',
      controllerName: 'Alpha Ventures',
      controllerColor: '#3b82f6',
      defenseStrength: 85,
      status: 'controlled',
      type: 'startup_hub'
    }
  ];
  
  return territories.find(t => t.id === territoryId) || null;
}

async function getChallengeById(challengeId: string) {
  // Mock challenge lookup
  return {
    id: challengeId,
    challengerTeam: { id: 'team_alpha', name: 'Alpha Ventures' },
    defenderTeam: { id: 'team_beta', name: 'Beta Innovations' },
    submissionDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  };
}

function getDefaultRequirements(challengeType: string): string[] {
  const requirements = {
    capture: [
      'Create a functional MVP demonstrating your solution',
      'Submit comprehensive documentation',
      'Present a go-to-market strategy',
      'Show technical implementation details'
    ],
    defend: [
      'Enhance existing solution with new features',
      'Demonstrate measurable improvements',
      'Show scalability and robustness',
      'Provide user feedback and metrics'
    ],
    duel: [
      'Build competing solutions to the same problem',
      'Demonstrate superior execution and strategy',
      'Present compelling business case',
      'Show innovation and creativity'
    ]
  };
  
  return (requirements as any)[challengeType] || [];
}

function getDefaultStakes(challengeType: string, territory: any) {
  const baseStakes = {
    capture: {
      winner: { xp: 2000, credits: 8000, reputation: 400 },
      loser: { xp: 400, credits: 1500, reputation: -50 }
    },
    defend: {
      winner: { xp: 1500, credits: 6000, reputation: 300 },
      loser: { xp: 300, credits: 1000, reputation: -25 }
    },
    duel: {
      winner: { xp: 2500, credits: 10000, reputation: 500 },
      loser: { xp: 500, credits: 2000, reputation: -100 }
    }
  };

  return (baseStakes as any)[challengeType] || baseStakes.capture;
}

async function assignJudges(challengeType: string, territoryType: string) {
  // Mock judge assignment based on expertise matching
  const judges = [
    { id: 'judge_1', name: 'Sarah Chen', expertise: 'AI/ML Expert', reputation: 950 },
    { id: 'judge_2', name: 'Marcus Rodriguez', expertise: 'Startup Founder', reputation: 880 },
    { id: 'judge_3', name: 'Dr. Kim Park', expertise: 'Technical Architect', reputation: 920 },
    { id: 'judge_4', name: 'Lisa Wang', expertise: 'Product Strategy', reputation: 890 },
    { id: 'judge_5', name: 'Alex Thompson', expertise: 'Venture Capital', reputation: 910 }
  ];

  // Return 3 random judges for now
  return judges.slice(0, 3);
}

async function notifyTeamOfChallenge(teamId: string, challenge: any) {
  // Mock notification system
  console.log(`Notifying team ${teamId} of new challenge:`, challenge.title);
}

async function checkAllTeamsSubmitted(challengeId: string): Promise<boolean> {
  // Mock check - in real implementation, check if all participating teams have submitted
  return false;
}

async function updateChallengeStatus(challengeId: string, status: string) {
  // Mock status update
  console.log(`Challenge ${challengeId} status updated to: ${status}`);
}

function calculateFortificationBonus(investmentType: string, amount: number): number {
  const bonusRates = {
    credits: 0.01, // 1 defense per 100 credits
    resources: 0.05, // 1 defense per 20 resources
    time: 2 // 2 defense per hour invested
  };

  return Math.floor(amount * ((bonusRates as any)[investmentType] || 0));
}

export default router;