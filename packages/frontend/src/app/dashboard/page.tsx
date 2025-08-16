'use client';

import { useAuth } from '../../hooks/useAuth';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';
import { GitHubVerification } from '../../components/auth/GitHubVerification';
import { User, Wallet, Github, LogOut, Crown, Sword, Shield, Target } from 'lucide-react';
import dynamic from 'next/dynamic';

// Dynamically import wallet button to avoid hydration issues
const WalletMultiButton = dynamic(
  () => import('@solana/wallet-adapter-react-ui').then((mod) => mod.WalletMultiButton),
  { ssr: false }
);

interface Kingdom {
  id: string;
  name: string;
  title: string;
  description: string;
  color: string;
  icon: string;
  boss: string;
  challenge: string;
}

const kingdoms: Kingdom[] = [
  {
    id: 'silicon-valley',
    name: 'Silicon Valley',
    title: 'The Code Citadel',
    description: 'Where algorithms become empires. Master the art of scalable technology.',
    color: 'from-blue-600 to-cyan-600',
    icon: '💻',
    boss: 'The Ghost of Jobs Past',
    challenge: 'Build an MVP that changes everything'
  },
  {
    id: 'crypto-valley',
    name: 'Crypto Valley', 
    title: 'The Decentralized Frontier',
    description: 'Where code is law. Master blockchain and prove decentralization is freedom.',
    color: 'from-purple-600 to-pink-600',
    icon: '⛓️',
    boss: 'The Gas Fee Dragon',
    challenge: 'Create protocols that serve the people'
  },
  {
    id: 'business-strategy',
    name: 'Business Strategy',
    title: 'The Boardroom Colosseum', 
    description: 'Where vision meets execution. Navigate politics without losing your soul.',
    color: 'from-green-600 to-emerald-600',
    icon: '📈',
    boss: 'The VC Overlord',
    challenge: 'Raise capital without selling your vision'
  },
  {
    id: 'product-olympus',
    name: 'Product Olympus',
    title: 'The User Paradise',
    description: 'Where creators craft experiences that change lives. Build intuitive perfection.',
    color: 'from-orange-600 to-red-600', 
    icon: '🎨',
    boss: 'The Scale Demon',
    challenge: 'Create products users can\'t live without'
  },
  {
    id: 'marketing-multiverse',
    name: 'Marketing Multiverse',
    title: 'The Attention Wars',
    description: 'Where stories become movements. Turn customers into crusaders.',
    color: 'from-yellow-600 to-orange-600',
    icon: '🚀',
    boss: 'The Algorithm Alchemist', 
    challenge: 'Cut through noise with authentic storytelling'
  }
];

export default function DashboardPage() {
  const { user, logout, walletAddress, isWalletConnected } = useAuth();

  const handleLogout = () => {
    if (logout) logout();
  };

  // Find user's selected kingdom
  const selectedKingdom = kingdoms.find(k => k.id === user?.selectedKingdom) || kingdoms[0];
  
  // Calculate progress and level
  const level = Math.floor((user?.xpTotal || 0) / 1000) + 1;
  const xpInCurrentLevel = (user?.xpTotal || 0) % 1000;
  const xpToNextLevel = 1000 - xpInCurrentLevel;
  const progressPercentage = (xpInCurrentLevel / 1000) * 100;
  
  // Boss encounter logic (simplified for demo)
  const bossHP = Math.max(0, 100 - (level * 10)); // Boss gets weaker as player levels up
  const playerProgress = Math.min(100, level * 10); // Player strength increases

  return (
    <ProtectedRoute requireAuth={true} requireProfile={true}>
      <div className={`min-h-screen bg-gradient-to-br ${selectedKingdom.color}`}>
        <header className="bg-black/20 backdrop-blur-lg border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 bg-gradient-to-r ${selectedKingdom.color} rounded-full flex items-center justify-center text-2xl`}>
                  {selectedKingdom.icon}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">
                    {selectedKingdom.name}
                  </h1>
                  <p className="text-white/70 text-sm">{selectedKingdom.title}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-white text-center">
                  <div className="text-lg font-bold">Level {level}</div>
                  <div className="text-sm text-white/70">{user?.xpTotal || 0} XP</div>
                </div>
                <WalletMultiButton />
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 px-4 py-2 rounded-lg transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-8">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              Welcome to {selectedKingdom.name}, {user?.name}!
            </h2>
            <p className="text-xl text-white/80 mb-6">
              {selectedKingdom.description}
            </p>
          </div>

          {/* Progress and Boss Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Player Progress */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                  <Crown className="w-8 h-8 text-yellow-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Your Conquest</h3>
                  <p className="text-white/70">Level {level} Founder</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-white/80 text-sm mb-2">
                    <span>Progress to Level {level + 1}</span>
                    <span>{xpInCurrentLevel}/1000 XP</span>
                  </div>
                  <div className="bg-white/20 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-yellow-400 to-orange-500 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${progressPercentage}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="bg-white/5 rounded-lg p-3">
                    <div className="text-2xl font-bold text-yellow-400">{user?.xpTotal || 0}</div>
                    <div className="text-white/70 text-sm">Total XP</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <div className="text-2xl font-bold text-green-400">{xpToNextLevel}</div>
                    <div className="text-white/70 text-sm">XP to Next Level</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Boss Encounter */}
            <div className="bg-black/20 backdrop-blur-lg rounded-2xl p-6 border border-red-500/30">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
                  <Sword className="w-8 h-8 text-red-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Boss Battle</h3>
                  <p className="text-red-300">{selectedKingdom.boss}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-white/80 text-sm mb-2">
                    <span>Boss Health</span>
                    <span>{bossHP}%</span>
                  </div>
                  <div className="bg-white/20 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-red-500 to-red-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${bossHP}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="text-center">
                  {bossHP > 0 ? (
                    <div>
                      <p className="text-yellow-300 mb-4 font-medium">
                        ⚡ Challenge: {selectedKingdom.challenge}
                      </p>
                      <button className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-lg font-bold hover:from-red-600 hover:to-red-700 transition-all transform hover:scale-105">
                        ⚔️ Face the Boss
                      </button>
                    </div>
                  ) : (
                    <div>
                      <p className="text-green-400 mb-4 font-bold text-lg">
                        👑 Boss Defeated! You Rule This Kingdom!
                      </p>
                      <button className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-3 rounded-lg font-bold hover:from-yellow-600 hover:to-orange-600 transition-all">
                        🏰 Expand Your Empire
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* GitHub Verification Section */}
          <div className="mb-12">
            <GitHubVerification 
              onVerificationComplete={(data) => {
                // Update user data or trigger a refresh
                console.log('GitHub verification completed:', data);
                // You could trigger a user data refresh here if needed
              }}
            />
          </div>

          {/* Kingdom Actions */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <h3 className="text-2xl font-bold text-white text-center mb-8">Your Kingdom Awaits</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { href: '/game', text: '🗺️ Explore Territories', description: 'Discover new lands to conquer' },
                { href: '/teams', text: '👥 Assemble Your Legion', description: 'Build your founding team' },
                { href: '/pvp', text: '⚔️ Wage Territory Wars', description: 'Battle other founders' },
                { href: '/quests', text: '🎯 Kingdom Missions', description: 'Complete royal quests' },
                { href: '/sponsors', text: '🏢 Royal Treasury', description: 'Secure kingdom funding' },
                { href: '/mentors', text: '🧙‍♂️ Wise Advisors', description: 'Seek guidance from elders' }
              ].map((action, index) => (
                <a
                  key={index}
                  href={action.href}
                  className="bg-white/5 hover:bg-white/10 border border-white/20 hover:border-white/40 rounded-xl p-6 transition-all transform hover:scale-105 text-center group"
                >
                  <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">
                    {action.text.split(' ')[0]}
                  </div>
                  <h4 className="text-white font-bold text-lg mb-2">
                    {action.text.substring(2)}
                  </h4>
                  <p className="text-white/70 text-sm">
                    {action.description}
                  </p>
                </a>
              ))}
            </div>
          </div>

          {/* Footer Status */}
          <div className="mt-12 text-center">
            <div className="bg-black/20 backdrop-blur-lg rounded-xl px-6 py-4 inline-flex items-center gap-4 border border-white/20">
              <div className="flex items-center gap-2 text-white/70">
                <Wallet className="w-4 h-4" />
                <span className="text-sm">
                  {isWalletConnected ? 'Royal Treasury Connected' : 'Connect Treasury'}
                </span>
              </div>
              {user?.githubUsername && (
                <div className="flex items-center gap-2 text-white/70">
                  <Github className="w-4 h-4" />
                  <span className="text-sm">@{user.githubUsername}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-white/70">
                <Shield className="w-4 h-4" />
                <span className="text-sm">🍯 Honeycomb Protocol Active</span>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}