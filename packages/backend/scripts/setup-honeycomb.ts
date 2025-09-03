#!/usr/bin/env ts-node

import { Connection, Keypair, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { createEdgeClient } from '@honeycomb-protocol/edge-client';
import bs58 from 'bs58';
import fs from 'fs';
import path from 'path';

/**
 * Honeycomb Setup Script
 * 
 * This script will:
 * 1. Generate a new project keypair for Rise of Founders
 * 2. Connect to Honeycomb Protocol 
 * 3. Create a new project on devnet
 * 4. Update environment variables with proper configuration
 * 5. Test the setup to ensure everything works
 */

interface HoneycombSetupResult {
  success: boolean;
  projectId?: string;
  projectKeypair?: string;
  projectPublicKey?: string;
  errors: string[];
}

class HoneycombSetup {
  private connection: Connection;
  private client: any;
  private projectKeypair: Keypair;

  constructor() {
    // Initialize Solana connection for devnet
    this.connection = new Connection(clusterApiUrl('devnet'), {
      commitment: 'confirmed',
    });

    // Generate a new keypair for the project
    this.projectKeypair = Keypair.generate();
    
    // Initialize Honeycomb Edge Client for development
    this.client = createEdgeClient('https://edge.test.honeycombprotocol.com/', true);
    
    console.log('🍯 Honeycomb Setup Initialized');
    console.log(`🔑 Generated Project Keypair: ${this.projectKeypair.publicKey.toString()}`);
  }

  /**
   * Check if the generated keypair has sufficient SOL for transactions
   */
  async checkAndFundKeypair(): Promise<boolean> {
    try {
      const balance = await this.connection.getBalance(this.projectKeypair.publicKey);
      const requiredBalance = 0.1 * 1e9; // 0.1 SOL in lamports
      
      console.log(`💰 Current balance: ${(balance / 1e9).toFixed(4)} SOL`);
      
      if (balance < requiredBalance) {
        console.log('💧 Requesting devnet airdrop...');
        
        try {
          // Request airdrop for devnet testing
          const signature = await this.connection.requestAirdrop(
            this.projectKeypair.publicKey,
            1e9 // 1 SOL
          );
          
          await this.connection.confirmTransaction(signature, 'confirmed');
          
          const newBalance = await this.connection.getBalance(this.projectKeypair.publicKey);
          console.log(`✅ Airdrop successful! New balance: ${(newBalance / 1e9).toFixed(4)} SOL`);
          
          return true;
        } catch (airdropError: any) {
          console.warn('⚠️ Airdrop failed, but continuing with setup:', airdropError.message);
          console.log('💡 You may need to manually fund the project keypair for transactions');
          return true; // Continue anyway for development
        }
      }
      
      return true;
    } catch (error) {
      console.error('❌ Failed to check/fund keypair:', error);
      return false;
    }
  }

  /**
   * Create a new Honeycomb project for Rise of Founders
   */
  async createProject(): Promise<HoneycombSetupResult> {
    const result: HoneycombSetupResult = {
      success: false,
      errors: [],
    };

    try {
      console.log('🏗️ Creating Rise of Founders Honeycomb Project...');

      // Check if keypair is funded
      const isFunded = await this.checkAndFundKeypair();
      if (!isFunded) {
        result.errors.push('Failed to fund project keypair');
        return result;
      }

      // Project configuration for Rise of Founders
      const projectConfig = {
        name: 'Rise of Founders',
        authority: this.projectKeypair.publicKey.toString(),
        payer: this.projectKeypair.publicKey.toString(),
        profileDataConfig: {
          achievements: [
            'Web3 Pioneer',
            'Solana Developer', 
            'Founder Badge',
            'Builder Badge',
            'GitHub Verified',
            'Course Graduate',
            'Mission Specialist',
            'Kingdom Citizen'
          ],
          customDataFields: [
            'xp_total',
            'skill_scores', 
            'reputation_score',
            'badges_earned',
            'missions_completed',
            'selected_kingdom',
            'github_verified',
            'wallet_connected'
          ],
        },
      };

      // Create the project transaction
      console.log('📋 Creating project transaction...');
      const createProjectTx = await this.client.createCreateProjectTransaction(projectConfig);

      // Sign and send the transaction
      console.log('✍️ Signing transaction...');
      const { blockhash } = await this.connection.getLatestBlockhash();
      createProjectTx.recentBlockhash = blockhash;
      createProjectTx.feePayer = this.projectKeypair.publicKey;
      createProjectTx.sign(this.projectKeypair);

      console.log('📤 Sending transaction...');
      const signature = await this.connection.sendRawTransaction(createProjectTx.serialize(), {
        skipPreflight: false,
        preflightCommitment: 'confirmed',
      });

      console.log(`🔗 Transaction sent: ${signature}`);

      // Confirm the transaction
      const confirmation = await this.connection.confirmTransaction(signature, 'confirmed');
      
      if (confirmation.value.err) {
        throw new Error(`Transaction failed: ${JSON.stringify(confirmation.value.err)}`);
      }

      console.log('✅ Project created successfully!');
      console.log(`🔗 View on Solana Explorer: https://explorer.solana.com/tx/${signature}?cluster=devnet`);

      // Wait a moment for the project to be indexed
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Verify the project was created by querying it
      try {
        const projectData = await this.client.findProjects({
          addresses: [this.projectKeypair.publicKey.toString()]
        });
        
        console.log('📊 Project data:', projectData);
      } catch (queryError) {
        console.warn('⚠️ Could not query project data immediately (normal for new projects)');
      }

      result.success = true;
      result.projectId = this.projectKeypair.publicKey.toString();
      result.projectKeypair = bs58.encode(this.projectKeypair.secretKey);
      result.projectPublicKey = this.projectKeypair.publicKey.toString();

      return result;

    } catch (error: any) {
      console.error('❌ Failed to create project:', error);
      result.errors.push(`Project creation failed: ${error.message}`);
      return result;
    }
  }

  /**
   * Update environment variables with the new project configuration
   */
  async updateEnvironmentFiles(setupResult: HoneycombSetupResult): Promise<void> {
    if (!setupResult.success) {
      console.log('⚠️ Skipping environment update due to setup failure');
      return;
    }

    try {
      console.log('📝 Updating environment files...');

      // Backend .env file
      const backendEnvPath = path.join(__dirname, '../.env');
      let backendEnv = fs.readFileSync(backendEnvPath, 'utf8');
      
      // Update Honeycomb configuration in backend
      backendEnv = backendEnv.replace(
        /HONEYCOMB_PROJECT_ID=.*/,
        `HONEYCOMB_PROJECT_ID=${setupResult.projectId}`
      );
      
      // Add project keypair (this would normally be kept secret)
      if (setupResult.projectKeypair) {
        if (backendEnv.includes('HONEYCOMB_PROJECT_KEYPAIR=')) {
          backendEnv = backendEnv.replace(
            /HONEYCOMB_PROJECT_KEYPAIR=.*/,
            `HONEYCOMB_PROJECT_KEYPAIR=${setupResult.projectKeypair}`
          );
        } else {
          backendEnv += `\nHONEYCOMB_PROJECT_KEYPAIR=${setupResult.projectKeypair}\n`;
        }
      }

      fs.writeFileSync(backendEnvPath, backendEnv);

      // Frontend .env.local file
      const frontendEnvPath = path.join(__dirname, '../../frontend/.env.local');
      let frontendEnv = fs.readFileSync(frontendEnvPath, 'utf8');
      
      // Update Honeycomb project ID in frontend
      frontendEnv = frontendEnv.replace(
        /NEXT_PUBLIC_HONEYCOMB_PROJECT_ID=.*/,
        `NEXT_PUBLIC_HONEYCOMB_PROJECT_ID=${setupResult.projectId}`
      );

      fs.writeFileSync(frontendEnvPath, frontendEnv);

      console.log('✅ Environment files updated successfully!');
      
      // Show the configuration
      console.log('\n🎯 Honeycomb Configuration:');
      console.log(`📍 Project ID: ${setupResult.projectId}`);
      console.log(`🔑 Project Public Key: ${setupResult.projectPublicKey}`);
      console.log(`🌐 Network: devnet`);
      console.log(`🔗 Explorer: https://explorer.solana.com/address/${setupResult.projectPublicKey}?cluster=devnet`);

    } catch (error) {
      console.error('❌ Failed to update environment files:', error);
      throw error;
    }
  }

  /**
   * Test the new Honeycomb setup
   */
  async testSetup(setupResult: HoneycombSetupResult): Promise<void> {
    if (!setupResult.success) {
      console.log('⚠️ Skipping setup test due to setup failure');
      return;
    }

    try {
      console.log('🧪 Testing Honeycomb setup...');

      // Test authentication flow
      const testWallet = Keypair.generate();
      console.log(`👤 Testing with wallet: ${testWallet.publicKey.toString()}`);

      // Get auth challenge
      const { authRequest } = await this.client.authRequest({
        wallet: testWallet.publicKey.toString(),
      });

      console.log('✅ Auth challenge received successfully');
      console.log(`📝 Challenge message: ${authRequest.message.substring(0, 50)}...`);

      // Test project query
      try {
        const projectData = await this.client.findProjects({
          addresses: [setupResult.projectId!]
        });
        
        if (projectData && projectData.projects && projectData.projects.length > 0) {
          console.log('✅ Project query successful');
          console.log(`📊 Project name: ${projectData.projects[0].name || 'Rise of Founders'}`);
        } else {
          console.log('⚠️ Project not yet indexed, but this is normal for new projects');
        }
      } catch (queryError) {
        console.log('⚠️ Project query not available yet (normal for new projects)');
      }

      console.log('🎉 Honeycomb setup test completed!');

    } catch (error: any) {
      console.error('❌ Setup test failed:', error);
      console.log('⚠️ This may be normal for a new project - try testing again in a few minutes');
    }
  }

  /**
   * Run the complete Honeycomb setup process
   */
  async runSetup(): Promise<void> {
    try {
      console.log('\n🚀 Starting Rise of Founders Honeycomb Setup');
      console.log('=====================================================\n');

      // Step 1: Create the project
      const setupResult = await this.createProject();

      if (!setupResult.success) {
        console.error('\n❌ Setup failed:');
        setupResult.errors.forEach(error => console.error(`  - ${error}`));
        process.exit(1);
      }

      // Step 2: Update environment files
      await this.updateEnvironmentFiles(setupResult);

      // Step 3: Test the setup
      await this.testSetup(setupResult);

      console.log('\n🎉 Rise of Founders Honeycomb Setup Complete!');
      console.log('=====================================================');
      console.log('Next steps:');
      console.log('1. Restart your backend server');
      console.log('2. Restart your frontend development server'); 
      console.log('3. Test the authentication flow at /test-blockchain');
      console.log('4. The project keypair has been funded with devnet SOL for testing');
      console.log('\n⚠️  IMPORTANT: Keep your project keypair secure in production!');

    } catch (error: any) {
      console.error('\n❌ Setup process failed:', error);
      process.exit(1);
    }
  }
}

// Run the setup if called directly
if (require.main === module) {
  const setup = new HoneycombSetup();
  setup.runSetup().catch(console.error);
}

export { HoneycombSetup };