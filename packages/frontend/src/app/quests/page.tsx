'use client';

import { QuestMarketplace } from '../../components/sponsors/QuestMarketplace';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';

export default function QuestsPage() {
  return (
    <ProtectedRoute requireAuth={true} requireProfile={true}>
      <QuestMarketplace />
    </ProtectedRoute>
  );
}