import { Router, Response } from 'express';
import { param, query } from 'express-validator';
import { prisma } from '../config/database';
import { AuthenticatedRequest } from '../middleware/auth';
import { ApiError, asyncHandler } from '../middleware/errorHandler';

const router = Router();

// GET /game/maps - Get all game maps
router.get('/maps', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const maps = await prisma.gameMap.findMany({
    where: { isActive: true },
    include: {
      nodes: {
        include: {
          territories: {
            include: {
              controllerUser: {
                select: { id: true, displayName: true, avatarUrl: true },
              },
              controllerTeam: {
                select: { id: true, name: true, emblemUrl: true },
              },
            },
          },
          progress: {
            where: { userId: req.user!.id },
          },
        },
        orderBy: { order: 'asc' },
      },
    },
    orderBy: { order: 'asc' },
  });

  res.json({
    success: true,
    data: maps,
  });
}));

// GET /game/maps/:id - Get specific map with detailed nodes
router.get('/maps/:id', [
  param('id').isString(),
], asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  const map = await prisma.gameMap.findUnique({
    where: { id },
    include: {
      nodes: {
        include: {
          missions: true,
          territories: {
            include: {
              controllerUser: {
                select: { id: true, displayName: true, avatarUrl: true },
              },
              controllerTeam: {
                select: { id: true, name: true, emblemUrl: true },
              },
            },
          },
          progress: {
            where: { userId: req.user!.id },
          },
          submissions: {
            where: { 
              submitterType: 'USER',
              submitterId: req.user!.id,
            },
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
        orderBy: { order: 'asc' },
      },
    },
  });

  if (!map) {
    throw new ApiError('Map not found', 404);
  }

  res.json({
    success: true,
    data: map,
  });
}));

// GET /game/nodes/:id - Get specific node details
router.get('/nodes/:id', [
  param('id').isString(),
], asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  const node = await prisma.mapNode.findUnique({
    where: { id },
    include: {
      map: {
        select: { id: true, name: true, skillTag: true },
      },
      missions: {
        where: { isActive: true },
      },
      territories: {
        include: {
          controllerUser: {
            select: { id: true, displayName: true, avatarUrl: true },
          },
          controllerTeam: {
            select: { id: true, name: true, emblemUrl: true },
          },
        },
      },
      progress: {
        where: { userId: req.user!.id },
      },
      submissions: {
        where: { 
          submitterType: 'USER',
          submitterId: req.user!.id,
        },
        orderBy: { createdAt: 'desc' },
        include: {
          reviews: {
            include: {
              reviewer: {
                select: { id: true, displayName: true, avatarUrl: true },
              },
            },
          },
        },
      },
      challenges: {
        where: {
          OR: [
            { challengerId: req.user!.id, challengerType: 'USER' },
            { defenderId: req.user!.id, defenderType: 'USER' },
          ],
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
  });

  if (!node) {
    throw new ApiError('Node not found', 404);
  }

  res.json({
    success: true,
    data: node,
  });
}));

// GET /game/progress - Get user's overall progress
router.get('/progress', [
  query('mapId').optional().isString(),
], asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { mapId } = req.query;

  const whereClause: any = { userId: req.user!.id };
  if (mapId) {
    whereClause.node = { mapId: mapId as string };
  }

  const progress = await prisma.nodeProgress.findMany({
    where: whereClause,
    include: {
      node: {
        include: {
          map: {
            select: { id: true, name: true, skillTag: true },
          },
        },
      },
    },
    orderBy: { lastAttemptAt: 'desc' },
  });

  // Calculate summary statistics
  const totalNodes = await prisma.mapNode.count({
    where: mapId ? { mapId: mapId as string } : undefined,
  });

  const completedNodes = progress.filter(p => p.status === 'COMPLETED').length;
  const inProgressNodes = progress.filter(p => p.status === 'IN_PROGRESS').length;
  const availableNodes = progress.filter(p => p.status === 'AVAILABLE').length;

  const summary = {
    totalNodes,
    completedNodes,
    inProgressNodes,
    availableNodes,
    completionRate: totalNodes > 0 ? (completedNodes / totalNodes) * 100 : 0,
  };

  res.json({
    success: true,
    data: {
      progress,
      summary,
    },
  });
}));

// GET /game/territories - Get territories controlled by user/teams
router.get('/territories', [
  query('controllerId').optional().isString(),
  query('controllerType').optional().isIn(['USER', 'TEAM']),
], asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { controllerId, controllerType } = req.query;

  let whereClause: any = {};

  if (controllerId && controllerType) {
    whereClause = {
      controllerId: controllerId as string,
      controllerType: controllerType as any,
    };
  } else {
    // Default to current user's territories
    whereClause = {
      controllerId: req.user!.id,
      controllerType: 'USER',
    };
  }

  const territories = await prisma.territory.findMany({
    where: whereClause,
    include: {
      node: {
        include: {
          map: {
            select: { id: true, name: true },
          },
        },
      },
      controllerUser: {
        select: { id: true, displayName: true, avatarUrl: true },
      },
      controllerTeam: {
        select: { id: true, name: true, emblemUrl: true },
      },
    },
    orderBy: { controlledAt: 'desc' },
  });

  res.json({
    success: true,
    data: territories,
  });
}));

export default router;