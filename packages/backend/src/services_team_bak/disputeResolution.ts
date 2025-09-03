import { prisma } from '../../config/database';
import { honeycombResourceService } from '../honeycomb/resources';
import { honeycombCharacterService } from '../honeycomb/characters';

interface DisputeInitiation {
  teamId: string;
  initiatorId: string;
  disputeType: 'RESOURCE_ALLOCATION' | 'DECISION_MAKING' | 'EQUITY_SPLIT' | 'TEAM_SEPARATION' | 'BREACH_OF_AGREEMENT';
  description: string;
  proposedResolution: string;
  evidenceUrls?: string[];
  affectedMembers: string[];
}

interface SeparationProposal {
  teamId: string;
  proposedBy: string;
  separationType: 'AMICABLE_SPLIT' | 'CONTESTED_SPLIT' | 'FOUNDER_EXIT' | 'MEMBER_REMOVAL';
  assetDistribution: {
    xpAllocation: Record<string, number>; // userId -> XP amount
    resourceAllocation: Record<string, Record<string, number>>; // userId -> { resourceType: amount }
    tokenAllocation: Record<string, number>; // userId -> token amount
    equityAllocation: Record<string, number>; // userId -> equity percentage
  };
  timeline: number; // Days to complete separation
  votingDeadline: Date;
  termsAcceptance: Record<string, boolean>; // userId -> accepted
}

interface AgreementTemplate {
  id: string;
  name: string;
  type: 'EQUAL_SPLIT' | 'CONTRIBUTION_BASED' | 'TIME_WEIGHTED' | 'PERFORMANCE_BASED' | 'CUSTOM';
  description: string;
  xpFormula: string;
  resourceFormula: string;
  tokenFormula: string;
  disputeResolutionMechanism: 'VOTING' | 'ARBITRATION' | 'SMART_CONTRACT' | 'HYBRID';
  automaticTriggers: string[];
}

class TeamDisputeResolutionService {
  
  /**
   * Initialize a dispute within a team
   */
  async initiateDispute(disputeData: DisputeInitiation): Promise<{
    success: boolean;
    dispute: any;
    nextSteps: string[];
    error?: string;
  }> {
    try {
      // Verify the initiator is a team member
      const membership = await prisma.teamMember.findFirst({
        where: {
          teamId: disputeData.teamId,
          userId: disputeData.initiatorId,
          status: 'ACTIVE'
        },
        include: { team: true }
      });

      if (!membership) {
        return { success: false, dispute: null, nextSteps: [], error: 'User is not a team member' };
      }

      // Create dispute record
      const dispute = await prisma.teamDispute.create({
        data: {
          teamId: disputeData.teamId,
          initiatorId: disputeData.initiatorId,
          disputeType: disputeData.disputeType,
          description: disputeData.description,
          proposedResolution: disputeData.proposedResolution,
          status: 'OPEN',
          evidenceUrls: disputeData.evidenceUrls || [],
          affectedMembers: disputeData.affectedMembers,
          createdAt: new Date(),
          votingDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days default
        }
      });

      // Notify all team members
      await this.notifyTeamMembers(disputeData.teamId, 'DISPUTE_INITIATED', {
        disputeId: dispute.id,
        type: disputeData.disputeType,
        initiator: disputeData.initiatorId
      });

      // Determine next steps based on team agreement
      const agreement = await this.getTeamAgreement(disputeData.teamId);
      const nextSteps = this.generateDisputeNextSteps(dispute, agreement);

      return {
        success: true,
        dispute,
        nextSteps,
      };
    } catch (error) {
      console.error('Error initiating dispute:', error);
      return { 
        success: false, 
        dispute: null, 
        nextSteps: [], 
        error: 'Failed to initiate dispute' 
      };
    }
  }

  /**
   * Cast a vote on a dispute
   */
  async voteOnDispute(disputeId: string, userId: string, vote: 'APPROVE' | 'REJECT' | 'ABSTAIN', comments?: string): Promise<{
    success: boolean;
    voteRecorded: boolean;
    disputeResolved: boolean;
    resolution?: any;
  }> {
    try {
      const dispute = await prisma.teamDispute.findUnique({
        where: { id: disputeId },
        include: { team: { include: { teamMembers: true } } }
      });

      if (!dispute || dispute.status !== 'OPEN') {
        return { success: false, voteRecorded: false, disputeResolved: false };
      }

      // Verify voter is team member
      const isTeamMember = dispute.team.teamMembers.some(m => 
        m.userId === userId && m.status === 'ACTIVE'
      );

      if (!isTeamMember) {
        return { success: false, voteRecorded: false, disputeResolved: false };
      }

      // Record vote
      await prisma.disputeVote.upsert({
        where: {
          disputeId_userId: {
            disputeId,
            userId
          }
        },
        create: {
          disputeId,
          userId,
          vote,
          comments: comments || '',
          createdAt: new Date()
        },
        update: {
          vote,
          comments: comments || '',
          updatedAt: new Date()
        }
      });

      // Check if voting is complete
      const votes = await prisma.disputeVote.findMany({
        where: { disputeId }
      });

      const activeMembers = dispute.team.teamMembers.filter(m => m.status === 'ACTIVE');
      const requiredVotes = Math.ceil(activeMembers.length * 0.5); // Simple majority

      let disputeResolved = false;
      let resolution = null;

      if (votes.length >= requiredVotes) {
        const approvals = votes.filter(v => v.vote === 'APPROVE').length;
        const rejections = votes.filter(v => v.vote === 'REJECT').length;

        if (approvals > rejections) {
          // Dispute resolution approved
          resolution = await this.executeDisputeResolution(disputeId, 'APPROVED');
          disputeResolved = true;
        } else if (rejections >= approvals) {
          // Dispute resolution rejected
          resolution = await this.executeDisputeResolution(disputeId, 'REJECTED');
          disputeResolved = true;
        }
      }

      return {
        success: true,
        voteRecorded: true,
        disputeResolved,
        resolution
      };

    } catch (error) {
      console.error('Error voting on dispute:', error);
      return { success: false, voteRecorded: false, disputeResolved: false };
    }
  }

  /**
   * Propose team separation with asset distribution
   */
  async proposeSeparation(separationData: SeparationProposal): Promise<{
    success: boolean;
    separationProposal: any;
    votingRequired: boolean;
    autoApproved: boolean;
  }> {
    try {
      // Verify proposer is team member
      const membership = await prisma.teamMember.findFirst({
        where: {
          teamId: separationData.teamId,
          userId: separationData.proposedBy,
          status: 'ACTIVE'
        },
        include: { 
          team: { 
            include: { 
              teamMembers: { include: { user: true } },
              agreement: true 
            } 
          } 
        }
      });

      if (!membership) {
        return { success: false, separationProposal: null, votingRequired: false, autoApproved: false };
      }

      // Calculate current team assets for validation
      const teamAssets = await this.calculateTeamAssets(separationData.teamId);

      // Validate proposed distribution doesn't exceed assets
      const distributionValid = await this.validateAssetDistribution(
        separationData.assetDistribution,
        teamAssets
      );

      if (!distributionValid.valid) {
        throw new Error(`Invalid asset distribution: ${distributionValid.reason}`);
      }

      // Create separation proposal
      const separationProposal = await prisma.teamSeparation.create({
        data: {
          teamId: separationData.teamId,
          proposedBy: separationData.proposedBy,
          separationType: separationData.separationType,
          assetDistribution: separationData.assetDistribution as any,
          timeline: separationData.timeline,
          status: 'PENDING_VOTES',
          votingDeadline: separationData.votingDeadline,
          termsAcceptance: separationData.termsAcceptance as any,
          createdAt: new Date()
        }
      });

      // Determine if voting is required or auto-approved
      const { votingRequired, autoApproved } = this.determineSeparationApproval(
        separationData,
        membership.team
      );

      if (autoApproved) {
        await this.executeSeparation(separationProposal.id);
      } else if (votingRequired) {
        // Notify team members to vote
        await this.notifyTeamMembers(separationData.teamId, 'SEPARATION_PROPOSED', {
          proposalId: separationProposal.id,
          proposedBy: separationData.proposedBy,
          type: separationData.separationType
        });
      }

      return {
        success: true,
        separationProposal,
        votingRequired,
        autoApproved
      };

    } catch (error) {
      console.error('Error proposing separation:', error);
      return { 
        success: false, 
        separationProposal: null, 
        votingRequired: false, 
        autoApproved: false 
      };
    }
  }

  /**
   * Execute team separation and distribute assets
   */
  async executeSeparation(separationId: string): Promise<{
    success: boolean;
    executionResults: {
      xpDistributed: Record<string, number>;
      resourcesDistributed: Record<string, Record<string, number>>;
      tokensDistributed: Record<string, number>;
      newTeamsCreated: string[];
    };
    error?: string;
  }> {
    try {
      const separation = await prisma.teamSeparation.findUnique({
        where: { id: separationId },
        include: {
          team: {
            include: {
              teamMembers: { include: { user: true } },
              agreement: true
            }
          }
        }
      });

      if (!separation) {
        return { success: false, executionResults: this.emptyExecutionResults(), error: 'Separation not found' };
      }

      const executionResults = {
        xpDistributed: {} as Record<string, number>,
        resourcesDistributed: {} as Record<string, Record<string, number>>,
        tokensDistributed: {} as Record<string, number>,
        newTeamsCreated: [] as string[]
      };

      // Distribute XP
      for (const [userId, xpAmount] of Object.entries(separation.assetDistribution.xpAllocation)) {
        await honeycombCharacterService.awardExperience(userId, xpAmount as number);
        executionResults.xpDistributed[userId] = xpAmount as number;
      }

      // Distribute Resources
      for (const [userId, resources] of Object.entries(separation.assetDistribution.resourceAllocation)) {
        for (const [resourceType, amount] of Object.entries(resources as Record<string, number>)) {
          await honeycombResourceService.awardResource(userId, resourceType, amount);
        }
        executionResults.resourcesDistributed[userId] = resources as Record<string, number>;
      }

      // Distribute Tokens (This would integrate with actual token contract)
      for (const [userId, tokenAmount] of Object.entries(separation.assetDistribution.tokenAllocation)) {
        // TODO: Integrate with token contract for actual distribution
        await this.distributeTokensToUser(userId, tokenAmount as number);
        executionResults.tokensDistributed[userId] = tokenAmount as number;
      }

      // Handle team structure changes
      if (separation.separationType === 'AMICABLE_SPLIT') {
        // Create new teams for separated groups if specified
        const newTeams = await this.createSeparatedTeams(separation);
        executionResults.newTeamsCreated = newTeams;
      } else if (separation.separationType === 'MEMBER_REMOVAL') {
        // Remove specific members from team
        await this.removeTeamMembers(separation);
      } else if (separation.separationType === 'FOUNDER_EXIT') {
        // Handle founder transition
        await this.handleFounderExit(separation);
      }

      // Update separation status
      await prisma.teamSeparation.update({
        where: { id: separationId },
        data: {
          status: 'EXECUTED',
          executedAt: new Date(),
          executionResults: executionResults as any
        }
      });

      // Log separation event for audit trail
      await this.logSeparationEvent(separationId, executionResults);

      return {
        success: true,
        executionResults
      };

    } catch (error) {
      console.error('Error executing separation:', error);
      return { 
        success: false, 
        executionResults: this.emptyExecutionResults(), 
        error: 'Failed to execute separation' 
      };
    }
  }

  /**
   * Get available agreement templates
   */
  async getAgreementTemplates(): Promise<AgreementTemplate[]> {
    return [
      {
        id: 'equal_split',
        name: 'Equal Split Agreement',
        type: 'EQUAL_SPLIT',
        description: 'All team members receive equal shares of XP, resources, and tokens upon separation',
        xpFormula: 'totalXP / memberCount',
        resourceFormula: 'totalResources / memberCount',
        tokenFormula: 'totalTokens / memberCount',
        disputeResolutionMechanism: 'VOTING',
        automaticTriggers: ['unanimous_vote', 'inactivity_30_days']
      },
      {
        id: 'contribution_based',
        name: 'Contribution-Based Agreement',
        type: 'CONTRIBUTION_BASED',
        description: 'Assets distributed based on individual contributions to missions and team success',
        xpFormula: '(individualContribution / totalContributions) * totalXP',
        resourceFormula: '(individualContribution / totalContributions) * totalResources',
        tokenFormula: '(individualContribution / totalContributions) * totalTokens',
        disputeResolutionMechanism: 'HYBRID',
        automaticTriggers: ['performance_threshold', 'majority_vote']
      },
      {
        id: 'time_weighted',
        name: 'Time-Weighted Agreement',
        type: 'TIME_WEIGHTED',
        description: 'Assets distributed based on time spent in the team and level of engagement',
        xpFormula: '(timeInTeam / totalTime) * engagementMultiplier * totalXP',
        resourceFormula: '(timeInTeam / totalTime) * engagementMultiplier * totalResources',
        tokenFormula: '(timeInTeam / totalTime) * engagementMultiplier * totalTokens',
        disputeResolutionMechanism: 'SMART_CONTRACT',
        automaticTriggers: ['time_based_vest', 'member_exit']
      },
      {
        id: 'performance_based',
        name: 'Performance-Based Agreement',
        type: 'PERFORMANCE_BASED',
        description: 'Assets distributed based on individual and team performance metrics',
        xpFormula: '(performanceScore / totalPerformance) * totalXP',
        resourceFormula: '(performanceScore / totalPerformance) * totalResources',
        tokenFormula: '(performanceScore / totalPerformance) * totalTokens',
        disputeResolutionMechanism: 'ARBITRATION',
        automaticTriggers: ['performance_review', 'milestone_completion']
      }
    ];
  }

  /**
   * Calculate team assets for distribution
   */
  async calculateTeamAssets(teamId: string): Promise<{
    totalXP: number;
    totalResources: Record<string, number>;
    totalTokens: number;
    memberContributions: Record<string, {
      xpEarned: number;
      resourcesGenerated: Record<string, number>;
      missionsCompleted: number;
      timeInTeam: number;
      performanceScore: number;
    }>;
  }> {
    try {
      // Get team members
      const teamMembers = await prisma.teamMember.findMany({
        where: { teamId, status: 'ACTIVE' },
        include: { user: true }
      });

      let totalXP = 0;
      const totalResources: Record<string, number> = {};
      let totalTokens = 0;
      const memberContributions: Record<string, any> = {};

      for (const member of teamMembers) {
        // Get member's character data
        const character = await honeycombCharacterService.getUserCharacter(member.userId);
        const resources = await honeycombResourceService.getUserInventory(member.userId);
        
        // Get member's mission history
        const missionsCompleted = await prisma.submission.count({
          where: {
            userId: member.userId,
            status: 'APPROVED',
            createdAt: { gte: member.joinedAt }
          }
        });

        const memberXP = character.success ? character.character?.experience || 0 : 0;
        const memberResources = resources.success ? resources.inventory : {};
        
        // Calculate time in team (in days)
        const timeInTeam = Math.floor((Date.now() - member.joinedAt.getTime()) / (1000 * 60 * 60 * 24));
        
        // Performance score based on missions completed and engagement
        const performanceScore = missionsCompleted * 10 + (memberXP / 100);

        totalXP += memberXP;
        
        // Aggregate resources
        Object.entries(memberResources).forEach(([resourceType, amount]) => {
          totalResources[resourceType] = (totalResources[resourceType] || 0) + (amount as number);
        });

        // Mock tokens (would come from actual token contract)
        const memberTokens = await this.getUserTokenBalance(member.userId);
        totalTokens += memberTokens;

        memberContributions[member.userId] = {
          xpEarned: memberXP,
          resourcesGenerated: memberResources,
          missionsCompleted,
          timeInTeam,
          performanceScore
        };
      }

      return {
        totalXP,
        totalResources,
        totalTokens,
        memberContributions
      };

    } catch (error) {
      console.error('Error calculating team assets:', error);
      return {
        totalXP: 0,
        totalResources: {},
        totalTokens: 0,
        memberContributions: {}
      };
    }
  }

  // Helper methods
  
  private async getTeamAgreement(teamId: string) {
    return await prisma.founderAgreement.findFirst({
      where: { teams: { some: { id: teamId } } }
    });
  }

  private generateDisputeNextSteps(dispute: any, agreement: any): string[] {
    const steps = [];
    
    if (agreement?.disputeResolutionMechanism === 'VOTING') {
      steps.push('Team members have 7 days to vote on the proposed resolution');
      steps.push('A simple majority (>50%) is required for approval');
    } else if (agreement?.disputeResolutionMechanism === 'ARBITRATION') {
      steps.push('An external arbitrator will be assigned within 48 hours');
      steps.push('Both parties will present their case within 5 business days');
    } else {
      steps.push('Team members can vote or propose alternative resolutions');
      steps.push('The dispute will be resolved within 14 days if no consensus is reached');
    }
    
    return steps;
  }

  private async notifyTeamMembers(teamId: string, eventType: string, eventData: any) {
    // This would integrate with notification service
    console.log(`Notifying team ${teamId} about ${eventType}:`, eventData);
  }

  private async executeDisputeResolution(disputeId: string, resolution: 'APPROVED' | 'REJECTED') {
    await prisma.teamDispute.update({
      where: { id: disputeId },
      data: {
        status: resolution,
        resolvedAt: new Date()
      }
    });

    return { disputeId, resolution, resolvedAt: new Date() };
  }

  private async validateAssetDistribution(distribution: any, teamAssets: any) {
    // Validate XP distribution
    const totalXPAllocated = Object.values(distribution.xpAllocation).reduce((sum: number, amount: any) => sum + amount, 0);
    if (totalXPAllocated > teamAssets.totalXP * 1.1) { // Allow 10% buffer for growth
      return { valid: false, reason: 'XP allocation exceeds available XP' };
    }

    // Validate resource distribution
    for (const [resourceType, totalAmount] of Object.entries(teamAssets.totalResources)) {
      const allocatedAmount = Object.values(distribution.resourceAllocation).reduce(
        (sum: number, userResources: any) => sum + (userResources[resourceType] || 0), 0
      );
      if (allocatedAmount > (totalAmount as number) * 1.1) {
        return { valid: false, reason: `${resourceType} allocation exceeds available amount` };
      }
    }

    // Validate token distribution
    const totalTokensAllocated = Object.values(distribution.tokenAllocation).reduce((sum: number, amount: any) => sum + amount, 0);
    if (totalTokensAllocated > teamAssets.totalTokens * 1.1) {
      return { valid: false, reason: 'Token allocation exceeds available tokens' };
    }

    return { valid: true, reason: null };
  }

  private determineSeparationApproval(separationData: SeparationProposal, team: any) {
    // Auto-approve if unanimous consensus already exists
    const activeMembers = team.teamMembers.filter((m: any) => m.status === 'ACTIVE');
    const acceptedCount = Object.values(separationData.termsAcceptance).filter(Boolean).length;
    
    if (acceptedCount === activeMembers.length) {
      return { votingRequired: false, autoApproved: true };
    }

    // For founder exit or member removal, different rules apply
    if (separationData.separationType === 'MEMBER_REMOVAL') {
      return { votingRequired: true, autoApproved: false };
    }

    return { votingRequired: true, autoApproved: false };
  }

  private async distributeTokensToUser(userId: string, amount: number) {
    // This would integrate with the actual token smart contract
    // For now, we'll create a pending transaction record
    await prisma.tokenTransaction.create({
      data: {
        userId,
        amount,
        type: 'TEAM_SEPARATION_DISTRIBUTION',
        status: 'PENDING',
        createdAt: new Date()
      }
    });
  }

  private async createSeparatedTeams(separation: any): Promise<string[]> {
    // Logic to create new teams for separated groups
    // This would be based on the separation proposal details
    return []; // Placeholder
  }

  private async removeTeamMembers(separation: any) {
    // Remove specific members from the team
    // Update their status to 'REMOVED'
  }

  private async handleFounderExit(separation: any) {
    // Handle founder leaving the team
    // Transfer leadership, update roles, etc.
  }

  private emptyExecutionResults() {
    return {
      xpDistributed: {},
      resourcesDistributed: {},
      tokensDistributed: {},
      newTeamsCreated: []
    };
  }

  private async getUserTokenBalance(userId: string): Promise<number> {
    // This would query the actual token contract
    // For now, return a mock balance
    return 1000; // Mock balance
  }

  private async logSeparationEvent(separationId: string, results: any) {
    // Log the separation event for audit trail
    console.log(`Team separation ${separationId} executed:`, results);
  }
}

export const teamDisputeResolutionService = new TeamDisputeResolutionService();