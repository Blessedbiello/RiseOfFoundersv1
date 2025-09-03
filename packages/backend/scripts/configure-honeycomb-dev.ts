#!/usr/bin/env ts-node

import { Keypair } from '@solana/web3.js';
import bs58 from 'bs58';
import fs from 'fs';
import path from 'path';

/**
 * Simple Honeycomb Development Configuration
 * 
 * This script sets up Honeycomb for development without requiring on-chain transactions.
 * It generates the necessary keypairs and updates environment variables for local testing.
 */

class HoneycombDevConfig {
  private projectKeypair: Keypair;

  constructor() {
    // Generate a new keypair for development
    this.projectKeypair = Keypair.generate();
    console.log('🍯 Honeycomb Development Configuration');
    console.log(`🔑 Generated Project Keypair: ${this.projectKeypair.publicKey.toString()}`);
  }

  /**
   * Update environment files with development configuration
   */
  async updateEnvironmentFiles(): Promise<void> {
    try {
      console.log('📝 Updating environment files for development...');

      const projectId = this.projectKeypair.publicKey.toString();
      const projectKeypair = bs58.encode(this.projectKeypair.secretKey);

      // Backend .env file
      const backendEnvPath = path.join(__dirname, '../.env');
      let backendEnv = fs.readFileSync(backendEnvPath, 'utf8');
      
      // Update Honeycomb configuration in backend
      backendEnv = backendEnv.replace(
        /HONEYCOMB_PROJECT_ID=.*/,
        `HONEYCOMB_PROJECT_ID=${projectId}`
      );

      backendEnv = backendEnv.replace(
        /HONEYCOMB_API_KEY=.*/,
        `HONEYCOMB_API_KEY=dev_api_key_${Date.now()}`
      );
      
      // Add project keypair
      if (backendEnv.includes('HONEYCOMB_PROJECT_KEYPAIR=')) {
        backendEnv = backendEnv.replace(
          /HONEYCOMB_PROJECT_KEYPAIR=.*/,
          `HONEYCOMB_PROJECT_KEYPAIR=${projectKeypair}`
        );
      } else {
        backendEnv += `\nHONEYCOMB_PROJECT_KEYPAIR=${projectKeypair}\n`;
      }

      fs.writeFileSync(backendEnvPath, backendEnv);

      // Frontend .env.local file
      const frontendEnvPath = path.join(__dirname, '../../frontend/.env.local');
      let frontendEnv = fs.readFileSync(frontendEnvPath, 'utf8');
      
      // Update Honeycomb project ID in frontend
      frontendEnv = frontendEnv.replace(
        /NEXT_PUBLIC_HONEYCOMB_PROJECT_ID=.*/,
        `NEXT_PUBLIC_HONEYCOMB_PROJECT_ID=${projectId}`
      );

      fs.writeFileSync(frontendEnvPath, frontendEnv);

      console.log('✅ Environment files updated successfully!');
      
      // Show the configuration
      console.log('\n🎯 Development Configuration:');
      console.log(`📍 Project ID: ${projectId}`);
      console.log(`🔑 Project Public Key: ${this.projectKeypair.publicKey.toString()}`);
      console.log(`🌐 Network: devnet`);
      console.log(`🔗 Explorer: https://explorer.solana.com/address/${projectId}?cluster=devnet`);

    } catch (error) {
      console.error('❌ Failed to update environment files:', error);
      throw error;
    }
  }

  /**
   * Create a simple configuration info file for reference
   */
  async createConfigFile(): Promise<void> {
    try {
      const configData = {
        projectId: this.projectKeypair.publicKey.toString(),
        projectPublicKey: this.projectKeypair.publicKey.toString(),
        network: 'devnet',
        environment: 'development',
        createdAt: new Date().toISOString(),
        notes: [
          'This is a development configuration for Rise of Founders',
          'The project keypair is generated locally for testing',
          'To create an actual on-chain project, use the full setup script when network is available',
          'This configuration allows testing of the Honeycomb authentication flow'
        ]
      };

      const configPath = path.join(__dirname, '../config/honeycomb-dev-config.json');
      fs.writeFileSync(configPath, JSON.stringify(configData, null, 2));
      
      console.log(`📄 Configuration saved to: ${configPath}`);
    } catch (error) {
      console.error('❌ Failed to create config file:', error);
    }
  }

  /**
   * Run the development configuration
   */
  async runConfig(): Promise<void> {
    try {
      console.log('\n🚀 Configuring Rise of Founders for Development');
      console.log('=================================================\n');

      await this.updateEnvironmentFiles();
      await this.createConfigFile();

      console.log('\n🎉 Development Configuration Complete!');
      console.log('===============================================');
      console.log('Next steps:');
      console.log('1. Restart your backend server');
      console.log('2. Restart your frontend development server'); 
      console.log('3. Test the authentication flow at /test-blockchain');
      console.log('4. The Honeycomb services should now initialize properly');
      console.log('\n💡 This creates a development setup. For production:');
      console.log('   - Use the full setup script to create an on-chain project');
      console.log('   - Obtain proper API keys from Honeycomb Protocol');
      console.log('   - Secure your project keypair properly');

    } catch (error: any) {
      console.error('\n❌ Configuration failed:', error);
      process.exit(1);
    }
  }
}

// Run the configuration if called directly
if (require.main === module) {
  const config = new HoneycombDevConfig();
  config.runConfig().catch(console.error);
}

export { HoneycombDevConfig };