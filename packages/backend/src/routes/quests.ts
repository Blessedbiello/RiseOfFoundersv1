import { Router, Response } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { AuthenticatedRequest } from '../middleware/auth';
import { ApiError, asyncHandler } from '../middleware/errorHandler';

const router: any = Router();

// GET /quests - Get all available quests with filtering
router.get('/', [
  query('category').isIn(['fintech', 'healthcare', 'edtech', 'climate', 'ai', 'web3', 'other']).optional(),
  query('difficulty').isIn(['beginner', 'intermediate', 'advanced', 'expert']).optional(),
  query('status').isIn(['active', 'starting_soon', 'ending_soon', 'full']).optional(),
  query('featured').isBoolean().optional(),
  query('search').isString().optional(),
  query('sort').isIn(['newest', 'budget', 'deadline', 'popularity']).optional(),
  query('limit').isInt({ min: 1, max: 100 }).optional(),
  query('offset').isInt({ min: 0 }).optional(),
], asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError('Validation failed', 400, errors.array());
  }

  const {
    category,
    difficulty,
    status,
    featured,
    search,
    sort = 'newest',
    limit = 20,
    offset = 0
  } = req.query;

  try {
    // Mock quest data
    let quests = [
      {
        id: 'quest_1',
        title: 'AI-Powered Personal Finance Assistant',
        description: 'Build an intelligent personal finance application that helps users optimize their spending, savings, and investments using AI/ML algorithms. The solution should provide personalized insights and actionable recommendations.',
        category: 'fintech',
        difficulty: 'advanced',
        duration: 30,
        budget: {
          total: 50000,
          currency: 'USD',
          distribution: {
            winner: 30000,
            runner_up: 15000,
            participation: 5000
          }
        },
        sponsor: {
          id: 'sponsor_1',
          name: 'TechVentures Inc.',
          logo: '/api/placeholder/32/32',
          tier: 'enterprise',
          rating: 4.8,
          verified: true
        },
        status: 'active',
        timeline: {
          starts: '2025-01-15T00:00:00Z',
          submissions_due: '2025-02-14T23:59:59Z',
          judging_complete: '2025-02-21T23:59:59Z'
        },
        metrics: {
          views: 1240,
          applications: 28,
          slots_filled: 25,
          max_participants: 50
        },
        requirements: [
          'AI/ML integration for financial insights',
          'Real-time data processing',
          'Mobile-responsive web application',
          'User authentication and security'
        ],
        tags: ['AI', 'FinTech', 'Machine Learning', 'Personal Finance'],
        featured: true,
        escrow: {
          status: 'funded',
          address: 'Es7rQ9mKnR2pL8vT4aF6yC3uX1nM9sH5bG2dJ7kW'
        }
      },
      {
        id: 'quest_2',
        title: 'Decentralized Healthcare Records',
        description: 'Create a blockchain-based system for secure, patient-controlled medical records that enables seamless sharing between healthcare providers while maintaining privacy.',
        category: 'healthcare',
        difficulty: 'expert',
        duration: 45,
        budget: {
          total: 75000,
          currency: 'USD',
          distribution: {
            winner: 45000,
            runner_up: 20000,
            participation: 10000
          }
        },
        sponsor: {
          id: 'sponsor_2',
          name: 'HealthChain Solutions',
          logo: '/api/placeholder/32/32',
          tier: 'growth',
          rating: 4.6,
          verified: true
        },
        status: 'starting_soon',
        timeline: {
          starts: '2025-01-20T00:00:00Z',
          submissions_due: '2025-03-05T23:59:59Z',
          judging_complete: '2025-03-12T23:59:59Z'
        },
        metrics: {
          views: 856,
          applications: 12,
          slots_filled: 15,
          max_participants: 30
        },
        requirements: [
          'Blockchain/Web3 expertise',
          'Healthcare compliance knowledge',
          'Privacy-preserving technologies',
          'Interoperability standards'
        ],
        tags: ['Blockchain', 'Healthcare', 'Privacy', 'Web3'],
        featured: true,
        escrow: {
          status: 'pending',
          address: null
        }
      },
      {
        id: 'quest_3',
        title: 'Gamified Learning Platform for Kids',
        description: 'Design an interactive educational platform that uses game mechanics to teach STEM subjects to children aged 8-14, with adaptive learning algorithms.',
        category: 'edtech',
        difficulty: 'intermediate',
        duration: 25,
        budget: {
          total: 35000,
          currency: 'USD',
          distribution: {
            winner: 20000,
            runner_up: 10000,
            participation: 5000
          }
        },
        sponsor: {
          id: 'sponsor_3',
          name: 'EduInnovate',
          logo: '/api/placeholder/32/32',
          tier: 'startup',
          rating: 4.4,
          verified: false
        },
        status: 'ending_soon',
        timeline: {
          starts: '2024-12-20T00:00:00Z',
          submissions_due: '2025-01-20T23:59:59Z',
          judging_complete: '2025-01-27T23:59:59Z'
        },
        metrics: {
          views: 645,
          applications: 35,
          slots_filled: 40,
          max_participants: 40
        },
        requirements: [
          'Game design principles',
          'Educational content development',
          'Child-friendly UX/UI',
          'Progress tracking systems'
        ],
        tags: ['Education', 'Gaming', 'STEM', 'Children'],
        featured: false,
        escrow: {
          status: 'funded',
          address: '5w4v3u2t1s0r9q8p7o6n5m4l3k2j1h0g9f8e7d6c'
        }
      }
    ];

    // Apply filters
    if (category && category !== 'all') {
      quests = quests.filter(q => q.category === category);
    }

    if (difficulty && difficulty !== 'all') {
      quests = quests.filter(q => q.difficulty === difficulty);
    }

    if (status && status !== 'all') {
      quests = quests.filter(q => q.status === status);
    }

    if (featured === 'true') {
      quests = quests.filter(q => q.featured);
    }

    if (search) {
      const searchLower = (search as string).toLowerCase();
      quests = quests.filter(q => 
        q.title.toLowerCase().includes(searchLower) ||
        q.description.toLowerCase().includes(searchLower) ||
        q.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    // Apply sorting
    switch (sort) {
      case 'budget':
        quests.sort((a, b) => b.budget.total - a.budget.total);
        break;
      case 'deadline':
        quests.sort((a, b) => new Date(a.timeline.submissions_due).getTime() - new Date(b.timeline.submissions_due).getTime());
        break;
      case 'popularity':
        quests.sort((a, b) => b.metrics.views - a.metrics.views);
        break;
      case 'newest':
      default:
        quests.sort((a, b) => new Date(b.timeline.starts).getTime() - new Date(a.timeline.starts).getTime());
        break;
    }

    // Apply pagination
    const paginatedQuests = quests.slice(Number(offset), Number(offset) + Number(limit));

    res.json({
      success: true,
      data: {
        quests: paginatedQuests,
        total: quests.length,
        limit: Number(limit),
        offset: Number(offset),
        filters: {
          category,
          difficulty,
          status,
          featured,
          search,
          sort
        }
      }
    });
  } catch (error) {
    throw new ApiError('Failed to fetch quests', 500);
  }
}));

// GET /quests/:id - Get detailed quest information
router.get('/:id', [
  param('id').isString(),
], asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  try {
    // Mock detailed quest data
    const questDetails = {
      id: 'quest_1',
      title: 'AI-Powered Personal Finance Assistant',
      description: 'Build an intelligent personal finance application that helps users optimize their spending, savings, and investments using AI/ML algorithms. The solution should provide personalized insights, automated savings recommendations, spending categorization, and investment portfolio optimization.',
      category: 'fintech',
      difficulty: 'advanced',
      duration: 30,
      budget: {
        total: 50000,
        currency: 'USD',
        distribution: {
          winner: 30000,
          runner_up: 15000,
          participation: 5000
        }
      },
      sponsor: {
        id: 'sponsor_1',
        name: 'TechVentures Inc.',
        description: 'Leading venture capital firm focused on early-stage fintech and AI startups.',
        logo: '/api/placeholder/64/64',
        tier: 'enterprise',
        rating: 4.8,
        verified: true,
        website: 'https://techventures.com',
        contact: {
          email: 'partnerships@techventures.com'
        }
      },
      status: 'active',
      timeline: {
        created: '2025-01-10T00:00:00Z',
        starts: '2025-01-15T00:00:00Z',
        submissions_due: '2025-02-14T23:59:59Z',
        judging_complete: '2025-02-21T23:59:59Z'
      },
      requirements: [
        'AI/ML integration for financial insights and recommendations',
        'Real-time data processing and analysis capabilities',
        'Mobile-responsive web application with modern UI/UX',
        'User authentication and secure data handling',
        'Integration with financial APIs (Plaid, Yodlee, or similar)',
        'Automated savings and investment recommendations',
        'Spending categorization and budgeting tools',
        'Data visualization and reporting features'
      ],
      deliverables: [
        'Working MVP with core AI features implemented',
        'Comprehensive technical documentation and API docs',
        'User testing results and feedback analysis',
        'Pitch presentation (10-15 slides) with demo',
        'Go-to-market strategy and business model',
        'Source code with deployment instructions',
        'Security audit report and privacy compliance'
      ],
      judging_criteria: [
        {
          criterion: 'Innovation & Creativity',
          weight: 30,
          description: 'Novel approach to personal finance with unique AI insights'
        },
        {
          criterion: 'Technical Excellence',
          weight: 25,
          description: 'Code quality, architecture, and AI implementation'
        },
        {
          criterion: 'User Experience',
          weight: 25,
          description: 'Intuitive design and engaging user interface'
        },
        {
          criterion: 'Business Viability',
          weight: 20,
          description: 'Market potential, monetization strategy, and scalability'
        }
      ],
      metrics: {
        views: 1240,
        applications: 28,
        slots_filled: 25,
        max_participants: 50,
        completion_rate: 0
      },
      participants: [
        {
          team_id: 'team_alpha',
          team_name: 'Alpha Ventures',
          status: 'accepted',
          applied_at: '2025-01-12T14:30:00Z'
        },
        {
          team_id: 'team_beta',
          team_name: 'Beta Innovations',
          status: 'pending',
          applied_at: '2025-01-13T09:15:00Z'
        }
      ],
      tags: ['AI', 'FinTech', 'Machine Learning', 'Personal Finance', 'Data Visualization'],
      featured: true,
      escrow: {
        status: 'funded',
        address: 'Es7rQ9mKnR2pL8vT4aF6yC3uX1nM9sH5bG2dJ7kW',
        funded_amount: 50000,
        conditions: [
          'Judging completed by panel of 3 experts',
          'All deliverables submitted and verified',
          'Winner announcement and community voting'
        ]
      },
      faq: [
        {
          question: 'Can teams use existing open-source libraries?',
          answer: 'Yes, teams are encouraged to use existing libraries and frameworks to build their solution efficiently.'
        },
        {
          question: 'What financial APIs are recommended?',
          answer: 'We recommend Plaid, Yodlee, or similar APIs for financial data integration. Mock data is acceptable for demo purposes.'
        }
      ]
    };

    if (id !== 'quest_1') {
      throw new ApiError('Quest not found', 404);
    }

    res.json({
      success: true,
      data: { quest: questDetails }
    });
  } catch (error: any) {
    if (error instanceof ApiError) throw error;
    throw new ApiError('Failed to fetch quest details', 500);
  }
}));

// POST /quests/:id/apply - Apply to a quest
router.post('/:id/apply', [
  param('id').isString(),
  body('team_id').isString(),
  body('motivation').isString().isLength({ min: 50, max: 500 }).optional(),
  body('relevant_experience').isString().optional(),
  body('approach').isString().optional(),
], asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError('Validation failed', 400, errors.array());
  }

  const { id: questId } = req.params;
  const { team_id, motivation, relevant_experience, approach } = req.body;
  const userId = req.user!.id;

  try {
    // Verify user is part of the specified team
    // TODO: Check team membership

    // Verify quest exists and is accepting applications
    // TODO: Check quest status and availability

    const application = {
      id: `app_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`,
      quest_id: questId,
      team_id,
      user_id: userId,
      motivation,
      relevant_experience,
      approach,
      status: 'pending',
      submitted_at: new Date().toISOString()
    };

    // TODO: Store application in database
    console.log('Quest application submitted:', application);

    res.status(201).json({
      success: true,
      data: { application }
    });
  } catch (error: any) {
    if (error instanceof ApiError) throw error;
    throw new ApiError('Failed to submit application', 500);
  }
}));

// POST /quests/:id/submit - Submit solution for a quest
router.post('/:id/submit', [
  param('id').isString(),
  body('team_id').isString(),
  body('submission_title').isString().isLength({ min: 5, max: 100 }),
  body('submission_description').isString().isLength({ min: 50, max: 2000 }),
  body('artifacts').isArray(),
  body('demo_url').isURL().optional(),
  body('repository_url').isURL().optional(),
], asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError('Validation failed', 400, errors.array());
  }

  const { id: questId } = req.params;
  const {
    team_id,
    submission_title,
    submission_description,
    artifacts,
    demo_url,
    repository_url
  } = req.body;
  const userId = req.user!.id;

  try {
    // Verify team is participating in quest
    // TODO: Check participation status

    // Verify submission deadline hasn't passed
    // TODO: Check quest timeline

    const submission = {
      id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`,
      quest_id: questId,
      team_id,
      submitted_by: userId,
      title: submission_title,
      description: submission_description,
      artifacts,
      demo_url,
      repository_url,
      status: 'submitted',
      submitted_at: new Date().toISOString(),
      judging_scores: {}
    };

    // TODO: Store submission in database
    console.log('Quest submission received:', submission);

    res.status(201).json({
      success: true,
      data: { submission }
    });
  } catch (error: any) {
    if (error instanceof ApiError) throw error;
    throw new ApiError('Failed to submit solution', 500);
  }
}));

// GET /quests/:id/leaderboard - Get quest leaderboard/results
router.get('/:id/leaderboard', [
  param('id').isString(),
], asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id: questId } = req.params;

  try {
    // Mock leaderboard data
    const leaderboard = {
      quest_id: questId,
      quest_title: 'AI-Powered Personal Finance Assistant',
      status: 'judging', // or 'completed'
      total_participants: 25,
      submissions: 18,
      judging_progress: 60, // percentage
      results: [
        {
          rank: 1,
          team_id: 'team_alpha',
          team_name: 'Alpha Ventures',
          submission_title: 'SmartFinance AI',
          total_score: 92.5,
          scores: {
            innovation: 28.5,
            technical: 23.0,
            ux: 22.5,
            business: 18.5
          },
          prize_amount: 30000,
          status: 'winner'
        },
        {
          rank: 2,
          team_id: 'team_beta',
          team_name: 'Beta Innovations',
          submission_title: 'FinanceBot Pro',
          total_score: 87.2,
          scores: {
            innovation: 25.8,
            technical: 21.5,
            ux: 21.0,
            business: 18.9
          },
          prize_amount: 15000,
          status: 'runner_up'
        },
        {
          rank: 3,
          team_id: 'team_gamma',
          team_name: 'Gamma Corp',
          submission_title: 'PersonalWealth AI',
          total_score: 82.1,
          scores: {
            innovation: 24.2,
            technical: 20.8,
            ux: 19.5,
            business: 17.6
          },
          prize_amount: 2500,
          status: 'participant'
        }
      ]
    };

    res.json({
      success: true,
      data: { leaderboard }
    });
  } catch (error) {
    throw new ApiError('Failed to fetch leaderboard', 500);
  }
}));

// GET /quests/categories - Get quest categories with counts
router.get('/categories', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    const categories = [
      { id: 'fintech', label: 'FinTech', icon: '💰', active_quests: 8, total_budget: 450000 },
      { id: 'healthcare', label: 'HealthTech', icon: '🏥', active_quests: 5, total_budget: 275000 },
      { id: 'edtech', label: 'EdTech', icon: '📚', active_quests: 6, total_budget: 180000 },
      { id: 'climate', label: 'Climate Tech', icon: '🌱', active_quests: 4, total_budget: 320000 },
      { id: 'ai', label: 'AI/ML', icon: '🤖', active_quests: 7, total_budget: 520000 },
      { id: 'web3', label: 'Web3/Crypto', icon: '⛓️', active_quests: 3, total_budget: 240000 },
      { id: 'other', label: 'Other', icon: '✨', active_quests: 2, total_budget: 85000 }
    ];

    res.json({
      success: true,
      data: { categories }
    });
  } catch (error) {
    throw new ApiError('Failed to fetch categories', 500);
  }
}));

export default router;