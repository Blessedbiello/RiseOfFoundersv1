import { Router, Response } from 'express';
import { body, param, validationResult } from 'express-validator';
import { AuthenticatedRequest } from '../middleware/auth';
import { ApiError, asyncHandler } from '../middleware/errorHandler';

const router: any = Router();

// POST /teams - Create a new team
router.post('/', [
  body('name').isString().isLength({ min: 2, max: 100 }).trim(),
  body('description').isString().isLength({ min: 10, max: 500 }).trim(),
  body('vision').isString().isLength({ min: 10, max: 1000 }).trim(),
  body('focus').isIn(['technical', 'business', 'marketing', 'design', 'mixed']),
  body('size').isInt({ min: 2, max: 10 }),
  body('equityDistribution').isIn(['equal', 'merit', 'investment', 'custom']),
  body('decisionMaking').isIn(['democratic', 'founder_led', 'consensus', 'delegated']),
  body('vestingPeriod').isIn(['1_year', '2_years', '4_years', 'custom']),
  body('commitmentLevel').isIn(['part_time', 'full_time', 'project_based']),
  body('agreement').isString().optional(),
  body('multiSigConfig').isObject().optional(),
  body('invitedMembers').isArray().optional(),
], asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError('Validation failed', 400, errors.array());
  }

  const {
    name,
    description,
    vision,
    focus,
    size,
    equityDistribution,
    decisionMaking,
    vestingPeriod,
    commitmentLevel,
    agreement,
    multiSigConfig,
    invitedMembers
  } = req.body;

  const userId = req.user!.id;

  try {
    // Check if user is already in a team
    const existingMembership = await checkUserTeamMembership(userId);
    if (existingMembership) {
      throw new ApiError('User is already a member of a team', 400);
    }

    // Create team (mock implementation)
    const teamData = {
      id: `team_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`,
      name,
      description,
      vision,
      focus,
      targetSize: size,
      equityDistribution,
      decisionMaking,
      vestingPeriod,
      commitmentLevel,
      founderId: userId,
      agreement,
      multiSigConfig,
      status: 'active',
      level: 1,
      xpTotal: 0,
      missionsCompleted: 0,
      territoriesControlled: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Add founder as first member
    const founderMembership = {
      teamId: teamData.id,
      userId,
      role: 'founder',
      equityPercentage: equityDistribution === 'equal' ? 100 / size : null,
      joinedAt: new Date().toISOString(),
      status: 'active'
    };

    // Send invitations (mock implementation)
    if (invitedMembers && Array.isArray(invitedMembers)) {
      const invitations = invitedMembers.map((email: string) => ({
        id: `inv_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`,
        teamId: teamData.id,
        email,
        invitedBy: userId,
        status: 'pending',
        sentAt: new Date().toISOString()
      }));
      
      // TODO: Send actual email invitations
      console.log('Team invitations to send:', invitations);
    }

    // Deploy multi-sig wallet if configured
    if (multiSigConfig) {
      try {
        // TODO: Deploy actual multi-sig wallet on Solana
        console.log('Multi-sig wallet configuration:', multiSigConfig);
      } catch (error) {
        console.error('Multi-sig deployment failed:', error);
        // Continue without failing team creation
      }
    }

    // Store legal agreement if provided
    if (agreement) {
      // TODO: Store agreement on-chain or IPFS for immutability
      console.log('Legal agreement stored for team:', teamData.id);
    }

    res.status(201).json({
      success: true,
      data: {
        team: teamData,
        membership: founderMembership,
        invitationsSent: invitedMembers ? invitedMembers.length : 0
      }
    });
  } catch (error: any) {
    if (error instanceof ApiError) throw error;
    throw new ApiError('Failed to create team', 500);
  }
}));

// GET /teams/my - Get user's team
router.get('/my', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;

  try {
    const teamMembership = await getUserTeamMembership(userId);
    
    if (!teamMembership) {
      return res.json({
        success: true,
        data: { team: null, membership: null }
      });
    }

    res.json({
      success: true,
      data: teamMembership
    });
  } catch (error) {
    throw new ApiError('Failed to get team information', 500);
  }
}));

// POST /teams/:teamId/invite - Invite member to team
router.post('/:teamId/invite', [
  param('teamId').isString(),
  body('email').isEmail(),
  body('role').isString().optional(),
  body('message').isString().optional(),
], asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError('Validation failed', 400);
  }

  const { teamId } = req.params;
  const { email, role, message } = req.body;
  const userId = req.user!.id;

  try {
    // Verify user has permission to invite (founder or admin)
    const membership = await getUserTeamMembership(userId);
    if (!membership || membership.team.id !== teamId) {
      throw new ApiError('Not authorized to invite members', 403);
    }

    if (!['founder', 'admin'].includes(membership.membership.role)) {
      throw new ApiError('Insufficient permissions to invite members', 403);
    }

    // Create invitation
    const invitation = {
      id: `inv_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`,
      teamId,
      email,
      role: role || 'member',
      message: message || '',
      invitedBy: userId,
      status: 'pending',
      sentAt: new Date().toISOString()
    };

    // TODO: Send actual email invitation
    console.log('Sending team invitation:', invitation);

    res.json({
      success: true,
      data: { invitation }
    });
  } catch (error: any) {
    if (error instanceof ApiError) throw error;
    throw new ApiError('Failed to send invitation', 500);
  }
}));

// POST /teams/join/:inviteCode - Join team via invite link
router.post('/join/:inviteCode', [
  param('inviteCode').isString(),
], asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { inviteCode } = req.params;
  const userId = req.user!.id;

  try {
    // Check if user is already in a team
    const existingMembership = await checkUserTeamMembership(userId);
    if (existingMembership) {
      throw new ApiError('User is already a member of a team', 400);
    }

    // Validate invite code and get team info
    const invitation = await validateInviteCode(inviteCode);
    if (!invitation) {
      throw new ApiError('Invalid or expired invitation', 404);
    }

    // Add user to team
    const membership = {
      teamId: invitation.teamId,
      userId,
      role: 'member',
      joinedAt: new Date().toISOString(),
      status: 'active'
    };

    // Update invitation status
    await updateInvitationStatus(invitation.id, 'accepted');

    res.json({
      success: true,
      data: { membership, team: invitation.team }
    });
  } catch (error: any) {
    if (error instanceof ApiError) throw error;
    throw new ApiError('Failed to join team', 500);
  }
}));

// GET /teams/:teamId/members - Get team members
router.get('/:teamId/members', [
  param('teamId').isString(),
], asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { teamId } = req.params;
  const userId = req.user!.id;

  try {
    // Verify user has access to team information
    const membership = await getUserTeamMembership(userId);
    if (!membership || membership.team.id !== teamId) {
      throw new ApiError('Not authorized to view team members', 403);
    }

    const members = await getTeamMembers(teamId);

    res.json({
      success: true,
      data: { members }
    });
  } catch (error: any) {
    if (error instanceof ApiError) throw error;
    throw new ApiError('Failed to get team members', 500);
  }
}));

// PUT /teams/:teamId - Update team settings
router.put('/:teamId', [
  param('teamId').isString(),
  body('name').isString().isLength({ min: 2, max: 100 }).optional(),
  body('description').isString().isLength({ min: 10, max: 500 }).optional(),
  body('vision').isString().isLength({ min: 10, max: 1000 }).optional(),
], asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError('Validation failed', 400);
  }

  const { teamId } = req.params;
  const updates = req.body;
  const userId = req.user!.id;

  try {
    // Verify user has permission to update team
    const membership = await getUserTeamMembership(userId);
    if (!membership || membership.team.id !== teamId) {
      throw new ApiError('Not authorized to update team', 403);
    }

    if (!['founder', 'admin'].includes(membership.membership.role)) {
      throw new ApiError('Insufficient permissions to update team', 403);
    }

    // Update team
    const updatedTeam = await updateTeam(teamId, updates);

    res.json({
      success: true,
      data: { team: updatedTeam }
    });
  } catch (error: any) {
    if (error instanceof ApiError) throw error;
    throw new ApiError('Failed to update team', 500);
  }
}));

// Mock helper functions (would be replaced with actual database calls)
async function checkUserTeamMembership(userId: string) {
  // Check if user is already in a team
  return null; // Mock: no existing membership
}

async function getUserTeamMembership(userId: string): Promise<{ team: { id: string; name: string; }; membership: { role: string; }; } | null> {
  // Get user's team membership with team details
  return null; // Mock: no team membership
}

async function validateInviteCode(inviteCode: string): Promise<{ id: string; teamId: string; team: { id: string; name: string; }; } | null> {
  // Validate invite code and return invitation details
  return null; // Mock: invalid code
}

async function updateInvitationStatus(invitationId: string, status: string) {
  // Update invitation status in database
  return true;
}

async function getTeamMembers(teamId: string) {
  // Get all team members
  return []; // Mock: empty members list
}

async function updateTeam(teamId: string, updates: any) {
  // Update team in database
  return { id: teamId, ...updates };
}

export default router;