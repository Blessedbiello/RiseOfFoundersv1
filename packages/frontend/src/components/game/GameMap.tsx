'use client';

import { Suspense, useRef, useState, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Html, Environment } from '@react-three/drei';
import { Vector3 } from 'three';
import * as THREE from 'three';
import { useAuth } from '../../hooks/useAuth';

// Map node data structure
export interface MapNodeData {
  id: string;
  name: string;
  position: [number, number, number];
  type: 'hub' | 'mission' | 'boss' | 'territory';
  difficulty: 'bronze' | 'silver' | 'gold' | 'boss';
  status: 'locked' | 'available' | 'in_progress' | 'completed';
  connections: string[];
  requiredLevel?: number;
  xpReward?: number;
  territory?: {
    controller?: string;
    contestable: boolean;
  };
}

// Personal Achievement Map - Dynamically updated based on user progress
const getPersonalAchievementMap = (user: any): MapNodeData[] => {
  // User progress indicators
  const userXp = user?.xpTotal || 0;
  const hasGitHub = user?.githubUsername ? true : false;
  const completedCourses = user?.completedCourses || [];
  const userLevel = Math.floor(userXp / 1000) + 1;
  const selectedKingdom = user?.selectedKingdom;

  // Determine node statuses based on user progress
  const getNodeStatus = (requirements: {
    minXp?: number;
    requiresGitHub?: boolean;
    requiresCourse?: string;
    requiresLevel?: number;
  }): 'locked' | 'available' | 'completed' => {
    if (requirements.minXp && userXp < requirements.minXp) return 'locked';
    if (requirements.requiresGitHub && !hasGitHub) return 'locked';
    if (requirements.requiresCourse && !completedCourses.includes(requirements.requiresCourse)) return 'locked';
    if (requirements.requiresLevel && userLevel < requirements.requiresLevel) return 'locked';
    return 'available';
  };

  return [
    // CROWN CITADEL - Center of all kingdoms (unlocked after significant progress)
    {
      id: 'crown-citadel',
      name: 'Crown Citadel',
      position: [0, 0, 0],
      type: 'hub',
      difficulty: 'boss',
      status: userLevel >= 10 ? 'available' : 'locked',
      connections: ['personal-journey', 'github-connection', 'solana-mastery', 'first-territory'],
      requiredLevel: 10,
    },
  
    // PERSONAL JOURNEY START - Always available
    {
      id: 'personal-journey',
      name: 'Your Journey Begins',
      position: [-2, 1, 2],
      type: 'hub',
      difficulty: 'bronze',
      status: 'available',
      connections: ['crown-citadel', 'first-xp', 'choose-kingdom'],
      xpReward: 0,
    },
    
    // FIRST XP MILESTONE
    {
      id: 'first-xp',
      name: 'Earn Your First 100 XP',
      position: [-4, 1, 1],
      type: 'mission',
      difficulty: 'bronze',
      status: userXp >= 100 ? 'completed' : 'available',
      connections: ['personal-journey', 'xp-milestone-500'],
      xpReward: 50,
    },
    
    // XP MILESTONES
    {
      id: 'xp-milestone-500',
      name: 'Reach 500 XP',
      position: [-6, 1, 0],
      type: 'mission',
      difficulty: 'silver',
      status: userXp >= 500 ? 'completed' : getNodeStatus({ minXp: 100 }),
      connections: ['first-xp', 'xp-milestone-1000'],
      xpReward: 100,
    },
    
    {
      id: 'xp-milestone-1000',
      name: 'Reach 1000 XP - Level Up!',
      position: [-8, 1, -1],
      type: 'mission',
      difficulty: 'gold',
      status: userXp >= 1000 ? 'completed' : getNodeStatus({ minXp: 500 }),
      connections: ['xp-milestone-500', 'level-master'],
      xpReward: 200,
    },
    
    // KINGDOM SELECTION
    {
      id: 'choose-kingdom',
      name: 'Choose Your Kingdom',
      position: [2, 1, 2],
      type: 'mission',
      difficulty: 'bronze',
      status: selectedKingdom ? 'completed' : 'available',
      connections: ['personal-journey', 'kingdom-specialization'],
      xpReward: 100,
    },
    
    // GITHUB CONNECTION
    {
      id: 'github-connection',
      name: 'Connect Your GitHub',
      position: [0, 2, 4],
      type: 'mission',
      difficulty: 'silver',
      status: hasGitHub ? 'completed' : 'available',
      connections: ['crown-citadel', 'first-commit', 'open-source'],
      xpReward: 200,
    },
    
    // GITHUB ACHIEVEMENTS
    {
      id: 'first-commit',
      name: 'Make Your First Commit',
      position: [2, 1, 6],
      type: 'mission',
      difficulty: 'bronze',
      status: getNodeStatus({ requiresGitHub: true }),
      connections: ['github-connection', 'repo-master'],
      xpReward: 150,
    },
    
    {
      id: 'repo-master',
      name: 'Create 5 Repositories',
      position: [4, 0, 8],
      type: 'mission',
      difficulty: 'silver',
      status: getNodeStatus({ requiresGitHub: true, minXp: 500 }),
      connections: ['first-commit', 'code-master'],
      xpReward: 300,
    },
    
    // SOLANA COURSE ACHIEVEMENTS
    {
      id: 'solana-mastery',
      name: 'Complete Solana Course',
      position: [-2, 2, -4],
      type: 'hub',
      difficulty: 'gold',
      status: completedCourses.includes('solana-fundamentals') ? 'completed' : 'available',
      connections: ['crown-citadel', 'solana-basics', 'solana-advanced'],
      xpReward: 500,
    },
    
    {
      id: 'solana-basics',
      name: 'Solana Fundamentals',
      position: [-4, 1, -6],
      type: 'mission',
      difficulty: 'bronze',
      status: completedCourses.includes('solana-module-1') ? 'completed' : 'available',
      connections: ['solana-mastery', 'solana-wallet'],
      xpReward: 150,
    },
    
    // LEVEL & MASTERY ACHIEVEMENTS
    {
      id: 'level-master',
      name: 'Reach Level 5',
      position: [-10, 0, -2],
      type: 'mission',
      difficulty: 'gold',
      status: userLevel >= 5 ? 'completed' : getNodeStatus({ minXp: 1000 }),
      connections: ['xp-milestone-1000', 'elite-founder'],
      xpReward: 500,
    },
    
    {
      id: 'elite-founder',
      name: 'Elite Founder Status',
      position: [-12, -1, -3],
      type: 'boss',
      difficulty: 'boss',
      status: getNodeStatus({ requiresLevel: 10, requiresGitHub: true }),
      connections: ['level-master', 'founder-legend'],
      xpReward: 1000,
    },
    
    // KINGDOM SPECIALIZATION
    {
      id: 'kingdom-specialization',
      name: 'Master Your Kingdom',
      position: [4, 2, 0],
      type: 'hub',
      difficulty: 'gold',
      status: getNodeStatus({ minXp: 500 }),
      connections: ['choose-kingdom', 'territory-control'],
      xpReward: 300,
    },
    
    // FIRST TERRITORY
    {
      id: 'first-territory',
      name: 'Claim Your First Territory',
      position: [0, -1, 0],
      type: 'territory',
      difficulty: 'boss',
      status: getNodeStatus({ requiresLevel: 5, requiresGitHub: true }),
      connections: ['crown-citadel', 'territory-master'],
      requiredLevel: 5,
      territory: {
        contestable: true,
      },
      xpReward: 750,
    },
    
    // ULTIMATE ACHIEVEMENTS
    {
      id: 'founder-legend',
      name: 'Legendary Founder',
      position: [-14, -2, -4],
      type: 'boss',
      difficulty: 'boss',
      status: getNodeStatus({ requiresLevel: 15, requiresGitHub: true, minXp: 5000 }),
      connections: ['elite-founder'],
      requiredLevel: 15,
      xpReward: 2000,
    },
    
    // TERRITORY CONTROL
    {
      id: 'territory-master',
      name: 'Territory Master',
      position: [0, -2, -2],
      type: 'territory',
      difficulty: 'boss',
      status: getNodeStatus({ requiresLevel: 8, requiresGitHub: true }),
      connections: ['first-territory'],
      requiredLevel: 8,
      territory: {
        contestable: true,
      },
      xpReward: 1200,
    },
  ];
};

// Node colors based on status and difficulty
const getNodeColor = (node: MapNodeData): string => {
  if (node.status === 'locked') return '#666666';
  if (node.status === 'completed') return '#10B981';
  if (node.status === 'in_progress') return '#F59E0B';
  
  // Available nodes colored by difficulty
  switch (node.difficulty) {
    case 'bronze': return '#CD7F32';
    case 'silver': return '#C0C0C0';
    case 'gold': return '#FFD700';
    case 'boss': return '#DC2626';
    default: return '#3B82F6';
  }
};

// Individual map node component
interface MapNodeProps {
  node: MapNodeData;
  onNodeClick: (node: MapNodeData) => void;
  isSelected?: boolean;
}

const MapNode: React.FC<MapNodeProps> = ({ node, onNodeClick, isSelected }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  
  useFrame((state) => {
    if (meshRef.current) {
      // Gentle bobbing animation
      meshRef.current.position.y = node.position[1] + Math.sin(state.clock.elapsedTime + node.position[0]) * 0.1;
      
      // Pulse effect for available missions
      if (node.status === 'available') {
        const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
        meshRef.current.scale.setScalar(scale);
      }
    }
  });

  const handleClick = useCallback(() => {
    if (node.status !== 'locked') {
      onNodeClick(node);
    }
  }, [node, onNodeClick]);

  const getGeometry = () => {
    switch (node.type) {
      case 'hub':
        return <sphereGeometry args={[0.8, 16, 16]} />;
      case 'mission':
        return <boxGeometry args={[1, 1, 1]} />;
      case 'territory':
        return <octahedronGeometry args={[1.2]} />;
      case 'boss':
        return <dodecahedronGeometry args={[1.5]} />;
      default:
        return <sphereGeometry args={[0.6, 12, 12]} />;
    }
  };

  return (
    <group position={node.position}>
      <mesh
        ref={meshRef}
        onClick={handleClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        castShadow
        receiveShadow
      >
        {getGeometry()}
        <meshStandardMaterial
          color={getNodeColor(node)}
          emissive={hovered ? '#444444' : '#000000'}
          emissiveIntensity={hovered ? 0.2 : 0}
          metalness={0.3}
          roughness={0.4}
        />
      </mesh>
      
      {/* Node label */}
      <Text
        position={[0, -1.5, 0]}
        fontSize={0.3}
        color={node.status === 'locked' ? '#666666' : '#ffffff'}
        anchorX="center"
        anchorY="middle"
        font="/fonts/inter-bold.woff"
      >
        {node.name}
      </Text>
      
      {/* Hover info */}
      {hovered && (
        <Html position={[0, 2, 0]} center>
          <div className="bg-black/80 text-white px-3 py-2 rounded-lg text-sm max-w-xs">
            <div className="font-semibold">{node.name}</div>
            <div className="text-gray-300 capitalize">{node.difficulty} {node.type}</div>
            {node.xpReward && (
              <div className="text-yellow-400">{node.xpReward} XP</div>
            )}
            {node.status === 'locked' && node.requiredLevel && (
              <div className="text-red-400">Requires Level {node.requiredLevel}</div>
            )}
          </div>
        </Html>
      )}
      
      {/* Selection indicator */}
      {isSelected && (
        <mesh position={[0, 0, 0]} scale={2}>
          <ringGeometry args={[1.2, 1.4, 16]} />
          <meshBasicMaterial color="#00FFFF" transparent opacity={0.6} />
        </mesh>
      )}
    </group>
  );
};

// Connection lines between nodes
const ConnectionLines: React.FC<{ nodes: MapNodeData[] }> = ({ nodes }) => {
  const nodeMap = new Map(nodes.map(node => [node.id, node]));
  
  const connections = nodes.flatMap(node =>
    node.connections
      .map(connectionId => {
        const connectedNode = nodeMap.get(connectionId);
        if (!connectedNode) return null;
        
        // Only draw line if both nodes are unlocked
        const shouldShow = node.status !== 'locked' || connectedNode.status !== 'locked';
        
        return shouldShow ? {
          from: new Vector3(...node.position),
          to: new Vector3(...connectedNode.position),
          completed: node.status === 'completed' && connectedNode.status === 'completed'
        } : null;
      })
      .filter(Boolean)
  );

  return (
    <>
      {connections.map((connection, index) => {
        if (!connection) return null;
        
        const points = [connection.from, connection.to];
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        
        return (
          <line key={index} geometry={geometry}>
            <lineBasicMaterial
              color={connection.completed ? '#10B981' : '#666666'}
              linewidth={2}
            />
          </line>
        );
      })}
    </>
  );
};

// Main game map component
interface GameMapProps {
  onNodeSelect?: (node: MapNodeData) => void;
  selectedNodeId?: string;
}

export const GameMap: React.FC<GameMapProps> = ({ onNodeSelect, selectedNodeId }) => {
  const { user } = useAuth();
  const [selectedNode, setSelectedNode] = useState<MapNodeData | null>(null);
  
  // Generate personal achievement map based on current user
  const personalMap = getPersonalAchievementMap(user);
  
  const handleNodeClick = useCallback((node: MapNodeData) => {
    setSelectedNode(node);
    onNodeSelect?.(node);
  }, [onNodeSelect]);

  return (
    <div className="w-full h-full min-h-[600px] relative">
      <Canvas
        camera={{ position: [15, 10, 15], fov: 60 }}
        shadows
        gl={{ antialias: true }}
      >
        <Suspense fallback={null}>
          <Environment preset="night" />
          
          {/* Lighting */}
          <ambientLight intensity={0.3} />
          <directionalLight
            position={[10, 10, 5]}
            intensity={1}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />
          <pointLight position={[0, 10, 0]} intensity={0.5} color="#4F46E5" />
          
          {/* Map nodes */}
          {personalMap.map(node => (
            <MapNode
              key={node.id}
              node={node}
              onNodeClick={handleNodeClick}
              isSelected={selectedNodeId === node.id || selectedNode?.id === node.id}
            />
          ))}
          
          {/* Connection lines */}
          <ConnectionLines nodes={personalMap} />
          
          {/* Ground plane */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
            <planeGeometry args={[50, 50]} />
            <meshStandardMaterial color="#1a1a2e" transparent opacity={0.3} />
          </mesh>
          
          {/* Controls */}
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            maxDistance={30}
            minDistance={5}
            maxPolarAngle={Math.PI / 2.2}
          />
        </Suspense>
      </Canvas>
      
      {/* Personal Progress Display */}
      <div className="absolute top-4 left-4 bg-black/80 text-white p-4 rounded-lg max-w-sm">
        <h3 className="font-bold text-lg mb-2">Your Progress</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>XP:</span>
            <span className="text-yellow-400">{user?.xpTotal || 0}</span>
          </div>
          <div className="flex justify-between">
            <span>Level:</span>
            <span className="text-green-400">{Math.floor((user?.xpTotal || 0) / 1000) + 1}</span>
          </div>
          <div className="flex justify-between">
            <span>Kingdom:</span>
            <span className="text-purple-400">{user?.selectedKingdom || 'None'}</span>
          </div>
          <div className="flex justify-between">
            <span>GitHub:</span>
            <span className={user?.githubUsername ? 'text-green-400' : 'text-red-400'}>
              {user?.githubUsername ? '✓ Connected' : '✗ Not Connected'}
            </span>
          </div>
        </div>
      </div>

      {/* Selected Node Info */}
      {selectedNode && (
        <div className="absolute top-4 right-4 bg-black/80 text-white p-4 rounded-lg max-w-sm">
          <h3 className="font-bold text-lg mb-2">{selectedNode.name}</h3>
          <div className="space-y-1 text-sm">
            <p className="capitalize">{selectedNode.difficulty} {selectedNode.type}</p>
            {selectedNode.xpReward && (
              <p className="text-yellow-400">{selectedNode.xpReward} XP Reward</p>
            )}
            <p className="capitalize text-gray-300">Status: {selectedNode.status.replace('_', ' ')}</p>
            {selectedNode.territory?.contestable && (
              <p className="text-purple-400">⚔️ PvP Territory</p>
            )}
          </div>
          
          {selectedNode.status === 'available' && (
            <button className="mt-3 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm font-medium transition-colors">
              Start Mission
            </button>
          )}
          
          {selectedNode.status === 'locked' && selectedNode.requiredLevel && (
            <p className="mt-2 text-red-400 text-sm">
              Requires Level {selectedNode.requiredLevel}
            </p>
          )}
        </div>
      )}
      
      {/* Achievement Summary */}
      <div className="absolute bottom-4 left-4 bg-black/80 text-white p-3 rounded-lg text-xs max-w-sm">
        <div className="font-semibold mb-2">Quick Goals</div>
        <div className="space-y-1">
          {user?.xpTotal < 100 && (
            <div className="text-yellow-400">🎯 Earn your first 100 XP</div>
          )}
          {!user?.selectedKingdom && (
            <div className="text-purple-400">👑 Choose your kingdom</div>
          )}
          {!user?.githubUsername && (
            <div className="text-blue-400">🔗 Connect your GitHub</div>
          )}
          {user?.xpTotal >= 100 && user?.xpTotal < 500 && (
            <div className="text-orange-400">🚀 Reach 500 XP milestone</div>
          )}
          {user?.xpTotal >= 500 && user?.xpTotal < 1000 && (
            <div className="text-gold-400">🏆 Reach Level 2 (1000 XP)</div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-black/80 text-white p-3 rounded-lg text-xs">
        <div className="font-semibold mb-2">Legend</div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-500 rounded"></div>
            <span>Locked</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-600 rounded"></div>
            <span>In Progress</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-600 rounded"></div>
            <span>Boss</span>
          </div>
        </div>
      </div>
    </div>
  );
};