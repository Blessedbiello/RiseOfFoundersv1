export interface MissionStep {
  id: string;
  title: string;
  description: string;
  type: 'reading' | 'video' | 'quiz' | 'coding' | 'submission' | 'reflection' | 'peer_review';
  content?: string;
  videoUrl?: string;
  quizQuestions?: QuizQuestion[];
  submissionType?: 'github' | 'url' | 'text' | 'file' | 'solana_tx';
  estimatedMinutes: number;
  isRequired: boolean;
  order: number;
}

export interface QuizQuestion {
  id: string;
  question: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer' | 'code_snippet';
  options?: string[];
  correctAnswer: string | string[];
  explanation: string;
  points: number;
}

export interface Mission {
  id: string;
  nodeId: string;
  title: string;
  description: string;
  objectives: string[];
  category: 'technical' | 'business' | 'leadership' | 'product' | 'design' | 'marketing';
  difficulty: 1 | 2 | 3 | 4 | 5;
  estimatedTimeMinutes: number;
  xpReward: number;
  badgeRewards: string[];
  resourceRewards: string[];
  prerequisites: string[];
  skills: string[];
  steps: MissionStep[];
  successCriteria: string[];
  mentorGuidance?: string;
  communityResources?: string[];
  realWorldApplication?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Silicon Valley Missions
export const siliconValleyMissions: Mission[] = [
  {
    id: 'sv_welcome_mission',
    nodeId: 'sv_welcome',
    title: 'Embrace the Silicon Valley Mindset',
    description: 'Learn the fundamental principles that drive Silicon Valley innovation and entrepreneurship',
    objectives: [
      'Understand the history and culture of Silicon Valley',
      'Identify key success factors for tech startups',
      'Develop a growth mindset for entrepreneurship',
      'Connect with the global founder community'
    ],
    category: 'business',
    difficulty: 1,
    estimatedTimeMinutes: 30,
    xpReward: 100,
    badgeRewards: ['valley_newcomer'],
    resourceRewards: ['startup_guide', 'networking_tips'],
    prerequisites: [],
    skills: ['entrepreneurship', 'networking'],
    steps: [
      {
        id: 'sv_welcome_step_1',
        title: 'Silicon Valley History',
        description: 'Watch a comprehensive overview of Silicon Valley\'s evolution from orchards to tech capital',
        type: 'video',
        videoUrl: 'https://example.com/sv-history',
        estimatedMinutes: 8,
        isRequired: true,
        order: 1
      },
      {
        id: 'sv_welcome_step_2',
        title: 'Founder Mindset Reading',
        description: 'Read about the key mental models that successful Silicon Valley founders use',
        type: 'reading',
        content: `# The Silicon Valley Mindset

The Silicon Valley mindset is characterized by several key principles:

## 1. Think 10x, Not 10%
Incremental improvements are good, but breakthrough innovation requires thinking 10 times bigger than the status quo.

## 2. Fail Fast, Learn Faster
Failure is not the opposite of success—it's a stepping stone to success. The key is to fail quickly, cheaply, and learn from each failure.

## 3. Focus on Impact at Scale
The most successful startups solve problems for millions or billions of people, not just thousands.

## 4. Embrace the Network Effect
Your network is your net worth. Silicon Valley thrives on connections, mentorship, and collaborative competition.

## 5. Data-Driven Decision Making
Gut instincts are important, but data should drive most of your strategic decisions.`,
        estimatedMinutes: 12,
        isRequired: true,
        order: 2
      },
      {
        id: 'sv_welcome_step_3',
        title: 'Mindset Assessment',
        description: 'Test your understanding of the Silicon Valley entrepreneurial mindset',
        type: 'quiz',
        quizQuestions: [
          {
            id: 'q1',
            question: 'What does "think 10x, not 10%" mean in the context of innovation?',
            type: 'multiple_choice',
            options: [
              'Make small incremental improvements',
              'Aim for breakthrough innovations that are 10 times better',
              'Increase profits by 10%',
              'Hire 10 times more employees'
            ],
            correctAnswer: 'Aim for breakthrough innovations that are 10 times better',
            explanation: 'The 10x thinking principle encourages founders to pursue radical improvements rather than incremental ones.',
            points: 10
          },
          {
            id: 'q2',
            question: 'True or False: In Silicon Valley culture, failure is seen as a sign of weakness.',
            type: 'true_false',
            correctAnswer: 'False',
            explanation: 'Silicon Valley culture embraces failure as a learning opportunity and stepping stone to success.',
            points: 10
          },
          {
            id: 'q3',
            question: 'What is the most important aspect of network effects in Silicon Valley?',
            type: 'multiple_choice',
            options: [
              'Having the most social media followers',
              'Building meaningful relationships that create mutual value',
              'Attending the most networking events',
              'Collecting the most business cards'
            ],
            correctAnswer: 'Building meaningful relationships that create mutual value',
            explanation: 'Quality relationships that provide mutual value are more important than quantity.',
            points: 15
          }
        ],
        estimatedMinutes: 5,
        isRequired: true,
        order: 3
      },
      {
        id: 'sv_welcome_step_4',
        title: 'Personal Vision Statement',
        description: 'Craft your personal mission statement as an entrepreneur',
        type: 'reflection',
        content: 'Write a 2-3 sentence personal vision statement that captures your entrepreneurial goals and the impact you want to make. Consider: What problem do you want to solve? Who do you want to help? What legacy do you want to leave?',
        submissionType: 'text',
        estimatedMinutes: 5,
        isRequired: true,
        order: 4
      }
    ],
    successCriteria: [
      'Complete video overview of Silicon Valley history',
      'Read and understand key mindset principles',
      'Score 80% or higher on mindset assessment quiz',
      'Submit personal vision statement'
    ],
    mentorGuidance: 'Remember, entrepreneurship is a journey of continuous learning. The Silicon Valley mindset is about embracing challenges as opportunities.',
    communityResources: ['Founder Slack Channel', 'Weekly Networking Events', 'Mentor Office Hours'],
    realWorldApplication: 'Apply these mindset principles to evaluate your current projects or ideas. Look for opportunities to think bigger and embrace experimentation.',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },

  {
    id: 'sv_idea_validation_mission',
    nodeId: 'sv_idea_validation',
    title: 'Master Lean Startup Validation',
    description: 'Learn to validate startup ideas using lean methodology and customer discovery techniques',
    objectives: [
      'Understand the Build-Measure-Learn cycle',
      'Conduct effective customer interviews',
      'Create and test hypotheses',
      'Use data to validate or pivot your idea'
    ],
    category: 'business',
    difficulty: 2,
    estimatedTimeMinutes: 90,
    xpReward: 200,
    badgeRewards: ['idea_validator'],
    resourceRewards: ['validation_framework', 'customer_interview_guide'],
    prerequisites: ['sv_welcome_mission'],
    skills: ['market_research', 'customer_development'],
    steps: [
      {
        id: 'sv_validation_step_1',
        title: 'Lean Startup Fundamentals',
        description: 'Learn the core principles of lean startup methodology',
        type: 'reading',
        content: `# Lean Startup Methodology

The Lean Startup methodology, developed by Eric Ries, focuses on building businesses and products using validated learning, rapid experimentation, and iterative product releases.

## Core Principles

### 1. Build-Measure-Learn Cycle
- **Build**: Create a Minimum Viable Product (MVP) to test your hypothesis
- **Measure**: Collect data on how customers interact with your MVP
- **Learn**: Use the data to validate or invalidate your assumptions

### 2. Validated Learning
Learning what customers want is more important than having the "perfect" product. Each experiment should teach you something valuable about your customers and market.

### 3. Innovation Accounting
Traditional metrics don't work for startups. Focus on actionable metrics, cohort analysis, and split testing rather than vanity metrics.

## The Problem-Solution Fit

Before building anything, you need to validate:
1. That the problem exists and is significant
2. That your target customers care about solving it
3. That your solution addresses the core problem
4. That customers are willing to pay for a solution

## Customer Development Process

1. **Customer Discovery**: Understand the problem and customer
2. **Customer Validation**: Validate the solution and business model
3. **Customer Creation**: Scale the validated business model
4. **Company Building**: Transition from startup to established company`,
        estimatedMinutes: 20,
        isRequired: true,
        order: 1
      },
      {
        id: 'sv_validation_step_2',
        title: 'Hypothesis Formation',
        description: 'Create testable hypotheses about your startup idea',
        type: 'submission',
        content: `Create 5 testable hypotheses about your startup idea using this format:

"We believe that [target customer] experiences [problem] when [situation]. They would be willing to [desired action] if we provide [solution] because [motivation]."

Example: "We believe that busy professionals experience difficulty meal planning when they work long hours. They would be willing to pay $20/week for pre-planned healthy meals if we provide personalized meal plans with grocery lists because it saves them 2+ hours per week and improves their health."

For each hypothesis, identify:
- How you will test it
- What success metrics you'll measure
- What would cause you to pivot or abandon the hypothesis`,
        submissionType: 'text',
        estimatedMinutes: 25,
        isRequired: true,
        order: 2
      },
      {
        id: 'sv_validation_step_3',
        title: 'Customer Interview Workshop',
        description: 'Watch expert guidance on conducting effective customer interviews',
        type: 'video',
        videoUrl: 'https://example.com/customer-interviews',
        estimatedMinutes: 15,
        isRequired: true,
        order: 3
      },
      {
        id: 'sv_validation_step_4',
        title: 'Interview Practice',
        description: 'Conduct and document 5 customer interviews',
        type: 'submission',
        content: `Conduct 5 customer interviews with your target audience. For each interview, document:

1. **Interviewee Profile**: Demographics, role, relevant background
2. **Problem Validation**: Do they experience the problem? How significant is it?
3. **Current Solutions**: What do they do now? What alternatives exist?
4. **Solution Feedback**: Their reaction to your proposed solution
5. **Willingness to Pay**: Would they pay for a solution? How much?
6. **Key Insights**: Surprising discoveries or pattern recognition

Submit your interview summaries and key learnings. Focus on patterns across interviews rather than individual responses.`,
        submissionType: 'text',
        estimatedMinutes: 25,
        isRequired: true,
        order: 4
      },
      {
        id: 'sv_validation_step_5',
        title: 'Validation Assessment',
        description: 'Test your understanding of validation principles',
        type: 'quiz',
        quizQuestions: [
          {
            id: 'val_q1',
            question: 'What is the primary purpose of the Build-Measure-Learn cycle?',
            type: 'multiple_choice',
            options: [
              'To build the perfect product on the first try',
              'To maximize revenue as quickly as possible',
              'To validate assumptions through rapid experimentation',
              'To compete with established companies'
            ],
            correctAnswer: 'To validate assumptions through rapid experimentation',
            explanation: 'The cycle is designed to test assumptions quickly and cheaply before making large investments.',
            points: 15
          },
          {
            id: 'val_q2',
            question: 'Which of these is a vanity metric that provides little actionable insight?',
            type: 'multiple_choice',
            options: [
              'Customer retention rate',
              'Total page views',
              'Customer acquisition cost',
              'Monthly recurring revenue'
            ],
            correctAnswer: 'Total page views',
            explanation: 'Page views don\'t indicate customer value or business progress. Focus on actionable metrics.',
            points: 10
          },
          {
            id: 'val_q3',
            question: 'What should you do if customer interviews consistently contradict your assumptions?',
            type: 'multiple_choice',
            options: [
              'Find different customers to interview',
              'Convince customers that they\'re wrong',
              'Pivot your idea based on the feedback',
              'Ignore the feedback and proceed anyway'
            ],
            correctAnswer: 'Pivot your idea based on the feedback',
            explanation: 'Customer feedback is invaluable data. If assumptions are consistently wrong, it\'s time to pivot.',
            points: 20
          }
        ],
        estimatedMinutes: 5,
        isRequired: true,
        order: 5
      }
    ],
    successCriteria: [
      'Complete lean startup methodology reading',
      'Create 5 testable hypotheses',
      'Conduct 5 customer interviews with detailed documentation',
      'Score 80% or higher on validation assessment',
      'Demonstrate learning from customer feedback'
    ],
    mentorGuidance: 'The goal is not to prove you\'re right—it\'s to learn what\'s true. Be open to feedback that contradicts your assumptions.',
    communityResources: ['Customer Interview Templates', 'Validation Frameworks', 'Peer Review Groups'],
    realWorldApplication: 'Use these techniques to validate any future business ideas before investing significant time or money.',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },

  {
    id: 'sv_mvp_building_mission',
    nodeId: 'sv_mvp_building',
    title: 'Build Your Minimum Viable Product',
    description: 'Create a functional MVP that tests your core value proposition with minimal resources',
    objectives: [
      'Understand MVP principles and anti-patterns',
      'Choose appropriate technologies for rapid development',
      'Build a working prototype that validates key assumptions',
      'Deploy and gather user feedback'
    ],
    category: 'technical',
    difficulty: 3,
    estimatedTimeMinutes: 180,
    xpReward: 400,
    badgeRewards: ['mvp_builder', 'technical_founder'],
    resourceRewards: ['dev_toolkit', 'deployment_guide'],
    prerequisites: ['sv_idea_validation_mission'],
    skills: ['full_stack_dev', 'product_design', 'user_experience'],
    steps: [
      {
        id: 'sv_mvp_step_1',
        title: 'MVP Strategy Planning',
        description: 'Define your MVP scope and core features',
        type: 'submission',
        content: `Plan your MVP strategy by answering these questions:

## MVP Definition
1. **Core Value Proposition**: What is the single most important thing your product does for users?
2. **Target Users**: Who is your primary user persona for the MVP?
3. **Key User Journey**: What is the essential flow users need to complete?

## Feature Prioritization
Create a feature list categorized as:
- **Must Have**: Core features required to deliver value
- **Should Have**: Important features that enhance the experience
- **Could Have**: Nice-to-have features for later versions
- **Won't Have**: Features explicitly excluded from MVP

## Success Metrics
Define 3-5 measurable outcomes that indicate MVP success:
- User engagement metrics (e.g., daily active users, session duration)
- Product-market fit indicators (e.g., retention rate, user feedback scores)
- Business metrics (e.g., conversion rate, revenue per user)

## Technical Approach
- What technology stack will you use?
- What third-party services will you integrate?
- How will you collect user feedback and analytics?`,
        submissionType: 'text',
        estimatedMinutes: 30,
        isRequired: true,
        order: 1
      },
      {
        id: 'sv_mvp_step_2',
        title: 'Rapid Prototyping Techniques',
        description: 'Learn modern tools and frameworks for rapid MVP development',
        type: 'video',
        videoUrl: 'https://example.com/rapid-prototyping',
        estimatedMinutes: 20,
        isRequired: true,
        order: 2
      },
      {
        id: 'sv_mvp_step_3',
        title: 'Build Your MVP',
        description: 'Create a working version of your MVP',
        type: 'coding',
        content: `Build your MVP using the plan from Step 1. Your MVP should include:

## Technical Requirements
1. **Functional Core Feature**: The primary value proposition must work
2. **User Authentication**: Simple sign-up/login system
3. **Data Persistence**: Store user data and interactions
4. **Basic UI/UX**: Clean, usable interface (doesn't need to be perfect)
5. **Analytics Integration**: Track user behavior and key metrics
6. **Feedback Collection**: Way for users to provide feedback

## Submission Requirements
Submit your MVP with:
1. **GitHub Repository**: Clean, documented code
2. **Live Demo URL**: Deployed and accessible application
3. **README Documentation**: Setup instructions, feature list, tech stack
4. **Demo Video**: 3-minute walkthrough of key features
5. **Architecture Overview**: High-level system design

## Code Quality Standards
- Clean, readable code with comments
- Basic error handling
- Responsive design for mobile and desktop
- Security best practices (input validation, authentication)

Focus on functionality over aesthetics. The goal is to validate your idea, not win design awards.`,
        submissionType: 'github',
        estimatedMinutes: 120,
        isRequired: true,
        order: 3
      },
      {
        id: 'sv_mvp_step_4',
        title: 'MVP Launch and Feedback',
        description: 'Deploy your MVP and collect initial user feedback',
        type: 'submission',
        content: `Launch your MVP and gather feedback from at least 20 users. Document:

## Launch Activities
1. **Deployment**: Confirm your MVP is live and accessible
2. **User Acquisition**: How did you find your first 20 users?
3. **Onboarding**: How did users discover and start using your product?

## User Feedback Analysis
For your 20+ test users, collect:
- **Demographics**: Basic user profile information
- **Usage Patterns**: How do they actually use your product?
- **Pain Points**: What frustrates or confuses them?
- **Value Perception**: What value do they get from your product?
- **Feature Requests**: What do they want to see added?
- **Willingness to Pay**: Would they pay for this? How much?

## Metrics Dashboard
Create a simple dashboard showing:
- User registration and activation rates
- Core feature usage
- User retention (1-day, 7-day return rates)
- User-reported satisfaction scores

## Insights and Next Steps
Based on feedback and metrics:
- What assumptions were validated or invalidated?
- What surprised you about user behavior?
- What would you build next?
- Would you pivot any part of your approach?`,
        submissionType: 'url',
        estimatedMinutes: 10,
        isRequired: true,
        order: 4
      }
    ],
    successCriteria: [
      'Complete MVP strategy with clear feature prioritization',
      'Build functional MVP with core features working',
      'Deploy MVP to production environment',
      'Collect feedback from 20+ real users',
      'Demonstrate measurable user engagement'
    ],
    mentorGuidance: 'Remember: an MVP is not a product with fewer features—it\'s the fastest way to start learning. Focus on speed and learning over perfection.',
    communityResources: ['Technical Mentors', 'Code Review Sessions', 'Demo Day Presentations'],
    realWorldApplication: 'This MVP development process scales to any product idea. Use it for future projects to validate quickly and build efficiently.',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
];

// Crypto Valley Missions
export const cryptoValleyMissions: Mission[] = [
  {
    id: 'cv_blockchain_basics_mission',
    nodeId: 'cv_blockchain_basics',
    title: 'Master Blockchain Fundamentals',
    description: 'Build a solid foundation in distributed ledger technology, cryptography, and decentralized systems',
    objectives: [
      'Understand how blockchains work at a technical level',
      'Learn cryptographic concepts essential for blockchain',
      'Explore different consensus mechanisms',
      'Analyze real blockchain networks and transactions'
    ],
    category: 'technical',
    difficulty: 2,
    estimatedTimeMinutes: 60,
    xpReward: 150,
    badgeRewards: ['blockchain_explorer'],
    resourceRewards: ['crypto_glossary', 'blockchain_primer'],
    prerequisites: [],
    skills: ['blockchain', 'cryptography', 'distributed_systems'],
    steps: [
      {
        id: 'cv_blockchain_step_1',
        title: 'Blockchain Architecture Deep Dive',
        description: 'Understand the fundamental components of blockchain technology',
        type: 'reading',
        content: `# Blockchain Technology Fundamentals

## What is a Blockchain?

A blockchain is a distributed, immutable ledger that maintains a continuously growing list of records (blocks) linked using cryptography. Each block contains a cryptographic hash of the previous block, a timestamp, and transaction data.

## Core Components

### 1. Blocks
- **Header**: Contains metadata about the block
- **Hash**: Unique identifier for the block
- **Previous Hash**: Links to the previous block
- **Merkle Root**: Summary of all transactions in the block
- **Timestamp**: When the block was created
- **Nonce**: Number used once in proof-of-work

### 2. Transactions
- Digital records of asset transfers
- Signed with private keys
- Verified using public keys
- Grouped into blocks by miners/validators

### 3. Network Nodes
- **Full Nodes**: Store complete blockchain history
- **Light Nodes**: Store block headers only
- **Mining/Validator Nodes**: Create new blocks

## Cryptographic Foundations

### Hash Functions
- One-way mathematical functions
- Input → Fixed-size output (hash/digest)
- Avalanche effect: Small input changes = dramatically different output
- Bitcoin uses SHA-256

### Digital Signatures
- Prove ownership without revealing private keys
- Created using private key + message
- Verified using public key + signature + message
- Ensures authenticity and non-repudiation

### Merkle Trees
- Binary trees of hashed transaction data
- Enable efficient verification of large datasets
- Root hash represents all transactions in a block

## Decentralization Benefits

1. **No Single Point of Failure**: Distributed across many nodes
2. **Censorship Resistance**: No central authority can block transactions
3. **Transparency**: All transactions are publicly verifiable
4. **Immutability**: Historical records cannot be altered
5. **Trustless**: No need to trust intermediaries`,
        estimatedMinutes: 25,
        isRequired: true,
        order: 1
      },
      {
        id: 'cv_blockchain_step_2',
        title: 'Consensus Mechanisms',
        description: 'Learn how blockchain networks reach agreement on the state of the ledger',
        type: 'video',
        videoUrl: 'https://example.com/consensus-mechanisms',
        estimatedMinutes: 15,
        isRequired: true,
        order: 2
      },
      {
        id: 'cv_blockchain_step_3',
        title: 'Blockchain Analysis Exercise',
        description: 'Analyze real blockchain transactions using block explorers',
        type: 'submission',
        content: `Use blockchain explorers to analyze real transactions and answer these questions:

## Bitcoin Analysis (use blockchain.info or blockchair.com)
1. **Latest Block Analysis**:
   - What is the current block height?
   - How many transactions are in the latest block?
   - What is the block size and how much space is being used?
   - Who mined this block and what was the mining reward?

2. **Transaction Deep Dive**:
   - Find a transaction with multiple inputs and outputs
   - What are the total input and output amounts?
   - Calculate the transaction fee
   - What is the transaction size in bytes?

## Ethereum Analysis (use etherscan.io)
1. **Smart Contract Interaction**:
   - Find a transaction that interacts with a smart contract
   - What contract is being called?
   - What function was executed?
   - How much gas was used vs. the gas limit?

2. **Token Transfer**:
   - Find an ERC-20 token transfer transaction
   - What token was transferred and in what amount?
   - Compare the ETH transaction fee to the token value

## Comparison Analysis
Write a 300-word comparison of Bitcoin and Ethereum transactions, covering:
- Transaction structure differences
- Fee calculation methods
- Transaction throughput and confirmation times
- Types of operations supported`,
        submissionType: 'text',
        estimatedMinutes: 15,
        isRequired: true,
        order: 3
      },
      {
        id: 'cv_blockchain_step_4',
        title: 'Blockchain Knowledge Check',
        description: 'Test your understanding of blockchain fundamentals',
        type: 'quiz',
        quizQuestions: [
          {
            id: 'bc_q1',
            question: 'What ensures the immutability of a blockchain?',
            type: 'multiple_choice',
            options: [
              'Each block contains a hash of the previous block',
              'Transactions are encrypted',
              'The network has many nodes',
              'Blocks are stored in chronological order'
            ],
            correctAnswer: 'Each block contains a hash of the previous block',
            explanation: 'The chain of hashes creates a tamper-evident structure where changing any historical data would require changing all subsequent blocks.',
            points: 15
          },
          {
            id: 'bc_q2',
            question: 'What is the primary purpose of a Merkle tree in blockchain?',
            type: 'multiple_choice',
            options: [
              'To encrypt transaction data',
              'To efficiently verify large sets of transactions',
              'To store wallet addresses',
              'To calculate mining rewards'
            ],
            correctAnswer: 'To efficiently verify large sets of transactions',
            explanation: 'Merkle trees allow efficient and secure verification of large data structures without downloading all the data.',
            points: 20
          },
          {
            id: 'bc_q3',
            question: 'True or False: In a blockchain, transactions are processed in the exact order they are received.',
            type: 'true_false',
            correctAnswer: 'False',
            explanation: 'Miners/validators can choose which transactions to include and in what order, often prioritizing by transaction fees.',
            points: 10
          }
        ],
        estimatedMinutes: 5,
        isRequired: true,
        order: 4
      }
    ],
    successCriteria: [
      'Complete blockchain architecture reading',
      'Watch consensus mechanisms video',
      'Successfully analyze Bitcoin and Ethereum transactions',
      'Score 85% or higher on blockchain knowledge quiz',
      'Demonstrate understanding of cryptographic concepts'
    ],
    mentorGuidance: 'Focus on understanding the "why" behind blockchain design decisions. Each component serves a specific purpose in creating a trustless, decentralized system.',
    communityResources: ['Blockchain Study Groups', 'Technical Deep Dives', 'Developer Office Hours'],
    realWorldApplication: 'This knowledge forms the foundation for smart contract development, DeFi protocols, and Web3 applications.',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },

  {
    id: 'cv_smart_contracts_mission',
    nodeId: 'cv_smart_contracts',
    title: 'Smart Contract Development Mastery',
    description: 'Learn to write, deploy, and audit smart contracts on Ethereum using Solidity',
    objectives: [
      'Write secure smart contracts in Solidity',
      'Understand gas optimization techniques',
      'Deploy contracts to testnet and mainnet',
      'Implement proper testing and security practices'
    ],
    category: 'technical',
    difficulty: 3,
    estimatedTimeMinutes: 180,
    xpReward: 400,
    badgeRewards: ['smart_contract_dev', 'solidity_master'],
    resourceRewards: ['solidity_toolkit', 'contract_templates'],
    prerequisites: ['cv_blockchain_basics_mission'],
    skills: ['solidity', 'smart_contracts', 'ethereum'],
    steps: [
      {
        id: 'cv_sc_step_1',
        title: 'Solidity Fundamentals',
        description: 'Learn the Solidity programming language and smart contract concepts',
        type: 'reading',
        content: `# Solidity and Smart Contracts

## What are Smart Contracts?

Smart contracts are self-executing contracts with terms directly written into code. They automatically enforce and execute agreements when predetermined conditions are met, without requiring intermediaries.

## Solidity Language Basics

### Data Types
\`\`\`solidity
// Value Types
bool public isActive = true;
uint256 public balance = 1000;
address public owner = 0x123...;
string public name = "MyContract";

// Reference Types
uint[] public numbers;
mapping(address => uint256) public balances;
struct User {
    string name;
    uint256 age;
}
\`\`\`

### Functions and Modifiers
\`\`\`solidity
// State changing function
function transfer(address to, uint256 amount) public {
    require(balances[msg.sender] >= amount, "Insufficient balance");
    balances[msg.sender] -= amount;
    balances[to] += amount;
}

// View function (doesn't change state)
function getBalance(address account) public view returns (uint256) {
    return balances[account];
}

// Modifier for access control
modifier onlyOwner() {
    require(msg.sender == owner, "Not the owner");
    _;
}
\`\`\`

### Events and Logging
\`\`\`solidity
event Transfer(address indexed from, address indexed to, uint256 value);

function transfer(address to, uint256 amount) public {
    // ... transfer logic ...
    emit Transfer(msg.sender, to, amount);
}
\`\`\`

## Smart Contract Architecture

### 1. State Variables
Store data on the blockchain permanently

### 2. Functions
- **Public**: Callable by anyone
- **Private**: Only callable within the contract
- **Internal**: Callable within contract and derived contracts
- **External**: Only callable from outside the contract

### 3. Function Modifiers
- **View**: Doesn't modify state
- **Pure**: Doesn't read or modify state
- **Payable**: Can receive Ether

## Gas and Optimization

Every operation costs gas. Optimization strategies:
- Use appropriate data types
- Pack structs efficiently
- Minimize storage operations
- Use events for data that doesn't need to be queryable

## Security Considerations

1. **Reentrancy**: Use checks-effects-interactions pattern
2. **Integer Overflow**: Use SafeMath or Solidity 0.8+
3. **Access Control**: Implement proper permission systems
4. **Input Validation**: Always validate external inputs`,
        estimatedMinutes: 45,
        isRequired: true,
        order: 1
      },
      {
        id: 'cv_sc_step_2',
        title: 'Development Environment Setup',
        description: 'Set up your Solidity development environment with Hardhat',
        type: 'coding',
        content: `Set up a complete Solidity development environment:

## Requirements
1. **Install Node.js and npm**
2. **Create new Hardhat project**
3. **Configure development networks (local, testnet, mainnet)**
4. **Set up environment variables for sensitive data**
5. **Install essential development dependencies**

## Project Structure
Create a project with this structure:
\`\`\`
my-smart-contract/
├── contracts/
│   ├── MyToken.sol
│   └── MyContract.sol
├── scripts/
│   ├── deploy.js
│   └── interact.js
├── test/
│   ├── MyToken.test.js
│   └── MyContract.test.js
├── hardhat.config.js
├── package.json
└── .env
\`\`\`

## Hardhat Configuration
Configure networks for:
- Local development (Hardhat Network)
- Ethereum testnet (Goerli or Sepolia)
- Polygon testnet (Mumbai)

## Submission
Submit your GitHub repository with:
1. Complete project setup with proper folder structure
2. Hardhat configuration file with multiple networks
3. Package.json with all necessary dependencies
4. README with setup and usage instructions
5. Environment file template (.env.example)`,
        submissionType: 'github',
        estimatedMinutes: 30,
        isRequired: true,
        order: 2
      },
      {
        id: 'cv_sc_step_3',
        title: 'Build Your First Smart Contract',
        description: 'Create a complete ERC-20 token contract with additional features',
        type: 'coding',
        content: `Build a comprehensive ERC-20 token contract with advanced features:

## Core Requirements
Your token contract must include:

### 1. Standard ERC-20 Functions
- \`totalSupply()\`
- \`balanceOf(address account)\`
- \`transfer(address to, uint256 amount)\`
- \`allowance(address owner, address spender)\`
- \`approve(address spender, uint256 amount)\`
- \`transferFrom(address from, address to, uint256 amount)\`

### 2. Additional Features
- **Mintable**: Owner can create new tokens
- **Burnable**: Token holders can destroy their tokens
- **Pausable**: Owner can pause all transfers
- **Access Control**: Role-based permissions

### 3. Security Features
- Reentrancy protection
- SafeMath operations (or use Solidity 0.8+)
- Input validation
- Event logging

## Advanced Features (Choose 2)
- **Vesting**: Lock tokens for a period
- **Staking**: Earn rewards for holding tokens
- **Governance**: Token holders can vote on proposals
- **Tax**: Take a percentage of transfers
- **Reflection**: Distribute rewards to all holders

## Testing Requirements
Write comprehensive tests covering:
- All ERC-20 functions
- Edge cases and error conditions
- Access control mechanisms
- Gas usage analysis

## Deployment
Deploy to testnet and verify contract on block explorer

## Submission
Your GitHub repository must include:
1. Complete smart contract code
2. Comprehensive test suite (90%+ coverage)
3. Deployment scripts
4. Gas optimization analysis
5. Security audit checklist
6. Live testnet deployment with verified contract`,
        submissionType: 'github',
        estimatedMinutes: 90,
        isRequired: true,
        order: 3
      },
      {
        id: 'cv_sc_step_4',
        title: 'Smart Contract Security Assessment',
        description: 'Test your knowledge of smart contract security best practices',
        type: 'quiz',
        quizQuestions: [
          {
            id: 'sc_q1',
            question: 'What is the "checks-effects-interactions" pattern designed to prevent?',
            type: 'multiple_choice',
            options: [
              'Gas optimization issues',
              'Reentrancy attacks',
              'Integer overflow',
              'Access control vulnerabilities'
            ],
            correctAnswer: 'Reentrancy attacks',
            explanation: 'This pattern prevents reentrancy by doing checks first, updating state second, and interacting with external contracts last.',
            points: 20
          },
          {
            id: 'sc_q2',
            question: 'Why should you avoid loops with unbounded iteration in smart contracts?',
            type: 'multiple_choice',
            options: [
              'They consume too much memory',
              'They can cause gas limit issues',
              'They are not supported in Solidity',
              'They make code harder to read'
            ],
            correctAnswer: 'They can cause gas limit issues',
            explanation: 'Unbounded loops can consume more gas than the block gas limit, causing transactions to fail.',
            points: 15
          },
          {
            id: 'sc_q3',
            question: 'What is the purpose of the "payable" modifier in Solidity?',
            type: 'short_answer',
            correctAnswer: 'Allows the function to receive Ether',
            explanation: 'Functions marked as payable can receive Ether as part of the transaction.',
            points: 10
          }
        ],
        estimatedMinutes: 15,
        isRequired: true,
        order: 4
      }
    ],
    successCriteria: [
      'Complete Solidity fundamentals reading',
      'Set up working Hardhat development environment',
      'Build and deploy ERC-20 token with advanced features',
      'Achieve 90%+ test coverage',
      'Score 85% or higher on security assessment',
      'Deploy verified contract to testnet'
    ],
    mentorGuidance: 'Smart contract development requires extreme attention to security. Every line of code handles real value, so thorough testing and security practices are essential.',
    communityResources: ['Solidity Study Groups', 'Smart Contract Audits', 'Developer Workshops'],
    realWorldApplication: 'These skills enable you to build DeFi protocols, NFT marketplaces, DAOs, and other Web3 applications.',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
];

// Export all missions
export const allMissions: Mission[] = [
  ...siliconValleyMissions,
  ...cryptoValleyMissions
];

// Utility functions
export const getMissionById = (missionId: string): Mission | undefined => {
  return allMissions.find(mission => mission.id === missionId);
};

export const getMissionsByNode = (nodeId: string): Mission[] => {
  return allMissions.filter(mission => mission.nodeId === nodeId);
};

export const getMissionsByCategory = (category: Mission['category']): Mission[] => {
  return allMissions.filter(mission => mission.category === category);
};

export const getMissionsByDifficulty = (difficulty: Mission['difficulty']): Mission[] => {
  return allMissions.filter(mission => mission.difficulty === difficulty);
};

export const getPrerequisiteMissions = (missionId: string): Mission[] => {
  const mission = getMissionById(missionId);
  if (!mission) return [];
  
  return mission.prerequisites
    .map(prereqId => getMissionById(prereqId))
    .filter(Boolean) as Mission[];
};

export const calculateMissionProgress = (mission: Mission, completedSteps: string[]): number => {
  const totalSteps = mission.steps.length;
  const completed = mission.steps.filter(step => completedSteps.includes(step.id)).length;
  
  return totalSteps > 0 ? (completed / totalSteps) * 100 : 0;
};