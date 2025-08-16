'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, Connection } from '@solana/web3.js';
import { BN } from '@coral-xyz/anchor';
import {
  SolanaProtocolClient,
  TeamVault,
  Proposal,
  SponsorEscrow,
  Territory,
  Battle,
  ProposalType,
  ProposalStatus,
  EscrowStatus,
  BattleType,
  BattleStatus,
  Milestone,
} from '../../../smart-contracts/app/solana-client';
import toast from 'react-hot-toast';

interface UseSolanaProtocolReturn {
  client: SolanaProtocolClient | null;
  isLoading: boolean;
  
  // Team Vault functions
  initializeTeamVault: (
    teamId: string,
    name: string,
    founders: string[],
    threshold: number
  ) => Promise<{ signature: string; teamVault: string } | null>;
  
  createProposal: (
    teamVault: string,
    title: string,
    description: string,
    recipient: string,
    amount: number
  ) => Promise<{ signature: string; proposal: string } | null>;
  
  voteOnProposal: (
    teamVault: string,
    proposal: string,
    support: boolean
  ) => Promise<string | null>;
  
  executeProposal: (
    teamVault: string,
    proposal: string,
    vaultTokenAccount: string,
    recipientTokenAccount: string
  ) => Promise<string | null>;
  
  // Sponsor Escrow functions
  initializeSponsorEscrow: (
    questId: string,
    totalAmount: number,
    milestones: Milestone[]
  ) => Promise<{ signature: string; escrow: string } | null>;
  
  releaseMilestone: (
    escrow: string,
    milestoneIndex: number,
    escrowTokenAccount: string,
    recipientTokenAccount: string
  ) => Promise<string | null>;
  
  // Territory functions
  initializeTerritory: (
    territoryId: string,
    name: string,
    description: string,
    coordinates: [number, number],
    size: number,
    difficulty: number,
    maxTeams: number,
    uri: string
  ) => Promise<{ signature: string; territory: string } | null>;
  
  challengeTerritory: (
    territory: string,
    challengerTeamId: string,
    battleType: BattleType
  ) => Promise<{ signature: string; battle: string } | null>;
  
  resolveBattle: (
    territory: string,
    battle: string,
    winner: string,
    score: number
  ) => Promise<string | null>;
  
  // Data fetching functions
  fetchTeamVault: (teamVault: string) => Promise<TeamVault | null>;
  fetchSponsorEscrow: (escrow: string) => Promise<SponsorEscrow | null>;
  fetchTerritory: (territory: string) => Promise<Territory | null>;
  
  // Utility functions
  getTeamVaultPDA: (teamId: string) => Promise<[string, number] | null>;
  getSponsorEscrowPDA: (questId: string) => Promise<[string, number] | null>;
  getTerritoryPDA: (territoryId: string) => Promise<[string, number] | null>;
  requestAirdrop: (amount?: number) => Promise<string | null>;
}

export const useSolanaProtocol = (): UseSolanaProtocolReturn => {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [isLoading, setIsLoading] = useState(false);

  const client = useMemo(() => {
    if (!wallet || !wallet.publicKey) return null;
    
    return new SolanaProtocolClient(connection, wallet);
  }, [connection, wallet]);

  // =============================================================================
  // TEAM VAULT FUNCTIONS
  // =============================================================================

  const initializeTeamVault = useCallback(async (
    teamId: string,
    name: string,
    founders: string[],
    threshold: number
  ): Promise<{ signature: string; teamVault: string } | null> => {
    if (!client || !wallet.publicKey) {
      toast.error('Wallet not connected');
      return null;
    }

    setIsLoading(true);
    try {
      const founderPubkeys = founders.map(f => new PublicKey(f));
      const result = await client.initializeTeamVault(teamId, name, founderPubkeys, threshold);
      
      toast.success('Team vault initialized successfully!');
      return {
        signature: result.signature,
        teamVault: result.teamVault.toString(),
      };
    } catch (error) {
      console.error('Error initializing team vault:', error);
      toast.error('Failed to initialize team vault');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [client, wallet.publicKey]);

  const createProposal = useCallback(async (
    teamVault: string,
    title: string,
    description: string,
    recipient: string,
    amount: number
  ): Promise<{ signature: string; proposal: string } | null> => {
    if (!client || !wallet.publicKey) {
      toast.error('Wallet not connected');
      return null;
    }

    setIsLoading(true);
    try {
      const result = await client.createProposal(
        new PublicKey(teamVault),
        title,
        description,
        new PublicKey(recipient),
        new BN(amount),
        ProposalType.Transfer
      );
      
      toast.success('Proposal created successfully!');
      return {
        signature: result.signature,
        proposal: result.proposal.toString(),
      };
    } catch (error) {
      console.error('Error creating proposal:', error);
      toast.error('Failed to create proposal');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [client, wallet.publicKey]);

  const voteOnProposal = useCallback(async (
    teamVault: string,
    proposal: string,
    support: boolean
  ): Promise<string | null> => {
    if (!client || !wallet.publicKey) {
      toast.error('Wallet not connected');
      return null;
    }

    setIsLoading(true);
    try {
      const signature = await client.voteOnProposal(
        new PublicKey(teamVault),
        new PublicKey(proposal),
        support
      );
      
      toast.success(`Vote ${support ? 'approved' : 'rejected'} successfully!`);
      return signature;
    } catch (error) {
      console.error('Error voting on proposal:', error);
      toast.error('Failed to vote on proposal');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [client, wallet.publicKey]);

  const executeProposal = useCallback(async (
    teamVault: string,
    proposal: string,
    vaultTokenAccount: string,
    recipientTokenAccount: string
  ): Promise<string | null> => {
    if (!client || !wallet.publicKey) {
      toast.error('Wallet not connected');
      return null;
    }

    setIsLoading(true);
    try {
      const signature = await client.executeProposal(
        new PublicKey(teamVault),
        new PublicKey(proposal),
        new PublicKey(vaultTokenAccount),
        new PublicKey(recipientTokenAccount)
      );
      
      toast.success('Proposal executed successfully!');
      return signature;
    } catch (error) {
      console.error('Error executing proposal:', error);
      toast.error('Failed to execute proposal');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [client, wallet.publicKey]);

  // =============================================================================
  // SPONSOR ESCROW FUNCTIONS
  // =============================================================================

  const initializeSponsorEscrow = useCallback(async (
    questId: string,
    totalAmount: number,
    milestones: Milestone[]
  ): Promise<{ signature: string; escrow: string } | null> => {
    if (!client || !wallet.publicKey) {
      toast.error('Wallet not connected');
      return null;
    }

    setIsLoading(true);
    try {
      const result = await client.initializeSponsorEscrow(
        questId,
        new BN(totalAmount),
        milestones
      );
      
      toast.success('Sponsor escrow initialized successfully!');
      return {
        signature: result.signature,
        escrow: result.escrow.toString(),
      };
    } catch (error) {
      console.error('Error initializing sponsor escrow:', error);
      toast.error('Failed to initialize sponsor escrow');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [client, wallet.publicKey]);

  const releaseMilestone = useCallback(async (
    escrow: string,
    milestoneIndex: number,
    escrowTokenAccount: string,
    recipientTokenAccount: string
  ): Promise<string | null> => {
    if (!client || !wallet.publicKey) {
      toast.error('Wallet not connected');
      return null;
    }

    setIsLoading(true);
    try {
      const signature = await client.releaseMilestone(
        new PublicKey(escrow),
        milestoneIndex,
        new PublicKey(escrowTokenAccount),
        new PublicKey(recipientTokenAccount)
      );
      
      toast.success('Milestone payment released successfully!');
      return signature;
    } catch (error) {
      console.error('Error releasing milestone:', error);
      toast.error('Failed to release milestone payment');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [client, wallet.publicKey]);

  // =============================================================================
  // TERRITORY FUNCTIONS
  // =============================================================================

  const initializeTerritory = useCallback(async (
    territoryId: string,
    name: string,
    description: string,
    coordinates: [number, number],
    size: number,
    difficulty: number,
    maxTeams: number,
    uri: string
  ): Promise<{ signature: string; territory: string } | null> => {
    if (!client || !wallet.publicKey) {
      toast.error('Wallet not connected');
      return null;
    }

    setIsLoading(true);
    try {
      const result = await client.initializeTerritory(
        territoryId,
        name,
        description,
        coordinates,
        size,
        difficulty,
        maxTeams,
        uri
      );
      
      toast.success('Territory initialized successfully!');
      return {
        signature: result.signature,
        territory: result.territory.toString(),
      };
    } catch (error) {
      console.error('Error initializing territory:', error);
      toast.error('Failed to initialize territory');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [client, wallet.publicKey]);

  const challengeTerritory = useCallback(async (
    territory: string,
    challengerTeamId: string,
    battleType: BattleType
  ): Promise<{ signature: string; battle: string } | null> => {
    if (!client || !wallet.publicKey) {
      toast.error('Wallet not connected');
      return null;
    }

    setIsLoading(true);
    try {
      const result = await client.challengeTerritory(
        new PublicKey(territory),
        challengerTeamId,
        battleType
      );
      
      toast.success('Territory challenge initiated!');
      return {
        signature: result.signature,
        battle: result.battle.toString(),
      };
    } catch (error) {
      console.error('Error challenging territory:', error);
      toast.error('Failed to challenge territory');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [client, wallet.publicKey]);

  const resolveBattle = useCallback(async (
    territory: string,
    battle: string,
    winner: string,
    score: number
  ): Promise<string | null> => {
    if (!client || !wallet.publicKey) {
      toast.error('Wallet not connected');
      return null;
    }

    setIsLoading(true);
    try {
      const signature = await client.resolveBattle(
        new PublicKey(territory),
        new PublicKey(battle),
        new PublicKey(winner),
        score
      );
      
      toast.success('Battle resolved successfully!');
      return signature;
    } catch (error) {
      console.error('Error resolving battle:', error);
      toast.error('Failed to resolve battle');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [client, wallet.publicKey]);

  // =============================================================================
  // DATA FETCHING FUNCTIONS
  // =============================================================================

  const fetchTeamVault = useCallback(async (teamVault: string): Promise<TeamVault | null> => {
    if (!client) return null;

    try {
      return await client.fetchTeamVault(new PublicKey(teamVault));
    } catch (error) {
      console.error('Error fetching team vault:', error);
      return null;
    }
  }, [client]);

  const fetchSponsorEscrow = useCallback(async (escrow: string): Promise<SponsorEscrow | null> => {
    if (!client) return null;

    try {
      return await client.fetchSponsorEscrow(new PublicKey(escrow));
    } catch (error) {
      console.error('Error fetching sponsor escrow:', error);
      return null;
    }
  }, [client]);

  const fetchTerritory = useCallback(async (territory: string): Promise<Territory | null> => {
    if (!client) return null;

    try {
      return await client.fetchTerritory(new PublicKey(territory));
    } catch (error) {
      console.error('Error fetching territory:', error);
      return null;
    }
  }, [client]);

  // =============================================================================
  // UTILITY FUNCTIONS
  // =============================================================================

  const getTeamVaultPDA = useCallback(async (teamId: string): Promise<[string, number] | null> => {
    if (!client) return null;

    try {
      const [pda, bump] = await client.getTeamVaultPDA(teamId);
      return [pda.toString(), bump];
    } catch (error) {
      console.error('Error getting team vault PDA:', error);
      return null;
    }
  }, [client]);

  const getSponsorEscrowPDA = useCallback(async (questId: string): Promise<[string, number] | null> => {
    if (!client) return null;

    try {
      const [pda, bump] = await client.getSponsorEscrowPDA(questId);
      return [pda.toString(), bump];
    } catch (error) {
      console.error('Error getting sponsor escrow PDA:', error);
      return null;
    }
  }, [client]);

  const getTerritoryPDA = useCallback(async (territoryId: string): Promise<[string, number] | null> => {
    if (!client) return null;

    try {
      const [pda, bump] = await client.getTerritoryPDA(territoryId);
      return [pda.toString(), bump];
    } catch (error) {
      console.error('Error getting territory PDA:', error);
      return null;
    }
  }, [client]);

  const requestAirdrop = useCallback(async (amount: number = 1): Promise<string | null> => {
    if (!client || !wallet.publicKey) {
      toast.error('Wallet not connected');
      return null;
    }

    try {
      const signature = await client.requestAirdrop(wallet.publicKey, amount);
      toast.success(`Airdropped ${amount} SOL successfully!`);
      return signature;
    } catch (error) {
      console.error('Error requesting airdrop:', error);
      toast.error('Failed to request airdrop');
      return null;
    }
  }, [client, wallet.publicKey]);

  return {
    client,
    isLoading,
    
    // Team Vault functions
    initializeTeamVault,
    createProposal,
    voteOnProposal,
    executeProposal,
    
    // Sponsor Escrow functions
    initializeSponsorEscrow,
    releaseMilestone,
    
    // Territory functions
    initializeTerritory,
    challengeTerritory,
    resolveBattle,
    
    // Data fetching functions
    fetchTeamVault,
    fetchSponsorEscrow,
    fetchTerritory,
    
    // Utility functions
    getTeamVaultPDA,
    getSponsorEscrowPDA,
    getTerritoryPDA,
    requestAirdrop,
  };
};

// Additional hook for specific team vault operations
export const useTeamVault = (teamId: string) => {
  const protocol = useSolanaProtocol();
  const [teamVault, setTeamVault] = useState<TeamVault | null>(null);
  const [teamVaultPDA, setTeamVaultPDA] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!protocol.client || !teamId) return;

      try {
        const pda = await protocol.getTeamVaultPDA(teamId);
        if (pda) {
          setTeamVaultPDA(pda[0]);
          const vaultData = await protocol.fetchTeamVault(pda[0]);
          setTeamVault(vaultData);
        }
      } catch (error) {
        console.error('Error fetching team vault data:', error);
      }
    };

    fetchData();
  }, [protocol.client, teamId]);

  return {
    ...protocol,
    teamVault,
    teamVaultPDA,
    refetchTeamVault: useCallback(async () => {
      if (teamVaultPDA) {
        const vaultData = await protocol.fetchTeamVault(teamVaultPDA);
        setTeamVault(vaultData);
      }
    }, [protocol, teamVaultPDA]),
  };
};

// Hook for sponsor escrow operations
export const useSponsorEscrow = (questId: string) => {
  const protocol = useSolanaProtocol();
  const [escrow, setEscrow] = useState<SponsorEscrow | null>(null);
  const [escrowPDA, setEscrowPDA] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!protocol.client || !questId) return;

      try {
        const pda = await protocol.getSponsorEscrowPDA(questId);
        if (pda) {
          setEscrowPDA(pda[0]);
          const escrowData = await protocol.fetchSponsorEscrow(pda[0]);
          setEscrow(escrowData);
        }
      } catch (error) {
        console.error('Error fetching sponsor escrow data:', error);
      }
    };

    fetchData();
  }, [protocol.client, questId]);

  return {
    ...protocol,
    escrow,
    escrowPDA,
    refetchEscrow: useCallback(async () => {
      if (escrowPDA) {
        const escrowData = await protocol.fetchSponsorEscrow(escrowPDA);
        setEscrow(escrowData);
      }
    }, [protocol, escrowPDA]),
  };
};

// Hook for territory operations
export const useTerritory = (territoryId: string) => {
  const protocol = useSolanaProtocol();
  const [territory, setTerritory] = useState<Territory | null>(null);
  const [territoryPDA, setTerritoryPDA] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!protocol.client || !territoryId) return;

      try {
        const pda = await protocol.getTerritoryPDA(territoryId);
        if (pda) {
          setTerritoryPDA(pda[0]);
          const territoryData = await protocol.fetchTerritory(pda[0]);
          setTerritory(territoryData);
        }
      } catch (error) {
        console.error('Error fetching territory data:', error);
      }
    };

    fetchData();
  }, [protocol.client, territoryId]);

  return {
    ...protocol,
    territory,
    territoryPDA,
    refetchTerritory: useCallback(async () => {
      if (territoryPDA) {
        const territoryData = await protocol.fetchTerritory(territoryPDA);
        setTerritory(territoryData);
      }
    }, [protocol, territoryPDA]),
  };
};