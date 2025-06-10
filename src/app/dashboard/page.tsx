'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  FiPlus, 
  FiBarChart,
  FiFileText,
  FiClock,
  FiLoader,
  FiUsers
} from 'react-icons/fi';
import { getUserData, getAuthToken } from '@/lib/api';
import AnalyticsDashboard from '@/components/dashboard/AnalyticsDashboard';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  organization?: string;
  permissions: string[];
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    const token = getAuthToken();
    const userData = getUserData();

    if (!token || !userData) {
      router.push('/auth/login');
      return;
    }

    setUser(userData);
    setLoading(false);
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FiLoader className="animate-spin h-12 w-12 text-indigo-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Dashboard</h2>
          <p className="text-gray-600">Please wait while we load your information...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user.firstName}!
          </h1>
          <p className="text-lg text-gray-600">
            {user.organization ? `${user.organization} • ` : ''}Ready to contribute to scientific research?
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FiPlus className="h-8 w-8 text-indigo-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Submit Data</h3>
                <p className="text-sm text-gray-600">Upload your research data</p>
              </div>
            </div>
            <div className="mt-4">
              <Link 
                href="/dashboard/submit"
                className="block w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium transition-colors text-center"
              >
                Upload Data
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FiBarChart className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Explore Data</h3>
                <p className="text-sm text-gray-600">Browse public datasets</p>
              </div>
            </div>
            <div className="mt-4">
              <Link 
                href="/public/explore"
                className="block w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm font-medium transition-colors text-center"
              >
                Explore
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FiFileText className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">My Submissions</h3>
                <p className="text-sm text-gray-600">View your uploaded data</p>
              </div>
            </div>
            <div className="mt-4">
              <Link 
                href="/dashboard/submissions"
                className="block w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium transition-colors text-center"
              >
                View All
              </Link>
            </div>
          </div>

          {user.permissions.includes('review_submission') ? (
            <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FiClock className="h-8 w-8 text-orange-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Review Queue</h3>
                  <p className="text-sm text-gray-600">Pending submissions to review</p>
                </div>
              </div>
              <div className="mt-4">
                <Link 
                  href="/dashboard/review"
                  className="block w-full bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm font-medium transition-colors text-center"
                >
                  Review Now
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FiUsers className="h-8 w-8 text-purple-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Community</h3>
                  <p className="text-sm text-gray-600">Connect with researchers</p>
                </div>
              </div>
              <div className="mt-4">
                <Link 
                  href="/community"
                  className="block w-full bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm font-medium transition-colors text-center"
                >
                  Join Discussion
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Analytics Dashboard */}
        <AnalyticsDashboard userRole={user.role} userId={user.id} />
      </main>
    </div>
  );
} 