import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/environment';
import { prisma } from '../config/database';
import { UserRole } from '@prisma/client';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    walletAddress: string;
    role: UserRole;
    email?: string;
    isVerified: boolean;
    subscription?: string;
  };
}

export const validateAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Access denied. No token provided or invalid format.',
      });
    }
    
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    try {
      const decoded = jwt.verify(token, config.JWT_SECRET) as {
        userId: string;
        walletAddress: string;
        role: UserRole;
        email?: string;
      };
      
      // Verify user still exists and is active
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          walletAddress: true,
          role: true,
          email: true,
          lastActive: true,
          isVerified: true,
        },
      });
      
      if (!user) {
        return res.status(401).json({
          error: 'Access denied. User not found.',
        });
      }
      
      // Update last active timestamp
      await prisma.user.update({
        where: { id: user.id },
        data: { lastActive: new Date() },
      });
      
      req.user = {
        id: user.id,
        walletAddress: user.walletAddress,
        role: user.role,
        email: user.email || undefined,
        isVerified: user.isVerified || false,
        subscription: undefined,
      };
      
      next();
    } catch (jwtError) {
      return res.status(401).json({
        error: 'Access denied. Invalid token.',
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      error: 'Internal server error during authentication.',
    });
  }
};

export const requireRole = (allowedRoles: UserRole | UserRole[]) => {
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required.',
      });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Insufficient permissions.',
        required: roles,
        current: req.user.role,
      });
    }
    
    next();
  };
};

export const requireAdmin = requireRole([UserRole.ADMIN]);
export const requireModerator = requireRole([UserRole.ADMIN, UserRole.MODERATOR]);
export const requireSponsor = requireRole([UserRole.ADMIN, UserRole.SPONSOR]);
export const requireMentor = requireRole([UserRole.ADMIN, UserRole.MENTOR]);

export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(); // Continue without authentication
  }
  
  try {
    await validateAuth(req, res, next);
  } catch (error) {
    // If authentication fails, continue without user context
    next();
  }
};

export const generateToken = (user: {
  id: string;
  walletAddress: string;
  role: UserRole;
  email?: string;
  isVerified?: boolean;
}): string => {
  const payload = {
    userId: user.id,
    walletAddress: user.walletAddress,
    role: user.role,
    email: user.email,
    isVerified: user.isVerified || false,
  };
  
  const secret = config.JWT_SECRET;
  const options = { 
    expiresIn: config.JWT_EXPIRE_TIME
  };
  
  return jwt.sign(payload, secret, options as any);
};

export const verifyWalletSignature = (
  message: string,
  signature: string,
  publicKey: string
): boolean => {
  try {
    // This would implement actual Solana signature verification
    // For now, we'll use a placeholder implementation
    // In production, use @solana/web3.js to verify the signature
    
    // Example implementation:
    // import { PublicKey } from '@solana/web3.js';
    // import nacl from 'tweetnacl';
    // 
    // const messageBytes = new TextEncoder().encode(message);
    // const signatureBytes = Buffer.from(signature, 'base64');
    // const publicKeyBytes = new PublicKey(publicKey).toBytes();
    // 
    // return nacl.sign.detached.verify(messageBytes, signatureBytes, publicKeyBytes);
    
    // Placeholder validation (replace with actual implementation)
    return signature.length > 50 && publicKey.length > 30;
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
};