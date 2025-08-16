'use client';

import { useState } from 'react';
import { MentorMarketplace } from '../../components/mentors/MentorMarketplace';
import { SessionManagement } from '../../components/mentors/SessionManagement';
import { BookingSystem } from '../../components/mentors/BookingSystem';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';
import { Button } from '../../components/ui/button';
import { 
  Users,
  Calendar,
  Star,
  BookOpen
} from 'lucide-react';

export default function MentorsPage() {
  const [activeView, setActiveView] = useState<'marketplace' | 'sessions'>('marketplace');
  const [showBooking, setShowBooking] = useState<string | null>(null);

  return (
    <ProtectedRoute requireAuth={true} requireProfile={true}>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Users className="w-8 h-8 text-blue-400" />
              <h1 className="text-4xl font-bold text-white">Mentorship Hub</h1>
            </div>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Learn from experienced founders, investors, and industry experts
            </p>
          </div>

          {/* Navigation */}
          <div className="flex justify-center mb-8">
            <div className="bg-gray-800/50 rounded-lg p-1">
              <button
                onClick={() => setActiveView('marketplace')}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  activeView === 'marketplace'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                <Users className="w-4 h-4 inline mr-2" />
                Find Mentors
              </button>
              
              <button
                onClick={() => setActiveView('sessions')}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  activeView === 'sessions'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                <Calendar className="w-4 h-4 inline mr-2" />
                My Sessions
              </button>
            </div>
          </div>

          {/* Content */}
          {activeView === 'marketplace' && <MentorMarketplace />}
          {activeView === 'sessions' && <SessionManagement userRole="founder" />}

          {/* Booking Modal */}
          {showBooking && (
            <BookingSystem
              mentorId={showBooking}
              onClose={() => setShowBooking(null)}
            />
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}