import {
  Connection,
  PublicKey,
  Keypair,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
  Commitment,
} from '@solana/web3.js';
import {
  Program,
  AnchorProvider,
  web3,
  BN,
  IdlAccounts,
  Idl,
  utils,
} from '@coral-xyz/anchor';
import {
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  getAccount,
} from '@solana/spl-token';
import { WalletContextState } from '@solana/wallet-adapter-react';

// Import the generated IDL (would be generated after anchor build)
// import { RiseOfFoundersProtocol } from '../target/types/rise_of_founders_protocol';

// Type definitions for our program accounts
export interface TeamVault {
  teamId: string;
  name: string;
  founders: PublicKey[];
  threshold: number;
  totalFunds: BN;
  proposalCount: BN;
  bump: number;
  createdAt: BN;
  isActive: boolean;
}

export interface Proposal {
  teamVault: PublicKey;
  proposer: PublicKey;
  title: string;
  description: string;
  recipient: PublicKey;
  amount: BN;
  proposalType: ProposalType;
  votes: Vote[];
  status: ProposalStatus;
  createdAt: BN;
  expiresAt: BN;
  executedAt: BN | null;
}

export interface SponsorEscrow {
  questId: string;
  sponsor: PublicKey;
  totalAmount: BN;
  releasedAmount: BN;
  milestones: Milestone[];
  status: EscrowStatus;
  bump: number;
  createdAt: BN;
}

export interface Territory {
  territoryId: string;
  name: string;
  description: string;
  coordinates: [number, number];
  size: number;
  difficulty: number;
  maxTeams: number;
  currentTeams: number;
  uri: string;
  owner: PublicKey | null;
  battlesWon: number;
  battlesLost: number;
  totalRewards: BN;
  isActive: boolean;
  bump: number;
  createdAt: BN;
}

export interface Battle {
  territory: PublicKey;
  challenger: PublicKey;
  challengerTeamId: string;
  defender: PublicKey | null;
  battleType: BattleType;
  status: BattleStatus;
  stakeAmount: BN;
  winner: PublicKey | null;
  score: number;
  createdAt: BN;
  expiresAt: BN;
  resolvedAt: BN | null;
}

// Enum types
export enum ProposalType {
  Transfer = 'Transfer',
}

export enum ProposalStatus {
  Pending = 'Pending',
  Approved = 'Approved',
  Rejected = 'Rejected',
  Executed = 'Executed',
  Expired = 'Expired',
}

export enum EscrowStatus {
  Active = 'Active',
  Completed = 'Completed',
  Cancelled = 'Cancelled',
}

export enum BattleType {
  Conquest = 'Conquest',
  Defense = 'Defense',
  Raid = 'Raid',
}

export enum BattleStatus {
  Pending = 'Pending',
  InProgress = 'InProgress',
  Completed = 'Completed',
  Cancelled = 'Cancelled',
}

// Additional types
export interface Vote {
  voter: PublicKey;
  support: boolean;
  timestamp: BN;
}

export interface Milestone {
  title: string;
  description: string;
  percentage: number;
  released: boolean;
  releasedAt: BN | null;
}

export class SolanaProtocolClient {
  private connection: Connection;
  private provider: AnchorProvider;
  // private program: Program<RiseOfFoundersProtocol>;
  private programId: PublicKey;

  constructor(
    connection: Connection,
    wallet: WalletContextState,
    programId: string = "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM"
  ) {
    this.connection = connection;
    this.programId = new PublicKey(programId);
    
    // Create provider
    this.provider = new AnchorProvider(
      connection,
      wallet as any,
      AnchorProvider.defaultOptions()
    );

    // Initialize program (would use actual IDL in production)
    // this.program = new Program(IDL, this.programId, this.provider);
  }

  // =============================================================================
  // TEAM VAULT FUNCTIONS
  // =============================================================================

  /**
   * Initialize a new team vault with multi-sig configuration
   */
  async initializeTeamVault(
    teamId: string,
    name: string,
    founders: PublicKey[],
    threshold: number
  ): Promise<{ signature: string; teamVault: PublicKey }> {
    const [teamVault, bump] = await PublicKey.findProgramAddress(
      [Buffer.from("team_vault"), Buffer.from(teamId)],
      this.programId
    );

    // In production, would use the actual program instruction
    const instruction = SystemProgram.createAccount({
      fromPubkey: this.provider.wallet.publicKey,
      newAccountPubkey: teamVault,
      lamports: await this.connection.getMinimumBalanceForRentExemption(1000),
      space: 1000,
      programId: this.programId,
    });

    const transaction = new Transaction().add(instruction);
    const signature = await this.provider.sendAndConfirm(transaction);

    return { signature, teamVault };
  }

  /**
   * Create a spending proposal for team vault
   */
  async createProposal(
    teamVault: PublicKey,
    title: string,
    description: string,
    recipient: PublicKey,
    amount: BN,
    proposalType: ProposalType = ProposalType.Transfer
  ): Promise<{ signature: string; proposal: PublicKey }> {
    const proposal = Keypair.generate();

    // Create proposal instruction (mock)
    const instruction = SystemProgram.createAccount({
      fromPubkey: this.provider.wallet.publicKey,
      newAccountPubkey: proposal.publicKey,
      lamports: await this.connection.getMinimumBalanceForRentExemption(500),
      space: 500,
      programId: this.programId,
    });

    const transaction = new Transaction().add(instruction);
    transaction.feePayer = this.provider.wallet.publicKey;
    
    const signature = await this.provider.sendAndConfirm(transaction, [proposal]);

    return { signature, proposal: proposal.publicKey };
  }

  /**
   * Vote on a spending proposal
   */
  async voteOnProposal(
    teamVault: PublicKey,
    proposal: PublicKey,
    support: boolean
  ): Promise<string> {
    // Mock transaction for voting
    const transaction = new Transaction();
    
    const signature = await this.provider.sendAndConfirm(transaction);
    return signature;
  }

  /**
   * Execute an approved proposal
   */
  async executeProposal(
    teamVault: PublicKey,
    proposal: PublicKey,
    vaultTokenAccount: PublicKey,
    recipientTokenAccount: PublicKey
  ): Promise<string> {
    // Mock transaction for execution
    const transaction = new Transaction();
    
    const signature = await this.provider.sendAndConfirm(transaction);
    return signature;
  }

  // =============================================================================
  // SPONSOR ESCROW FUNCTIONS
  // =============================================================================

  /**
   * Initialize a sponsor escrow for quest funding
   */
  async initializeSponsorEscrow(
    questId: string,
    totalAmount: BN,
    milestones: Milestone[]
  ): Promise<{ signature: string; escrow: PublicKey }> {
    const [escrow, bump] = await PublicKey.findProgramAddress(
      [Buffer.from("sponsor_escrow"), Buffer.from(questId)],
      this.programId
    );

    // Mock escrow creation
    const instruction = SystemProgram.createAccount({
      fromPubkey: this.provider.wallet.publicKey,
      newAccountPubkey: escrow,
      lamports: await this.connection.getMinimumBalanceForRentExemption(800),
      space: 800,
      programId: this.programId,
    });

    const transaction = new Transaction().add(instruction);
    const signature = await this.provider.sendAndConfirm(transaction);

    return { signature, escrow };
  }

  /**
   * Release milestone payment from escrow
   */
  async releaseMilestone(
    escrow: PublicKey,
    milestoneIndex: number,
    escrowTokenAccount: PublicKey,
    recipientTokenAccount: PublicKey
  ): Promise<string> {
    // Mock milestone release
    const transaction = new Transaction();
    
    const signature = await this.provider.sendAndConfirm(transaction);
    return signature;
  }

  // =============================================================================
  // TERRITORY NFT FUNCTIONS
  // =============================================================================

  /**
   * Initialize a new territory NFT
   */
  async initializeTerritory(
    territoryId: string,
    name: string,
    description: string,
    coordinates: [number, number],
    size: number,
    difficulty: number,
    maxTeams: number,
    uri: string
  ): Promise<{ signature: string; territory: PublicKey }> {
    const [territory, bump] = await PublicKey.findProgramAddress(
      [Buffer.from("territory"), Buffer.from(territoryId)],
      this.programId
    );

    // Mock territory creation
    const instruction = SystemProgram.createAccount({
      fromPubkey: this.provider.wallet.publicKey,
      newAccountPubkey: territory,
      lamports: await this.connection.getMinimumBalanceForRentExemption(600),
      space: 600,
      programId: this.programId,
    });

    const transaction = new Transaction().add(instruction);
    const signature = await this.provider.sendAndConfirm(transaction);

    return { signature, territory };
  }

  /**
   * Initiate a battle for territory control
   */
  async challengeTerritory(
    territory: PublicKey,
    challengerTeamId: string,
    battleType: BattleType
  ): Promise<{ signature: string; battle: PublicKey }> {
    const battle = Keypair.generate();

    // Mock battle creation
    const instruction = SystemProgram.createAccount({
      fromPubkey: this.provider.wallet.publicKey,
      newAccountPubkey: battle.publicKey,
      lamports: await this.connection.getMinimumBalanceForRentExemption(400),
      space: 400,
      programId: this.programId,
    });

    const transaction = new Transaction().add(instruction);
    const signature = await this.provider.sendAndConfirm(transaction, [battle]);

    return { signature, battle: battle.publicKey };
  }

  /**
   * Resolve a territory battle
   */
  async resolveBattle(
    territory: PublicKey,
    battle: PublicKey,
    winner: PublicKey,
    score: number
  ): Promise<string> {
    // Mock battle resolution
    const transaction = new Transaction();
    
    const signature = await this.provider.sendAndConfirm(transaction);
    return signature;
  }

  // =============================================================================
  // UTILITY FUNCTIONS
  // =============================================================================

  /**
   * Get team vault PDA
   */
  async getTeamVaultPDA(teamId: string): Promise<[PublicKey, number]> {
    return await PublicKey.findProgramAddress(
      [Buffer.from("team_vault"), Buffer.from(teamId)],
      this.programId
    );
  }

  /**
   * Get sponsor escrow PDA
   */
  async getSponsorEscrowPDA(questId: string): Promise<[PublicKey, number]> {
    return await PublicKey.findProgramAddress(
      [Buffer.from("sponsor_escrow"), Buffer.from(questId)],
      this.programId
    );
  }

  /**
   * Get territory PDA
   */
  async getTerritoryPDA(territoryId: string): Promise<[PublicKey, number]> {
    return await PublicKey.findProgramAddress(
      [Buffer.from("territory"), Buffer.from(territoryId)],
      this.programId
    );
  }

  /**
   * Fetch team vault account
   */
  async fetchTeamVault(teamVaultPubkey: PublicKey): Promise<TeamVault | null> {
    try {
      // In production, would use: return await this.program.account.teamVault.fetch(teamVaultPubkey);
      
      // Mock data for now
      return {
        teamId: "team_1",
        name: "TechStartup Co",
        founders: [this.provider.wallet.publicKey],
        threshold: 1,
        totalFunds: new BN(0),
        proposalCount: new BN(0),
        bump: 255,
        createdAt: new BN(Date.now() / 1000),
        isActive: true,
      };
    } catch (error) {
      console.error("Error fetching team vault:", error);
      return null;
    }
  }

  /**
   * Fetch sponsor escrow account
   */
  async fetchSponsorEscrow(escrowPubkey: PublicKey): Promise<SponsorEscrow | null> {
    try {
      // Mock data for now
      return {
        questId: "quest_1",
        sponsor: this.provider.wallet.publicKey,
        totalAmount: new BN(1000000),
        releasedAmount: new BN(0),
        milestones: [
          {
            title: "Project Setup",
            description: "Initial project setup and planning",
            percentage: 25,
            released: false,
            releasedAt: null,
          },
          {
            title: "Development Phase",
            description: "Core development work",
            percentage: 50,
            released: false,
            releasedAt: null,
          },
          {
            title: "Final Delivery",
            description: "Project completion and delivery",
            percentage: 25,
            released: false,
            releasedAt: null,
          },
        ],
        status: EscrowStatus.Active,
        bump: 255,
        createdAt: new BN(Date.now() / 1000),
      };
    } catch (error) {
      console.error("Error fetching sponsor escrow:", error);
      return null;
    }
  }

  /**
   * Fetch territory account
   */
  async fetchTerritory(territoryPubkey: PublicKey): Promise<Territory | null> {
    try {
      // Mock data for now
      return {
        territoryId: "territory_1",
        name: "Silicon Valley",
        description: "The tech capital of the world",
        coordinates: [100, 150],
        size: 50,
        difficulty: 5,
        maxTeams: 10,
        currentTeams: 3,
        uri: "https://example.com/territory/1",
        owner: null,
        battlesWon: 0,
        battlesLost: 0,
        totalRewards: new BN(0),
        isActive: true,
        bump: 255,
        createdAt: new BN(Date.now() / 1000),
      };
    } catch (error) {
      console.error("Error fetching territory:", error);
      return null;
    }
  }

  /**
   * Get associated token address for a user
   */
  async getAssociatedTokenAccount(
    owner: PublicKey,
    mint: PublicKey
  ): Promise<PublicKey> {
    return await getAssociatedTokenAddress(mint, owner);
  }

  /**
   * Create associated token account if it doesn't exist
   */
  async createAssociatedTokenAccountIfNeeded(
    owner: PublicKey,
    mint: PublicKey
  ): Promise<{ address: PublicKey; instruction?: web3.TransactionInstruction }> {
    const associatedTokenAddress = await this.getAssociatedTokenAccount(owner, mint);

    try {
      await getAccount(this.connection, associatedTokenAddress);
      return { address: associatedTokenAddress };
    } catch (error) {
      // Account doesn't exist, create it
      const instruction = createAssociatedTokenAccountInstruction(
        this.provider.wallet.publicKey,
        associatedTokenAddress,
        owner,
        mint
      );

      return { address: associatedTokenAddress, instruction };
    }
  }

  /**
   * Get account balance
   */
  async getAccountBalance(pubkey: PublicKey): Promise<number> {
    const balance = await this.connection.getBalance(pubkey);
    return balance / LAMPORTS_PER_SOL;
  }

  /**
   * Request airdrop for testing (devnet only)
   */
  async requestAirdrop(pubkey: PublicKey, amount: number = 1): Promise<string> {
    const signature = await this.connection.requestAirdrop(
      pubkey,
      amount * LAMPORTS_PER_SOL
    );
    
    await this.connection.confirmTransaction(signature);
    return signature;
  }

  /**
   * Get program accounts of a specific type
   */
  async getProgramAccounts(discriminator: Buffer): Promise<any[]> {
    const accounts = await this.connection.getProgramAccounts(this.programId, {
      filters: [
        {
          memcmp: {
            offset: 0,
            bytes: discriminator.toString('base58'),
          },
        },
      ],
    });

    return accounts;
  }
}