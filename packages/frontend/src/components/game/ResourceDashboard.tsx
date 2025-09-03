'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { 
  Package,
  Hammer,
  Clock,
  ArrowRight,
  Zap,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Sparkles,
  TrendingUp,
  RefreshCw,
  Plus,
  Minus,
  Timer,
  Target,
  Coins,
  BookOpen,
  Settings
} from 'lucide-react';

interface ResourceInventory {
  resourceType: string;
  amount: number;
  totalEarned: number;
  totalSpent: number;
  lastEarned?: string;
  recentTransactions: any[];
}

interface CraftingRecipe {
  id: string;
  name: string;
  description: string;
  category: string;
  requiredResources: Record<string, number>;
  requiredLevel: number;
  requiredKingdom?: string;
  craftingTime: number;
  successRate: number;
  resultType: string;
  resultMetadata: any;
  canCraft: boolean;
  missingResources?: string[];
  isActive: boolean;
}

interface CraftingJob {
  id: string;
  recipeId: string;
  status: string;
  startedAt: string;
  completedAt?: string;
  progressPercent: number;
  timeRemaining: number;
  resourcesSpent: Record<string, number>;
  recipe: {
    name: string;
    description: string;
    craftingTime: number;
    resultType: string;
    resultMetadata: any;
  };
}

const resourceTypes = {
  'CODE_POINTS': { name: 'Code Points', icon: '💻', color: 'text-blue-400', bgColor: 'bg-blue-500/20' },
  'BUSINESS_ACUMEN': { name: 'Business Acumen', icon: '📊', color: 'text-green-400', bgColor: 'bg-green-500/20' },
  'MARKETING_INFLUENCE': { name: 'Marketing Influence', icon: '📢', color: 'text-yellow-400', bgColor: 'bg-yellow-500/20' },
  'NETWORK_CONNECTIONS': { name: 'Network Connections', icon: '👥', color: 'text-purple-400', bgColor: 'bg-purple-500/20' },
  'FUNDING_TOKENS': { name: 'Funding Tokens', icon: '💰', color: 'text-orange-400', bgColor: 'bg-orange-500/20' },
  'DESIGN_CREATIVITY': { name: 'Design Creativity', icon: '🎨', color: 'text-pink-400', bgColor: 'bg-pink-500/20' },
  'PRODUCT_VISION': { name: 'Product Vision', icon: '🚀', color: 'text-indigo-400', bgColor: 'bg-indigo-500/20' }
};

const rarityColors = {
  COMMON: 'border-gray-400 bg-gray-500/10',
  UNCOMMON: 'border-green-400 bg-green-500/10',
  RARE: 'border-blue-400 bg-blue-500/10',
  EPIC: 'border-purple-400 bg-purple-500/10',
  LEGENDARY: 'border-yellow-400 bg-yellow-500/10'
};

export const ResourceDashboard: React.FC = () => {
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState<'inventory' | 'crafting' | 'jobs'>('inventory');
  const [inventory, setInventory] = useState<ResourceInventory[]>([]);
  const [recipes, setRecipes] = useState<CraftingRecipe[]>([]);
  const [craftingJobs, setCraftingJobs] = useState<CraftingJob[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<CraftingRecipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user && token) {
      fetchResourceData();
      // Refresh every 30 seconds for real-time updates
      const interval = setInterval(fetchResourceData, 30000);
      return () => clearInterval(interval);
    }
  }, [user, token]);

  const fetchResourceData = async () => {
    try {
      setError(null);
      const [inventoryRes, recipesRes, jobsRes] = await Promise.all([
        fetch('/api/resources/inventory', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/resources/crafting/recipes', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/resources/crafting/jobs', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (inventoryRes.ok) {
        const inventoryData = await inventoryRes.json();
        setInventory(inventoryData.data.inventory);
      }

      if (recipesRes.ok) {
        const recipesData = await recipesRes.json();
        setRecipes(recipesData.data.recipes);
      }

      if (jobsRes.ok) {
        const jobsData = await jobsRes.json();
        setCraftingJobs(jobsData.data.jobs);
      }

    } catch (err: any) {
      setError('Failed to load resource data');
    } finally {
      setLoading(false);
    }
  };

  const startCrafting = async (recipeId: string) => {
    try {
      const response = await fetch('/api/resources/crafting/start', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ recipeId })
      });

      if (response.ok) {
        await fetchResourceData();
        setSelectedRecipe(null);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to start crafting');
      }
    } catch (err) {
      setError('Failed to start crafting');
    }
  };

  const completeCrafting = async (jobId: string) => {
    try {
      const response = await fetch(`/api/resources/crafting/${jobId}/complete`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        await fetchResourceData();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to complete crafting');
      }
    } catch (err) {
      setError('Failed to complete crafting');
    }
  };

  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const getResourceInfo = (resourceType: string) => {
    return resourceTypes[resourceType as keyof typeof resourceTypes] || 
           { name: resourceType, icon: '📦', color: 'text-gray-400', bgColor: 'bg-gray-500/20' };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  const totalWealth = inventory.reduce((sum, inv) => sum + inv.amount, 0);
  const activeJobs = craftingJobs.filter(job => job.status === 'IN_PROGRESS');
  const availableRecipes = recipes.filter(recipe => recipe.canCraft);

  return (
    <div className="space-y-6 text-white max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 border border-white/10 rounded-lg p-6 backdrop-blur-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Package className="w-8 h-8 text-purple-400" />
              Resource Center
            </h1>
            <p className="text-gray-400 mt-2">Manage your startup resources and craft powerful artifacts</p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 mb-2">
              <Coins className="w-5 h-5 text-yellow-400" />
              <span className="text-2xl font-bold text-yellow-400">{totalWealth.toLocaleString()}</span>
            </div>
            <p className="text-gray-400 text-sm">Total Wealth</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 bg-gray-800/50 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'inventory' 
                ? 'bg-purple-600 text-white' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Package className="w-4 h-4" />
            Inventory
          </button>
          <button
            onClick={() => setActiveTab('crafting')}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'crafting' 
                ? 'bg-purple-600 text-white' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Hammer className="w-4 h-4" />
            Crafting ({availableRecipes.length})
          </button>
          <button
            onClick={() => setActiveTab('jobs')}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'jobs' 
                ? 'bg-purple-600 text-white' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Clock className="w-4 h-4" />
            Jobs ({activeJobs.length})
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400" />
          <span className="text-red-200">{error}</span>
          <button 
            onClick={() => setError(null)}
            className="ml-auto text-red-400 hover:text-red-300"
          >
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Tab Content */}
      {activeTab === 'inventory' && (
        <div className="space-y-6">
          {/* Resource Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {inventory.map((resource) => {
              const resourceInfo = getResourceInfo(resource.resourceType);
              return (
                <div key={resource.resourceType} className={`${resourceInfo.bgColor} border border-white/10 rounded-lg p-4`}>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">{resourceInfo.icon}</span>
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm">{resourceInfo.name}</h3>
                      <p className={`text-2xl font-bold ${resourceInfo.color}`}>
                        {resource.amount.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-1 text-xs text-gray-400">
                    <div className="flex justify-between">
                      <span>Earned:</span>
                      <span className="text-green-400">{resource.totalEarned.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Spent:</span>
                      <span className="text-red-400">{resource.totalSpent.toLocaleString()}</span>
                    </div>
                    {resource.lastEarned && (
                      <div className="text-xs text-gray-500 mt-2">
                        Last earned: {new Date(resource.lastEarned).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Actions */}
          <div className="bg-gray-800/50 border border-white/10 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <button 
                onClick={fetchResourceData}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
              <button className="bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center gap-2">
                <Target className="w-4 h-4" />
                Missions
              </button>
              <button className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Trade
              </button>
              <button className="bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Upgrade
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'crafting' && (
        <div className="space-y-6">
          {/* Recipe Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recipes.map((recipe) => {
              const rarity = recipe.resultMetadata?.rarity || 'COMMON';
              return (
                <div key={recipe.id} className={`border-2 rounded-lg p-6 ${rarityColors[rarity as keyof typeof rarityColors]} ${recipe.canCraft ? 'hover:border-opacity-50 cursor-pointer' : 'opacity-60'}`}
                     onClick={() => recipe.canCraft && setSelectedRecipe(recipe)}>
                  
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold">{recipe.name}</h3>
                      <p className="text-gray-400 text-sm">{recipe.category.replace('_', ' ')}</p>
                    </div>
                    <div className="text-right">
                      <div className={`text-xs font-bold px-2 py-1 rounded ${rarityColors[rarity as keyof typeof rarityColors]}`}>
                        {rarity}
                      </div>
                      {recipe.craftingTime > 0 && (
                        <div className="flex items-center gap-1 mt-2 text-gray-400 text-xs">
                          <Timer className="w-3 h-3" />
                          {formatTime(recipe.craftingTime)}
                        </div>
                      )}
                    </div>
                  </div>

                  <p className="text-gray-300 text-sm mb-4">{recipe.description}</p>

                  {/* Required Resources */}
                  <div className="space-y-2 mb-4">
                    <h4 className="text-sm font-semibold text-gray-300">Required Resources:</h4>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(recipe.requiredResources).map(([resourceType, amount]) => {
                        const resourceInfo = getResourceInfo(resourceType);
                        const userAmount = inventory.find(inv => inv.resourceType === resourceType)?.amount || 0;
                        const hasEnough = userAmount >= amount;
                        
                        return (
                          <div key={resourceType} className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${hasEnough ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                            <span>{resourceInfo.icon}</span>
                            <span>{amount}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Requirements & Status */}
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-400">
                      Level {recipe.requiredLevel}+ {recipe.requiredKingdom && `• ${recipe.requiredKingdom}`}
                    </div>
                    <div className="flex items-center gap-2">
                      {recipe.canCraft ? (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-400" />
                      )}
                      <span className={`text-xs ${recipe.canCraft ? 'text-green-400' : 'text-red-400'}`}>
                        {recipe.canCraft ? 'Can Craft' : 'Missing Requirements'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'jobs' && (
        <div className="space-y-6">
          {/* Active Jobs */}
          {activeJobs.length > 0 && (
            <div className="bg-gray-800/50 border border-white/10 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-yellow-400" />
                Active Crafting Jobs
              </h2>
              
              <div className="space-y-4">
                {activeJobs.map((job) => {
                  const canComplete = job.timeRemaining <= 0;
                  return (
                    <div key={job.id} className="bg-gray-700/30 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold">{job.recipe.name}</h3>
                        {canComplete ? (
                          <button
                            onClick={() => completeCrafting(job.id)}
                            className="bg-green-600 hover:bg-green-700 text-white font-medium py-1 px-3 rounded text-sm flex items-center gap-1"
                          >
                            <CheckCircle className="w-3 h-3" />
                            Complete
                          </button>
                        ) : (
                          <span className="text-yellow-400 text-sm">
                            {formatTime(Math.floor(job.timeRemaining / 1000))} remaining
                          </span>
                        )}
                      </div>
                      
                      <div className="w-full bg-gray-600 rounded-full h-2 mb-2">
                        <div 
                          className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${job.progressPercent}%` }}
                        />
                      </div>
                      
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>Started: {new Date(job.startedAt).toLocaleString()}</span>
                        <span>{job.progressPercent}% Complete</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Recent Completed Jobs */}
          <div className="bg-gray-800/50 border border-white/10 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Crafting History</h2>
            
            <div className="space-y-3">
              {craftingJobs.filter(job => job.status === 'COMPLETED').slice(0, 10).map((job) => (
                <div key={job.id} className="flex items-center gap-4 p-3 bg-gray-700/20 rounded-lg">
                  <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-semibold">{job.recipe.name}</h3>
                    <p className="text-gray-400 text-sm">
                      Completed {new Date(job.completedAt!).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div className="text-right text-xs text-green-400">
                    Success
                  </div>
                </div>
              ))}
              
              {craftingJobs.filter(job => job.status === 'COMPLETED').length === 0 && (
                <div className="text-center text-gray-400 py-8">
                  <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No completed crafting jobs yet</p>
                  <p className="text-sm">Start crafting to see your history here!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Recipe Detail Modal */}
      {selectedRecipe && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 border border-white/20 rounded-lg p-6 max-w-md w-full">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-xl font-bold">{selectedRecipe.name}</h3>
              <button 
                onClick={() => setSelectedRecipe(null)}
                className="text-gray-400 hover:text-white"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <p className="text-gray-300 mb-4">{selectedRecipe.description}</p>

            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Required Resources:</h4>
                <div className="space-y-2">
                  {Object.entries(selectedRecipe.requiredResources).map(([resourceType, amount]) => {
                    const resourceInfo = getResourceInfo(resourceType);
                    const userAmount = inventory.find(inv => inv.resourceType === resourceType)?.amount || 0;
                    const hasEnough = userAmount >= amount;
                    
                    return (
                      <div key={resourceType} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span>{resourceInfo.icon}</span>
                          <span className="text-sm">{resourceInfo.name}</span>
                        </div>
                        <div className={`text-sm ${hasEnough ? 'text-green-400' : 'text-red-400'}`}>
                          {userAmount} / {amount}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <div className="text-sm text-gray-400">
                  {selectedRecipe.craftingTime > 0 ? `${formatTime(selectedRecipe.craftingTime)} to craft` : 'Instant craft'}
                </div>
                <button
                  onClick={() => startCrafting(selectedRecipe.id)}
                  disabled={!selectedRecipe.canCraft}
                  className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
                >
                  <Hammer className="w-4 h-4" />
                  {selectedRecipe.canCraft ? 'Start Crafting' : 'Cannot Craft'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourceDashboard;