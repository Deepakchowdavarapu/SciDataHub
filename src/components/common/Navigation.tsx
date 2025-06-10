'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiDatabase, FiMenu, FiX, FiUser, FiSettings, FiLogOut, FiUpload, FiBarChart, FiUsers } from 'react-icons/fi';
import { getUserData, getAuthToken } from '@/lib/api';
import { IconType } from 'react-icons';

interface NavigationItem {
  name: string;
  href: string;
  icon: IconType;
  auth?: boolean;
  public?: boolean;
  roles?: string[];
}

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  organization?: string;
  permissions: string[];
}

const Navigation: React.FC = () => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const userData = getUserData();
    const token = getAuthToken();
    
    if (userData && token) {
      setUser(userData);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    setUser(null);
    router.push('/');
  };

  const navigationItems: NavigationItem[] = [
    // { name: 'Home', href: '/', icon: FiHome, public: true },
    { name: 'Dashboard', href: '/dashboard', icon: FiBarChart, auth: true },
    { name: 'Submit Data', href: '/dashboard/submit', icon: FiUpload, auth: true },
    { name: 'Review', href: '/dashboard/review', icon: FiUsers, auth: true, roles: ['reviewer', 'admin'] },
    { name: 'Admin', href: '/admin', icon: FiSettings, auth: true, roles: ['admin'] }
  ];

  const filteredNavItems = navigationItems.filter(item => {
    if (item.public) return true;
    if (item.auth && !user) return false;
    if (item.roles && !item.roles.includes(user?.role || '')) return false;
    return true;
  });

  return (
    <nav className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center group">
              <div className="relative">
                <FiDatabase className="h-8 w-8 text-indigo-600 transition-colors group-hover:text-indigo-700" />
                <div className="absolute inset-0 bg-indigo-600/20 rounded-lg blur-lg group-hover:bg-indigo-600/30 transition-all duration-300 scale-150"></div>
              </div>
              <span className="ml-3 text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                SciDataHub
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {filteredNavItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center hover:bg-gray-100/50 group"
              >
                <item.icon className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform duration-200" />
                {item.name}
              </Link>
            ))}
          </div>

          {/* Right side items */}
          <div className="flex items-center space-x-4">
            {/* User Menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 hover:shadow-lg transition-all duration-200 bg-white/50 backdrop-blur-sm p-2"
                >
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg">
                    <span className="text-sm font-semibold text-white">
                      {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                    </span>
                  </div>
                  <span className="ml-2 text-gray-700 font-medium hidden sm:block">
                    {user.firstName} {user.lastName}
                  </span>
                </button>

                {isUserMenuOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-xl shadow-xl bg-white/90 backdrop-blur-xl ring-1 ring-black/5 border border-gray-200/50 transition-all duration-200">
                    <div className="py-2">
                      <div className="px-4 py-3 border-b border-gray-200/50">
                        <div className="font-semibold text-gray-900">{user.firstName} {user.lastName}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                        <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 mt-1 capitalize">
                          {user.role}
                        </div>
                      </div>
                      <Link
                        href="/dashboard/profile"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100/50 transition-colors group"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <FiUser className="h-4 w-4 mr-3 group-hover:scale-110 transition-transform" />
                        Profile
                      </Link>
                      <Link
                        href="/dashboard/settings"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100/50 transition-colors group"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <FiSettings className="h-4 w-4 mr-3 group-hover:scale-110 transition-transform" />
                        Settings
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors group"
                      >
                        <FiLogOut className="h-4 w-4 mr-3 group-hover:scale-110 transition-transform" />
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  href="/auth/login"
                  className="text-gray-700 hover:text-indigo-600 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-gray-100/50"
                >
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-gray-700 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 p-2 rounded-lg hover:bg-gray-100/50 transition-all duration-200"
              >
                {isOpen ? <FiX className="h-6 w-6" /> : <FiMenu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden border-t border-gray-200/50">
          <div className="px-4 py-3 space-y-2 bg-white/90 backdrop-blur-xl">
            {filteredNavItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-gray-700 hover:text-indigo-600 block px-3 py-2 rounded-lg text-base font-medium transition-all duration-200 flex items-center hover:bg-gray-100/50 group"
                onClick={() => setIsOpen(false)}
              >
                <item.icon className="h-5 w-5 mr-3 group-hover:scale-110 transition-transform duration-200" />
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation; 