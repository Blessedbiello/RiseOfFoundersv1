import { Router, Response } from 'express';
import { body, param, validationResult } from 'express-validator';
import { AuthenticatedRequest, validateAuth } from '../middleware/auth';
import { ApiError, asyncHandler } from '../middleware/errorHandler';
import { honeycombCharacterService } from '../services/honeycomb/characters';
import { prisma } from '../config/database';
import type { Kingdom, CharacterClass } from '@prisma/client';

const router: any = Router();

// All character routes require authentication
router.use(validateAuth as any);

// Validation rules
const characterCreationValidation = [
  body('name')
    .isString()
    .isLength({ min: 2, max: 30 })
    .withMessage('Character name must be between 2 and 30 characters'),
  body('kingdom')
    .isIn(['SILICON_VALLEY', 'CRYPTO_VALLEY', 'BUSINESS_STRATEGY', 'PRODUCT_OLYMPUS', 'MARKETING_MULTIVERSE', 'ALL_KINGDOMS'])
    .withMessage('Invalid kingdom selection'),
  body('characterClass')
    .optional()
    .isIn(['TECH_FOUNDER', 'CRYPTO_FOUNDER', 'BUSINESS_STRATEGIST', 'PRODUCT_VISIONARY', 'MARKETING_MAVERICK', 'RENAISSANCE_FOUNDER'])
    .withMessage('Invalid character class'),
  body('customization')
    .optional()
    .isObject()
    .withMessage('Customization must be an object'),
  body('customization.avatarUrl')
    .optional()
    .isURL()
    .withMessage('Avatar URL must be a valid URL'),
];

const experienceAwardValidation = [
  body('amount')
    .isInt({ min: 1, max: 10000 })
    .withMessage('Experience amount must be between 1 and 10000'),
  body('source')
    .isString()
    .isLength({ min: 1, max: 100 })
    .withMessage('Source description required'),
];

// POST /api/characters - Create new founder character
router.post('/', characterCreationValidation, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError('Validation failed', 400, errors.array());
  }

  const userId = req.user!.id;
  const { name, kingdom, characterClass, customization } = req.body;

  try {
    // Check if user already has a character
    const existingCharacter = await prisma.founderCharacter.findUnique({
      where: { userId }
    });

    if (existingCharacter) {
      throw new ApiError('User already has a character', 409);
    }

    // Create character
    const character = await honeycombCharacterService.createFounderCharacter({
      userId,
      name,
      kingdom: kingdom as Kingdom,
      characterClass: characterClass as CharacterClass,
      customization
    });

    res.status(201).json({
      success: true,
      data: {
        character: {
          id: character.id,
          name: character.name,
          kingdom: character.kingdom,
          characterClass: character.characterClass,
          level: character.level,
          experience: character.experience,
          stats: {
            technical: character.technical,
            business: character.business,
            marketing: character.marketing,
            community: character.community,
            design: character.design,
            product: character.product
          },
          honeycombCharacterId: character.honeycombCharacterId,
          createdAt: character.createdAt,
        },
        message: 'Character created successfully! Welcome to your founder journey.',
      },
    });
  } catch (error: any) {
    throw new ApiError(error.message || 'Failed to create character', 500);
  }
}));

// GET /api/characters/me - Get current user's character
router.get('/me', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;

  try {
    const character = await honeycombCharacterService.getCharacter(userId);

    if (!character) {
      return res.status(404).json({
        success: false,
        error: 'Character not found',
        message: 'No character exists for this user. Create one first.',
      });
    }

    // Get character stats and progression
    const stats = await honeycombCharacterService.getCharacterStats(character.id);

    res.json({
      success: true,
      data: {
        character: {
          id: character.id,
          name: character.name,
          kingdom: character.kingdom,
          characterClass: character.characterClass,
          level: character.level,
          experience: character.experience,
          experienceToNext: character.experienceToNext,
          stats: {
            technical: character.technical,
            business: character.business,
            marketing: character.marketing,
            community: character.community,
            design: character.design,
            product: character.product
          },
          visual: {
            avatarUrl: character.avatarUrl,
            kingdomEmblem: character.kingdomEmblem,
            characterTheme: character.characterTheme
          },
          progression: stats.progression,
          kingdomBonuses: stats.kingdomBonuses,
          totalPower: stats.totalPower,
          user: character.user,
          equipment: character.equipment,
          resourceInventory: character.resourceInventory,
          stakingRecords: character.stakingRecords,
          recentEvolutions: character.evolutions,
          createdAt: character.createdAt,
          updatedAt: character.updatedAt,
        },
      },
    });
  } catch (error: any) {
    throw new ApiError(error.message || 'Failed to get character', 500);
  }
}));

// GET /api/characters/:characterId/stats - Get character stats and progression
router.get('/:characterId/stats', [
  param('characterId').isString().withMessage('Character ID required'),
], asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError('Validation failed', 400, errors.array());
  }

  const { characterId } = req.params;
  const userId = req.user!.id;

  try {
    // Verify character belongs to user or is publicly accessible
    const character = await prisma.founderCharacter.findFirst({
      where: {
        id: characterId,
        // Allow access if it's the user's character or if we want to allow public access
        OR: [
          { userId },
          // Add public access conditions here if needed
        ]
      }
    });

    if (!character) {
      throw new ApiError('Character not found or access denied', 404);
    }

    const stats = await honeycombCharacterService.getCharacterStats(characterId);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    throw new ApiError(error.message || 'Failed to get character stats', 500);
  }
}));

// POST /api/characters/:characterId/experience - Award experience (admin/system use)
router.post('/:characterId/experience', [
  param('characterId').isString().withMessage('Character ID required'),
  ...experienceAwardValidation,
], asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError('Validation failed', 400, errors.array());
  }

  const { characterId } = req.params;
  const { amount, source } = req.body;
  const userId = req.user!.id;

  try {
    // Verify character belongs to user
    const character = await prisma.founderCharacter.findFirst({
      where: { id: characterId, userId }
    });

    if (!character) {
      throw new ApiError('Character not found', 404);
    }

    const result = await honeycombCharacterService.awardExperience(characterId, amount, source);

    res.json({
      success: true,
      data: {
        experienceAwarded: amount,
        newExperience: result.newExperience,
        leveledUp: result.leveledUp,
        ...(result.leveledUp && { newLevel: result.newLevel }),
        message: result.leveledUp 
          ? `Congratulations! Your character leveled up to level ${result.newLevel}!`
          : `Awarded ${amount} experience points.`,
      },
    });
  } catch (error: any) {
    throw new ApiError(error.message || 'Failed to award experience', 500);
  }
}));

// POST /api/characters/:characterId/evolve - Trigger character evolution
router.post('/:characterId/evolve', [
  param('characterId').isString().withMessage('Character ID required'),
  body('evolutionType')
    .isIn(['LEVEL_UP', 'SKILL_UNLOCK', 'CLASS_EVOLUTION'])
    .withMessage('Invalid evolution type'),
  body('triggerType')
    .isIn(['MISSION_COMPLETE', 'XP_THRESHOLD', 'SPECIAL_EVENT'])
    .withMessage('Invalid trigger type'),
  body('statChanges')
    .isObject()
    .withMessage('Stat changes must be an object'),
], asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError('Validation failed', 400, errors.array());
  }

  const { characterId } = req.params;
  const { evolutionType, triggerType, statChanges, newAbilities, triggerData } = req.body;
  const userId = req.user!.id;

  try {
    // Verify character belongs to user
    const character = await prisma.founderCharacter.findFirst({
      where: { id: characterId, userId }
    });

    if (!character) {
      throw new ApiError('Character not found', 404);
    }

    // Check if character can evolve
    const evolutionCheck = await honeycombCharacterService.checkForEvolution(characterId);
    if (!evolutionCheck.canEvolve) {
      throw new ApiError('Character is not ready for evolution', 400);
    }

    const evolvedCharacter = await honeycombCharacterService.evolveCharacter({
      characterId,
      evolutionType,
      triggerType,
      statChanges,
      newAbilities,
      triggerData
    });

    res.json({
      success: true,
      data: {
        character: evolvedCharacter,
        evolutionType,
        message: `Character evolution successful! ${evolutionType} completed.`,
      },
    });
  } catch (error: any) {
    throw new ApiError(error.message || 'Failed to evolve character', 500);
  }
}));

// GET /api/characters/:characterId/evolution-check - Check if character can evolve
router.get('/:characterId/evolution-check', [
  param('characterId').isString().withMessage('Character ID required'),
], asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError('Validation failed', 400, errors.array());
  }

  const { characterId } = req.params;
  const userId = req.user!.id;

  try {
    // Verify character belongs to user
    const character = await prisma.founderCharacter.findFirst({
      where: { id: characterId, userId }
    });

    if (!character) {
      throw new ApiError('Character not found', 404);
    }

    const evolutionCheck = await honeycombCharacterService.checkForEvolution(characterId);

    res.json({
      success: true,
      data: evolutionCheck,
    });
  } catch (error: any) {
    throw new ApiError(error.message || 'Failed to check evolution', 500);
  }
}));

// GET /api/characters/kingdoms - Get available kingdoms and their details
router.get('/kingdoms', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const kingdoms = [
    {
      id: 'SILICON_VALLEY',
      name: 'Silicon Valley',
      title: 'The Code Citadel',
      description: 'Where algorithms become empires. Master the art of scalable technology.',
      characterClass: 'TECH_FOUNDER',
      emblem: '💻',
      color: 'from-blue-600 to-cyan-600',
      primaryStats: ['technical', 'product'],
      startingBonuses: { technical: 50, product: 30 },
      specialAbilities: ['Code Mastery', 'Tech Innovation'],
    },
    {
      id: 'CRYPTO_VALLEY',
      name: 'Crypto Valley',
      title: 'The Decentralized Frontier',
      description: 'Where code is law. Master blockchain and prove decentralization is freedom.',
      characterClass: 'CRYPTO_FOUNDER',
      emblem: '⛓️',
      color: 'from-purple-600 to-pink-600',
      primaryStats: ['technical', 'community'],
      startingBonuses: { technical: 45, community: 35 },
      specialAbilities: ['Blockchain Mastery', 'Community Building'],
    },
    {
      id: 'BUSINESS_STRATEGY',
      name: 'Business Strategy',
      title: 'The Boardroom Colosseum',
      description: 'Where vision meets execution. Navigate politics without losing your soul.',
      characterClass: 'BUSINESS_STRATEGIST',
      emblem: '📈',
      color: 'from-green-600 to-emerald-600',
      primaryStats: ['business', 'marketing'],
      startingBonuses: { business: 50, marketing: 30 },
      specialAbilities: ['Strategic Planning', 'Market Analysis'],
    },
    {
      id: 'PRODUCT_OLYMPUS',
      name: 'Product Olympus',
      title: 'The User Paradise',
      description: 'Where creators craft experiences that change lives. Build intuitive perfection.',
      characterClass: 'PRODUCT_VISIONARY',
      emblem: '🎨',
      color: 'from-orange-600 to-red-600',
      primaryStats: ['product', 'design'],
      startingBonuses: { product: 50, design: 45 },
      specialAbilities: ['Design Thinking', 'User Empathy'],
    },
    {
      id: 'MARKETING_MULTIVERSE',
      name: 'Marketing Multiverse',
      title: 'The Attention Wars',
      description: 'Where stories become movements. Turn customers into crusaders.',
      characterClass: 'MARKETING_MAVERICK',
      emblem: '🚀',
      color: 'from-yellow-600 to-orange-600',
      primaryStats: ['marketing', 'community'],
      startingBonuses: { marketing: 50, community: 40 },
      specialAbilities: ['Viral Marketing', 'Brand Building'],
    },
    {
      id: 'ALL_KINGDOMS',
      name: 'All Kingdoms',
      title: 'The Complete Conquest',
      description: 'Face all kingdoms. Unite them under one vision and claim the crown.',
      characterClass: 'RENAISSANCE_FOUNDER',
      emblem: '👑',
      color: 'from-purple-600 to-pink-600',
      primaryStats: ['balanced'],
      startingBonuses: { all: 30 },
      specialAbilities: ['Adaptability', 'Cross-Domain Mastery'],
    },
  ];

  res.json({
    success: true,
    data: { kingdoms },
  });
}));

// PUT /api/characters/:characterId - Update character (customization, name, etc.)
router.put('/:characterId', [
  param('characterId').isString().withMessage('Character ID required'),
  body('name')
    .optional()
    .isString()
    .isLength({ min: 2, max: 30 })
    .withMessage('Character name must be between 2 and 30 characters'),
  body('avatarUrl')
    .optional()
    .isURL()
    .withMessage('Avatar URL must be valid'),
  body('characterTheme')
    .optional()
    .isObject()
    .withMessage('Character theme must be an object'),
], asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError('Validation failed', 400, errors.array());
  }

  const { characterId } = req.params;
  const { name, avatarUrl, characterTheme } = req.body;
  const userId = req.user!.id;

  try {
    // Verify character belongs to user
    const character = await prisma.founderCharacter.findFirst({
      where: { id: characterId, userId }
    });

    if (!character) {
      throw new ApiError('Character not found', 404);
    }

    const updatedCharacter = await prisma.founderCharacter.update({
      where: { id: characterId },
      data: {
        ...(name && { name }),
        ...(avatarUrl && { avatarUrl }),
        ...(characterTheme && { characterTheme }),
        updatedAt: new Date(),
      },
      include: {
        user: { select: { displayName: true, walletAddress: true } },
        equipment: { where: { isEquipped: true } },
      }
    });

    res.json({
      success: true,
      data: {
        character: updatedCharacter,
        message: 'Character updated successfully!',
      },
    });
  } catch (error: any) {
    throw new ApiError(error.message || 'Failed to update character', 500);
  }
}));

export default router;