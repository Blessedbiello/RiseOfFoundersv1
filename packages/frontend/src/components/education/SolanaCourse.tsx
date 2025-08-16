'use client';

import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Check, Lock, Play, Award, BookOpen, Code, Zap } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface Module {
  id: string;
  title: string;
  description: string;
  content: string;
  xpReward: number;
  estimatedTime: string;
  quiz: Question[];
  unlocked: boolean;
  completed: boolean;
  icon: string;
}

const solanaModules: Module[] = [
  {
    id: 'solana-basics',
    title: 'Solana Fundamentals',
    description: 'Learn the core concepts of Solana blockchain',
    content: `
# Welcome to Solana! 🚀

Solana is a high-performance blockchain designed for decentralized applications and crypto projects. Here's what makes it special:

## What is Solana?
Solana is a fast, secure, and scalable blockchain that supports smart contracts and decentralized applications (dApps). It can process over 65,000 transactions per second!

## Key Features:
- **Lightning Fast**: Sub-second finality
- **Low Cost**: Transactions cost less than $0.01
- **Scalable**: Handles thousands of projects
- **Developer Friendly**: Easy to build on

## Why Solana Matters for Founders:
As a founder, understanding Solana helps you:
- Build faster, cheaper applications
- Reach global users instantly
- Create innovative financial products
- Join a thriving ecosystem

Ready to dive deeper? Let's explore what makes Solana tick!
    `,
    xpReward: 100,
    estimatedTime: '10 min',
    quiz: [
      {
        id: 'q1',
        question: 'How many transactions per second can Solana process?',
        options: ['1,000', '15,000', '65,000+', '100'],
        correctAnswer: 2,
        explanation: 'Solana can process over 65,000 transactions per second, making it one of the fastest blockchains.'
      },
      {
        id: 'q2',
        question: 'What is the typical cost of a Solana transaction?',
        options: ['$10', '$1', 'Less than $0.01', '$0.50'],
        correctAnswer: 2,
        explanation: 'Solana transactions typically cost less than $0.01, making it very affordable for users.'
      },
      {
        id: 'q3',
        question: 'What makes Solana attractive for founders?',
        options: ['Only speed', 'Only low cost', 'Speed, low cost, and scalability', 'Only developer tools'],
        correctAnswer: 2,
        explanation: 'Solana combines speed, low cost, scalability, and great developer tools, making it ideal for founders.'
      }
    ],
    unlocked: true,
    completed: false,
    icon: '🏗️'
  },
  {
    id: 'wallets-keys',
    title: 'Wallets & Key Management',
    description: 'Understanding wallets, private keys, and security',
    content: `
# Wallets & Security 🔐

Understanding wallets is crucial for any Solana founder. Let's break it down:

## What is a Wallet?
A wallet is your gateway to the Solana blockchain. It holds your:
- **Private Keys**: Your secret access codes
- **Public Keys**: Your blockchain addresses
- **Digital Assets**: SOL tokens, NFTs, etc.

## Types of Wallets:

### Hot Wallets (Connected to Internet)
- **Phantom**: Most popular Solana wallet
- **Solflare**: Feature-rich web wallet
- **Backpack**: New social wallet

### Cold Wallets (Offline Storage)
- **Ledger**: Hardware wallet for maximum security
- **Paper Wallets**: Written private keys

## Security Best Practices:
1. **Never share your seed phrase**
2. **Use hardware wallets for large amounts**
3. **Double-check addresses before sending**
4. **Keep multiple backups of your seed phrase**

## For Founders:
- Understand your users' wallet experience
- Integrate popular wallets in your dApps
- Educate users about security
- Build trust through transparency

Your wallet is your identity on Solana. Protect it!
    `,
    xpReward: 150,
    estimatedTime: '12 min',
    quiz: [
      {
        id: 'q1',
        question: 'What should you NEVER share with anyone?',
        options: ['Public key', 'Wallet address', 'Seed phrase', 'Username'],
        correctAnswer: 2,
        explanation: 'Your seed phrase gives complete access to your wallet and should never be shared with anyone.'
      },
      {
        id: 'q2',
        question: 'Which is the most popular Solana wallet?',
        options: ['MetaMask', 'Phantom', 'Trust Wallet', 'Coinbase'],
        correctAnswer: 1,
        explanation: 'Phantom is the most popular wallet specifically designed for Solana.'
      },
      {
        id: 'q3',
        question: 'What type of wallet offers the highest security for large amounts?',
        options: ['Browser extension', 'Mobile app', 'Hardware wallet', 'Web wallet'],
        correctAnswer: 2,
        explanation: 'Hardware wallets offer the highest security as they store private keys offline.'
      }
    ],
    unlocked: false,
    completed: false,
    icon: '👛'
  },
  {
    id: 'sol-token',
    title: 'SOL Token & Economics',
    description: 'Learn about SOL tokenomics and network fees',
    content: `
# SOL Token Economics 💰

SOL is the native token that powers the Solana network. Here's everything founders need to know:

## What is SOL?
SOL is Solana's native cryptocurrency that serves multiple purposes:
- **Transaction Fees**: Pay for network operations
- **Staking**: Secure the network and earn rewards
- **Governance**: Vote on network upgrades
- **Medium of Exchange**: Trade and store value

## Token Supply:
- **Total Supply**: ~500 million SOL
- **Circulating Supply**: ~400 million SOL
- **Inflation Rate**: Decreases over time

## How SOL is Used:

### Transaction Fees
- Ultra-low fees (< $0.01)
- Paid to validators
- Prevents spam attacks

### Staking Rewards
- Earn ~5-8% APY by staking
- Help secure the network
- Delegated Proof of Stake (DPoS)

### Network Security
- Validators stake SOL to participate
- Economic incentives align with security

## For Founders:
- **Budget for SOL**: Your users need SOL for transactions
- **Staking Strategies**: Consider staking treasury SOL
- **Fee Sponsorship**: You can pay fees for users
- **Token Integration**: Build SOL into your economics

## Real-World Impact:
Understanding SOL economics helps you:
- Design sustainable tokenomics
- Optimize user experience
- Plan treasury management
- Build network effects

SOL isn't just a token—it's the fuel that powers innovation!
    `,
    xpReward: 200,
    estimatedTime: '15 min',
    quiz: [
      {
        id: 'q1',
        question: 'What is the approximate annual staking reward for SOL?',
        options: ['1-2%', '5-8%', '15-20%', '25-30%'],
        correctAnswer: 1,
        explanation: 'SOL staking typically yields around 5-8% APY, providing steady returns for validators and delegators.'
      },
      {
        id: 'q2',
        question: 'What consensus mechanism does Solana use?',
        options: ['Proof of Work', 'Proof of Stake', 'Delegated Proof of Stake', 'Proof of Authority'],
        correctAnswer: 2,
        explanation: 'Solana uses Delegated Proof of Stake (DPoS) which allows token holders to delegate their stake to validators.'
      },
      {
        id: 'q3',
        question: 'Can developers pay transaction fees for their users?',
        options: ['No, never possible', 'Yes, through fee sponsorship', 'Only with special permission', 'Only for enterprise accounts'],
        correctAnswer: 1,
        explanation: 'Yes! Developers can sponsor transaction fees for their users, creating gasless experiences.'
      }
    ],
    unlocked: false,
    completed: false,
    icon: '🪙'
  },
  {
    id: 'programs-accounts',
    title: 'Programs & Accounts',
    description: 'Understanding Solana\'s account model and programs',
    content: `
# Programs & Accounts 🏗️

Solana's architecture is unique. Let's understand how programs and accounts work:

## The Account Model

### Everything is an Account
In Solana, everything is stored in accounts:
- **User accounts**: Hold SOL and tokens
- **Program accounts**: Store executable code
- **Data accounts**: Store application data

### Account Properties:
- **Address**: Unique identifier (public key)
- **Lamports**: SOL balance (1 SOL = 1B lamports)
- **Owner**: Which program controls this account
- **Data**: The actual stored information

## Programs (Smart Contracts)

### What are Programs?
Programs are Solana's version of smart contracts:
- **Stateless**: Don't store data themselves
- **Reusable**: Can be called by many accounts
- **Upgradeable**: Can be updated by authority

### Popular Programs:
- **SPL Token**: Creates and manages tokens
- **Serum**: Decentralized exchange
- **Metaplex**: NFT standard
- **Anchor**: Development framework

## How They Work Together:

### Program Execution:
1. User creates transaction
2. Transaction specifies accounts and program
3. Program executes logic
4. Accounts are updated atomically

### Data Storage:
- Programs hold logic
- Accounts hold state
- Separation of code and data

## For Founders:

### Building Applications:
- **Design your account structure** first
- **Choose existing programs** when possible
- **Plan for account rent** and storage costs
- **Think in transactions**, not function calls

### User Experience:
- Accounts need SOL for rent
- Users own their data
- Composability enables innovation
- Fast finality improves UX

Understanding this model is key to building on Solana!
    `,
    xpReward: 250,
    estimatedTime: '18 min',
    quiz: [
      {
        id: 'q1',
        question: 'In Solana, where is application data stored?',
        options: ['In the program itself', 'In accounts', 'On IPFS', 'In validators'],
        correctAnswer: 1,
        explanation: 'In Solana, application data is stored in accounts, while programs contain only the executable logic.'
      },
      {
        id: 'q2',
        question: 'What makes Solana programs different from Ethereum smart contracts?',
        options: ['They store data', 'They are stateless', 'They can\'t be upgraded', 'They cost more'],
        correctAnswer: 1,
        explanation: 'Solana programs are stateless - they contain only logic, while data is stored separately in accounts.'
      },
      {
        id: 'q3',
        question: 'What is SPL Token?',
        options: ['A cryptocurrency', 'A program for creating tokens', 'A wallet', 'A validator'],
        correctAnswer: 1,
        explanation: 'SPL Token is a program that provides the standard for creating and managing tokens on Solana.'
      }
    ],
    unlocked: false,
    completed: false,
    icon: '⚙️'
  },
  {
    id: 'defi-ecosystem',
    title: 'DeFi Ecosystem',
    description: 'Explore Solana\'s decentralized finance landscape',
    content: `
# Solana DeFi Ecosystem 🌟

Solana hosts a thriving DeFi ecosystem. Let's explore the opportunities:

## What is DeFi?
Decentralized Finance removes intermediaries from financial services:
- **No banks required**
- **Global accessibility**
- **Programmable money**
- **Transparent operations**

## Major DeFi Protocols:

### Decentralized Exchanges (DEXs)
- **Jupiter**: Aggregates liquidity across Solana
- **Raydium**: Automated market maker (AMM)
- **Orca**: User-friendly DEX with concentrated liquidity
- **Serum**: Central limit order book

### Lending & Borrowing
- **Solend**: Decentralized lending protocol
- **Mango Markets**: Margin trading platform
- **Jet Protocol**: Borrowing and lending

### Yield Farming
- **Marinade**: Liquid staking for SOL
- **Quarry**: Protocol for yield farming
- **Tulip**: Yield aggregation platform

## Key DeFi Concepts:

### Automated Market Makers (AMMs)
- Pool-based trading
- Liquidity providers earn fees
- No order books needed

### Yield Farming
- Earn rewards for providing liquidity
- Lock tokens in smart contracts
- Get protocol tokens as rewards

### Liquid Staking
- Stake SOL but keep it liquid
- Receive derivative tokens (mSOL, stSOL)
- Use staked SOL in other DeFi protocols

## For Founders:

### Building DeFi:
- **Composability**: Build on existing protocols
- **Liquidity**: Partner with established DEXs
- **Yield**: Create value for token holders
- **Security**: Audit everything thoroughly

### Integration Opportunities:
- Payment systems using stablecoins
- Yield generation for treasury
- Token distribution mechanisms
- Cross-protocol integrations

### User Considerations:
- Education about risks
- Clear fee structures
- Insurance options
- Regulatory compliance

## Innovation Areas:
- **Real-world assets** on-chain
- **Cross-chain** bridges
- **Institutional** DeFi tools
- **Mobile-first** experiences

DeFi on Solana is fast, cheap, and composable!
    `,
    xpReward: 300,
    estimatedTime: '20 min',
    quiz: [
      {
        id: 'q1',
        question: 'What is the main advantage of DEXs over centralized exchanges?',
        options: ['Better UI', 'No intermediaries needed', 'Higher fees', 'Slower transactions'],
        correctAnswer: 1,
        explanation: 'DEXs eliminate intermediaries, giving users full control of their funds and enabling permissionless trading.'
      },
      {
        id: 'q2',
        question: 'What is liquid staking?',
        options: ['Staking without rewards', 'Staking SOL while keeping it liquid', 'Unstaking immediately', 'Staking multiple tokens'],
        correctAnswer: 1,
        explanation: 'Liquid staking allows you to stake SOL and receive derivative tokens that can be used in DeFi while still earning staking rewards.'
      },
      {
        id: 'q3',
        question: 'What does Jupiter do in the Solana ecosystem?',
        options: ['Creates tokens', 'Aggregates liquidity', 'Provides loans', 'Stores NFTs'],
        correctAnswer: 1,
        explanation: 'Jupiter is a DEX aggregator that finds the best prices by routing trades across multiple Solana DEXs.'
      }
    ],
    unlocked: false,
    completed: false,
    icon: '🏦'
  },
  {
    id: 'hands-on-coding',
    title: 'Hands-On Coding',
    description: 'Build your first Solana application with real code',
    content: `
# Hands-On Coding with Solana 💻

Time to get your hands dirty! Let's build a real Solana application step by step.

## What We'll Build
A simple **Token Balance Checker** that:
- Connects to a Solana wallet
- Fetches SOL balance
- Displays token information
- Shows transaction history

## Prerequisites
Make sure you have:
- **Node.js** installed
- **Phantom Wallet** browser extension
- Basic **JavaScript** knowledge

## Step 1: Set Up Your Environment

First, let's install the Solana Web3.js library:

\`\`\`bash
npm install @solana/web3.js @solana/wallet-adapter-base @solana/wallet-adapter-phantom
\`\`\`

## Step 2: Connect to Solana Network

\`\`\`javascript
import { Connection, clusterApiUrl, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';

// Connect to Solana devnet
const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

console.log('Connected to Solana devnet!');
\`\`\`

## Step 3: Connect to Phantom Wallet

\`\`\`javascript
async function connectWallet() {
    try {
        // Check if Phantom is installed
        if (!window.solana || !window.solana.isPhantom) {
            alert('Please install Phantom wallet!');
            return;
        }

        // Connect to wallet
        const response = await window.solana.connect();
        const publicKey = response.publicKey.toString();
        
        console.log('Connected to wallet:', publicKey);
        return response.publicKey;
    } catch (error) {
        console.error('Failed to connect wallet:', error);
    }
}
\`\`\`

## Step 4: Get SOL Balance

\`\`\`javascript
async function getBalance(publicKey) {
    try {
        // Get balance in lamports
        const balance = await connection.getBalance(publicKey);
        
        // Convert to SOL (1 SOL = 1 billion lamports)
        const solBalance = balance / LAMPORTS_PER_SOL;
        
        console.log(\`Balance: \${solBalance} SOL\`);
        return solBalance;
    } catch (error) {
        console.error('Failed to get balance:', error);
    }
}
\`\`\`

## Step 5: Get Account Info

\`\`\`javascript
async function getAccountInfo(publicKey) {
    try {
        const accountInfo = await connection.getAccountInfo(publicKey);
        
        if (accountInfo) {
            console.log('Account Owner:', accountInfo.owner.toString());
            console.log('Account Data Length:', accountInfo.data.length);
            console.log('Account Lamports:', accountInfo.lamports);
        } else {
            console.log('Account not found');
        }
        
        return accountInfo;
    } catch (error) {
        console.error('Failed to get account info:', error);
    }
}
\`\`\`

## Step 6: Put It All Together

\`\`\`javascript
async function main() {
    try {
        // 1. Connect to wallet
        const publicKey = await connectWallet();
        if (!publicKey) return;

        // 2. Get SOL balance
        const balance = await getBalance(publicKey);

        // 3. Get account information
        const accountInfo = await getAccountInfo(publicKey);

        // 4. Display results
        document.getElementById('wallet-address').textContent = publicKey.toString();
        document.getElementById('sol-balance').textContent = \`\${balance.toFixed(4)} SOL\`;
        
        if (accountInfo) {
            document.getElementById('account-owner').textContent = accountInfo.owner.toString();
        }

    } catch (error) {
        console.error('Error in main function:', error);
    }
}

// Run the application
main();
\`\`\`

## Step 7: HTML Interface

\`\`\`html
<!DOCTYPE html>
<html>
<head>
    <title>Solana Balance Checker</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .container { max-width: 600px; margin: 0 auto; }
        .info-box { 
            background: #f5f5f5; 
            padding: 20px; 
            border-radius: 8px; 
            margin: 10px 0; 
        }
        button { 
            background: #9945FF; 
            color: white; 
            border: none; 
            padding: 12px 24px; 
            border-radius: 6px; 
            cursor: pointer; 
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 Solana Balance Checker</h1>
        
        <button onclick="main()">Connect Wallet & Check Balance</button>
        
        <div class="info-box">
            <h3>Wallet Address:</h3>
            <p id="wallet-address">Not connected</p>
        </div>
        
        <div class="info-box">
            <h3>SOL Balance:</h3>
            <p id="sol-balance">0 SOL</p>
        </div>
        
        <div class="info-box">
            <h3>Account Owner:</h3>
            <p id="account-owner">Unknown</p>
        </div>
    </div>

    <script src="your-script.js"></script>
</body>
</html>
\`\`\`

## What You've Learned

Congratulations! You've built your first Solana application that:

✅ **Connects to Solana network**
✅ **Integrates with Phantom wallet**
✅ **Fetches real blockchain data**
✅ **Displays user-friendly information**

## Next Steps

Now you can extend this application to:
- **Send SOL transactions**
- **Interact with SPL tokens**
- **Call smart contract programs**
- **Build a full dApp frontend**

## Real-World Applications

This foundation enables you to build:
- **DeFi dashboards**
- **NFT marketplaces**
- **DAO voting interfaces**
- **Gaming economies**

You're now ready to build on Solana! 🎉

## Challenge Exercise

Try modifying the code to:
1. Display multiple token balances
2. Show recent transaction history
3. Add error handling for network issues
4. Style the interface with modern CSS

Keep coding and building the future! 🚀
    `,
    xpReward: 500,
    estimatedTime: '30 min',
    quiz: [
      {
        id: 'q1',
        question: 'What library do we use to interact with Solana in JavaScript?',
        options: ['@solana/react', '@solana/web3.js', 'solana-sdk', 'phantom-js'],
        correctAnswer: 1,
        explanation: '@solana/web3.js is the official JavaScript SDK for interacting with the Solana blockchain.'
      },
      {
        id: 'q2',
        question: 'How many lamports are in 1 SOL?',
        options: ['1,000', '1,000,000', '1,000,000,000', '1,000,000,000,000'],
        correctAnswer: 2,
        explanation: '1 SOL equals 1 billion (1,000,000,000) lamports. Lamports are the smallest unit of SOL.'
      },
      {
        id: 'q3',
        question: 'Which method is used to get an account\'s SOL balance?',
        options: ['getBalance()', 'getSolBalance()', 'getAccountBalance()', 'fetchBalance()'],
        correctAnswer: 0,
        explanation: 'connection.getBalance(publicKey) returns the account balance in lamports.'
      },
      {
        id: 'q4',
        question: 'What does window.solana.connect() do?',
        options: ['Connects to Solana network', 'Connects to Phantom wallet', 'Connects to a validator', 'Connects to an RPC'],
        correctAnswer: 1,
        explanation: 'window.solana.connect() requests connection to the user\'s Phantom wallet and returns the public key.'
      },
      {
        id: 'q5',
        question: 'Which Solana cluster should you use for development?',
        options: ['mainnet-beta', 'devnet', 'testnet', 'localhost'],
        correctAnswer: 1,
        explanation: 'Devnet is the recommended cluster for development - it\'s stable and has free test tokens.'
      }
    ],
    unlocked: false,
    completed: false,
    icon: '👨‍💻'
  }
];

export const SolanaCourse: React.FC = () => {
  const { addXp, user, isAuthenticated } = useAuth();
  const [modules, setModules] = useState<Module[]>(solanaModules);
  const [currentModule, setCurrentModule] = useState<Module | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [isAddingXp, setIsAddingXp] = useState(false);

  const completedModules = modules.filter(m => m.completed).length;
  const totalModules = modules.length;
  const overallProgress = (completedModules / totalModules) * 100;

  const startModule = (module: Module) => {
    if (!module.unlocked) return;
    setCurrentModule(module);
    setShowQuiz(false);
    setShowResults(false);
    setCurrentQuestion(0);
    setUserAnswers([]);
  };

  const startQuiz = () => {
    setShowQuiz(true);
    setCurrentQuestion(0);
    setUserAnswers([]);
  };

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestion] = answerIndex;
    setUserAnswers(newAnswers);
  };

  const nextQuestion = () => {
    if (currentModule && currentQuestion < currentModule.quiz.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      showQuizResults();
    }
  };

  const showQuizResults = async () => {
    if (!currentModule) return;
    
    const correctAnswers = userAnswers.filter((answer, index) => 
      answer === currentModule.quiz[index].correctAnswer
    ).length;
    
    const passingScore = Math.ceil(currentModule.quiz.length * 0.7); // 70% to pass
    const passed = correctAnswers >= passingScore;
    
    if (passed && isAuthenticated) {
      setIsAddingXp(true);
      
      try {
        // Award XP to user's profile
        const success = await addXp({
          amount: currentModule.xpReward,
          source: `Solana Course - ${currentModule.title}`,
          description: `Completed module: ${currentModule.title} with ${correctAnswers}/${currentModule.quiz.length} correct answers`,
        });

        if (success) {
          // Mark module as completed and unlock next
          const updatedModules = modules.map(m => {
            if (m.id === currentModule.id) {
              return { ...m, completed: true };
            }
            return m;
          });
          
          // Unlock next module
          const currentIndex = modules.findIndex(m => m.id === currentModule.id);
          if (currentIndex < modules.length - 1) {
            updatedModules[currentIndex + 1].unlocked = true;
          }
          
          setModules(updatedModules);
          
          // Check if all modules are completed for course completion bonus
          const allCompleted = updatedModules.every(m => m.completed);
          if (allCompleted) {
            try {
              // Award additional XP for course completion via Honeycomb mission
              await addXp({
                amount: 200,
                source: 'solana_course_complete',
                description: 'Completed full Solana fundamentals course - Honeycomb achievement unlocked!'
              });
            } catch (error) {
              console.error('Failed to award course completion bonus:', error);
            }
          }
        }
      } catch (error) {
        console.error('Failed to award XP:', error);
      } finally {
        setIsAddingXp(false);
      }
    }
    
    setShowResults(true);
  };

  const backToModules = () => {
    setCurrentModule(null);
    setShowQuiz(false);
    setShowResults(false);
  };

  if (currentModule && showQuiz) {
    const question = currentModule.quiz[currentQuestion];
    const correctAnswers = userAnswers.filter((answer, index) => 
      answer === currentModule.quiz[index].correctAnswer
    ).length;
    
    if (showResults) {
      const passingScore = Math.ceil(currentModule.quiz.length * 0.7);
      const passed = correctAnswers >= passingScore;
      
      return (
        <div className="max-w-4xl mx-auto p-6">
          <Card className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 border-purple-500/30">
            <CardHeader className="text-center">
              <div className="text-6xl mb-4">
                {passed ? '🎉' : '😔'}
              </div>
              <CardTitle className="text-3xl text-white">
                {passed ? 'Congratulations!' : 'Keep Learning!'}
              </CardTitle>
              <CardDescription className="text-gray-300">
                You scored {correctAnswers}/{currentModule.quiz.length} 
                {passed ? ` and earned ${currentModule.xpReward} XP!` : '. You need 70% to pass.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {passed && (
                <div className="text-center p-6 bg-green-900/30 rounded-lg border border-green-500/30">
                  <Award className="w-12 h-12 text-yellow-400 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-green-400">+{currentModule.xpReward} XP</div>
                  <div className="text-green-300">
                    {isAddingXp ? 'Adding to your profile...' : 'Module Completed!'}
                  </div>
                  {!isAuthenticated && (
                    <div className="text-yellow-300 text-sm mt-2">
                      Connect your wallet to save XP progress!
                    </div>
                  )}
                </div>
              )}
              
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-white mb-4">Review:</h3>
                {currentModule.quiz.map((q, index) => (
                  <div key={q.id} className="p-4 bg-black/30 rounded-lg">
                    <div className="flex items-start gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                        userAnswers[index] === q.correctAnswer ? 'bg-green-500' : 'bg-red-500'
                      }`}>
                        {userAnswers[index] === q.correctAnswer ? '✓' : '✗'}
                      </div>
                      <div className="flex-1">
                        <div className="text-white font-medium mb-2">{q.question}</div>
                        <div className="text-sm text-gray-400 mb-2">
                          Your answer: {q.options[userAnswers[index]]}
                        </div>
                        <div className="text-sm text-green-400">
                          Correct: {q.options[q.correctAnswer]}
                        </div>
                        <div className="text-sm text-gray-300 mt-2">
                          {q.explanation}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex gap-4">
                <Button onClick={backToModules} className="flex-1">
                  Back to Modules
                </Button>
                {!passed && (
                  <Button onClick={() => {
                    setShowResults(false);
                    setShowQuiz(true);
                    setCurrentQuestion(0);
                    setUserAnswers([]);
                  }} variant="outline" className="flex-1">
                    Try Again
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }
    
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 border-purple-500/30">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white">Quiz: {currentModule.title}</CardTitle>
              <Badge variant="outline" className="text-white border-white/30">
                {currentQuestion + 1} / {currentModule.quiz.length}
              </Badge>
            </div>
            <Progress 
              value={(currentQuestion / currentModule.quiz.length) * 100} 
              className="w-full"
            />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-xl text-white font-medium">
              {question.question}
            </div>
            
            <div className="grid gap-3">
              {question.options.map((option, index) => (
                <Button
                  key={index}
                  variant={userAnswers[currentQuestion] === index ? "default" : "outline"}
                  className="p-4 h-auto text-left justify-start"
                  onClick={() => handleAnswerSelect(index)}
                >
                  <span className="mr-3 font-bold">{String.fromCharCode(65 + index)}.</span>
                  {option}
                </Button>
              ))}
            </div>
            
            <div className="flex justify-between">
              <Button variant="outline" onClick={backToModules}>
                Back to Module
              </Button>
              <Button 
                onClick={nextQuestion}
                disabled={userAnswers[currentQuestion] === undefined}
              >
                {currentQuestion === currentModule.quiz.length - 1 ? 'Finish Quiz' : 'Next Question'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (currentModule && !showQuiz) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 border-purple-500/30">
          <CardHeader>
            <div className="flex items-center gap-3">
              <span className="text-3xl">{currentModule.icon}</span>
              <div>
                <CardTitle className="text-white">{currentModule.title}</CardTitle>
                <CardDescription className="text-gray-300">
                  {currentModule.description} • {currentModule.estimatedTime} • {currentModule.xpReward} XP
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="prose prose-invert max-w-none">
              <div className="text-gray-200 leading-relaxed whitespace-pre-line">
                {currentModule.content}
              </div>
            </div>
            
            <div className="flex gap-4">
              <Button variant="outline" onClick={backToModules}>
                Back to Modules
              </Button>
              <Button onClick={startQuiz} className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Take Quiz ({currentModule.quiz.length} questions)
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-4">
          🚀 Solana Fundamentals Course
        </h1>
        <p className="text-xl text-gray-300 mb-6">
          Master Solana basics and earn XP to advance in your founder journey!
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-900/50 to-purple-900/50 border-blue-500/30">
            <CardContent className="p-6 text-center">
              <BookOpen className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{completedModules}/{totalModules}</div>
              <div className="text-gray-300">Modules Completed</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-900/50 to-blue-900/50 border-green-500/30">
            <CardContent className="p-6 text-center">
              <Award className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{user?.xpTotal || 0}</div>
              <div className="text-gray-300">Total XP</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 border-purple-500/30">
            <CardContent className="p-6 text-center">
              <Zap className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{Math.round(overallProgress)}%</div>
              <div className="text-gray-300">Course Progress</div>
            </CardContent>
          </Card>
        </div>
        
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white font-medium">Overall Progress</span>
            <span className="text-gray-300">{Math.round(overallProgress)}%</span>
          </div>
          <Progress value={overallProgress} className="w-full" />
        </div>
      </div>

      <div className="grid gap-6">
        {modules.map((module, index) => (
          <Card 
            key={module.id} 
            className={`border transition-all duration-300 ${
              module.unlocked 
                ? 'bg-gradient-to-br from-purple-900/30 to-blue-900/30 border-purple-500/30 hover:border-purple-400/50 cursor-pointer' 
                : 'bg-gray-900/30 border-gray-700/30'
            }`}
            onClick={() => module.unlocked && startModule(module)}
          >
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  {module.completed ? (
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                      <Check className="w-6 h-6 text-white" />
                    </div>
                  ) : module.unlocked ? (
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-2xl">
                      {module.icon}
                    </div>
                  ) : (
                    <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center">
                      <Lock className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className={`text-xl font-bold ${module.unlocked ? 'text-white' : 'text-gray-500'}`}>
                      {module.title}
                    </h3>
                    {module.completed && (
                      <Badge className="bg-green-500 text-white">
                        +{module.xpReward} XP
                      </Badge>
                    )}
                  </div>
                  
                  <p className={`mb-3 ${module.unlocked ? 'text-gray-300' : 'text-gray-500'}`}>
                    {module.description}
                  </p>
                  
                  <div className="flex items-center gap-4 text-sm">
                    <span className={`flex items-center gap-1 ${module.unlocked ? 'text-gray-400' : 'text-gray-600'}`}>
                      <BookOpen className="w-4 h-4" />
                      {module.estimatedTime}
                    </span>
                    <span className={`flex items-center gap-1 ${module.unlocked ? 'text-gray-400' : 'text-gray-600'}`}>
                      <Award className="w-4 h-4" />
                      {module.xpReward} XP
                    </span>
                    <span className={`flex items-center gap-1 ${module.unlocked ? 'text-gray-400' : 'text-gray-600'}`}>
                      <Code className="w-4 h-4" />
                      {module.quiz.length} questions
                    </span>
                  </div>
                  
                  {module.unlocked && (
                    <Button 
                      className="mt-4" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        startModule(module);
                      }}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      {module.completed ? 'Review Module' : 'Start Module'}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};