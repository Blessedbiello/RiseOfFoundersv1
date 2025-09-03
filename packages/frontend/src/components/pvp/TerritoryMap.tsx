'use client';

import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Canvas, useFrame, extend } from '@react-three/fiber';
import { OrbitControls, Text, Html } from '@react-three/drei';
import * as THREE from 'three';
import { Button } from '../ui/button';
import { 
  Shield,
  Sword,
  Crown,
  Trophy,
  Users,
  Star,
  Zap,
  Target,
  Flag
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

// Extend Three.js with necessary materials
extend({ MeshStandardMaterial: THREE.MeshStandardMaterial });

interface Territory {
  id: string;
  name: string;
  position: [number, number, number];
  controlledBy?: string; // team ID
  controllerName?: string;
  defenseStrength: number;
  resources: {
    xp: number;
    credits: number;
    influence: number;
  };
  type: 'startup_hub' | 'funding_center' | 'tech_district' | 'market_square' | 'innovation_lab';
  status: 'neutral' | 'contested' | 'controlled';
  challengeActive?: boolean;
  lastBattle?: string;
  reputation: number;
}

interface Team {
  id: string;
  name: string;
  color: string;
  reputation: number;
  territories: number;
  totalStrength: number;
}

interface Challenge {
  id: string;
  territoryId: string;
  challengerTeam: string;
  defenderTeam?: string;
  type: 'capture' | 'defend' | 'duel';
  status: 'pending' | 'active' | 'judging' | 'completed';
  submissionDeadline: string;
  judging?: {
    judges: string[];
    submissions: any[];
    voting: Record<string, string>;
  };
}

const territoryTypes = {
  startup_hub: {
    color: '#3b82f6',
    geometry: 'box',
    size: [3, 2, 3],
    icon: '🏢'
  },
  funding_center: {
    color: '#10b981',
    geometry: 'sphere',
    size: [2, 32, 32],
    icon: '💰'
  },
  tech_district: {
    color: '#8b5cf6',
    geometry: 'cylinder',
    size: [2, 3, 8],
    icon: '⚡'
  },
  market_square: {
    color: '#f59e0b',
    geometry: 'octahedron',
    size: [2.5, 0],
    icon: '🏪'
  },
  innovation_lab: {
    color: '#ef4444',
    geometry: 'cone',
    size: [2, 3, 8],
    icon: '🔬'
  }
};

interface TerritoryNodeProps {
  territory: Territory;
  isSelected: boolean;
  onSelect: (territory: Territory) => void;
  teams: Team[];
}

const TerritoryNode: React.FC<TerritoryNodeProps> = ({ 
  territory, 
  isSelected, 
  onSelect, 
  teams 
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  
  const territoryConfig = territoryTypes[territory.type];
  const controllerTeam = teams.find(t => t.id === territory.controlledBy);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
      
      if (territory.challengeActive) {
        meshRef.current.position.y = territory.position[1] + Math.sin(state.clock.elapsedTime * 3) * 0.2;
      }
      
      if (isSelected) {
        meshRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 4) * 0.05);
      }
    }
  });

  // Calculate emissive color based on territory state
  const emissive = territory.challengeActive ? '#ff6b6b' : hovered ? '#555555' : '#000000';

  const renderGeometry = () => {
    const { geometry, size } = territoryConfig;
    const baseColor = controllerTeam?.color || territoryConfig.color;

    switch (geometry) {
      case 'box':
        return <boxGeometry args={size as [number, number, number]} />;
      case 'sphere':
        return <sphereGeometry args={size as [number, number, number]} />;
      case 'cylinder':
        return <cylinderGeometry args={size as [number, number, number]} />;
      case 'octahedron':
        return <octahedronGeometry args={[size[0]]} />;
      case 'cone':
        return <coneGeometry args={size as [number, number, number]} />;
      default:
        return <boxGeometry args={[2, 2, 2]} />;
    }
  };

  return (
    <group position={territory.position}>
      <mesh
        ref={meshRef}
        onClick={() => onSelect(territory)}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
      >
        {renderGeometry()}
        <meshStandardMaterial
          color={controllerTeam?.color || territoryConfig.color}
          emissive={emissive}
          emissiveIntensity={territory.challengeActive ? 0.3 : hovered ? 0.1 : 0}
        />
      </mesh>

      {/* Territory Status Indicators */}
      {territory.challengeActive && (
        <mesh position={[0, 4, 0]}>
          <sphereGeometry args={[0.3]} />
          <meshStandardMaterial color="#ff4444" emissive="#ff0000" emissiveIntensity={0.5} />
        </mesh>
      )}

      {controllerTeam && (
        <mesh position={[0, 3, 0]}>
          <sphereGeometry args={[0.2]} />
          <meshStandardMaterial color={controllerTeam.color} />
        </mesh>
      )}

      {/* Territory Name */}
      <Text
        position={[0, -3, 0]}
        fontSize={0.5}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        {territory.name}
      </Text>

      {/* Hover Info */}
      {hovered && (
        <Html position={[0, 5, 0]} center>
          <div className="bg-black/80 text-white p-3 rounded-lg text-sm min-w-48">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">{territoryConfig.icon}</span>
              <span className="font-bold">{territory.name}</span>
            </div>
            
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span>Status:</span>
                <span className={
                  territory.status === 'controlled' ? 'text-green-400' :
                  territory.status === 'contested' ? 'text-red-400' :
                  'text-gray-400'
                }>
                  {territory.status.charAt(0).toUpperCase() + territory.status.slice(1)}
                </span>
              </div>
              
              {controllerTeam && (
                <div className="flex justify-between">
                  <span>Controlled by:</span>
                  <span style={{ color: controllerTeam.color }}>{controllerTeam.name}</span>
                </div>
              )}
              
              <div className="flex justify-between">
                <span>Defense:</span>
                <span className="text-blue-400">{territory.defenseStrength}</span>
              </div>
              
              <div className="flex justify-between">
                <span>Reputation:</span>
                <span className="text-purple-400">{territory.reputation}</span>
              </div>
              
              <div className="mt-2 pt-2 border-t border-gray-600">
                <div className="font-medium mb-1">Resources:</div>
                <div className="flex justify-between text-xs">
                  <span>{territory.resources.xp} XP</span>
                  <span>{territory.resources.credits} Credits</span>
                  <span>{territory.resources.influence} Influence</span>
                </div>
              </div>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
};

interface TerritoryMapProps {
  onTerritorySelect: (territory: Territory) => void;
}

export const TerritoryMap: React.FC<TerritoryMapProps> = ({ onTerritorySelect }) => {
  const [selectedTerritory, setSelectedTerritory] = useState<Territory | null>(null);
  const { user } = useAuth();

  const territories: Territory[] = useMemo(() => [
    {
      id: 'startup_hub_1',
      name: 'Silicon Valley Hub',
      position: [0, 0, 0],
      controlledBy: 'team_alpha',
      controllerName: 'Alpha Ventures',
      defenseStrength: 85,
      resources: { xp: 1500, credits: 5000, influence: 250 },
      type: 'startup_hub',
      status: 'controlled',
      reputation: 95
    },
    {
      id: 'funding_center_1', 
      name: 'Venture Capital Plaza',
      position: [8, 0, -5],
      controlledBy: 'team_beta',
      controllerName: 'Beta Innovations',
      defenseStrength: 72,
      resources: { xp: 2000, credits: 8000, influence: 400 },
      type: 'funding_center',
      status: 'controlled',
      reputation: 88
    },
    {
      id: 'tech_district_1',
      name: 'AI Research District',
      position: [-6, 0, 8],
      defenseStrength: 45,
      resources: { xp: 1200, credits: 3500, influence: 180 },
      type: 'tech_district',
      status: 'neutral',
      reputation: 65
    },
    {
      id: 'market_square_1',
      name: 'Global Markets',
      position: [12, 0, 6],
      controlledBy: 'team_gamma',
      controllerName: 'Gamma Corp',
      defenseStrength: 60,
      resources: { xp: 1800, credits: 6000, influence: 300 },
      type: 'market_square',
      status: 'contested',
      challengeActive: true,
      reputation: 78
    },
    {
      id: 'innovation_lab_1',
      name: 'Quantum Innovation Lab',
      position: [-10, 0, -8],
      defenseStrength: 90,
      resources: { xp: 2500, credits: 4000, influence: 500 },
      type: 'innovation_lab',
      status: 'neutral',
      reputation: 92
    },
    {
      id: 'startup_hub_2',
      name: 'European Tech Hub',
      position: [15, 0, -12],
      controlledBy: 'team_delta',
      controllerName: 'Delta Systems',
      defenseStrength: 68,
      resources: { xp: 1300, credits: 4500, influence: 220 },
      type: 'startup_hub',
      status: 'controlled',
      reputation: 71
    }
  ], []);

  const teams: Team[] = useMemo(() => [
    {
      id: 'team_alpha',
      name: 'Alpha Ventures',
      color: '#3b82f6',
      reputation: 850,
      territories: 1,
      totalStrength: 85
    },
    {
      id: 'team_beta',
      name: 'Beta Innovations',
      color: '#10b981',
      reputation: 720,
      territories: 1,
      totalStrength: 72
    },
    {
      id: 'team_gamma',
      name: 'Gamma Corp',
      color: '#f59e0b',
      reputation: 640,
      territories: 1,
      totalStrength: 60
    },
    {
      id: 'team_delta',
      name: 'Delta Systems',
      color: '#8b5cf6',
      reputation: 580,
      territories: 1,
      totalStrength: 68
    }
  ], []);

  const handleTerritorySelect = useCallback((territory: Territory) => {
    setSelectedTerritory(territory);
    onTerritorySelect(territory);
  }, [onTerritorySelect]);

  return (
    <div className="relative w-full h-full bg-gray-900">
      <Canvas camera={{ position: [20, 15, 20], fov: 60 }}>
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#4338ca" />
        
        {territories.map((territory) => (
          <TerritoryNode
            key={territory.id}
            territory={territory}
            isSelected={selectedTerritory?.id === territory.id}
            onSelect={handleTerritorySelect}
            teams={teams}
          />
        ))}

        {/* Connection Lines between territories */}
        {territories.map((territory, index) => (
          territories.slice(index + 1).map((otherTerritory) => {
            const distance = new THREE.Vector3(...territory.position)
              .distanceTo(new THREE.Vector3(...otherTerritory.position));
            
            if (distance < 15) {
              return (
                <line key={`${territory.id}-${otherTerritory.id}`}>
                  <bufferGeometry>
                    <bufferAttribute
                      attach="attributes-position"
                      array={new Float32Array([
                        ...territory.position,
                        ...otherTerritory.position
                      ])}
                      count={2}
                      itemSize={3}
                    />
                  </bufferGeometry>
                  <lineBasicMaterial color="#333333" opacity={0.3} transparent />
                </line>
              );
            }
            return null;
          })
        )).flat().filter(Boolean)}

        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={10}
          maxDistance={50}
        />
      </Canvas>

      {/* Territory Info Overlay */}
      {selectedTerritory && (
        <div className="absolute top-4 left-4 bg-black/80 text-white p-4 rounded-lg min-w-80">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{territoryTypes[selectedTerritory.type].icon}</span>
              <h3 className="text-lg font-bold">{selectedTerritory.name}</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedTerritory(null)}
              className="text-gray-400 hover:text-white"
            >
              ×
            </Button>
          </div>

          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-gray-400 mb-1">Status</div>
                <div className={`font-medium capitalize ${
                  selectedTerritory.status === 'controlled' ? 'text-green-400' :
                  selectedTerritory.status === 'contested' ? 'text-red-400' :
                  'text-gray-400'
                }`}>
                  {selectedTerritory.challengeActive ? '⚡ Under Attack' : selectedTerritory.status}
                </div>
              </div>
              
              <div>
                <div className="text-gray-400 mb-1">Defense Strength</div>
                <div className="flex items-center gap-1">
                  <Shield className="w-4 h-4 text-blue-400" />
                  <span className="font-bold text-blue-400">{selectedTerritory.defenseStrength}</span>
                </div>
              </div>
            </div>

            {selectedTerritory.controllerName && (
              <div>
                <div className="text-gray-400 mb-1">Controlled By</div>
                <div className="font-medium" style={{ 
                  color: teams.find(t => t.id === selectedTerritory.controlledBy)?.color 
                }}>
                  {selectedTerritory.controllerName}
                </div>
              </div>
            )}

            <div>
              <div className="text-gray-400 mb-1">Resources Generated</div>
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-gray-800 rounded p-2 text-center">
                  <div className="text-blue-400 font-bold">{selectedTerritory.resources.xp}</div>
                  <div className="text-xs text-gray-400">XP/day</div>
                </div>
                <div className="bg-gray-800 rounded p-2 text-center">
                  <div className="text-green-400 font-bold">{selectedTerritory.resources.credits}</div>
                  <div className="text-xs text-gray-400">Credits/day</div>
                </div>
                <div className="bg-gray-800 rounded p-2 text-center">
                  <div className="text-purple-400 font-bold">{selectedTerritory.resources.influence}</div>
                  <div className="text-xs text-gray-400">Influence/day</div>
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              {selectedTerritory.status === 'neutral' && (
                <Button className="flex-1 bg-green-600 hover:bg-green-700" size="sm">
                  <Flag className="w-4 h-4 mr-2" />
                  Claim Territory
                </Button>
              )}
              
              {selectedTerritory.controlledBy && selectedTerritory.controlledBy !== user?.teamId && (
                <Button className="flex-1 bg-red-600 hover:bg-red-700" size="sm">
                  <Sword className="w-4 h-4 mr-2" />
                  Challenge
                </Button>
              )}

              {selectedTerritory.controlledBy === user?.teamId && (
                <Button className="flex-1 bg-blue-600 hover:bg-blue-700" size="sm">
                  <Shield className="w-4 h-4 mr-2" />
                  Fortify
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard */}
      <div className="absolute top-4 right-4 bg-black/80 text-white p-4 rounded-lg min-w-64">
        <div className="flex items-center gap-2 mb-3">
          <Trophy className="w-5 h-5 text-yellow-400" />
          <h3 className="font-bold">Territory Leaderboard</h3>
        </div>
        
        <div className="space-y-2">
          {teams
            .sort((a, b) => b.reputation - a.reputation)
            .map((team, index) => (
              <div key={team.id} className="flex items-center justify-between p-2 bg-gray-800/50 rounded">
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-bold ${
                    index === 0 ? 'text-yellow-400' :
                    index === 1 ? 'text-gray-300' :
                    index === 2 ? 'text-amber-600' :
                    'text-gray-500'
                  }`}>
                    #{index + 1}
                  </span>
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: team.color }}></div>
                  <span className="font-medium text-sm">{team.name}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-purple-400">{team.reputation}</div>
                  <div className="text-xs text-gray-400">{team.territories} territories</div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};