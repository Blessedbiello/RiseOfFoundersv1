'use client';

import { TeamDashboard } from '../../components/teams/TeamDashboard';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';

export default function TeamsPage() {
  return (
    <ProtectedRoute requireAuth={true} requireProfile={true}>
      <TeamDashboard />
    </ProtectedRoute>
  );
}