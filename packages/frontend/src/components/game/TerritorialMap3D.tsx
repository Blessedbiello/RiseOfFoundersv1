'use client';

import { useState, useEffect } from 'react';

interface Territory {
  id: string;
  name: string;
  kingdom: string;
  status: 'controlled' | 'contested' | 'available' | 'boss';
  controller?: string;
  emblem: string;
  color: string;
  x: number;
  y: number;
  z: number;
  size: number;
  width?: number;
  height?: number;
}

interface Kingdom {
  id: string;
  name: string;
  color: string;
  emblem: string;
  territories: number;
}

const kingdoms: Kingdom[] = [
  { id: 'silicon-valley', name: 'Silicon Valley', color: '#3b82f6', emblem: '💻', territories: 12 },
  { id: 'crypto-valley', name: 'Crypto Valley', color: '#8b5cf6', emblem: '⛓️', territories: 10 },
  { id: 'business-strategy', name: 'Business Strategy', color: '#10b981', emblem: '📈', territories: 8 },
  { id: 'product-olympus', name: 'Product Olympus', color: '#f59e0b', emblem: '🎨', territories: 15 },
  { id: 'marketing-multiverse', name: 'Marketing Multiverse', color: '#ef4444', emblem: '🚀', territories: 11 },
];

// Honeycomb-style regions for each kingdom arranged in hexagonal patterns
const kingdomRegions = {
  'silicon-valley': [
    { name: 'Silicon Core', x: -280, y: -120, width: 100, height: 100 }, // Central hub
    { name: 'Tech Valley', x: -180, y: -160, width: 90, height: 90 },
    { name: 'Innovation Hub', x: -180, y: -80, width: 90, height: 90 },
    { name: 'Startup Bay', x: -380, y: -160, width: 90, height: 90 },
    { name: 'Code Fortress', x: -380, y: -80, width: 90, height: 90 },
  ],
  'crypto-valley': [
    { name: 'Blockchain Core', x: -80, y: -120, width: 100, height: 100 }, // Central hub
    { name: 'DeFi Plains', x: 20, y: -160, width: 90, height: 90 },
    { name: 'NFT Nexus', x: 20, y: -80, width: 90, height: 90 },
    { name: 'Mining Mesa', x: -180, y: -160, width: 90, height: 90 },
    { name: 'Web3 Woods', x: -180, y: -80, width: 90, height: 90 },
  ],
  'business-strategy': [
    { name: 'Strategy Core', x: 120, y: -120, width: 100, height: 100 }, // Central hub
    { name: 'Corporate Castle', x: 220, y: -160, width: 90, height: 90 },
    { name: 'Investment Isle', x: 220, y: -80, width: 90, height: 90 },
    { name: 'Finance Frontier', x: 20, y: -160, width: 90, height: 90 },
    { name: 'Growth Gateway', x: 20, y: -80, width: 90, height: 90 },
  ],
  'product-olympus': [
    { name: 'Design Core', x: 320, y: -120, width: 100, height: 100 }, // Central hub
    { name: 'UX Universe', x: 420, y: -160, width: 90, height: 90 },
    { name: 'Creative Colony', x: 420, y: -80, width: 90, height: 90 },
    { name: 'Product Peak', x: 220, y: -160, width: 90, height: 90 },
    { name: 'Innovation Island', x: 220, y: -80, width: 90, height: 90 },
  ],
  'marketing-multiverse': [
    { name: 'Brand Core', x: -80, y: 80, width: 100, height: 100 }, // Central hub
    { name: 'Content Citadel', x: 20, y: 40, width: 90, height: 90 },
    { name: 'Social Sphere', x: 20, y: 120, width: 90, height: 90 },
    { name: 'Growth Galaxy', x: -180, y: 40, width: 90, height: 90 },
    { name: 'Viral Valley', x: -180, y: 120, width: 90, height: 90 },
  ],
};

const generateTerritories = (): Territory[] => {
  const territories: Territory[] = [];
  let id = 1;

  kingdoms.forEach((kingdom, kingdomIndex) => {
    const regions = kingdomRegions[kingdom.id as keyof typeof kingdomRegions] || [];
    
    regions.forEach((region, regionIndex) => {
      const isBoss = regionIndex === 0; // First region is capital/boss territory
      const status = isBoss ? 'boss' : 
                   Math.random() > 0.6 ? 'controlled' :
                   Math.random() > 0.8 ? 'contested' : 'available';
      
      territories.push({
        id: `territory-${id++}`,
        name: region.name,
        kingdom: kingdom.id,
        status,
        controller: status === 'controlled' ? kingdom.name : undefined,
        emblem: isBoss ? '👑' : kingdom.emblem,
        color: kingdom.color,
        x: region.x,
        y: region.y,
        z: 0,
        size: Math.max(region.width, region.height),
        width: region.width,
        height: region.height,
      });
    });
  });

  return territories;
};

export const TerritorialMap3D: React.FC = () => {
  const [territories, setTerritories] = useState<Territory[]>([]);
  const [selectedTerritory, setSelectedTerritory] = useState<Territory | null>(null);
  const [animationPhase, setAnimationPhase] = useState(0);
  const [showDemo, setShowDemo] = useState(false);

  useEffect(() => {
    setTerritories(generateTerritories());
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationPhase(prev => (prev + 1) % 360);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (showDemo) {
      const demoInterval = setInterval(() => {
        setTerritories(prev => prev.map(territory => {
          if (Math.random() > 0.95) {
            const newStatus = territory.status === 'available' ? 'contested' :
                            territory.status === 'contested' ? 'controlled' :
                            territory.status === 'controlled' && Math.random() > 0.8 ? 'contested' :
                            territory.status;
            return { ...territory, status: newStatus };
          }
          return territory;
        }));
      }, 2000);
      
      return () => clearInterval(demoInterval);
    }
  }, [showDemo]);

  const getStatusColor = (status: string, baseColor: string) => {
    switch (status) {
      case 'controlled': return baseColor;
      case 'contested': return '#ff6b6b';
      case 'boss': return '#ffd700';
      default: return '#6b7280';
    }
  };

  const getStatusGlow = (status: string, phase: number = 0) => {
    const pulseIntensity = 0.5 + 0.5 * Math.sin(phase * 0.05);
    switch (status) {
      case 'controlled': return `0 0 ${20 + pulseIntensity * 20}px currentColor, 0 0 ${40 + pulseIntensity * 40}px currentColor`;
      case 'contested': return `0 0 ${30 + pulseIntensity * 30}px #ff6b6b, 0 0 ${60 + pulseIntensity * 60}px #ff6b6b, 0 0 ${90 + pulseIntensity * 90}px #ff6b6b`;
      case 'boss': return `0 0 ${40 + pulseIntensity * 40}px #ffd700, 0 0 ${80 + pulseIntensity * 80}px #ffd700, 0 0 ${120 + pulseIntensity * 120}px #ffd700`;
      default: return '0 0 10px rgba(107, 114, 128, 0.5)';
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gradient-to-br from-purple-900 via-slate-900 to-blue-900">
      {/* Cosmic Background Elements */}
      <div className="absolute inset-0 opacity-30">
        {/* Stars */}
        {[...Array(50)].map((_, i) => (
          <div
            key={`star-${i}`}
            className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          />
        ))}
        
        {/* Nebula clouds */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-blue-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-40 w-72 h-72 bg-pink-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-2000"></div>
      </div>

      {/* Stable Map Container */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-full h-full scale-90">
          {/* Territories as Geographic Regions */}
          {territories.map((territory) => (
            <div
              key={territory.id}
              className="absolute cursor-pointer transition-all duration-300 group"
              style={{
                left: `calc(50% + ${territory.x}px)`,
                top: `calc(50% + ${territory.y}px)`,
                width: `${territory.width || territory.size}px`,
                height: `${territory.height || territory.size}px`,
              }}
              onClick={() => setSelectedTerritory(territory)}
            >
              {/* Honeycomb Territory Shape */}
              <div
                className="w-full h-full border-2 transition-all duration-300 group-hover:scale-105 group-hover:brightness-125 relative overflow-hidden"
                style={{
                  backgroundColor: getStatusColor(territory.status, territory.color),
                  borderColor: territory.status === 'contested' ? '#ff6b6b' : territory.color,
                  borderStyle: territory.status === 'contested' ? 'dashed' : 'solid',
                  opacity: territory.status === 'available' ? 0.6 : 0.9,
                  boxShadow: territory.status !== 'available' ? getStatusGlow(territory.status, animationPhase) : '0 0 5px rgba(107, 114, 128, 0.3)',
                  clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
                }}
              >
                {/* Territory Pattern */}
                <div 
                  className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage: territory.status === 'controlled' 
                      ? 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px)'
                      : territory.status === 'contested'
                      ? 'repeating-linear-gradient(45deg, rgba(255,0,0,0.2) 0px, rgba(255,0,0,0.2) 5px, transparent 5px, transparent 10px)'
                      : 'none'
                  }}
                />
                
                {/* Region Name Label */}
                <div className="absolute inset-0 flex items-center justify-center p-2">
                  <div className="text-center">
                    <div className="text-lg mb-1" style={{ filter: 'drop-shadow(1px 1px 2px rgba(0,0,0,0.8))' }}>
                      {territory.emblem}
                    </div>
                    <div 
                      className="text-xs font-bold text-white px-2 py-1 rounded backdrop-blur-sm"
                      style={{ 
                        backgroundColor: 'rgba(0,0,0,0.6)',
                        textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
                        fontSize: Math.max(8, Math.min(territory.width || territory.size, territory.height || territory.size) / 8),
                      }}
                    >
                      {territory.name}
                    </div>
                  </div>
                </div>

                {/* Capital City marker for boss territories */}
                {territory.status === 'boss' && (
                  <div className="absolute top-2 right-2">
                    <div className="w-4 h-4 bg-yellow-400 rounded-full border-2 border-yellow-600 animate-pulse">
                      <div className="w-2 h-2 bg-yellow-600 rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
                    </div>
                  </div>
                )}

                {/* Battle indicators for contested territories */}
                {territory.status === 'contested' && (
                  <>
                    <div className="absolute top-1 left-1 w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
                    <div className="absolute bottom-1 right-1 w-2 h-2 bg-orange-500 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
                    <div className="absolute top-1 right-1 w-2 h-2 bg-yellow-500 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
                  </>
                )}

                {/* Control indicator */}
                {territory.status === 'controlled' && (
                  <div className="absolute top-2 left-2">
                    <div 
                      className="w-3 h-3 rounded-full border border-white"
                      style={{ backgroundColor: territory.color }}
                    />
                  </div>
                )}
              </div>

              {/* Hover effect border */}
              <div className="absolute inset-0 border-2 border-transparent group-hover:border-white/50 transition-all duration-300 pointer-events-none" 
                   style={{ clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)' }} />
            </div>
          ))}

          {/* Kingdom Territory Borders */}
          {kingdoms.map((kingdom, index) => {
            const regions = kingdomRegions[kingdom.id as keyof typeof kingdomRegions] || [];
            if (regions.length === 0) return null;
            
            // Calculate kingdom boundary
            const minX = Math.min(...regions.map(r => r.x));
            const maxX = Math.max(...regions.map(r => r.x + r.width));
            const minY = Math.min(...regions.map(r => r.y));
            const maxY = Math.max(...regions.map(r => r.y + r.height));
            
            return (
              <div
                key={kingdom.id}
                className="absolute border-2 border-dashed opacity-30 pointer-events-none"
                style={{
                  left: `calc(50% + ${minX - 20}px)`,
                  top: `calc(50% + ${minY - 20}px)`,
                  width: `${maxX - minX + 40}px`,
                  height: `${maxY - minY + 40}px`,
                  borderColor: kingdom.color,
                }}
              />
            );
          })}
        </div>
      </div>

      {/* Control Panel */}
      <div className="absolute top-4 left-4 space-y-4 z-10">
        <div className="bg-black/70 backdrop-blur-lg rounded-lg p-4 border border-purple-500/30">
          <h3 className="text-yellow-400 font-bold text-lg mb-3">🍯 Honeycomb Territories</h3>
          <p className="text-purple-300 text-xs mb-3">Powered by Honeycomb Protocol</p>
          
          {/* Legend */}
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500" style={{ 
                clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
                boxShadow: '0 0 10px #3b82f6' 
              }}></div>
              <span className="text-blue-300">Controlled Hive</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 animate-pulse" style={{ 
                clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)' 
              }}></div>
              <span className="text-red-300">Contested Hive</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-500 opacity-60" style={{ 
                clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)' 
              }}></div>
              <span className="text-gray-300">Available Hive</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-500" style={{ 
                clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
                boxShadow: '0 0 15px #ffd700' 
              }}></div>
              <span className="text-yellow-300">Queen's Hive</span>
            </div>
          </div>

          <button
            onClick={() => setShowDemo(!showDemo)}
            className={`mt-4 w-full px-4 py-2 rounded-lg font-bold transition-all ${
              showDemo 
                ? 'bg-red-600 text-white hover:bg-red-700' 
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {showDemo ? '⏹️ Stop Demo' : '▶️ Start Live Demo'}
          </button>
        </div>

        {/* Kingdom Stats */}
        <div className="bg-black/70 backdrop-blur-lg rounded-lg p-4 border border-purple-500/30">
          <h3 className="text-yellow-400 font-bold text-lg mb-3">👑 Kingdom Power</h3>
          <div className="space-y-2">
            {kingdoms.map(kingdom => {
              const controlled = territories.filter(t => t.kingdom === kingdom.id && t.status === 'controlled').length;
              const total = kingdom.territories;
              const percentage = Math.round((controlled / total) * 100);
              
              return (
                <div key={kingdom.id} className="text-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="flex items-center gap-1">
                      <span>{kingdom.emblem}</span>
                      <span className="text-gray-300">{kingdom.name}</span>
                    </span>
                    <span className="text-white font-bold">{percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: kingdom.color,
                        boxShadow: `0 0 10px ${kingdom.color}`,
                      }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Selected Territory Info */}
      {selectedTerritory && (
        <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-lg rounded-lg p-6 border border-purple-500/30 min-w-80 z-10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-yellow-400">Territory Details</h3>
            <button
              onClick={() => setSelectedTerritory(null)}
              className="text-gray-400 hover:text-white text-xl"
            >
              ✕
            </button>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center text-lg"
                style={{
                  backgroundColor: getStatusColor(selectedTerritory.status, selectedTerritory.color),
                  boxShadow: getStatusGlow(selectedTerritory.status),
                }}
              >
                {selectedTerritory.emblem}
              </div>
              <div>
                <div className="text-white font-bold">{selectedTerritory.name}</div>
                <div className="text-gray-400 text-sm">{selectedTerritory.kingdom.replace('-', ' ')}</div>
              </div>
            </div>
            
            <div className="border-t border-gray-600 pt-3 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Status:</span>
                <span className={`font-bold capitalize ${
                  selectedTerritory.status === 'controlled' ? 'text-green-400' :
                  selectedTerritory.status === 'contested' ? 'text-red-400' :
                  selectedTerritory.status === 'boss' ? 'text-yellow-400' :
                  'text-gray-400'
                }`}>
                  {selectedTerritory.status === 'boss' ? 'Boss Territory' : selectedTerritory.status}
                </span>
              </div>
              
              {selectedTerritory.controller && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Controller:</span>
                  <span className="text-white font-bold">{selectedTerritory.controller}</span>
                </div>
              )}
              
              <div className="flex justify-between">
                <span className="text-gray-400">Size:</span>
                <span className="text-white">{Math.round(selectedTerritory.size)}px</span>
              </div>
            </div>

            {selectedTerritory.status === 'available' && (
              <button className="w-full mt-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-2 px-4 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all">
                🚀 Claim Territory
              </button>
            )}
            
            {selectedTerritory.status === 'contested' && (
              <button className="w-full mt-4 bg-gradient-to-r from-red-600 to-orange-600 text-white font-bold py-2 px-4 rounded-lg hover:from-red-700 hover:to-orange-700 transition-all">
                ⚔️ Join Battle
              </button>
            )}
            
            {selectedTerritory.status === 'boss' && (
              <button className="w-full mt-4 bg-gradient-to-r from-yellow-600 to-red-600 text-white font-bold py-2 px-4 rounded-lg hover:from-yellow-700 hover:to-red-700 transition-all">
                👑 Challenge Boss
              </button>
            )}
          </div>
        </div>
      )}

      {/* Demo Explanation */}
      {showDemo && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/80 backdrop-blur-lg rounded-lg p-4 border border-green-500/30 max-w-2xl text-center z-10">
          <div className="text-green-400 font-bold text-lg mb-2">🎮 Live Territorial Demo Active!</div>
          <p className="text-gray-300 text-sm">
            Watch as territories change hands in real-time! Founders compete for control, 
            territories become contested, and new lands are claimed. This is how the Rise of Founders 
            territorial control system works in practice.
          </p>
        </div>
      )}
    </div>
  );
};