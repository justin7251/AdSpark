'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import useUserStore from '../../stores/userStore';

export default function DashboardPage() {
  const router = useRouter();
  const { isLoading } = useAuth();
  const { user, hooks } = useUserStore();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="spinner">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">
        Welcome, {user?.displayName || 'AdSpark User'}
      </h1>

      <section className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">Your Marketing Hooks</h2>
        
        {hooks.length === 0 ? (
          <p className="text-gray-500">
            You haven't created any marketing hooks yet.
          </p>
        ) : (
          <div className="grid gap-4">
            {hooks.map((hook) => (
              <div 
                key={hook.id} 
                className="border p-4 rounded-md hover:bg-gray-50 transition"
              >
                <p>{hook.content}</p>
                <div className="text-sm text-gray-500 mt-2">
                  Created: {new Date(hook.createdAt).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
