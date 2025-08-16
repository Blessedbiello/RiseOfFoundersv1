'use client';

import { useState } from 'react';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';
import { AdminSidebar } from '../../components/admin/AdminSidebar';
import { AdminOverview } from '../../components/admin/AdminOverview';
import { UserManagement } from '../../components/admin/UserManagement';
import { ContentManagement } from '../../components/admin/ContentManagement';
import { AnalyticsDashboard } from '../../components/admin/AnalyticsDashboard';
import { ModerationTools } from '../../components/admin/ModerationTools';
import { SystemSettings } from '../../components/admin/SystemSettings';
import { 
  Shield,
  Users,
  Settings,
  BarChart3,
  FileText,
  AlertTriangle,
  Home
} from 'lucide-react';

type AdminView = 'overview' | 'users' | 'content' | 'analytics' | 'moderation' | 'settings';

export default function AdminDashboard() {
  const [activeView, setActiveView] = useState<AdminView>('overview');

  const renderActiveView = () => {
    switch (activeView) {
      case 'overview':
        return <AdminOverview />;
      case 'users':
        return <UserManagement />;
      case 'content':
        return <ContentManagement />;
      case 'analytics':
        return <AnalyticsDashboard />;
      case 'moderation':
        return <ModerationTools />;
      case 'settings':
        return <SystemSettings />;
      default:
        return <AdminOverview />;
    }
  };

  return (
    <ProtectedRoute requireAuth={true} requireProfile={true} requireRole="admin">
      <div className="min-h-screen bg-gray-900 flex">
        {/* Sidebar */}
        <AdminSidebar activeView={activeView} onViewChange={(view: string) => setActiveView(view as AdminView)} />
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="w-8 h-8 text-blue-400" />
                <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-sm text-gray-400">
                  Rise of Founders v1.0
                </div>
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">A</span>
                </div>
              </div>
            </div>
          </header>

          {/* Content Area */}
          <main className="flex-1 overflow-auto bg-gray-900 p-6">
            {renderActiveView()}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}