use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Mint, Transfer};

declare_id!("9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM");

#[program]
pub mod rise_of_founders_protocol {
    use super::*;

    // =============================================================================
    // TEAM VAULT PROGRAM
    // =============================================================================

    /// Initialize a new team vault with multi-sig configuration
    pub fn initialize_team_vault(
        ctx: Context<InitializeTeamVault>,
        team_id: String,
        name: String,
        founders: Vec<Pubkey>,
        threshold: u8,
        bump: u8,
    ) -> Result<()> {
        let team_vault = &mut ctx.accounts.team_vault;
        
        require!(
            founders.len() <= 10,
            ErrorCode::TooManyFounders
        );
        
        require!(
            threshold > 0 && threshold <= founders.len() as u8,
            ErrorCode::InvalidThreshold
        );
        
        team_vault.team_id = team_id;
        team_vault.name = name;
        team_vault.founders = founders;
        team_vault.threshold = threshold;
        team_vault.total_funds = 0;
        team_vault.proposal_count = 0;
        team_vault.bump = bump;
        team_vault.created_at = Clock::get()?.unix_timestamp;
        team_vault.is_active = true;

        emit!(TeamVaultCreated {
            team_vault: ctx.accounts.team_vault.key(),
            team_id: team_vault.team_id.clone(),
            founders: team_vault.founders.clone(),
            threshold,
        });

        Ok(())
    }

    /// Create a spending proposal for team vault
    pub fn create_proposal(
        ctx: Context<CreateProposal>,
        title: String,
        description: String,
        recipient: Pubkey,
        amount: u64,
        proposal_type: ProposalType,
    ) -> Result<()> {
        let team_vault = &mut ctx.accounts.team_vault;
        let proposal = &mut ctx.accounts.proposal;
        
        // Verify signer is a founder
        require!(
            team_vault.founders.contains(&ctx.accounts.proposer.key()),
            ErrorCode::UnauthorizedFounder
        );

        proposal.team_vault = ctx.accounts.team_vault.key();
        proposal.proposer = ctx.accounts.proposer.key();
        proposal.title = title;
        proposal.description = description;
        proposal.recipient = recipient;
        proposal.amount = amount;
        proposal.proposal_type = proposal_type;
        proposal.votes = Vec::new();
        proposal.status = ProposalStatus::Pending;
        proposal.created_at = Clock::get()?.unix_timestamp;
        proposal.expires_at = Clock::get()?.unix_timestamp + 7 * 24 * 60 * 60; // 7 days

        team_vault.proposal_count += 1;

        emit!(ProposalCreated {
            proposal: ctx.accounts.proposal.key(),
            team_vault: ctx.accounts.team_vault.key(),
            proposer: ctx.accounts.proposer.key(),
            amount,
            proposal_type,
        });

        Ok(())
    }

    /// Vote on a spending proposal
    pub fn vote_on_proposal(
        ctx: Context<VoteOnProposal>,
        support: bool,
    ) -> Result<()> {
        let team_vault = &ctx.accounts.team_vault;
        let proposal = &mut ctx.accounts.proposal;
        
        // Verify signer is a founder
        require!(
            team_vault.founders.contains(&ctx.accounts.voter.key()),
            ErrorCode::UnauthorizedFounder
        );
        
        // Check if already voted
        require!(
            !proposal.votes.iter().any(|vote| vote.voter == ctx.accounts.voter.key()),
            ErrorCode::AlreadyVoted
        );
        
        // Check if proposal is still active
        require!(
            proposal.status == ProposalStatus::Pending,
            ErrorCode::ProposalNotActive
        );
        
        require!(
            Clock::get()?.unix_timestamp < proposal.expires_at,
            ErrorCode::ProposalExpired
        );

        proposal.votes.push(Vote {
            voter: ctx.accounts.voter.key(),
            support,
            timestamp: Clock::get()?.unix_timestamp,
        });

        // Check if proposal has enough votes to execute
        let support_votes = proposal.votes.iter().filter(|v| v.support).count();
        if support_votes >= team_vault.threshold as usize {
            proposal.status = ProposalStatus::Approved;
            
            emit!(ProposalApproved {
                proposal: ctx.accounts.proposal.key(),
                team_vault: ctx.accounts.team_vault.key(),
                votes: support_votes as u8,
            });
        }

        Ok(())
    }

    /// Execute an approved proposal
    pub fn execute_proposal(ctx: Context<ExecuteProposal>) -> Result<()> {
        let proposal = &mut ctx.accounts.proposal;
        let team_vault = &ctx.accounts.team_vault;
        
        require!(
            proposal.status == ProposalStatus::Approved,
            ErrorCode::ProposalNotApproved
        );

        // Transfer funds based on proposal type
        match proposal.proposal_type {
            ProposalType::Transfer => {
                let seeds = &[
                    b"team_vault",
                    team_vault.team_id.as_bytes(),
                    &[team_vault.bump],
                ];
                let signer = &[&seeds[..]];

                token::transfer(
                    CpiContext::new_with_signer(
                        ctx.accounts.token_program.to_account_info(),
                        Transfer {
                            from: ctx.accounts.vault_token_account.to_account_info(),
                            to: ctx.accounts.recipient_token_account.to_account_info(),
                            authority: ctx.accounts.team_vault.to_account_info(),
                        },
                        signer,
                    ),
                    proposal.amount,
                )?;
            },
        }

        proposal.status = ProposalStatus::Executed;
        proposal.executed_at = Some(Clock::get()?.unix_timestamp);

        emit!(ProposalExecuted {
            proposal: ctx.accounts.proposal.key(),
            team_vault: ctx.accounts.team_vault.key(),
            amount: proposal.amount,
        });

        Ok(())
    }

    // =============================================================================
    // SPONSOR ESCROW PROGRAM
    // =============================================================================

    /// Initialize a sponsor escrow for quest funding
    pub fn initialize_sponsor_escrow(
        ctx: Context<InitializeSponsorEscrow>,
        quest_id: String,
        total_amount: u64,
        milestones: Vec<Milestone>,
        bump: u8,
    ) -> Result<()> {
        let escrow = &mut ctx.accounts.escrow;
        
        require!(
            milestones.len() <= 10,
            ErrorCode::TooManyMilestones
        );
        
        // Validate milestone percentages sum to 100
        let total_percentage: u16 = milestones.iter().map(|m| m.percentage).sum();
        require!(
            total_percentage == 100,
            ErrorCode::InvalidMilestonePercentages
        );

        escrow.quest_id = quest_id;
        escrow.sponsor = ctx.accounts.sponsor.key();
        escrow.total_amount = total_amount;
        escrow.released_amount = 0;
        escrow.milestones = milestones;
        escrow.status = EscrowStatus::Active;
        escrow.bump = bump;
        escrow.created_at = Clock::get()?.unix_timestamp;

        // Transfer funds to escrow
        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.sponsor_token_account.to_account_info(),
                    to: ctx.accounts.escrow_token_account.to_account_info(),
                    authority: ctx.accounts.sponsor.to_account_info(),
                },
            ),
            total_amount,
        )?;

        emit!(EscrowCreated {
            escrow: ctx.accounts.escrow.key(),
            quest_id: escrow.quest_id.clone(),
            sponsor: ctx.accounts.sponsor.key(),
            total_amount,
        });

        Ok(())
    }

    /// Release milestone payment from escrow
    pub fn release_milestone(
        ctx: Context<ReleaseMilestone>,
        milestone_index: u8,
    ) -> Result<()> {
        let escrow = &mut ctx.accounts.escrow;
        
        require!(
            escrow.status == EscrowStatus::Active,
            ErrorCode::EscrowNotActive
        );
        
        require!(
            milestone_index < escrow.milestones.len() as u8,
            ErrorCode::InvalidMilestoneIndex
        );
        
        let milestone = &mut escrow.milestones[milestone_index as usize];
        
        require!(
            !milestone.released,
            ErrorCode::MilestoneAlreadyReleased
        );

        // Calculate release amount
        let release_amount = (escrow.total_amount as u128 * milestone.percentage as u128 / 100) as u64;

        // Transfer funds from escrow to quest creator
        let seeds = &[
            b"sponsor_escrow",
            escrow.quest_id.as_bytes(),
            &[escrow.bump],
        ];
        let signer = &[&seeds[..]];

        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.escrow_token_account.to_account_info(),
                    to: ctx.accounts.recipient_token_account.to_account_info(),
                    authority: ctx.accounts.escrow.to_account_info(),
                },
                signer,
            ),
            release_amount,
        )?;

        milestone.released = true;
        milestone.released_at = Some(Clock::get()?.unix_timestamp);
        escrow.released_amount += release_amount;

        // Check if all milestones are complete
        if escrow.milestones.iter().all(|m| m.released) {
            escrow.status = EscrowStatus::Completed;
        }

        emit!(MilestoneReleased {
            escrow: ctx.accounts.escrow.key(),
            milestone_index,
            amount: release_amount,
        });

        Ok(())
    }

    // =============================================================================
    // TERRITORY NFT PROGRAM
    // =============================================================================

    /// Initialize a new territory NFT
    pub fn initialize_territory(
        ctx: Context<InitializeTerritory>,
        territory_id: String,
        name: String,
        description: String,
        coordinates: [i32; 2], // [x, y]
        size: u32,
        difficulty: u8,
        max_teams: u16,
        uri: String,
        bump: u8,
    ) -> Result<()> {
        let territory = &mut ctx.accounts.territory;
        
        require!(
            difficulty >= 1 && difficulty <= 5,
            ErrorCode::InvalidDifficulty
        );

        territory.territory_id = territory_id;
        territory.name = name;
        territory.description = description;
        territory.coordinates = coordinates;
        territory.size = size;
        territory.difficulty = difficulty;
        territory.max_teams = max_teams;
        territory.current_teams = 0;
        territory.uri = uri;
        territory.owner = None;
        territory.battles_won = 0;
        territory.battles_lost = 0;
        territory.total_rewards = 0;
        territory.is_active = true;
        territory.bump = bump;
        territory.created_at = Clock::get()?.unix_timestamp;

        emit!(TerritoryCreated {
            territory: ctx.accounts.territory.key(),
            territory_id: territory.territory_id.clone(),
            name: territory.name.clone(),
            coordinates,
            difficulty,
        });

        Ok(())
    }

    /// Initiate a battle for territory control
    pub fn challenge_territory(
        ctx: Context<ChallengeTerritory>,
        challenger_team_id: String,
        battle_type: BattleType,
    ) -> Result<()> {
        let territory = &ctx.accounts.territory;
        let battle = &mut ctx.accounts.battle;
        
        require!(
            territory.is_active,
            ErrorCode::TerritoryNotActive
        );
        
        // Create battle record
        battle.territory = ctx.accounts.territory.key();
        battle.challenger = ctx.accounts.challenger.key();
        battle.challenger_team_id = challenger_team_id;
        battle.defender = territory.owner;
        battle.battle_type = battle_type;
        battle.status = BattleStatus::Pending;
        battle.stake_amount = 0; // To be set based on battle type
        battle.created_at = Clock::get()?.unix_timestamp;
        battle.expires_at = Clock::get()?.unix_timestamp + 24 * 60 * 60; // 24 hours

        emit!(TerritoryChallenge {
            territory: ctx.accounts.territory.key(),
            battle: ctx.accounts.battle.key(),
            challenger: ctx.accounts.challenger.key(),
            battle_type,
        });

        Ok(())
    }

    /// Resolve a territory battle
    pub fn resolve_battle(
        ctx: Context<ResolveBattle>,
        winner: Pubkey,
        score: u32,
    ) -> Result<()> {
        let territory = &mut ctx.accounts.territory;
        let battle = &mut ctx.accounts.battle;
        
        require!(
            battle.status == BattleStatus::Pending,
            ErrorCode::BattleNotActive
        );

        battle.status = BattleStatus::Completed;
        battle.winner = Some(winner);
        battle.score = score;
        battle.resolved_at = Some(Clock::get()?.unix_timestamp);

        // Update territory ownership if challenger wins
        if winner == battle.challenger {
            territory.owner = Some(battle.challenger);
            territory.battles_won += 1;
        } else {
            territory.battles_lost += 1;
        }

        emit!(BattleResolved {
            territory: ctx.accounts.territory.key(),
            battle: ctx.accounts.battle.key(),
            winner,
            score,
        });

        Ok(())
    }
}

// =============================================================================
// ACCOUNT STRUCTURES
// =============================================================================

#[account]
pub struct TeamVault {
    pub team_id: String,
    pub name: String,
    pub founders: Vec<Pubkey>,
    pub threshold: u8,
    pub total_funds: u64,
    pub proposal_count: u64,
    pub bump: u8,
    pub created_at: i64,
    pub is_active: bool,
}

#[account]
pub struct Proposal {
    pub team_vault: Pubkey,
    pub proposer: Pubkey,
    pub title: String,
    pub description: String,
    pub recipient: Pubkey,
    pub amount: u64,
    pub proposal_type: ProposalType,
    pub votes: Vec<Vote>,
    pub status: ProposalStatus,
    pub created_at: i64,
    pub expires_at: i64,
    pub executed_at: Option<i64>,
}

#[account]
pub struct SponsorEscrow {
    pub quest_id: String,
    pub sponsor: Pubkey,
    pub total_amount: u64,
    pub released_amount: u64,
    pub milestones: Vec<Milestone>,
    pub status: EscrowStatus,
    pub bump: u8,
    pub created_at: i64,
}

#[account]
pub struct Territory {
    pub territory_id: String,
    pub name: String,
    pub description: String,
    pub coordinates: [i32; 2],
    pub size: u32,
    pub difficulty: u8,
    pub max_teams: u16,
    pub current_teams: u16,
    pub uri: String,
    pub owner: Option<Pubkey>,
    pub battles_won: u32,
    pub battles_lost: u32,
    pub total_rewards: u64,
    pub is_active: bool,
    pub bump: u8,
    pub created_at: i64,
}

#[account]
pub struct Battle {
    pub territory: Pubkey,
    pub challenger: Pubkey,
    pub challenger_team_id: String,
    pub defender: Option<Pubkey>,
    pub battle_type: BattleType,
    pub status: BattleStatus,
    pub stake_amount: u64,
    pub winner: Option<Pubkey>,
    pub score: u32,
    pub created_at: i64,
    pub expires_at: i64,
    pub resolved_at: Option<i64>,
}

// =============================================================================
// DATA TYPES
// =============================================================================

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct Vote {
    pub voter: Pubkey,
    pub support: bool,
    pub timestamp: i64,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct Milestone {
    pub title: String,
    pub description: String,
    pub percentage: u16, // Percentage of total amount (0-100)
    pub released: bool,
    pub released_at: Option<i64>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq)]
pub enum ProposalType {
    Transfer,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq)]
pub enum ProposalStatus {
    Pending,
    Approved,
    Rejected,
    Executed,
    Expired,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq)]
pub enum EscrowStatus {
    Active,
    Completed,
    Cancelled,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq)]
pub enum BattleType {
    Conquest,
    Defense,
    Raid,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq)]
pub enum BattleStatus {
    Pending,
    InProgress,
    Completed,
    Cancelled,
}

// =============================================================================
// CONTEXT STRUCTURES
// =============================================================================

#[derive(Accounts)]
#[instruction(team_id: String)]
pub struct InitializeTeamVault<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 100 + 32 * 10 + 1 + 8 + 8 + 1 + 8 + 1,
        seeds = [b"team_vault", team_id.as_bytes()],
        bump
    )]
    pub team_vault: Account<'info, TeamVault>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CreateProposal<'info> {
    #[account(mut)]
    pub team_vault: Account<'info, TeamVault>,
    
    #[account(
        init,
        payer = proposer,
        space = 8 + 32 + 32 + 100 + 200 + 32 + 8 + 1 + 32 * 10 + 1 + 8 + 8 + 8,
    )]
    pub proposal: Account<'info, Proposal>,
    
    #[account(mut)]
    pub proposer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct VoteOnProposal<'info> {
    pub team_vault: Account<'info, TeamVault>,
    
    #[account(mut)]
    pub proposal: Account<'info, Proposal>,
    
    pub voter: Signer<'info>,
}

#[derive(Accounts)]
pub struct ExecuteProposal<'info> {
    pub team_vault: Account<'info, TeamVault>,
    
    #[account(mut)]
    pub proposal: Account<'info, Proposal>,
    
    #[account(mut)]
    pub vault_token_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub recipient_token_account: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
#[instruction(quest_id: String)]
pub struct InitializeSponsorEscrow<'info> {
    #[account(
        init,
        payer = sponsor,
        space = 8 + 32 + 32 + 8 + 8 + 32 * 10 + 1 + 1 + 8,
        seeds = [b"sponsor_escrow", quest_id.as_bytes()],
        bump
    )]
    pub escrow: Account<'info, SponsorEscrow>,
    
    #[account(mut)]
    pub sponsor: Signer<'info>,
    
    #[account(mut)]
    pub sponsor_token_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub escrow_token_account: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ReleaseMilestone<'info> {
    #[account(mut)]
    pub escrow: Account<'info, SponsorEscrow>,
    
    #[account(mut)]
    pub escrow_token_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub recipient_token_account: Account<'info, TokenAccount>,
    
    pub authority: Signer<'info>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
#[instruction(territory_id: String)]
pub struct InitializeTerritory<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 100 + 200 + 8 + 4 + 1 + 2 + 2 + 100 + 32 + 4 + 4 + 8 + 1 + 1 + 8,
        seeds = [b"territory", territory_id.as_bytes()],
        bump
    )]
    pub territory: Account<'info, Territory>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ChallengeTerritory<'info> {
    pub territory: Account<'info, Territory>,
    
    #[account(
        init,
        payer = challenger,
        space = 8 + 32 + 32 + 32 + 32 + 1 + 1 + 8 + 32 + 4 + 8 + 8 + 8,
    )]
    pub battle: Account<'info, Battle>,
    
    #[account(mut)]
    pub challenger: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ResolveBattle<'info> {
    #[account(mut)]
    pub territory: Account<'info, Territory>,
    
    #[account(mut)]
    pub battle: Account<'info, Battle>,
    
    pub authority: Signer<'info>,
}

// =============================================================================
// EVENTS
// =============================================================================

#[event]
pub struct TeamVaultCreated {
    pub team_vault: Pubkey,
    pub team_id: String,
    pub founders: Vec<Pubkey>,
    pub threshold: u8,
}

#[event]
pub struct ProposalCreated {
    pub proposal: Pubkey,
    pub team_vault: Pubkey,
    pub proposer: Pubkey,
    pub amount: u64,
    pub proposal_type: ProposalType,
}

#[event]
pub struct ProposalApproved {
    pub proposal: Pubkey,
    pub team_vault: Pubkey,
    pub votes: u8,
}

#[event]
pub struct ProposalExecuted {
    pub proposal: Pubkey,
    pub team_vault: Pubkey,
    pub amount: u64,
}

#[event]
pub struct EscrowCreated {
    pub escrow: Pubkey,
    pub quest_id: String,
    pub sponsor: Pubkey,
    pub total_amount: u64,
}

#[event]
pub struct MilestoneReleased {
    pub escrow: Pubkey,
    pub milestone_index: u8,
    pub amount: u64,
}

#[event]
pub struct TerritoryCreated {
    pub territory: Pubkey,
    pub territory_id: String,
    pub name: String,
    pub coordinates: [i32; 2],
    pub difficulty: u8,
}

#[event]
pub struct TerritoryChallenge {
    pub territory: Pubkey,
    pub battle: Pubkey,
    pub challenger: Pubkey,
    pub battle_type: BattleType,
}

#[event]
pub struct BattleResolved {
    pub territory: Pubkey,
    pub battle: Pubkey,
    pub winner: Pubkey,
    pub score: u32,
}

// =============================================================================
// ERROR CODES
// =============================================================================

#[error_code]
pub enum ErrorCode {
    #[msg("Too many founders in team (max 10)")]
    TooManyFounders,
    
    #[msg("Invalid threshold value")]
    InvalidThreshold,
    
    #[msg("Unauthorized founder")]
    UnauthorizedFounder,
    
    #[msg("Already voted on this proposal")]
    AlreadyVoted,
    
    #[msg("Proposal is not active")]
    ProposalNotActive,
    
    #[msg("Proposal has expired")]
    ProposalExpired,
    
    #[msg("Proposal is not approved")]
    ProposalNotApproved,
    
    #[msg("Too many milestones (max 10)")]
    TooManyMilestones,
    
    #[msg("Milestone percentages must sum to 100")]
    InvalidMilestonePercentages,
    
    #[msg("Escrow is not active")]
    EscrowNotActive,
    
    #[msg("Invalid milestone index")]
    InvalidMilestoneIndex,
    
    #[msg("Milestone already released")]
    MilestoneAlreadyReleased,
    
    #[msg("Invalid difficulty level (1-5)")]
    InvalidDifficulty,
    
    #[msg("Territory is not active")]
    TerritoryNotActive,
    
    #[msg("Battle is not active")]
    BattleNotActive,
}