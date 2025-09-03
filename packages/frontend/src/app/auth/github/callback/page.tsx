'use client';

import { Suspense } from 'react';
import { GitHubCallback } from '../../../../components/auth/GitHubCallback';

export default function GitHubCallbackPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p>Loading...</p>
      </div>
    </div>}>
      <GitHubCallback />
    </Suspense>
  );
}