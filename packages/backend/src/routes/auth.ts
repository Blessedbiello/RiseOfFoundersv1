import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { prisma } from '../config/database';
import { generateToken, verifyWalletSignature, AuthenticatedRequest, validateAuth } from '../middleware/auth';
import { ApiError, asyncHandler } from '../middleware/errorHandler';
import { UserRole } from '@prisma/client';

const router: any = Router();

// Validation rules
const walletAuthValidation = [
  body('walletAddress')
    .isLength({ min: 32, max: 44 })
    .matches(/^[1-9A-HJ-NP-Za-km-z]+$/)
    .withMessage('Invalid wallet address format'),
  body('signature')
    .isLength({ min: 50 })
    .withMessage('Invalid signature'),
  body('message')
    .isLength({ min: 10 })
    .withMessage('Invalid message'),
];

const profileUpdateValidation = [
  body('displayName')
    .optional()
    .isLength({ min: 2, max: 30 })
    .withMessage('Display name must be between 2 and 30 characters'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Invalid email format'),
  body('bio')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Bio must be less than 500 characters'),
  body('selectedKingdom')
    .optional()
    .isIn(['silicon-valley', 'crypto-valley', 'business-strategy', 'product-olympus', 'marketing-multiverse', 'all'])
    .withMessage('Invalid kingdom selection'),
];

// GET /auth/nonce - Get nonce for wallet signature
router.get('/nonce/:walletAddress', asyncHandler(async (req: Request, res: Response) => {
  const { walletAddress } = req.params;
  
  if (!walletAddress.match(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/)) {
    throw new ApiError('Invalid wallet address format', 400);
  }
  
  // Generate a unique nonce for this wallet
  const nonce = `Rise of Founders Login: ${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  // Store nonce temporarily (in production, use Redis with expiration)
  // For now, we'll embed timestamp and validate on login
  
  res.json({
    success: true,
    data: {
      nonce,
      message: `Please sign this message to authenticate with Rise of Founders.\n\nNonce: ${nonce}\nTimestamp: ${new Date().toISOString()}`,
    },
  });
}));

// POST /auth/wallet - Authenticate with wallet signature
router.post('/wallet', walletAuthValidation, asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError('Validation failed', 400);
  }
  
  const { walletAddress, signature, message } = req.body;
  
  // Verify the signature (placeholder implementation)
  const isValidSignature = verifyWalletSignature(message, signature, walletAddress);
  
  if (!isValidSignature) {
    throw new ApiError('Invalid signature', 401);
  }
  
  // Check if message is recent (within 5 minutes)
  const messageTimestamp = message.match(/Timestamp: (.+)/)?.[1];
  if (messageTimestamp) {
    const timestamp = new Date(messageTimestamp);
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
    
    if (timestamp < fiveMinutesAgo) {
      throw new ApiError('Message expired. Please generate a new nonce', 401);
    }
  }
  
  // Find or create user
  let user = await prisma.user.findUnique({
    where: { walletAddress },
    include: {
      badges: true,
      traits: true,
    },
  });
  
  if (!user) {
    // Create new user
    user = await prisma.user.create({
      data: {
        walletAddress,
        displayName: `Founder_${walletAddress.slice(-8)}`,
        role: UserRole.PLAYER,
        skillScores: {
          technical: 0,
          business: 0,
          marketing: 0,
          community: 0,
          design: 0,
          product: 0,
        },
        preferences: {
          theme: 'dark',
          notifications: {
            email: false,
            discord: false,
            inApp: true,
            missions: true,
            teams: true,
            mentorship: true,
            competitions: true,
          },
          privacy: {
            showProfile: true,
            showProgress: true,
            showTeams: true,
            allowMentorRequests: true,
          },
          gameplay: {
            autoAcceptTeamInvites: false,
            allowPvpChallenges: true,
            preferredDifficulty: 'adaptive',
          },
        },
      },
      include: {
        badges: true,
        traits: true,
      },
    });

    // Award first wallet connection mission via Honeycomb
    try {
      const { honeycombService } = await import('../services/honeycomb/client');
      await honeycombService.completeMission('first_wallet_connection', walletAddress);
      
      // Add XP for first wallet connection
      await prisma.user.update({
        where: { id: user.id },
        data: { xpTotal: { increment: 25 } },
      });
    } catch (error) {
      console.error('Failed to award first wallet connection mission:', error);
    }
  } else {
    // Update last active
    user = await prisma.user.update({
      where: { id: user.id },
      data: { lastActive: new Date() },
      include: {
        badges: true,
        traits: true,
      },
    });
  }
  
  const token = generateToken({
    id: user.id,
    walletAddress: user.walletAddress,
    role: user.role,
    email: user.email || undefined,
    isVerified: user.isVerified,
  });
  
  res.json({
    success: true,
    data: {
      token,
      user: {
        id: user.id,
        walletAddress: user.walletAddress,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        role: user.role,
        xpTotal: user.xpTotal,
        reputationScore: user.reputationScore,
        skillScores: user.skillScores,
        badges: user.badges,
        traits: user.traits,
        isVerified: user.isVerified,
        preferences: user.preferences,
      },
    },
  });
}));

// POST /auth/github/connect - Connect GitHub account
router.post('/github/connect', validateAuth as any, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  
  const state = Buffer.from(JSON.stringify({ userId })).toString('base64');
  const authUrl = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&scope=user:email&state=${state}&redirect_uri=${process.env.GITHUB_REDIRECT_URI}`;
  
  res.json({
    success: true,
    data: {
      authUrl,
      state,
    },
  });
}));

// POST /auth/github/callback - Handle GitHub OAuth callback
router.post('/github/callback', asyncHandler(async (req: Request, res: Response) => {
  const { code, state } = req.body;
  
  if (!code || !state) {
    throw new ApiError('Missing authorization code or state', 400);
  }
  
  try {
    // Decode state to get user ID
    const stateData = JSON.parse(Buffer.from(state, 'base64').toString());
    const { userId } = stateData;
    
    // Exchange code for access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      }),
    });
    
    const tokenData: any = await tokenResponse.json();
    
    if (!tokenData.access_token) {
      throw new ApiError('Failed to get GitHub access token', 400);
    }
    
    // Get GitHub user info
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `token ${tokenData.access_token}`,
        'User-Agent': 'Rise-of-Founders',
      },
    });
    
    const githubUser: any = await userResponse.json();
    
    if (!githubUser.id) {
      throw new ApiError('Failed to get GitHub user info', 400);
    }
    
    // Update user with GitHub info
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        githubId: githubUser.id.toString(),
        githubUsername: githubUser.login,
        githubAccessToken: tokenData.access_token, // Store encrypted in production
      },
    });
    
    // Award GitHub verification badge via Honeycomb
    try {
      const { honeycombService } = await import('../services/honeycomb/client');
      await honeycombService.completeMission('github_verification', user.walletAddress, [
        {
          type: 'github_profile',
          username: githubUser.login,
          id: githubUser.id,
          verified: true,
        }
      ]);
      
      // Add XP for GitHub verification
      await prisma.user.update({
        where: { id: userId },
        data: {
          xpTotal: { increment: 150 },
        },
      });
    } catch (error) {
      console.error('Failed to award GitHub verification rewards:', error);
    }
    
    res.json({
      success: true,
      data: {
        githubConnected: true,
        githubUsername: githubUser.login,
        githubId: githubUser.id,
        xpAwarded: 150,
        badgeEarned: 'GitHub Verification',
      },
    });
  } catch (error: any) {
    console.error('GitHub OAuth error:', error);
    throw new ApiError('Failed to connect GitHub account', 500);
  }
}));

// GET /auth/github/status - Get GitHub connection status
router.get('/github/status', validateAuth as any, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      githubId: true,
      githubUsername: true,
    },
  });
  
  res.json({
    success: true,
    data: {
      connected: !!(user?.githubId && user?.githubUsername),
      username: user?.githubUsername || undefined,
      githubId: user?.githubId || undefined,
    },
  });
}));

// POST /auth/github/disconnect - Disconnect GitHub account
router.post('/github/disconnect', validateAuth as any, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  
  await prisma.user.update({
    where: { id: userId },
    data: {
      githubId: null,
      githubUsername: null,
      githubAccessToken: null,
    },
  });
  
  res.json({
    success: true,
    data: {
      githubDisconnected: true,
    },
  });
}));

// POST /auth/refresh - Refresh JWT token
router.post('/refresh', asyncHandler(async (req: Request, res: Response) => {
  const { token } = req.body;
  
  if (!token) {
    throw new ApiError('Token required', 400);
  }
  
  try {
    // Verify current token and issue new one
    const decoded = require('jsonwebtoken').verify(token, process.env.JWT_SECRET) as any;
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });
    
    if (!user) {
      throw new ApiError('User not found', 404);
    }
    
    const newToken = generateToken({
      id: user.id,
      walletAddress: user.walletAddress,
      role: user.role,
      email: user.email || undefined,
      isVerified: user.isVerified,
    });
    
    res.json({
      success: true,
      data: { token: newToken },
    });
  } catch (error) {
    throw new ApiError('Invalid token', 401);
  }
}));

// GET /auth/verify - Verify current token
router.get('/verify', asyncHandler(async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new ApiError('No token provided', 401);
  }
  
  const token = authHeader.substring(7);
  
  try {
    const decoded = require('jsonwebtoken').verify(token, process.env.JWT_SECRET) as any;
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        walletAddress: true,
        displayName: true,
        role: true,
        email: true,
        isVerified: true,
      },
    });
    
    if (!user) {
      throw new ApiError('User not found', 404);
    }
    
    res.json({
      success: true,
      data: {
        valid: true,
        user,
      },
    });
  } catch (error) {
    throw new ApiError('Invalid token', 401);
  }
}));

// PUT /auth/profile - Update user profile
router.put('/profile', validateAuth as any, profileUpdateValidation, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError('Validation failed', 400, errors.array());
  }

  const userId = req.user!.id;
  const { displayName, email, bio, avatarUrl, selectedKingdom } = req.body;

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(displayName && { displayName }),
        ...(email && { email }),
        ...(bio && { bio }),
        ...(avatarUrl && { avatarUrl }),
        ...(selectedKingdom && { selectedKingdom }),
        updatedAt: new Date(),
      },
      select: {
        id: true,
        walletAddress: true,
        displayName: true,
        email: true,
        bio: true,
        avatarUrl: true,
        selectedKingdom: true,
        role: true,
        xpTotal: true,
        reputationScore: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Award missions for profile completions
    try {
      const { honeycombService } = await import('../services/honeycomb/client');
      
      // Award profile creation mission if this is a significant profile update
      if (displayName || bio || avatarUrl) {
        await honeycombService.completeMission('profile_creation', updatedUser.walletAddress);
        await prisma.user.update({
          where: { id: userId },
          data: { xpTotal: { increment: 30 } },
        });
      }
      
      // Award territory selection mission and create character if kingdom was selected
      if (selectedKingdom) {
        // Check if user already has a character
        const existingCharacter = await prisma.founderCharacter.findUnique({
          where: { userId }
        });

        // If no character exists, create one based on kingdom selection
        if (!existingCharacter) {
          try {
            const { honeycombCharacterService } = await import('../services/honeycomb/characters');
            
            await honeycombCharacterService.createFounderCharacter({
              userId,
              name: updatedUser.displayName || `Founder_${updatedUser.walletAddress.slice(-8)}`,
              kingdom: selectedKingdom as any, // Kingdom enum
              customization: {
                avatarUrl: updatedUser.avatarUrl || undefined
              }
            });

            console.log(`✅ Created character for user ${userId} in kingdom ${selectedKingdom}`);
          } catch (error) {
            console.error('Failed to create character during kingdom selection:', error);
            // Continue without failing the profile update
          }
        }

        await honeycombService.completeMission('territory_selection', updatedUser.walletAddress, [
          { type: 'kingdom_selection', kingdom: selectedKingdom }
        ]);
        await prisma.user.update({
          where: { id: userId },
          data: { xpTotal: { increment: 40 } },
        });
      }
    } catch (error) {
      console.error('Failed to award profile update missions:', error);
    }

    res.json({
      success: true,
      data: { 
        user: {
          ...updatedUser,
          name: updatedUser.displayName, // Map displayName to name for frontend compatibility
          profilePicture: updatedUser.avatarUrl, // Map avatarUrl to profilePicture for frontend compatibility
          createdAt: updatedUser.createdAt.toISOString(),
          updatedAt: updatedUser.updatedAt.toISOString(),
        }
      },
    });
  } catch (error: any) {
    if (error.code === 'P2002') {
      throw new ApiError('Email already exists', 409);
    }
    throw new ApiError('Failed to update profile', 500);
  }
}));

export default router;