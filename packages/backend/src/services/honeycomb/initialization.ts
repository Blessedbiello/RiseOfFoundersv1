import { honeycombService } from './client';
import { honeycombMissionService } from './missions';
import { honeycombBadgeService } from './badges';
import { PublicKey } from '@solana/web3.js';
import { isDevelopment } from '../../config/environment';

interface InitializationResult {
  success: boolean;
  projectCreated: boolean;
  missionsInitialized: number;
  badgesInitialized: number;
  errors: string[];
}

class HoneycombInitializationService {
  private isInitialized = false;
  private initializationPromise?: Promise<InitializationResult>;

  /**
   * Initialize the complete Honeycomb setup for Rise of Founders
   */
  async initializeHoneycombSetup(): Promise<InitializationResult> {
    if (this.isInitialized) {
      return {
        success: true,
        projectCreated: false,
        missionsInitialized: 0,
        badgesInitialized: 0,
        errors: ['Already initialized'],
      };
    }

    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = this._performInitialization();
    return this.initializationPromise;
  }

  private async _performInitialization(): Promise<InitializationResult> {
    const result: InitializationResult = {
      success: false,
      projectCreated: false,
      missionsInitialized: 0,
      badgesInitialized: 0,
      errors: [],
    };

    try {
      console.log('🍯 Starting Honeycomb Protocol initialization for Rise of Founders...');

      // Step 1: Initialize the base Honeycomb service
      await honeycombService.initialize();
      console.log('✅ Honeycomb client initialized');

      // Step 2: Create or verify project exists
      try {
        const projectInfo = honeycombService.getProjectInfo();
        if (projectInfo.publicKey) {
          console.log(`📋 Project exists: ${projectInfo.publicKey}`);
          result.projectCreated = true;
        } else {
          console.log('⚠️ Project not found, would need to create one manually');
          result.errors.push('Project setup required');
        }
      } catch (error) {
        console.error('❌ Failed to verify project:', error);
        result.errors.push(`Project verification failed: ${error}`);
      }

      // Step 3: Initialize game missions
      if (isDevelopment) {
        try {
          await honeycombMissionService.initializeGameMissions();
          result.missionsInitialized = this.getMissionCount();
          console.log(`✅ Initialized ${result.missionsInitialized} missions`);
        } catch (error) {
          console.error('❌ Failed to initialize missions:', error);
          result.errors.push(`Mission initialization failed: ${error}`);
        }
      }

      // Step 4: Initialize game badges
      if (isDevelopment) {
        try {
          await honeycombBadgeService.initializeGameBadges();
          result.badgesInitialized = honeycombBadgeService.getBadgeDefinitions().length;
          console.log(`✅ Initialized ${result.badgesInitialized} badges`);
        } catch (error) {
          console.error('❌ Failed to initialize badges:', error);
          result.errors.push(`Badge initialization failed: ${error}`);
        }
      }

      // Step 5: Mark as initialized if successful
      if (result.errors.length === 0) {
        this.isInitialized = true;
        result.success = true;
        console.log('🎉 Honeycomb initialization completed successfully!');
      } else {
        console.log('⚠️ Honeycomb initialization completed with errors:', result.errors);
      }

    } catch (error) {
      console.error('❌ Critical error during Honeycomb initialization:', error);
      result.errors.push(`Critical initialization error: ${error}`);
    }

    return result;
  }

  /**
   * Get the count of missions to be initialized
   */
  private getMissionCount(): number {
    // Count of missions defined in the mission service
    return 5; // This should match the number of missions in initializeGameMissions
  }

  /**
   * Check if Honeycomb is properly initialized
   */
  isHoneycombReady(): boolean {
    return this.isInitialized && honeycombService.getProjectInfo().isInitialized;
  }

  /**
   * Reinitialize Honeycomb (useful for development)
   */
  async reinitialize(): Promise<InitializationResult> {
    console.log('🔄 Reinitializing Honeycomb setup...');
    this.isInitialized = false;
    this.initializationPromise = undefined;
    return this.initializeHoneycombSetup();
  }

  /**
   * Get initialization status
   */
  getInitializationStatus(): {
    isInitialized: boolean;
    projectInfo: { publicKey: string; isInitialized: boolean };
  } {
    return {
      isInitialized: this.isInitialized,
      projectInfo: honeycombService.getProjectInfo(),
    };
  }

  /**
   * Setup project manually (for production setup)
   */
  async setupProject(
    projectName: string,
    authorityPublicKey: string
  ): Promise<{ success: boolean; projectId?: string; error?: string }> {
    try {
      console.log(`🏗️ Setting up Honeycomb project: ${projectName}`);
      
      const authority = new PublicKey(authorityPublicKey);
      const project = await honeycombService.createProject(projectName, authority);
      
      console.log(`✅ Project created successfully: ${project.id}`);
      
      return {
        success: true,
        projectId: project.id,
      };
    } catch (error) {
      console.error('❌ Failed to setup project:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Health check for Honeycomb integration
   */
  async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    details: {
      clientInitialized: boolean;
      projectReady: boolean;
      canCreateProfile: boolean;
      lastError?: string;
    };
  }> {
    const details = {
      clientInitialized: honeycombService.getProjectInfo().isInitialized,
      projectReady: this.isInitialized,
      canCreateProfile: false,
      lastError: undefined as string | undefined,
    };

    try {
      // Test basic functionality by trying to get auth challenge
      if (details.clientInitialized) {
        await honeycombService.getAuthChallenge('11111111111111111111111111111112'); // Test with dummy address
        details.canCreateProfile = true;
      }
    } catch (error) {
      details.lastError = error instanceof Error ? error.message : 'Unknown error';
    }

    let status: 'healthy' | 'degraded' | 'unhealthy';
    
    if (details.clientInitialized && details.projectReady && details.canCreateProfile) {
      status = 'healthy';
    } else if (details.clientInitialized || details.projectReady) {
      status = 'degraded';
    } else {
      status = 'unhealthy';
    }

    return { status, details };
  }
}

export const honeycombInitializationService = new HoneycombInitializationService();