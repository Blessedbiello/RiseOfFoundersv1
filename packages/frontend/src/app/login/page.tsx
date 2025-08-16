'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import { LoginModal } from '../../components/auth/LoginModal';

export default function LoginPage() {
  const [showModal, setShowModal] = useState(true);
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  const handleSuccess = () => {
    router.push('/dashboard');
  };

  const handleClose = () => {
    setShowModal(false);
    router.push('/');
  };

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full mx-auto px-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Rise of Founders
          </h1>
          <p className="text-gray-600">
            Join the gamified founder education platform
          </p>
        </div>
      </div>
      
      <LoginModal
        isOpen={showModal}
        onClose={handleClose}
        onSuccess={handleSuccess}
      />
    </div>
  );
}