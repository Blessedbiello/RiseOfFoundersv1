'use client';

import { MapInterface } from '../../components/game/MapInterface';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';

export default function GamePage() {
  return (
    <ProtectedRoute requireAuth={true} requireProfile={true}>
      <MapInterface />
    </ProtectedRoute>
  );
}