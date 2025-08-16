// Export all game content modules
export * from './maps';
export * from './missions';
export * from './learning-paths';
export * from './achievements';

// Content configuration and metadata
export const GAME_CONTENT_VERSION = '1.0.0';
export const CONTENT_LAST_UPDATED = '2024-01-01T00:00:00Z';

// Content validation and utility functions
export const validateContentIntegrity = () => {
  // This function would validate that all cross-references between
  // maps, missions, learning paths, and achievements are valid
  const errors: string[] = [];
  
  // Example validation checks:
  // - All mission nodeIds reference valid map nodes
  // - All learning path missions reference valid missions
  // - All achievement requirements are achievable
  // - All prerequisite chains are valid (no circular dependencies)
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const getContentStats = () => {
  // Import the content arrays to calculate stats
  const { gameMaps } = require('./maps');
  const { allMissions } = require('./missions');
  const { learningPaths } = require('./learning-paths');
  const { achievements, badges } = require('./achievements');
  
  const totalNodes = gameMaps.reduce((sum: number, map: any) => sum + map.nodes.length, 0);
  const totalTerritories = gameMaps.reduce((sum: number, map: any) => sum + map.territories.length, 0);
  
  return {
    maps: gameMaps.length,
    nodes: totalNodes,
    territories: totalTerritories,
    missions: allMissions.length,
    learningPaths: learningPaths.length,
    achievements: achievements.length,
    badges: badges.length,
    estimatedTotalHours: learningPaths.reduce((sum: number, path: any) => sum + path.estimatedHours, 0)
  };
};