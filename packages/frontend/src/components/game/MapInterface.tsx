'use client';

import { useState, useCallback } from 'react';
import { GameMap, MapNodeData } from './GameMap';
import { MissionPanel } from './MissionPanel';
import { PlayerStats } from './PlayerStats';
import { GlobalLeaderboard } from './GlobalLeaderboard';
import { SolanaCourse } from '../education/SolanaCourse';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/button';
import { 
  Map, 
  User, 
  Trophy, 
  Target, 
  Users, 
  Settings,
  Minimize2,
  Maximize2,
  RotateCcw,
  BookOpen
} from 'lucide-react';

export const MapInterface: React.FC = () => {
  const [selectedNode, setSelectedNode] = useState<MapNodeData | null>(null);
  const [showMissionPanel, setShowMissionPanel] = useState(false);
  const [activeTab, setActiveTab] = useState<'map' | 'profile' | 'leaderboard' | 'course'>('map');
  const [isMinimized, setIsMinimized] = useState(false);
  
  const { user } = useAuth();

  const handleNodeSelect = useCallback((node: MapNodeData) => {
    setSelectedNode(node);
    
    // Show mission panel for missions and territories
    if (['mission', 'territory', 'boss'].includes(node.type)) {
      setShowMissionPanel(true);
    }
  }, []);

  const handleStartMission = useCallback((node: MapNodeData) => {
    console.log('Starting mission:', node.name);
    // TODO: Integrate with mission service
  }, []);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'map':
        return (
          <div className="h-full">
            <GameMap 
              onNodeSelect={handleNodeSelect}
              selectedNodeId={selectedNode?.id}
            />
          </div>
        );
      
      case 'profile':
        return (
          <div className="p-6">
            <PlayerStats />
          </div>
        );
      
      case 'leaderboard':
        return (
          <div className="p-6 h-full overflow-y-auto">
            <GlobalLeaderboard />
          </div>
        );
      
      case 'course':
        return (
          <div className="h-full overflow-y-auto bg-gradient-to-br from-purple-900 via-slate-900 to-blue-900">
            <SolanaCourse />
          </div>
        );
      
      default:
        return null;
    }
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsMinimized(false)}
          className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg"
        >
          <Maximize2 className="w-5 h-5" />
        </Button>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 relative overflow-hidden">
      {/* Main interface */}
      <div className="flex h-full">
        {/* Sidebar */}
        <div className="w-16 bg-black/50 backdrop-blur-sm border-r border-white/10 flex flex-col items-center py-4 space-y-4">
          <Button
            variant={activeTab === 'map' ? 'default' : 'ghost'}
            size="icon"
            onClick={() => setActiveTab('map')}
            className="text-white hover:text-blue-400"
          >
            <Map className="w-5 h-5" />
          </Button>
          
          <Button
            variant={activeTab === 'profile' ? 'default' : 'ghost'}
            size="icon"
            onClick={() => setActiveTab('profile')}
            className="text-white hover:text-blue-400"
          >
            <User className="w-5 h-5" />
          </Button>
          
          <Button
            variant={activeTab === 'leaderboard' ? 'default' : 'ghost'}
            size="icon"
            onClick={() => setActiveTab('leaderboard')}
            className="text-white hover:text-blue-400"
          >
            <Trophy className="w-5 h-5" />
          </Button>
          
          <Button
            variant={activeTab === 'course' ? 'default' : 'ghost'}
            size="icon"
            onClick={() => setActiveTab('course')}
            className="text-white hover:text-blue-400"
          >
            <BookOpen className="w-5 h-5" />
          </Button>
          
          <div className="flex-1" />
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMinimized(true)}
            className="text-white hover:text-red-400"
          >
            <Minimize2 className="w-5 h-5" />
          </Button>
        </div>

        {/* Main content area */}
        <div className="flex-1 relative">
          {renderTabContent()}
        </div>
      </div>

      {/* Top bar with user info */}
      <div className="absolute top-0 left-16 right-0 bg-black/30 backdrop-blur-sm border-b border-white/10 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-white">
            {activeTab === 'map' && '🗺️ Kingdom Map'}
            {activeTab === 'profile' && '👤 Profile'}
            {activeTab === 'leaderboard' && '🏆 Leaderboard'}
            {activeTab === 'course' && '📚 Solana Course'}
          </h1>
          {selectedNode && (
            <div className="flex items-center gap-2 text-gray-300">
              <Target className="w-4 h-4" />
              <span>{selectedNode.name}</span>
              {selectedNode.type === 'boss' && <span className="text-red-400">👹</span>}
              {selectedNode.type === 'territory' && <span className="text-yellow-400">🏰</span>}
            </div>
          )}
        </div>
        
        {user && (
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-white font-medium">{user.name}</div>
              <div className="text-gray-400 text-sm">Level {user.level} • {user.xpTotal} XP</div>
            </div>
            
            {user.profilePicture ? (
              <img
                src={user.profilePicture}
                alt={user.name}
                className="w-8 h-8 rounded-full border border-white/20"
              />
            ) : (
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Mission panel */}
      {showMissionPanel && selectedNode && (
        <MissionPanel
          node={selectedNode}
          onClose={() => setShowMissionPanel(false)}
          onStartMission={handleStartMission}
        />
      )}

      {/* Quick actions */}
      {activeTab === 'map' && (
        <div className="absolute bottom-6 left-20 flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            className="bg-black/50 backdrop-blur-sm text-white border border-white/20 hover:bg-black/70"
          >
            <Users className="w-4 h-4 mr-2" />
            🏛️ Assemble Legion
          </Button>
          
          <Button
            variant="secondary"
            size="sm"
            className="bg-black/50 backdrop-blur-sm text-white border border-white/20 hover:bg-black/70"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            🔄 Reset View
          </Button>
          
          <Button
            variant="secondary"
            size="sm"
            className="bg-black/50 backdrop-blur-sm text-white border border-white/20 hover:bg-black/70"
          >
            <Settings className="w-4 h-4 mr-2" />
            ⚙️ Royal Settings
          </Button>
        </div>
      )}
    </div>
  );
};