'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
// Dynamically import components to avoid hydration issues
const WalletMultiButton = dynamic(
  () => import('@solana/wallet-adapter-react-ui').then((mod) => mod.WalletMultiButton),
  { ssr: false }
);

const TerritorialMap3D = dynamic(
  () => import('../components/game/TerritorialMap3D').then((mod) => mod.TerritorialMap3D),
  { 
    ssr: false,
    loading: () => (
      <div className="h-screen bg-gradient-to-br from-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse">🗺️</div>
          <div className="text-2xl text-yellow-400 font-bold">Loading 3D Territorial Map</div>
          <div className="text-gray-300">Preparing immersive experience...</div>
        </div>
      </div>
    )
  }
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

export default function HomePage() {
  const { connected, publicKey, connecting } = useWallet();
  const router = useRouter();
  const [currentStory, setCurrentStory] = useState(0);
  const [showKingdoms, setShowKingdoms] = useState(false);
  const [selectedKingdom, setSelectedKingdom] = useState<Kingdom | null>(null);
  const [showMap, setShowMap] = useState(true);
  const [showStory, setShowStory] = useState(false);

  const storyBeats = [
    {
      title: "The Age of the Old Guards",
      text: "For a thousand market cycles, the Startup Kingdoms have been ruled by ancient gatekeepers who built walls around innovation...",
      image: "🏰"
    },
    {
      title: "The Prophecy of the Unicorn Crown", 
      text: "Legend speaks of the Crown of Unicorns — a mythical artifact that grants its wearer the power to unite all kingdoms...",
      image: "👑"
    },
    {
      title: "Your Awakening",
      text: "You are part of the New Generation — founders who refuse to bow to gatekeepers, who build rather than beg...",
      image: "⚡"
    }
  ];

  // Auto-advance story
  useEffect(() => {
    if (!showKingdoms && currentStory < storyBeats.length - 1) {
      const timer = setTimeout(() => {
        setCurrentStory(current => current + 1);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [currentStory, showKingdoms]);

  // Redirect to dashboard if already connected
  useEffect(() => {
    if (connected) {
      // Give user a moment to see the connection success
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    }
  }, [connected, router]);

  if (connected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-green-800 to-teal-700 text-white flex items-center justify-center">
        <div className="text-center space-y-8 animate-fade-in">
          <div className="text-8xl animate-bounce">👑</div>
          <h1 className="text-6xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
            Welcome to the Rebellion!
          </h1>
          <p className="text-2xl text-green-200 max-w-2xl mx-auto">
            Your wallet is connected. The Crown of Unicorns awaits your claim, Founder.
          </p>
          <div className="text-lg text-green-300">
            Redirecting to your destiny...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-hidden">
      <div className="relative z-10">
        {/* Rise of Founders Landing Page */}
        {showMap && !showStory && (
          <div className="relative min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            {/* Top Section - Title and CTA */}
            <div className="relative z-20 pt-20 pb-12">
              <div className="text-center space-y-8 max-w-4xl mx-auto px-4">
                <div className="space-y-4">
                  <h1 className="text-8xl font-bold bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500 bg-clip-text text-transparent animate-fade-in">
                    RISE OF FOUNDERS
                  </h1>
                  <p className="text-2xl text-purple-200 font-medium">
                    Conquer Territories • Build Empires • Claim the Crown
                  </p>
                  <p className="text-lg text-gray-300 max-w-2xl mx-auto">
                    Experience the world's first gamified founder education platform where you battle for territorial control, complete real missions, and earn verifiable on-chain achievements.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <button
                    onClick={() => {setShowMap(false); setShowStory(true);}}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xl font-bold px-8 py-4 rounded-2xl hover:from-purple-700 hover:to-pink-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl"
                  >
                    🚀 Begin Your Journey
                  </button>
                  
                  <button
                    onClick={() => {setShowMap(false); setShowKingdoms(true);}}
                    className="bg-gradient-to-r from-yellow-600 to-orange-600 text-white text-xl font-bold px-8 py-4 rounded-2xl hover:from-yellow-700 hover:to-orange-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl"
                  >
                    ⚔️ Skip to Kingdoms
                  </button>
                </div>

                <div className="text-sm text-gray-400">
                  💡 Tip: Click honeycomb territories below to explore, or start the live demo to see hive warfare in action!
                </div>
              </div>
            </div>

            {/* Bottom Section - Interactive Map */}
            <div className="relative z-10 h-screen">
              <TerritorialMap3D />
            </div>

            {/* Global Rankings & Stats Section */}
            <div className="relative z-20 bg-gradient-to-b from-slate-900 to-black py-16">
              <div className="max-w-7xl mx-auto px-4">
                <div className="text-center mb-12">
                  <h2 className="text-5xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent mb-4">
                    Global Leaderboard
                  </h2>
                  <p className="text-xl text-gray-300">
                    See who's dominating the Rise of Founders multiverse
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Top Founders */}
                  <div className="bg-black/60 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/30">
                    <h3 className="text-2xl font-bold text-yellow-400 mb-6 flex items-center gap-2">
                      👑 Top Founders
                    </h3>
                    <div className="space-y-4">
                      {[
                        { rank: 1, name: "CryptoFounder", xp: 15420, kingdom: "Crypto Valley", badge: "🥇" },
                        { rank: 2, name: "TechVisioneer", xp: 14280, kingdom: "Silicon Valley", badge: "🥈" },
                        { rank: 3, name: "GrowthHacker", xp: 13560, kingdom: "Marketing Multiverse", badge: "🥉" },
                        { rank: 4, name: "ProductGuru", xp: 12840, kingdom: "Product Olympus", badge: "🏅" },
                        { rank: 5, name: "StrategyMaster", xp: 12120, kingdom: "Business Strategy", badge: "🏅" },
                      ].map((founder) => (
                        <div key={founder.rank} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg hover:bg-gray-700/50 transition-colors">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{founder.badge}</span>
                            <div>
                              <div className="font-bold text-white">{founder.name}</div>
                              <div className="text-sm text-gray-400">{founder.kingdom}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-green-400">{founder.xp.toLocaleString()} XP</div>
                            <div className="text-xs text-gray-500">#{founder.rank}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Platform Stats */}
                  <div className="bg-black/60 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/30">
                    <h3 className="text-2xl font-bold text-blue-400 mb-6 flex items-center gap-2">
                      📊 Platform Stats
                    </h3>
                    <div className="space-y-6">
                      <div className="text-center p-4 bg-blue-900/30 rounded-lg">
                        <div className="text-3xl font-bold text-blue-300">2,847</div>
                        <div className="text-sm text-gray-400">Active Founders</div>
                      </div>
                      <div className="text-center p-4 bg-green-900/30 rounded-lg">
                        <div className="text-3xl font-bold text-green-300">15,623</div>
                        <div className="text-sm text-gray-400">Missions Completed</div>
                      </div>
                      <div className="text-center p-4 bg-purple-900/30 rounded-lg">
                        <div className="text-3xl font-bold text-purple-300">127</div>
                        <div className="text-sm text-gray-400">Territories Conquered</div>
                      </div>
                      <div className="text-center p-4 bg-yellow-900/30 rounded-lg">
                        <div className="text-3xl font-bold text-yellow-300">$2.4M</div>
                        <div className="text-sm text-gray-400">Funding Raised</div>
                      </div>
                    </div>
                  </div>

                  {/* Kingdom Control */}
                  <div className="bg-black/60 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/30">
                    <h3 className="text-2xl font-bold text-red-400 mb-6 flex items-center gap-2">
                      🏰 Kingdom Control
                    </h3>
                    <div className="space-y-4">
                      {[
                        { kingdom: "Silicon Valley", control: 34, color: "bg-blue-500", emblem: "💻" },
                        { kingdom: "Crypto Valley", control: 28, color: "bg-purple-500", emblem: "⛓️" },
                        { kingdom: "Product Olympus", control: 22, color: "bg-orange-500", emblem: "🎨" },
                        { kingdom: "Marketing Multiverse", control: 18, color: "bg-red-500", emblem: "🚀" },
                        { kingdom: "Business Strategy", control: 15, color: "bg-green-500", emblem: "📈" },
                      ].map((kingdom, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{kingdom.emblem}</span>
                              <span className="text-white font-medium">{kingdom.kingdom}</span>
                            </div>
                            <span className="text-gray-300 font-bold">{kingdom.control}%</span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${kingdom.color} transition-all duration-500`}
                              style={{ width: `${kingdom.control}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Call to Action */}
                <div className="text-center mt-12">
                  <p className="text-gray-400 mb-6">
                    Ready to make your mark on the leaderboard?
                  </p>
                  <button
                    onClick={() => {setShowMap(false); setShowStory(true);}}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xl font-bold px-12 py-4 rounded-2xl hover:from-purple-700 hover:to-pink-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl"
                  >
                    🚀 Start Your Rise to the Top
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Story Introduction */}
        {showStory && !showKingdoms && (
          <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative">
            {/* Animated Background */}
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-20 left-20 w-72 h-72 bg-purple-600 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
              <div className="absolute top-40 right-20 w-72 h-72 bg-yellow-600 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
              <div className="absolute -bottom-8 left-40 w-72 h-72 bg-pink-600 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-2000"></div>
            </div>
            
            <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
              <div className="max-w-4xl mx-auto text-center space-y-12">
              {/* Epic Title */}
              <div className="space-y-6">
                <div className="text-8xl animate-pulse">{storyBeats[currentStory].image}</div>
                <h1 className="text-7xl font-bold bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500 bg-clip-text text-transparent animate-fade-in">
                  RISE OF FOUNDERS
                </h1>
                <p className="text-xl text-purple-200 font-medium">
                  Where Dreamers Become Builders, and Builders Become Legends
                </p>
              </div>

              {/* Story Beat */}
              <div className="bg-black/40 backdrop-blur-lg rounded-2xl p-12 border border-purple-500/30 shadow-2xl">
                <h2 className="text-4xl font-bold text-yellow-400 mb-6">
                  {storyBeats[currentStory].title}
                </h2>
                <p className="text-xl text-gray-300 leading-relaxed">
                  {storyBeats[currentStory].text}
                </p>
              </div>

              {/* Story Progress */}
              <div className="flex justify-center space-x-4">
                {storyBeats.map((_, index) => (
                  <div
                    key={index}
                    className={`w-4 h-4 rounded-full transition-all duration-500 ${
                      index === currentStory ? 'bg-yellow-400 shadow-lg shadow-yellow-400/50' : 
                      index < currentStory ? 'bg-green-500' : 'bg-gray-600'
                    }`}
                  />
                ))}
              </div>

              {/* Continue Button */}
              {currentStory === storyBeats.length - 1 && (
                <div className="space-y-4">
                  <button
                    onClick={() => setShowKingdoms(true)}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-2xl font-bold px-12 py-6 rounded-2xl hover:from-purple-700 hover:to-pink-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl animate-bounce"
                  >
                    ⚔️ Explore the Kingdoms ⚔️
                  </button>
                  
                  <div className="flex justify-center">
                    <button
                      onClick={() => {setShowStory(false); setShowMap(true);}}
                      className="bg-gray-700 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      ← Back to 3D Map
                    </button>
                  </div>
                </div>
              )}
            </div>
            </div>
          </div>
        )}

        {/* Kingdom Selection */}
        {showKingdoms && !selectedKingdom && (
          <div className="min-h-screen py-12 px-4">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-16">
                <h1 className="text-6xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent mb-6">
                  The Startup Kingdoms
                </h1>
                <p className="text-2xl text-gray-300 max-w-3xl mx-auto">
                  Five realms corrupted by the Old Guards. Choose your battleground wisely, for each kingdom will test different aspects of your founder spirit.
                </p>
              </div>

              {/* Kingdoms Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                {kingdoms.map((kingdom, index) => (
                  <div
                    key={kingdom.id}
                    onClick={() => setSelectedKingdom(kingdom)}
                    className="bg-gradient-to-br from-black/60 to-black/30 backdrop-blur-lg rounded-2xl p-8 border border-purple-500/30 hover:border-yellow-400/50 cursor-pointer transform hover:scale-105 transition-all duration-300 group hover:shadow-2xl"
                  >
                    <div className={`w-24 h-24 bg-gradient-to-r ${kingdom.color} rounded-full flex items-center justify-center text-4xl mb-6 group-hover:animate-pulse`}>
                      {kingdom.icon}
                    </div>
                    <h3 className="text-2xl font-bold text-yellow-400 mb-2">
                      {kingdom.name}
                    </h3>
                    <p className="text-lg text-purple-300 mb-4 font-medium">
                      {kingdom.title}
                    </p>
                    <p className="text-gray-300 text-base leading-relaxed mb-6">
                      {kingdom.description}
                    </p>
                    <div className="space-y-2 text-sm">
                      <div className="text-red-400 font-medium">
                        👹 Boss: {kingdom.boss}
                      </div>
                      <div className="text-green-400 font-medium">
                        ⚡ Challenge: {kingdom.challenge}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center space-y-6">
                <button
                  onClick={() => setSelectedKingdom({ id: 'all', name: 'All Kingdoms', title: 'The Complete Conquest', description: 'Face all kingdoms', color: 'from-purple-600 to-pink-600', icon: '👑', boss: 'All Old Guards', challenge: 'Unite the kingdoms and claim the crown' })}
                  className="bg-gradient-to-r from-yellow-600 via-orange-600 to-red-600 text-white text-2xl font-bold px-16 py-6 rounded-2xl hover:from-yellow-700 hover:via-orange-700 hover:to-red-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl"
                >
                  👑 I Will Conquer ALL Kingdoms! 👑
                </button>
                
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={() => {setShowKingdoms(false); setShowMap(true);}}
                    className="bg-gray-700 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    ← Back to 3D Map
                  </button>
                  <button
                    onClick={() => {setShowKingdoms(false); setShowStory(true);}}
                    className="bg-gray-700 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    ← Back to Story
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Call to Adventure */}
        {selectedKingdom && (
          <div className="min-h-screen flex items-center justify-center px-4">
            <div className="max-w-4xl mx-auto text-center space-y-12">
              <div className={`w-32 h-32 bg-gradient-to-r ${selectedKingdom.color} rounded-full flex items-center justify-center text-6xl mx-auto animate-spin-slow`}>
                {selectedKingdom.icon}
              </div>
              
              <div className="space-y-6">
                <h1 className="text-6xl font-bold text-yellow-400">
                  {selectedKingdom.name}
                </h1>
                <h2 className="text-3xl text-purple-300 font-medium">
                  {selectedKingdom.title}
                </h2>
                <p className="text-xl text-gray-300 leading-relaxed max-w-2xl mx-auto">
                  {selectedKingdom.description}
                </p>
              </div>

              <div className="bg-black/60 backdrop-blur-lg rounded-2xl p-12 border border-purple-500/30">
                <h3 className="text-4xl font-bold text-red-400 mb-6">
                  Your Destiny Awaits
                </h3>
                <p className="text-2xl text-gray-200 mb-8 leading-relaxed">
                  The {selectedKingdom.boss} guards this realm. Only by connecting your wallet and joining the rebellion can you begin your conquest.
                </p>
                <p className="text-lg text-yellow-300 mb-12 font-medium">
                  "When dreamers rise as one, when code flows like water, when ideas burn brighter than gold — a new Founder shall claim the crown."
                </p>
                
                {/* Epic Wallet Connection */}
                <div className="space-y-6">
                  <h4 className="text-2xl font-bold text-yellow-400">
                    ⚡ Join the Rebellion ⚡
                  </h4>
                  <div className="flex justify-center">
                    <WalletMultiButton className="!bg-gradient-to-r !from-purple-600 !to-pink-600 !text-white !text-xl !font-bold !px-12 !py-4 !rounded-2xl hover:!from-purple-700 hover:!to-pink-700 transform hover:scale-105 transition-all duration-300 !shadow-lg hover:!shadow-2xl" />
                  </div>
                  {connecting && (
                    <p className="text-yellow-300 animate-pulse text-lg">
                      Connecting to the rebellion network...
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-center space-x-4 flex-wrap gap-2">
                <button
                  onClick={() => setSelectedKingdom(null)}
                  className="bg-gray-700 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  ← Choose Different Kingdom
                </button>
                <button
                  onClick={() => {setSelectedKingdom(null); setShowKingdoms(false); setShowMap(true);}}
                  className="bg-gray-700 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  ← Back to 3D Map
                </button>
                <button
                  onClick={() => {setSelectedKingdom(null); setShowKingdoms(false); setShowStory(true);}}
                  className="bg-gray-700 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  ← Back to Story
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}