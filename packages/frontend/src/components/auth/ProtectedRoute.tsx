'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import { LoadingSpinner } from '../ui/loading-spinner';
import { LoginModal } from './LoginModal';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireProfile?: boolean;
  requireRole?: 'admin' | 'mentor' | 'sponsor';
  redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
  requireProfile = false,
  requireRole,
  redirectTo = '/login',
}) => {
  const [isChecking, setIsChecking] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  
  const router = useRouter();
  const { isAuthenticated, user, isLoading } = useAuth();

  useEffect(() => {
    const checkAuth = async () => {
      // Wait for auth state to be loaded from storage
      if (isLoading) return;

      if (requireAuth && !isAuthenticated) {
        setShowLoginModal(true);
        setIsChecking(false);
        return;
      }

      if (requireProfile && isAuthenticated && !user?.name && !user?.displayName) {
        router.push('/profile/setup');
        return;
      }

      if (requireRole && isAuthenticated && user?.role !== requireRole) {
        router.push('/dashboard');
        return;
      }

      setIsChecking(false);
    };

    checkAuth();
  }, [isAuthenticated, user, isLoading, requireAuth, requireProfile, requireRole, router]);

  const handleLoginSuccess = () => {
    setShowLoginModal(false);
    
    // Check if profile setup is needed
    if (requireProfile && !user?.name && !user?.displayName) {
      router.push('/profile/setup');
    }
  };

  const handleLoginClose = () => {
    setShowLoginModal(false);
    if (redirectTo !== '/login') {
      router.push(redirectTo);
    }
  };

  if (isLoading || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (requireAuth && !isAuthenticated) {
    return (
      <>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Authentication Required
            </h1>
            <p className="text-gray-600 mb-6">
              Please sign in to access this page
            </p>
          </div>
        </div>
        <LoginModal
          isOpen={showLoginModal}
          onClose={handleLoginClose}
          onSuccess={handleLoginSuccess}
        />
      </>
    );
  }

  return <>{children}</>;
};