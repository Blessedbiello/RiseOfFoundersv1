'use client';

import { useRouter } from 'next/navigation';
import { ProfileSetup } from '../../../components/auth/ProfileSetup';
import { ProtectedRoute } from '../../../components/auth/ProtectedRoute';

export default function ProfileSetupPage() {
  const router = useRouter();

  const handleComplete = () => {
    router.push('/dashboard');
  };

  return (
    <ProtectedRoute requireAuth={true}>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <ProfileSetup onComplete={handleComplete} isRequired={true} />
        </div>
      </div>
    </ProtectedRoute>
  );
}