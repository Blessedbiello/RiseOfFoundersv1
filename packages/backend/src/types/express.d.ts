// Centralized Express type extensions
declare global {
  namespace Express {
    interface Request {
      requestId?: string;
      sessionID?: string;
      rateLimit?: {
        limit: number;
        remaining: number;
        resetTime: number;
        message?: string;
      };
      user?: {
        id: string;
        walletAddress: string;
        role: string;
        email?: string;
        isVerified: boolean;
        subscription?: string;
      };
    }
  }
}

export {};