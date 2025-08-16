'use client';

import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { 
  Settings,
  Save,
  RefreshCw,
  Upload,
  Download,
  Shield,
  Bell,
  Mail,
  Globe,
  DollarSign,
  Users,
  Zap,
  Database,
  Key,
  AlertTriangle,
  CheckCircle,
  Copy,
  Eye,
  EyeOff
} from 'lucide-react';
import toast from 'react-hot-toast';

interface SystemConfig {
  platform: {
    name: string;
    description: string;
    version: string;
    environment: 'development' | 'staging' | 'production';
    maintenanceMode: boolean;
  };
  authentication: {
    requireEmailVerification: boolean;
    requireWalletConnection: boolean;
    sessionTimeout: number; // minutes
    maxLoginAttempts: number;
    passwordMinLength: number;
  };
  features: {
    enableMentorBooking: boolean;
    enableTeamCreation: boolean;
    enablePvPSystem: boolean;
    enableSponsorQuests: boolean;
    enableContentModeration: boolean;
    enableAnalytics: boolean;
  };
  payments: {
    stripeEnabled: boolean;
    cryptoEnabled: boolean;
    platformFeePercentage: number;
    minimumWithdrawal: number;
    escrowDuration: number; // hours
  };
  notifications: {
    emailEnabled: boolean;
    pushEnabled: boolean;
    smsEnabled: boolean;
    webhookUrl: string;
  };
  blockchain: {
    network: 'mainnet' | 'devnet' | 'testnet';
    rpcEndpoint: string;
    programId: string;
    treasuryWallet: string;
  };
  content: {
    maxUploadSize: number; // MB
    allowedFileTypes: string[];
    enableUserGeneratedContent: boolean;
    autoModeration: boolean;
  };
  rate_limiting: {
    api_calls_per_minute: number;
    file_uploads_per_hour: number;
    messages_per_minute: number;
  };
}

export const SystemSettings: React.FC = () => {
  const [config, setConfig] = useState<SystemConfig>({
    platform: {
      name: 'Rise of Founders',
      description: 'Gamified founder education platform powered by Honeycomb Protocol',
      version: '1.0.0',
      environment: 'development',
      maintenanceMode: false
    },
    authentication: {
      requireEmailVerification: true,
      requireWalletConnection: true,
      sessionTimeout: 1440, // 24 hours
      maxLoginAttempts: 5,
      passwordMinLength: 8
    },
    features: {
      enableMentorBooking: true,
      enableTeamCreation: true,
      enablePvPSystem: true,
      enableSponsorQuests: true,
      enableContentModeration: true,
      enableAnalytics: true
    },
    payments: {
      stripeEnabled: true,
      cryptoEnabled: true,
      platformFeePercentage: 2.5,
      minimumWithdrawal: 50,
      escrowDuration: 24
    },
    notifications: {
      emailEnabled: true,
      pushEnabled: true,
      smsEnabled: false,
      webhookUrl: 'https://api.riseoffounders.com/webhooks'
    },
    blockchain: {
      network: 'devnet',
      rpcEndpoint: 'https://api.devnet.solana.com',
      programId: 'ABC123...XYZ789',
      treasuryWallet: 'DEF456...ABC123'
    },
    content: {
      maxUploadSize: 10,
      allowedFileTypes: ['jpg', 'png', 'pdf', 'doc', 'docx', 'txt'],
      enableUserGeneratedContent: true,
      autoModeration: true
    },
    rate_limiting: {
      api_calls_per_minute: 100,
      file_uploads_per_hour: 20,
      messages_per_minute: 10
    }
  });

  const [activeSection, setActiveSection] = useState<'platform' | 'auth' | 'features' | 'payments' | 'notifications' | 'blockchain' | 'content' | 'rate_limiting'>('platform');
  const [showSecrets, setShowSecrets] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const handleConfigChange = (section: keyof SystemConfig, key: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
    setHasUnsavedChanges(true);
  };

  const handleSave = async () => {
    try {
      // Mock API call to save configuration
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Configuration saved successfully!');
      setHasUnsavedChanges(false);
    } catch (error) {
      toast.error('Failed to save configuration');
    }
  };

  const handleExportConfig = () => {
    const configJson = JSON.stringify(config, null, 2);
    const blob = new Blob([configJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'system-config.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const navigationItems = [
    { id: 'platform', label: 'Platform', icon: Settings },
    { id: 'auth', label: 'Authentication', icon: Shield },
    { id: 'features', label: 'Features', icon: Zap },
    { id: 'payments', label: 'Payments', icon: DollarSign },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'blockchain', label: 'Blockchain', icon: Key },
    { id: 'content', label: 'Content', icon: Database },
    { id: 'rate_limiting', label: 'Rate Limiting', icon: AlertTriangle }
  ] as const;

  const renderPlatformSettings = () => (
    <div className="space-y-6">
      <div>
        <Label htmlFor="platformName">Platform Name</Label>
        <Input
          id="platformName"
          value={config.platform.name}
          onChange={(e) => handleConfigChange('platform', 'name', e.target.value)}
          className="mt-1"
        />
      </div>
      
      <div>
        <Label htmlFor="platformDescription">Description</Label>
        <Textarea
          id="platformDescription"
          value={config.platform.description}
          onChange={(e) => handleConfigChange('platform', 'description', e.target.value)}
          rows={3}
          className="mt-1"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="version">Version</Label>
          <Input
            id="version"
            value={config.platform.version}
            onChange={(e) => handleConfigChange('platform', 'version', e.target.value)}
            className="mt-1"
          />
        </div>
        
        <div>
          <Label htmlFor="environment">Environment</Label>
          <select
            id="environment"
            value={config.platform.environment}
            onChange={(e) => handleConfigChange('platform', 'environment', e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white mt-1"
          >
            <option value="development">Development</option>
            <option value="staging">Staging</option>
            <option value="production">Production</option>
          </select>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="maintenanceMode"
          checked={config.platform.maintenanceMode}
          onChange={(e) => handleConfigChange('platform', 'maintenanceMode', e.target.checked)}
          className="rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
        />
        <Label htmlFor="maintenanceMode" className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-yellow-400" />
          Maintenance Mode
        </Label>
      </div>
    </div>
  );

  const renderAuthSettings = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="requireEmailVerification"
            checked={config.authentication.requireEmailVerification}
            onChange={(e) => handleConfigChange('authentication', 'requireEmailVerification', e.target.checked)}
            className="rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
          />
          <Label htmlFor="requireEmailVerification">Require Email Verification</Label>
        </div>
        
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="requireWalletConnection"
            checked={config.authentication.requireWalletConnection}
            onChange={(e) => handleConfigChange('authentication', 'requireWalletConnection', e.target.checked)}
            className="rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
          />
          <Label htmlFor="requireWalletConnection">Require Wallet Connection</Label>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
          <Input
            id="sessionTimeout"
            type="number"
            value={config.authentication.sessionTimeout}
            onChange={(e) => handleConfigChange('authentication', 'sessionTimeout', parseInt(e.target.value))}
            className="mt-1"
          />
        </div>
        
        <div>
          <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
          <Input
            id="maxLoginAttempts"
            type="number"
            value={config.authentication.maxLoginAttempts}
            onChange={(e) => handleConfigChange('authentication', 'maxLoginAttempts', parseInt(e.target.value))}
            className="mt-1"
          />
        </div>
        
        <div>
          <Label htmlFor="passwordMinLength">Min Password Length</Label>
          <Input
            id="passwordMinLength"
            type="number"
            value={config.authentication.passwordMinLength}
            onChange={(e) => handleConfigChange('authentication', 'passwordMinLength', parseInt(e.target.value))}
            className="mt-1"
          />
        </div>
      </div>
    </div>
  );

  const renderFeatureSettings = () => (
    <div className="grid grid-cols-2 gap-4">
      {Object.entries(config.features).map(([key, value]) => (
        <div key={key} className="flex items-center gap-2">
          <input
            type="checkbox"
            id={key}
            checked={value}
            onChange={(e) => handleConfigChange('features', key, e.target.checked)}
            className="rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
          />
          <Label htmlFor={key} className="capitalize">
            {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
          </Label>
        </div>
      ))}
    </div>
  );

  const renderPaymentSettings = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="stripeEnabled"
            checked={config.payments.stripeEnabled}
            onChange={(e) => handleConfigChange('payments', 'stripeEnabled', e.target.checked)}
            className="rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
          />
          <Label htmlFor="stripeEnabled">Enable Stripe Payments</Label>
        </div>
        
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="cryptoEnabled"
            checked={config.payments.cryptoEnabled}
            onChange={(e) => handleConfigChange('payments', 'cryptoEnabled', e.target.checked)}
            className="rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
          />
          <Label htmlFor="cryptoEnabled">Enable Crypto Payments</Label>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="platformFeePercentage">Platform Fee (%)</Label>
          <Input
            id="platformFeePercentage"
            type="number"
            step="0.1"
            value={config.payments.platformFeePercentage}
            onChange={(e) => handleConfigChange('payments', 'platformFeePercentage', parseFloat(e.target.value))}
            className="mt-1"
          />
        </div>
        
        <div>
          <Label htmlFor="minimumWithdrawal">Min Withdrawal ($)</Label>
          <Input
            id="minimumWithdrawal"
            type="number"
            value={config.payments.minimumWithdrawal}
            onChange={(e) => handleConfigChange('payments', 'minimumWithdrawal', parseInt(e.target.value))}
            className="mt-1"
          />
        </div>
        
        <div>
          <Label htmlFor="escrowDuration">Escrow Duration (hours)</Label>
          <Input
            id="escrowDuration"
            type="number"
            value={config.payments.escrowDuration}
            onChange={(e) => handleConfigChange('payments', 'escrowDuration', parseInt(e.target.value))}
            className="mt-1"
          />
        </div>
      </div>
    </div>
  );

  const renderBlockchainSettings = () => (
    <div className="space-y-6">
      <div>
        <Label htmlFor="network">Network</Label>
        <select
          id="network"
          value={config.blockchain.network}
          onChange={(e) => handleConfigChange('blockchain', 'network', e.target.value)}
          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white mt-1"
        >
          <option value="devnet">Devnet</option>
          <option value="testnet">Testnet</option>
          <option value="mainnet">Mainnet</option>
        </select>
      </div>
      
      <div>
        <Label htmlFor="rpcEndpoint">RPC Endpoint</Label>
        <Input
          id="rpcEndpoint"
          value={config.blockchain.rpcEndpoint}
          onChange={(e) => handleConfigChange('blockchain', 'rpcEndpoint', e.target.value)}
          className="mt-1"
        />
      </div>
      
      <div>
        <Label htmlFor="programId">Program ID</Label>
        <div className="flex gap-2 mt-1">
          <Input
            id="programId"
            value={config.blockchain.programId}
            onChange={(e) => handleConfigChange('blockchain', 'programId', e.target.value)}
            type={showSecrets ? 'text' : 'password'}
            className="flex-1"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSecrets(!showSecrets)}
          >
            {showSecrets ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </Button>
        </div>
      </div>
      
      <div>
        <Label htmlFor="treasuryWallet">Treasury Wallet</Label>
        <div className="flex gap-2 mt-1">
          <Input
            id="treasuryWallet"
            value={config.blockchain.treasuryWallet}
            onChange={(e) => handleConfigChange('blockchain', 'treasuryWallet', e.target.value)}
            type={showSecrets ? 'text' : 'password'}
            className="flex-1"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigator.clipboard.writeText(config.blockchain.treasuryWallet)}
          >
            <Copy className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'platform':
        return renderPlatformSettings();
      case 'auth':
        return renderAuthSettings();
      case 'features':
        return renderFeatureSettings();
      case 'payments':
        return renderPaymentSettings();
      case 'blockchain':
        return renderBlockchainSettings();
      default:
        return (
          <div className="text-center py-8">
            <Settings className="w-16 h-16 mx-auto text-gray-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-400 mb-2">Settings Section</h3>
            <p className="text-sm text-gray-500">
              Configuration options for {activeSection.replace('_', ' ')} will be displayed here.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">System Settings</h1>
          <p className="text-gray-400 mt-1">
            Configure platform settings and system parameters
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          {hasUnsavedChanges && (
            <span className="text-yellow-400 text-sm">Unsaved changes</span>
          )}
          
          <Button variant="outline" size="sm" onClick={handleExportConfig}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          
          <Button onClick={handleSave} disabled={!hasUnsavedChanges}>
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Navigation */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-bold text-white mb-4">Settings</h3>
          
          <nav className="space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id as typeof activeSection)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>
          
          {/* System Status */}
          <div className="mt-6 pt-4 border-t border-gray-700">
            <h4 className="text-sm font-medium text-gray-300 mb-2">System Status</h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">API Status</span>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-green-400">Online</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Database</span>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-green-400">Connected</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Cache</span>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <span className="text-yellow-400">Warning</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Settings Content */}
        <div className="xl:col-span-3">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-600 rounded">
                {(() => {
                  const activeItem = navigationItems.find(item => item.id === activeSection);
                  const Icon = activeItem?.icon || Settings;
                  return <Icon className="w-5 h-5 text-white" />;
                })()}
              </div>
              <div>
                <h2 className="text-xl font-bold text-white capitalize">
                  {activeSection.replace('_', ' ')} Settings
                </h2>
                <p className="text-sm text-gray-400">
                  Configure {activeSection.replace('_', ' ').toLowerCase()} options and parameters
                </p>
              </div>
            </div>

            {renderActiveSection()}
          </div>
        </div>
      </div>
    </div>
  );
};