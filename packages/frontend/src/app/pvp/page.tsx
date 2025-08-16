'use client';

import { PvPDashboard } from '../../components/pvp/PvPDashboard';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';

export default function PvPPage() {
  return (
    <ProtectedRoute requireAuth={true} requireProfile={true}>
      <PvPDashboard />
    </ProtectedRoute>
  );
}