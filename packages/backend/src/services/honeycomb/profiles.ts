import { honeycombService } from './client';
import { prisma } from '../../config/database';

interface HoneycombProfileData {
  name: string;
  bio?: string;
  profilePicture?: string;
  walletAddress: string;
}

interface ProfileSyncResult {
  success: boolean;
  honeycombProfileId?: string;
  error?: string;
}

class HoneycombProfileService {
  /**
   * Create a user profile in both our database and Honeycomb
   */
  async createUserProfile(data: HoneycombProfileData): Promise<ProfileSyncResult> {
    try {
      // Create profile in Honeycomb
      const honeycombProfile = await honeycombService.createProfile(
        data.walletAddress,
        data.name,
        data.bio,
        data.profilePicture
      );

      console.log(`✅ Created Honeycomb profile for ${data.walletAddress}:`, honeycombProfile.id);

      return {
        success: true,
        honeycombProfileId: honeycombProfile.id,
      };
    } catch (error) {
      console.error('Failed to create Honeycomb profile:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Sync user data between our database and Honeycomb
   */
  async syncUserProfile(userId: string): Promise<ProfileSyncResult> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          badges: true,
          traits: true,
          teamMembers: {
            where: { isActive: true },
            include: { team: true },
          },
        },
      });

      if (!user) {
        return {
          success: false,
          error: 'User not found',
        };
      }

      // Get user progress from Honeycomb
      const honeycombProgress = await honeycombService.getUserProgress(user.walletAddress);

      // Sync badges if any new ones are found
      if (honeycombProgress.badges.length > 0) {
        await this.syncBadgesFromHoneycomb(userId, honeycombProgress.badges);
      }

      // Update user's total XP if it differs
      if (honeycombProgress.totalXp !== user.xpTotal) {
        await prisma.user.update({
          where: { id: userId },
          data: { xpTotal: honeycombProgress.totalXp },
        });

        console.log(`📈 Synced XP for user ${userId}: ${user.xpTotal} → ${honeycombProgress.totalXp}`);
      }

      return {
        success: true,
        honeycombProfileId: honeycombProgress.profile?.id,
      };
    } catch (error) {
      console.error('Failed to sync user profile:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Sync badges from Honeycomb to our database
   */
  private async syncBadgesFromHoneycomb(userId: string, honeycombBadges: any[]): Promise<void> {
    const existingBadges = await prisma.userBadge.findMany({
      where: { userId },
      select: { name: true },
    });

    const existingBadgeNames = new Set(existingBadges.map(b => b.name));

    for (const honeycombBadge of honeycombBadges) {
      if (!existingBadgeNames.has(honeycombBadge.name)) {
        try {
          await prisma.userBadge.create({
            data: {
              userId,
              name: honeycombBadge.name,
              description: honeycombBadge.uri || 'Achievement from Honeycomb',
              imageUrl: honeycombBadge.uri || '/badges/default.png',
              rarity: 'COMMON', // Default rarity
              earnedAt: new Date(),
              metadata: { 
                honeycombId: honeycombBadge.id,
                publicKey: honeycombBadge.publicKey,
              },
            },
          });

          console.log(`🏆 Synced badge "${honeycombBadge.name}" for user ${userId}`);
        } catch (error) {
          console.error(`Failed to sync badge ${honeycombBadge.name}:`, error);
        }
      }
    }
  }

  /**
   * Get comprehensive user profile data
   */
  async getUserProfileData(userId: string): Promise<{
    user: any;
    honeycombData?: any;
    syncStatus: 'synced' | 'outdated' | 'error';
  }> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          badges: {
            orderBy: { earnedAt: 'desc' },
          },
          traits: {
            orderBy: { level: 'desc' },
          },
          teamMembers: {
            where: { isActive: true },
            include: {
              team: {
                select: {
                  id: true,
                  name: true,
                  emblemUrl: true,
                  totalXp: true,
                  memberCount: true,
                },
              },
            },
          },
          territories: {
            include: {
              node: {
                select: {
                  id: true,
                  title: true,
                  difficulty: true,
                },
              },
            },
          },
          nodeProgress: {
            where: { status: 'COMPLETED' },
            include: {
              node: {
                select: {
                  id: true,
                  title: true,
                  difficulty: true,
                },
              },
            },
          },
        },
      });

      if (!user) {
        return {
          user: null,
          syncStatus: 'error',
        };
      }

      // Get Honeycomb data
      let honeycombData;
      let syncStatus: 'synced' | 'outdated' | 'error' = 'synced';

      try {
        honeycombData = await honeycombService.getUserProgress(user.walletAddress);
        
        // Check if data is outdated
        if (honeycombData.totalXp !== user.xpTotal || 
            honeycombData.badges.length !== user.badges.length) {
          syncStatus = 'outdated';
        }
      } catch (error) {
        console.error('Failed to get Honeycomb data:', error);
        syncStatus = 'error';
      }

      return {
        user,
        honeycombData,
        syncStatus,
      };
    } catch (error) {
      console.error('Failed to get user profile data:', error);
      return {
        user: null,
        syncStatus: 'error',
      };
    }
  }

  /**
   * Update user profile information
   */
  async updateUserProfile(userId: string, updates: {
    displayName?: string;
    bio?: string;
    avatarUrl?: string;
  }): Promise<{ success: boolean; error?: string }> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { walletAddress: true },
      });

      if (!user) {
        return { success: false, error: 'User not found' };
      }

      // Update in our database
      await prisma.user.update({
        where: { id: userId },
        data: updates,
      });

      // Optionally update in Honeycomb (if supported by their API)
      // This would require a profile update method in their SDK
      console.log(`📝 Updated profile for user ${userId}`);

      return { success: true };
    } catch (error) {
      console.error('Failed to update user profile:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get user statistics for profile display
   */
  async getUserStatistics(userId: string): Promise<{
    totalMissions: number;
    completedMissions: number;
    totalXp: number;
    badgeCount: number;
    teamCount: number;
    territoriesOwned: number;
    currentStreak: number;
    skillBreakdown: Record<string, { level: number; xp: number; progress: number }>;
  }> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        badges: true,
        traits: true,
        teamMembers: { where: { isActive: true } },
        territories: true,
        nodeProgress: true,
        submissions: {
          where: { status: 'APPROVED' },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!user) {
      return {
        totalMissions: 0,
        completedMissions: 0,
        totalXp: 0,
        badgeCount: 0,
        teamCount: 0,
        territoriesOwned: 0,
        currentStreak: 0,
        skillBreakdown: {},
      };
    }

    // Calculate skill breakdown
    const skillScores = user.skillScores as any;
    const skillBreakdown: Record<string, { level: number; xp: number; progress: number }> = {};

    for (const [skill, xp] of Object.entries(skillScores)) {
      const level = this.calculateSkillLevel(xp as number);
      const nextLevelXp = this.getXpForLevel(level + 1);
      const currentLevelXp = this.getXpForLevel(level);
      const progress = ((xp as number - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100;

      skillBreakdown[skill] = {
        level,
        xp: xp as number,
        progress: Math.max(0, Math.min(100, progress)),
      };
    }

    // Calculate current streak
    const currentStreak = this.calculateCurrentStreak(user.submissions);

    return {
      totalMissions: user.nodeProgress.length,
      completedMissions: user.submissions.length,
      totalXp: user.xpTotal,
      badgeCount: user.badges.length,
      teamCount: user.teamMembers.length,
      territoriesOwned: user.territories.length,
      currentStreak,
      skillBreakdown,
    };
  }

  /**
   * Calculate skill level from XP
   */
  private calculateSkillLevel(xp: number): number {
    const thresholds = [0, 100, 300, 700, 1500, 3000, 6000]; // From shared constants
    
    for (let i = thresholds.length - 1; i >= 0; i--) {
      if (xp >= thresholds[i]) {
        return i + 1;
      }
    }
    
    return 1;
  }

  /**
   * Get XP required for a specific level
   */
  private getXpForLevel(level: number): number {
    const thresholds = [0, 100, 300, 700, 1500, 3000, 6000];
    return thresholds[level - 1] || thresholds[thresholds.length - 1];
  }

  /**
   * Calculate current submission streak
   */
  private calculateCurrentStreak(submissions: any[]): number {
    if (submissions.length === 0) return 0;

    let streak = 1;
    const sortedSubmissions = submissions.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    for (let i = 1; i < sortedSubmissions.length; i++) {
      const current = new Date(sortedSubmissions[i].createdAt);
      const previous = new Date(sortedSubmissions[i - 1].createdAt);
      const daysDiff = Math.floor((previous.getTime() - current.getTime()) / (1000 * 60 * 60 * 24));

      if (daysDiff <= 1) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }
}

export const honeycombProfileService = new HoneycombProfileService();