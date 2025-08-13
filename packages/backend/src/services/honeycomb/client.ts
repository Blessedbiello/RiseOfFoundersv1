import { createEdgeClient, EdgeClient } from '@honeycomb-protocol/edge-client';
import { PublicKey, Keypair } from '@solana/web3.js';
import bs58 from 'bs58';
import { honeycombConfig, isDevelopment } from '../../config/environment';

interface HoneycombAuthResult {
  accessToken: string;
  user: {
    id: string;
    wallet: string;
  };
}

interface HoneycombProject {
  id: string;
  publicKey: string;
  name: string;
  authority: string;
}

interface HoneycombProfile {
  id: string;
  publicKey: string;
  name: string;
  bio?: string;
  pfp?: string;
}

interface HoneycombBadge {
  id: string;
  publicKey: string;
  project: string;
  name: string;
  uri: string;
  criteria: {
    startTime?: number;
    endTime?: number;
    index: number;
  };
}

interface HoneycombMissionData {
  id: string;
  name: string;
  description: string;
  project: string;
  guild?: string;
  cost?: {
    amount: number;
    mint: string;
  }[];
  reward?: {
    amount: number;
    mint: string;
  }[];
}

class HoneycombService {
  private client: EdgeClient;
  private isInitialized = false;
  private projectPublicKey?: PublicKey;
  private projectKeypair?: Keypair;

  constructor() {
    console.log('🍯 Initializing Honeycomb Protocol Edge Client...');
    
    this.client = createEdgeClient({
      url: honeycombConfig.environment === 'development' 
        ? 'https://edge.test.honeycombprotocol.com/'
        : 'https://edge.honeycombprotocol.com/', // Production URL when available
      debug: isDevelopment,
    });
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Initialize project keypair for server operations
      if (!process.env.HONEYCOMB_PROJECT_KEYPAIR) {
        console.warn('⚠️ No HONEYCOMB_PROJECT_KEYPAIR provided. Generating new keypair for development.');
        this.projectKeypair = Keypair.generate();
        console.log(`🔑 Generated project keypair: ${this.projectKeypair.publicKey.toString()}`);
      } else {
        const secretKey = bs58.decode(process.env.HONEYCOMB_PROJECT_KEYPAIR);
        this.projectKeypair = Keypair.fromSecretKey(secretKey);
      }

      this.projectPublicKey = this.projectKeypair.publicKey;
      this.isInitialized = true;

      console.log('✅ Honeycomb service initialized successfully');
      console.log(`📍 Project Public Key: ${this.projectPublicKey.toString()}`);
    } catch (error) {
      console.error('❌ Failed to initialize Honeycomb service:', error);
      throw error;
    }
  }

  /**
   * Authenticate a user with their wallet signature
   */
  async authenticateUser(walletAddress: string, signature: string, message: string): Promise<HoneycombAuthResult> {
    await this.initialize();

    try {
      // Step 1: Request authentication challenge
      const { authRequest } = await this.client.authRequest({
        wallet: walletAddress,
      });

      if (authRequest.message !== message) {
        throw new Error('Authentication message mismatch');
      }

      // Step 2: Confirm authentication with signature
      const { authConfirm } = await this.client.authConfirm({
        wallet: walletAddress,
        signature,
      });

      return {
        accessToken: authConfirm.accessToken,
        user: {
          id: authConfirm.user.id,
          wallet: walletAddress,
        },
      };
    } catch (error) {
      console.error('Authentication failed:', error);
      throw new Error('Failed to authenticate with Honeycomb Protocol');
    }
  }

  /**
   * Get authentication challenge message for a wallet
   */
  async getAuthChallenge(walletAddress: string): Promise<string> {
    try {
      const { authRequest } = await this.client.authRequest({
        wallet: walletAddress,
      });

      return authRequest.message;
    } catch (error) {
      console.error('Failed to get auth challenge:', error);
      throw new Error('Failed to get authentication challenge');
    }
  }

  /**
   * Create a new Honeycomb project for our game
   */
  async createProject(name: string, authority: PublicKey): Promise<HoneycombProject> {
    await this.initialize();

    try {
      const transaction = await this.client.createCreateProjectTransaction({
        name,
        authority: authority.toString(),
        payer: this.projectKeypair!.publicKey.toString(),
        profileDataConfig: {
          achievements: ['Founder', 'Builder', 'Innovator', 'Leader'],
          customDataFields: ['xp_total', 'skill_scores', 'reputation_score', 'badges_earned'],
        },
      });

      // In a real implementation, you would sign and send this transaction
      console.log('📋 Project creation transaction prepared:', transaction);

      // Return mock project data for now
      return {
        id: `project_${Date.now()}`,
        publicKey: this.projectPublicKey!.toString(),
        name,
        authority: authority.toString(),
      };
    } catch (error) {
      console.error('Failed to create project:', error);
      throw new Error('Failed to create Honeycomb project');
    }
  }

  /**
   * Create a user profile
   */
  async createProfile(
    userWallet: string,
    name: string,
    bio?: string,
    profilePicture?: string
  ): Promise<HoneycombProfile> {
    try {
      const transaction = await this.client.createNewProfileTransaction({
        project: this.projectPublicKey!.toString(),
        name,
        bio: bio || '',
        pfp: profilePicture || '',
        payer: userWallet,
      });

      console.log('👤 Profile creation transaction prepared:', transaction);

      return {
        id: `profile_${Date.now()}`,
        publicKey: `profile_pk_${Date.now()}`,
        name,
        bio,
        pfp: profilePicture,
      };
    } catch (error) {
      console.error('Failed to create profile:', error);
      throw new Error('Failed to create user profile');
    }
  }

  /**
   * Create a badge (achievement) for the game
   */
  async createBadge(
    name: string,
    metadataUri: string,
    startTime?: Date,
    endTime?: Date
  ): Promise<HoneycombBadge> {
    await this.initialize();

    try {
      const transaction = await this.client.createCreateBadgeCriteriaTransaction({
        project: this.projectPublicKey!.toString(),
        authority: this.projectKeypair!.publicKey.toString(),
        payer: this.projectKeypair!.publicKey.toString(),
        name,
        uri: metadataUri,
        startTime: startTime ? Math.floor(startTime.getTime() / 1000) : undefined,
        endTime: endTime ? Math.floor(endTime.getTime() / 1000) : undefined,
        index: Math.floor(Math.random() * 1000), // Generate unique index
      });

      console.log('🏆 Badge creation transaction prepared:', transaction);

      return {
        id: `badge_${Date.now()}`,
        publicKey: `badge_pk_${Date.now()}`,
        project: this.projectPublicKey!.toString(),
        name,
        uri: metadataUri,
        criteria: {
          startTime: startTime ? Math.floor(startTime.getTime() / 1000) : undefined,
          endTime: endTime ? Math.floor(endTime.getTime() / 1000) : undefined,
          index: Math.floor(Math.random() * 1000),
        },
      };
    } catch (error) {
      console.error('Failed to create badge:', error);
      throw new Error('Failed to create badge');
    }
  }

  /**
   * Create a mission for players to complete
   */
  async createMission(missionData: Omit<HoneycombMissionData, 'id'>): Promise<HoneycombMissionData> {
    await this.initialize();

    try {
      // Note: The actual mission creation API might be different
      // This is based on the general pattern observed in the documentation
      console.log('🎯 Creating mission:', missionData);

      // In a real implementation, this would call the appropriate Honeycomb API
      const mission: HoneycombMissionData = {
        id: `mission_${Date.now()}`,
        ...missionData,
      };

      console.log('✅ Mission created:', mission);
      return mission;
    } catch (error) {
      console.error('Failed to create mission:', error);
      throw new Error('Failed to create mission');
    }
  }

  /**
   * Complete a mission for a user
   */
  async completeMission(
    missionId: string,
    userWallet: string,
    evidence?: any[]
  ): Promise<{
    success: boolean;
    rewards: any[];
    transactionHash?: string;
  }> {
    try {
      console.log(`🎉 Completing mission ${missionId} for user ${userWallet}`);

      // In a real implementation, this would:
      // 1. Verify the mission completion criteria
      // 2. Update the user's progress
      // 3. Distribute rewards
      // 4. Update badges/achievements

      return {
        success: true,
        rewards: [
          {
            type: 'xp',
            amount: 100,
            description: 'Mission completion XP',
          },
          {
            type: 'badge',
            badgeId: 'builder_badge',
            description: 'Builder achievement unlocked',
          },
        ],
        transactionHash: `tx_${Date.now()}`,
      };
    } catch (error) {
      console.error('Failed to complete mission:', error);
      throw new Error('Failed to complete mission');
    }
  }

  /**
   * Get user's progress and achievements
   */
  async getUserProgress(userWallet: string): Promise<{
    profile?: HoneycombProfile;
    badges: HoneycombBadge[];
    missions: any[];
    totalXp: number;
  }> {
    try {
      console.log(`📊 Getting progress for user ${userWallet}`);

      // In a real implementation, this would query the user's on-chain data
      return {
        profile: undefined, // Would be fetched from Honeycomb
        badges: [], // Would be fetched from Honeycomb
        missions: [], // Would be fetched from Honeycomb
        totalXp: 0, // Would be calculated from mission completions
      };
    } catch (error) {
      console.error('Failed to get user progress:', error);
      throw new Error('Failed to get user progress');
    }
  }

  /**
   * Get the project information
   */
  getProjectInfo(): { publicKey: string; isInitialized: boolean } {
    return {
      publicKey: this.projectPublicKey?.toString() || '',
      isInitialized: this.isInitialized,
    };
  }
}

// Export singleton instance
export const honeycombService = new HoneycombService();