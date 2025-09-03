'use client';

import { createEdgeClient } from '@honeycomb-protocol/edge-client';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, Transaction } from '@solana/web3.js';

interface HoneycombClientTransactionResult {
  success: boolean;
  signature?: string;
  error?: string;
}

class HoneycombClient {
  private client: any;
  private isInitialized = false;

  constructor() {
    const isDevelopment = process.env.NODE_ENV === 'development';
    const edgeUrl = process.env.NEXT_PUBLIC_HONEYCOMB_EDGE_URL ||
      (isDevelopment 
        ? 'https://edge.test.honeycombprotocol.com/'
        : 'https://edge.honeycombprotocol.com/');

    this.client = createEdgeClient(edgeUrl, isDevelopment);
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      console.log('🍯 Initializing Honeycomb Frontend Client...');
      this.isInitialized = true;
      console.log('✅ Honeycomb frontend client initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Honeycomb frontend client:', error);
      throw error;
    }
  }

  /**
   * Send client transactions using wallet adapter
   */
  async sendClientTransactions(
    transactions: Transaction[],
    connection: any,
    wallet: any
  ): Promise<HoneycombClientTransactionResult[]> {
    if (!wallet.connected || !wallet.publicKey) {
      throw new Error('Wallet not connected');
    }

    try {
      console.log(`📤 Sending ${transactions.length} transactions via wallet`);

      // Use Honeycomb's sendClientTransactions for frontend
      const results = await this.client.sendClientTransactions({
        transactions,
        wallet: wallet.publicKey.toString(),
        connection,
      });

      console.log('✅ Client transactions sent successfully');
      return results.map((result: any, index: number) => ({
        success: result.success || false,
        signature: result.signature,
        error: result.error || (!result.success ? `Transaction ${index} failed` : undefined)
      }));

    } catch (error: any) {
      console.error('❌ sendClientTransactions failed:', error);
      return transactions.map(() => ({ 
        success: false, 
        error: error.message || 'Unknown error in sendClientTransactions' 
      }));
    }
  }

  /**
   * Get authentication challenge for wallet
   */
  async getAuthChallenge(walletAddress: string): Promise<string> {
    await this.initialize();

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
   * Authenticate user with wallet signature
   */
  async authenticateUser(walletAddress: string, signature: string): Promise<{
    accessToken: string;
    user: { id: string; wallet: string };
  }> {
    await this.initialize();

    try {
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
   * Create profile transaction for user to sign
   */
  async createProfileTransaction(
    projectPublicKey: string,
    name: string,
    bio?: string,
    profilePicture?: string,
    userWallet?: string
  ): Promise<Transaction> {
    await this.initialize();

    try {
      const transaction = await this.client.createNewProfileTransaction({
        project: projectPublicKey,
        name,
        bio: bio || '',
        pfp: profilePicture || '',
        payer: userWallet,
      });

      return transaction;
    } catch (error) {
      console.error('Failed to create profile transaction:', error);
      throw new Error('Failed to create profile transaction');
    }
  }

  /**
   * Create badge claim transaction for user to sign
   */
  async createBadgeClaimTransaction(
    projectPublicKey: string,
    userWallet: string,
    badgeName: string,
    evidence?: any[]
  ): Promise<Transaction> {
    await this.initialize();

    try {
      const transaction = await this.client.createClaimBadgeTransaction({
        project: projectPublicKey,
        user: userWallet,
        badgeName,
        evidence: evidence || [],
      });

      return transaction;
    } catch (error) {
      console.error('Failed to create badge claim transaction:', error);
      throw new Error('Failed to create badge claim transaction');
    }
  }

  /**
   * Query user profile data
   */
  async getUserProfile(
    projectPublicKey: string,
    userWallet: string
  ): Promise<any> {
    await this.initialize();

    try {
      const profileData = await this.client.findProfiles({
        project: projectPublicKey,
        users: [userWallet],
      });

      return profileData?.profiles?.[0] || null;
    } catch (error) {
      console.error('Failed to get user profile:', error);
      return null;
    }
  }

  /**
   * Query user badges
   */
  async getUserBadges(
    projectPublicKey: string,
    userWallet: string
  ): Promise<any[]> {
    await this.initialize();

    try {
      const badgeData = await this.client.findUserBadges({
        project: projectPublicKey,
        user: userWallet,
      });

      return badgeData?.badges || [];
    } catch (error) {
      console.error('Failed to get user badges:', error);
      return [];
    }
  }

  /**
   * Get project information
   */
  async getProjectInfo(projectPublicKey: string): Promise<any> {
    await this.initialize();

    try {
      const projectData = await this.client.findProjects({
        addresses: [projectPublicKey]
      });

      return projectData?.projects?.[0] || null;
    } catch (error) {
      console.error('Failed to get project info:', error);
      return null;
    }
  }
}

// Export singleton instance
export const honeycombClient = new HoneycombClient();

// React hook for using Honeycomb client
export function useHoneycomb() {
  const { connection } = useConnection();
  const wallet = useWallet();

  return {
    client: honeycombClient,
    connection,
    wallet,
    sendTransactions: async (transactions: Transaction[]) => {
      return honeycombClient.sendClientTransactions(transactions, connection, wallet);
    },
  };
}