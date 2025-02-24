'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import useUserStore from '../stores/userStore';
import Image from 'next/image';

export default function Navbar() {
  const router = useRouter();
  const { user, logout } = useUserStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);  // Add loading state

  const handleLogout = async () => {
    try {
      setIsLoading(true);  // Start loading
      setIsMenuOpen(false);  // Close menu
      
      await logout();
      
      // Clear all persisted storage
      localStorage.clear();
      
      // Navigate to home page
      router.push('/');
      
      // Force a page refresh to clear any remaining state
      window.location.reload();
    } catch (error) {
      console.error('Logout failed', error);
    } finally {
      setIsLoading(false);  // End loading
    }
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMenuOpen && !event.target.closest('.user-menu')) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  return (
    <nav className="bg-white shadow-md relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0">
              <Image 
                src="/assets/Adspark.svg"  
                width={32}  
                height={32}  
                alt="AdSpark Logo" 
                className="h-8 w-8"
              />
            </Link>

            {/* Main Navigation */}
            <div className="ml-10 flex items-baseline space-x-4">
              <Link 
                href="/dashboard" 
                className="text-gray-600 hover:bg-gray-100 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Dashboard
              </Link>
              <Link 
                href="/hooks" 
                className="text-gray-600 hover:bg-gray-100 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Marketing Hooks
              </Link>
            </div>
          </div>
          {/* Tokens: {user.tokens} */}
          

          {/* User Profile and Actions */}
          <div className="ml-4 flex items-center md:ml-6">
            {user ? (
              <div className="relative user-menu">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="max-w-xs bg-gray-200 rounded-full flex items-center text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  disabled={isLoading}
                >
                  <span className="sr-only">Open user menu</span>
                  {user.photoURL ? (
                    <img 
                      className="h-8 w-8 rounded-full" 
                      src={user.photoURL} 
                      alt="User Profile" 
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold">
                      {user.displayName ? user.displayName.charAt(0) : 'U'}
                    </div>
                  )}
                </button>

                {/* Dropdown Menu */}
                {isMenuOpen && (
                  <div 
                    className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="user-menu"
                  >
                    <Link 
                      href="/profile" 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                      onClick={() => setIsMenuOpen(false)}
                      role="menuitem"
                    >
                      Your Profile
                    </Link>
                    <div className="border-t border-gray-200"></div>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                      role="menuitem"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Signing out...' : 'Sign out'}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex space-x-4">
                <Link
                  href="/auth/login"
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="bg-indigo-600 text-white hover:bg-indigo-700 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
} 