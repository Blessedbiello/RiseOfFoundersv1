import { Router, Response } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { AuthenticatedRequest } from '../middleware/auth';
import { ApiError, asyncHandler } from '../middleware/errorHandler';
import multer from 'multer';
import path from 'path';

const router: any = Router();

// Configure multer for session materials upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/sessions/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `session-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, DOC, and TXT files are allowed'));
    }
  }
});

// GET /mentors - Get all mentors with filtering
router.get('/', [
  query('expertise').isString().optional(),
  query('session_type').isIn(['1-on-1', 'group', 'workshop']).optional(),
  query('price_min').isFloat({ min: 0 }).optional(),
  query('price_max').isFloat({ min: 0 }).optional(),
  query('available_now').isBoolean().optional(),
  query('featured').isBoolean().optional(),
  query('sort').isIn(['rating', 'price_low', 'price_high', 'experience']).optional(),
  query('limit').isInt({ min: 1, max: 100 }).optional(),
  query('offset').isInt({ min: 0 }).optional(),
], asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const {
    expertise,
    session_type,
    price_min,
    price_max,
    available_now,
    featured,
    sort = 'rating',
    limit = 20,
    offset = 0
  } = req.query;

  try {
    // Mock mentor data
    let mentors = [
      {
        id: 'mentor_1',
        name: 'Sarah Chen',
        title: 'Former VP Product at Stripe',
        company: 'Stripe → Angel Investor',
        avatar: '/api/placeholder/64/64',
        bio: 'Former VP of Product at Stripe with 12+ years in fintech. Helped build products used by millions. Now angel investor and mentor helping founders navigate product-market fit and scale.',
        location: 'San Francisco, CA',
        timezone: 'PST',
        languages: ['English', 'Mandarin'],
        expertise: [
          { area: 'product', level: 'expert', years: 12 },
          { area: 'fundraising', level: 'advanced', years: 8 },
          { area: 'leadership', level: 'expert', years: 10 }
        ],
        experience: {
          total_years: 15,
          companies: ['Stripe', 'Google', 'Y Combinator'],
          exits: 2,
          investments: 45,
          mentees_helped: 120
        },
        pricing: {
          hourly_rate: 250,
          currency: 'USD',
          session_types: [
            { type: '1-on-1', duration: 60, price: 250, description: 'Deep dive product strategy session' },
            { type: 'group', duration: 90, price: 150, description: 'Small group product workshop' },
            { type: 'workshop', duration: 120, price: 400, description: 'Product-market fit masterclass' }
          ]
        },
        availability: {
          weekly_hours: 10,
          preferred_times: ['9 AM - 12 PM PST', '2 PM - 5 PM PST'],
          booking_lead_time: 3,
          max_sessions_per_week: 8
        },
        reviews: {
          average_rating: 4.9,
          total_reviews: 47,
          recent_reviews: [
            {
              id: 'review_1',
              founder_name: 'Alex M.',
              rating: 5,
              comment: 'Sarah provided incredible insights on our product strategy. Her experience at Stripe really shows.',
              date: '2025-01-10T00:00:00Z',
              session_type: '1-on-1'
            }
          ]
        },
        verification: {
          identity_verified: true,
          linkedin_verified: true,
          company_verified: true,
          background_checked: true
        },
        social: {
          linkedin: 'https://linkedin.com/in/sarahchen',
          twitter: 'https://twitter.com/sarahchen',
          website: 'https://sarahchen.com'
        },
        featured: true,
        response_time: 'Within 2 hours',
        success_rate: 96,
        tags: ['Fintech', 'Product Strategy', 'Stripe Alumni', 'Angel Investor']
      },
      {
        id: 'mentor_2',
        name: 'Marcus Rodriguez',
        title: 'Serial Entrepreneur & VC Partner',
        company: 'Andreessen Horowitz',
        avatar: '/api/placeholder/64/64',
        bio: 'Built and sold 3 companies, including a $200M exit to Adobe. Now partner at a16z focusing on early-stage B2B startups. Passionate about helping founders avoid common pitfalls.',
        location: 'Austin, TX',
        timezone: 'CST',
        languages: ['English', 'Spanish'],
        expertise: [
          { area: 'fundraising', level: 'expert', years: 15 },
          { area: 'operations', level: 'expert', years: 12 },
          { area: 'leadership', level: 'expert', years: 14 }
        ],
        experience: {
          total_years: 18,
          companies: ['Andreessen Horowitz', 'Adobe', 'TechStars'],
          exits: 3,
          investments: 78,
          mentees_helped: 200
        },
        pricing: {
          hourly_rate: 300,
          currency: 'USD',
          session_types: [
            { type: '1-on-1', duration: 45, price: 225, description: 'Fundraising and strategy consultation' },
            { type: 'group', duration: 90, price: 180, description: 'Entrepreneur roundtable discussion' },
            { type: 'workshop', duration: 180, price: 600, description: 'Fundraising bootcamp intensive' }
          ]
        },
        availability: {
          weekly_hours: 8,
          preferred_times: ['10 AM - 1 PM CST', '3 PM - 6 PM CST'],
          booking_lead_time: 5,
          max_sessions_per_week: 6
        },
        reviews: {
          average_rating: 4.8,
          total_reviews: 63,
          recent_reviews: [
            {
              id: 'review_3',
              founder_name: 'Jennifer L.',
              rating: 5,
              comment: 'Marcus helped us close our seed round. His network and advice were invaluable.',
              date: '2025-01-12T00:00:00Z',
              session_type: '1-on-1'
            }
          ]
        },
        verification: {
          identity_verified: true,
          linkedin_verified: true,
          company_verified: true,
          background_checked: true
        },
        social: {
          linkedin: 'https://linkedin.com/in/marcusrodriguez',
          twitter: 'https://twitter.com/marcusrod'
        },
        featured: true,
        response_time: 'Within 4 hours',
        success_rate: 94,
        tags: ['Serial Entrepreneur', 'VC Partner', 'B2B Expert', 'Exits']
      }
    ];

    // Apply filters
    if (expertise && expertise !== 'all') {
      mentors = mentors.filter(mentor => 
        mentor.expertise.some(exp => exp.area === expertise)
      );
    }

    if (session_type && session_type !== 'all') {
      mentors = mentors.filter(mentor =>
        mentor.pricing.session_types.some(session => session.type === session_type)
      );
    }

    if (price_min !== undefined) {
      mentors = mentors.filter(mentor => mentor.pricing.hourly_rate >= Number(price_min));
    }

    if (price_max !== undefined) {
      mentors = mentors.filter(mentor => mentor.pricing.hourly_rate <= Number(price_max));
    }

    if (featured === 'true') {
      mentors = mentors.filter(mentor => mentor.featured);
    }

    // Apply sorting
    switch (sort) {
      case 'price_low':
        mentors.sort((a, b) => a.pricing.hourly_rate - b.pricing.hourly_rate);
        break;
      case 'price_high':
        mentors.sort((a, b) => b.pricing.hourly_rate - a.pricing.hourly_rate);
        break;
      case 'experience':
        mentors.sort((a, b) => b.experience.total_years - a.experience.total_years);
        break;
      case 'rating':
      default:
        mentors.sort((a, b) => b.reviews.average_rating - a.reviews.average_rating);
        break;
    }

    // Apply pagination
    const paginatedMentors = mentors.slice(Number(offset), Number(offset) + Number(limit));

    res.json({
      success: true,
      data: {
        mentors: paginatedMentors,
        total: mentors.length,
        limit: Number(limit),
        offset: Number(offset)
      }
    });
  } catch (error) {
    throw new ApiError('Failed to fetch mentors', 500);
  }
}));

// GET /mentors/:id - Get detailed mentor profile
router.get('/:id', [
  param('id').isString(),
], asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  try {
    // Mock detailed mentor data
    const mentorDetail = {
      id: 'mentor_1',
      name: 'Sarah Chen',
      title: 'Former VP Product at Stripe',
      company: 'Stripe → Angel Investor',
      avatar: '/api/placeholder/64/64',
      bio: 'Former VP of Product at Stripe with 12+ years in fintech. Helped build products used by millions of developers and businesses worldwide. Led the team that launched Stripe Connect and Stripe Atlas. Now angel investor focusing on early-stage fintech and developer tools.',
      location: 'San Francisco, CA',
      timezone: 'PST',
      languages: ['English', 'Mandarin'],
      expertise: [
        { area: 'product', level: 'expert', years: 12 },
        { area: 'fundraising', level: 'advanced', years: 8 },
        { area: 'leadership', level: 'expert', years: 10 }
      ],
      experience: {
        total_years: 15,
        companies: ['Stripe', 'Google', 'Y Combinator'],
        exits: 2,
        investments: 45,
        mentees_helped: 120
      },
      pricing: {
        hourly_rate: 250,
        currency: 'USD',
        session_types: [
          { type: '1-on-1', duration: 60, price: 250, description: 'Deep dive product strategy session' },
          { type: 'group', duration: 90, price: 150, description: 'Small group product workshop' },
          { type: 'workshop', duration: 120, price: 400, description: 'Product-market fit masterclass' }
        ]
      },
      availability: {
        weekly_hours: 10,
        preferred_times: ['9 AM - 12 PM PST', '2 PM - 5 PM PST'],
        booking_lead_time: 3,
        max_sessions_per_week: 8,
        available_slots: [
          {
            id: 'slot_1',
            datetime: '2025-01-20T10:00:00Z',
            available: true,
            price: 250,
            duration: 60,
            session_type: '1-on-1'
          }
        ]
      },
      reviews: {
        average_rating: 4.9,
        total_reviews: 47,
        recent_reviews: [
          {
            id: 'review_1',
            founder_name: 'Alex M.',
            rating: 5,
            comment: 'Sarah provided incredible insights on our product strategy. Her experience at Stripe really shows.',
            date: '2025-01-10T00:00:00Z',
            session_type: '1-on-1'
          }
        ]
      },
      verification: {
        identity_verified: true,
        linkedin_verified: true,
        company_verified: true,
        background_checked: true
      },
      social: {
        linkedin: 'https://linkedin.com/in/sarahchen',
        twitter: 'https://twitter.com/sarahchen',
        website: 'https://sarahchen.com'
      },
      featured: true,
      response_time: 'Within 2 hours',
      success_rate: 96,
      tags: ['Fintech', 'Product Strategy', 'Stripe Alumni', 'Angel Investor']
    };

    if (id !== 'mentor_1') {
      throw new ApiError('Mentor not found', 404);
    }

    res.json({
      success: true,
      data: { mentor: mentorDetail }
    });
  } catch (error: any) {
    if (error instanceof ApiError) throw error;
    throw new ApiError('Failed to fetch mentor details', 500);
  }
}));

// POST /mentors/:id/sessions - Book a session with mentor
router.post('/:id/sessions', [
  param('id').isString(),
  body('session_type').isIn(['1-on-1', 'group', 'workshop']),
  body('slot_id').isString(),
  body('agenda').isString().isLength({ min: 10, max: 500 }),
  body('questions').isString().optional(),
], asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError('Validation failed', 400, errors.array());
  }

  const { id: mentorId } = req.params;
  const { session_type, slot_id, agenda, questions } = req.body;
  const userId = req.user!.id;

  try {
    // Mock session booking
    const session = {
      id: `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`,
      mentor_id: mentorId,
      founder_id: userId,
      session_type,
      slot_id,
      agenda,
      questions,
      status: 'pending_confirmation',
      scheduled_at: '2025-01-20T10:00:00Z', // From slot
      duration: 60,
      price: 250,
      currency: 'USD',
      payment_status: 'pending',
      meeting_link: null,
      created_at: new Date().toISOString()
    };

    // TODO: Store in database and initiate payment process
    console.log('Session booking created:', session);

    res.status(201).json({
      success: true,
      data: { session }
    });
  } catch (error: any) {
    if (error instanceof ApiError) throw error;
    throw new ApiError('Failed to book session', 500);
  }
}));

// GET /mentors/sessions/my - Get user's sessions
router.get('/sessions/my', [
  query('status').isIn(['upcoming', 'completed', 'cancelled']).optional(),
  query('role').isIn(['founder', 'mentor']).optional(),
], asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { status, role } = req.query;
  const userId = req.user!.id;

  try {
    // Mock sessions data
    let sessions = [
      {
        id: 'session_1',
        mentor: {
          id: 'mentor_1',
          name: 'Sarah Chen',
          title: 'Former VP Product at Stripe',
          avatar: '/api/placeholder/48/48'
        },
        founder: {
          id: 'founder_1',
          name: 'Alex Martinez',
          company: 'TechStartup Co',
          avatar: '/api/placeholder/48/48'
        },
        type: '1-on-1',
        status: 'upcoming',
        scheduled_at: '2025-01-20T15:00:00Z',
        duration: 60,
        agenda: 'Product-market fit strategy and user feedback analysis',
        meeting_link: 'https://meet.google.com/abc-defg-hij',
        price: 250,
        currency: 'USD',
        payment_status: 'escrowed',
        materials: [
          {
            id: 'material_1',
            name: 'Product Strategy Framework',
            type: 'pdf',
            url: '/materials/product-strategy.pdf',
            uploaded_by: 'mentor'
          }
        ],
        created_at: '2025-01-15T10:30:00Z'
      },
      {
        id: 'session_2',
        mentor: {
          id: 'mentor_2',
          name: 'Marcus Rodriguez',
          title: 'Serial Entrepreneur & VC Partner',
          avatar: '/api/placeholder/48/48'
        },
        founder: {
          id: 'founder_2',
          name: 'Jennifer Liu',
          company: 'GreenTech Solutions',
          avatar: '/api/placeholder/48/48'
        },
        type: '1-on-1',
        status: 'completed',
        scheduled_at: '2025-01-18T14:00:00Z',
        duration: 45,
        agenda: 'Fundraising preparation and investor pitch review',
        price: 225,
        currency: 'USD',
        payment_status: 'released',
        notes: 'Great session! Provided excellent feedback on pitch deck structure.',
        recording_url: 'https://recordings.mentorplatform.com/session_2',
        feedback: {
          mentor_rating: 5,
          mentor_review: 'Alex was well-prepared and asked thoughtful questions.',
          founder_rating: 5,
          founder_review: 'Marcus provided incredibly valuable insights.',
          submitted_at: '2025-01-18T15:30:00Z'
        },
        created_at: '2025-01-16T09:15:00Z'
      }
    ];

    // Apply filters
    if (status) {
      sessions = sessions.filter(session => session.status === status);
    }

    res.json({
      success: true,
      data: { sessions }
    });
  } catch (error) {
    throw new ApiError('Failed to fetch sessions', 500);
  }
}));

// PUT /mentors/sessions/:sessionId/feedback - Submit session feedback
router.put('/sessions/:sessionId/feedback', [
  param('sessionId').isString(),
  body('rating').isInt({ min: 1, max: 5 }),
  body('comment').isString().isLength({ min: 10, max: 500 }).optional(),
], asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError('Validation failed', 400, errors.array());
  }

  const { sessionId } = req.params;
  const { rating, comment } = req.body;
  const userId = req.user!.id;

  try {
    // Mock feedback submission
    const feedback = {
      session_id: sessionId,
      user_id: userId,
      rating,
      comment,
      submitted_at: new Date().toISOString()
    };

    // TODO: Store feedback and update session
    console.log('Session feedback submitted:', feedback);

    res.json({
      success: true,
      data: { feedback }
    });
  } catch (error: any) {
    if (error instanceof ApiError) throw error;
    throw new ApiError('Failed to submit feedback', 500);
  }
}));

// POST /mentors/sessions/:sessionId/materials - Upload session materials
router.post('/sessions/:sessionId/materials', upload.single('material'), [
  param('sessionId').isString(),
  body('name').isString().optional(),
  body('description').isString().optional(),
], asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { sessionId } = req.params;
  const { name, description } = req.body;
  const userId = req.user!.id;

  if (!req.file) {
    throw new ApiError('No file uploaded', 400);
  }

  try {
    const material = {
      id: `material_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`,
      session_id: sessionId,
      name: name || req.file.originalname,
      description,
      file_path: `/uploads/sessions/${req.file.filename}`,
      file_type: path.extname(req.file.originalname).slice(1),
      uploaded_by: userId,
      uploaded_at: new Date().toISOString()
    };

    // TODO: Store material info in database
    console.log('Session material uploaded:', material);

    res.json({
      success: true,
      data: { material }
    });
  } catch (error: any) {
    if (error instanceof ApiError) throw error;
    throw new ApiError('Failed to upload material', 500);
  }
}));

// GET /mentors/expertise-areas - Get available expertise areas
router.get('/expertise-areas', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    const expertiseAreas = [
      { id: 'fundraising', label: 'Fundraising', icon: '💰', mentor_count: 15 },
      { id: 'product', label: 'Product Strategy', icon: '📱', mentor_count: 12 },
      { id: 'marketing', label: 'Marketing & Growth', icon: '📈', mentor_count: 18 },
      { id: 'operations', label: 'Operations', icon: '⚙️', mentor_count: 8 },
      { id: 'leadership', label: 'Leadership', icon: '👥', mentor_count: 14 },
      { id: 'sales', label: 'Sales Strategy', icon: '🎯', mentor_count: 10 },
      { id: 'technology', label: 'Technology', icon: '💻', mentor_count: 9 },
      { id: 'legal', label: 'Legal & Compliance', icon: '⚖️', mentor_count: 5 },
      { id: 'finance', label: 'Finance & Accounting', icon: '📊', mentor_count: 7 },
      { id: 'hr', label: 'HR & Talent', icon: '👤', mentor_count: 6 }
    ];

    res.json({
      success: true,
      data: { expertise_areas: expertiseAreas }
    });
  } catch (error) {
    throw new ApiError('Failed to fetch expertise areas', 500);
  }
}));

// GET /mentors/stats - Get mentorship platform statistics
router.get('/stats', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    const stats = {
      total_mentors: 47,
      active_sessions: 156,
      completed_sessions: 1247,
      average_rating: 4.7,
      success_rate: 94.2,
      total_hours: 3890,
      expertise_distribution: {
        fundraising: 22,
        product: 18,
        marketing: 15,
        leadership: 12,
        operations: 10,
        other: 23
      },
      session_type_distribution: {
        '1-on-1': 78,
        group: 15,
        workshop: 7
      }
    };

    res.json({
      success: true,
      data: { stats }
    });
  } catch (error) {
    throw new ApiError('Failed to fetch mentorship stats', 500);
  }
}));

export default router;