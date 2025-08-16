'use client';

import { SponsorDashboard } from '../../components/sponsors/SponsorDashboard';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';

export default function SponsorsPage() {
  return (
    <ProtectedRoute requireAuth={true} requireProfile={true}>
      <SponsorDashboard />
    </ProtectedRoute>
  );
}