'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  FiDatabase, 
  FiUser, 
  FiLogOut, 
  FiUsers,
  FiBarChart,
  FiSettings,
  FiShield,
  FiTrendingUp,
  FiClock,
  FiCheck,
  FiX,
  FiEdit,
  FiLoader,
  FiSearch,
  FiFilter,
  FiEye,
  FiPlus,
  FiMoreHorizontal,
  FiRefreshCw
} from 'react-icons/fi';
import { authAPI, dataAPI, reviewAPI } from '@/lib/api';
import { User as UserType, DashboardStats, ReviewStats } from '@/types';

interface AdminStats {
  totalUsers: number;
  totalSubmissions: number;
  pendingReviews: number;
  totalReviewers: number;
  platformStats: DashboardStats;
  reviewStats: ReviewStats;
}

interface UserWithStats extends UserType {
  submissionCount?: number;
  reviewCount?: number;
  lastActivity?: Date;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'submissions' | 'reviews'>('overview');
  
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<UserWithStats[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);

  const [userFilters, setUserFilters] = useState({
    role: '',
    search: '',
    isActive: '',
    page: 1,
    limit: 10
  });

  useEffect(() => {
    // Check if user is authenticated and has admin permissions
    const token = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('user_data');

    if (!token || !userData) {
      router.push('/auth/login');
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      if (!parsedUser.permissions.includes('admin_access')) {
        router.push('/dashboard');
        return;
      }
      setUser(parsedUser);
    } catch (error) {
      console.error('Error parsing user data:', error);
      router.push('/auth/login');
      return;
    }

    setLoading(false);
  }, [router]);

  useEffect(() => {
    if (user) {
      loadAdminStats();
      if (activeTab === 'users') {
        loadUsers();
      }
    }
  }, [user, activeTab, userFilters]);

  const loadAdminStats = async () => {
    setStatsLoading(true);
    try {
      // Simulate loading admin stats
      // In a real app, you'd have specific admin endpoints
      const [platformStats, reviewStats] = await Promise.all([
        dataAPI.getStats(), // This would need to be implemented
        reviewAPI.getReviewStats()
      ]);

      setAdminStats({
        totalUsers: 156, // Mock data
        totalSubmissions: platformStats.totalSubmissions || 0,
        pendingReviews: reviewStats.pending || 0,
        totalReviewers: 12, // Mock data
        platformStats,
        reviewStats
      });
    } catch (error) {
      console.error('Error loading admin stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  const loadUsers = async () => {
    setUsersLoading(true);
    try {
      const response = await authAPI.getUsers(userFilters);
      setUsers(response.users || []);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setUsersLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    router.push('/');
  };

  const handleUserAction = async (userId: string, action: 'activate' | 'deactivate' | 'makeReviewer') => {
    try {
      // Implement user actions
      console.log(`${action} user ${userId}`);
      // Reload users after action
      loadUsers();
    } catch (error) {
      console.error(`Error performing ${action}:`, error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FiLoader className="animate-spin h-12 w-12 text-indigo-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Admin Dashboard</h2>
          <p className="text-gray-600">Please wait while we load the admin interface...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <FiDatabase className="h-8 w-8 text-indigo-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">SciDataHub</span>
              </Link>
              <span className="ml-4 text-sm text-gray-500">Admin Dashboard</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
                Dashboard
              </Link>
              <div className="flex items-center text-sm text-gray-700">
                <FiShield className="h-4 w-4 mr-2" />
                <span>{user.firstName} {user.lastName}</span>
                <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
                  Admin
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center text-gray-700 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                <FiLogOut className="h-4 w-4 mr-1" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
              <p className="text-lg text-gray-600">
                Manage users, monitor platform activity, and oversee system operations
              </p>
            </div>
            <button
              onClick={() => loadAdminStats()}
              className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 text-sm font-medium text-gray-700"
            >
              <FiRefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: FiBarChart },
              { id: 'users', label: 'Users', icon: FiUsers },
              { id: 'submissions', label: 'Submissions', icon: FiDatabase },
              { id: 'reviews', label: 'Reviews', icon: FiClock }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <FiUsers className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Users</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {statsLoading ? <FiLoader className="animate-spin h-6 w-6" /> : adminStats?.totalUsers || 0}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <FiDatabase className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Submissions</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {statsLoading ? <FiLoader className="animate-spin h-6 w-6" /> : adminStats?.totalSubmissions || 0}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <FiClock className="h-8 w-8 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Pending Reviews</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {statsLoading ? <FiLoader className="animate-spin h-6 w-6" /> : adminStats?.pendingReviews || 0}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <FiShield className="h-8 w-8 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Active Reviewers</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {statsLoading ? <FiLoader className="animate-spin h-6 w-6" /> : adminStats?.totalReviewers || 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts and Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Submission Status Chart */}
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Submission Status Overview</h3>
                {adminStats?.platformStats ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Pending</span>
                      <span className="text-sm font-medium text-orange-600">
                        {adminStats.platformStats.pendingSubmissions}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Approved</span>
                      <span className="text-sm font-medium text-green-600">
                        {adminStats.platformStats.approvedSubmissions}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Rejected</span>
                      <span className="text-sm font-medium text-red-600">
                        {adminStats.platformStats.rejectedSubmissions}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-32">
                    <FiLoader className="animate-spin h-8 w-8 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Recent Activity */}
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
                <div className="space-y-4">
                  <div className="text-center py-8">
                    <FiClock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No recent activity</p>
                    <p className="text-sm text-gray-400 mt-1">Activity feed coming soon</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={userFilters.search}
                    onChange={(e) => setUserFilters({ ...userFilters, search: e.target.value })}
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <select
                  value={userFilters.role}
                  onChange={(e) => setUserFilters({ ...userFilters, role: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">All Roles</option>
                  <option value="citizen">Citizen</option>
                  <option value="researcher">Researcher</option>
                  <option value="reviewer">Reviewer</option>
                  <option value="admin">Admin</option>
                </select>

                <select
                  value={userFilters.isActive}
                  onChange={(e) => setUserFilters({ ...userFilters, isActive: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">All Status</option>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>

                <button className="flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                  <FiPlus className="h-4 w-4 mr-2" />
                  Add User
                </button>
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-lg shadow-sm border">
              {usersLoading ? (
                <div className="p-8 text-center">
                  <FiLoader className="animate-spin h-8 w-8 text-indigo-600 mx-auto mb-4" />
                  <p className="text-gray-600">Loading users...</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Joined
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                            No users found
                          </td>
                        </tr>
                      ) : (
                        users.map((userItem) => (
                          <tr key={userItem.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="h-10 w-10 flex-shrink-0">
                                  <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                    <FiUser className="h-5 w-5 text-gray-600" />
                                  </div>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {userItem.firstName} {userItem.lastName}
                                  </div>
                                  <div className="text-sm text-gray-500">{userItem.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full capitalize ${
                                userItem.role === 'admin' ? 'bg-red-100 text-red-800' :
                                userItem.role === 'reviewer' ? 'bg-blue-100 text-blue-800' :
                                userItem.role === 'researcher' ? 'bg-green-100 text-green-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {userItem.role}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                userItem.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {userItem.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(userItem.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleUserAction(userItem.id, userItem.isActive ? 'deactivate' : 'activate')}
                                  className={`text-sm ${
                                    userItem.isActive ? 'text-red-600 hover:text-red-800' : 'text-green-600 hover:text-green-800'
                                  }`}
                                >
                                  {userItem.isActive ? 'Deactivate' : 'Activate'}
                                </button>
                                <span className="text-gray-300">|</span>
                                <button
                                  onClick={() => handleUserAction(userItem.id, 'makeReviewer')}
                                  className="text-indigo-600 hover:text-indigo-800"
                                >
                                  Edit
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Submissions Tab */}
        {activeTab === 'submissions' && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Submission Management</h3>
            <div className="text-center py-8">
              <FiDatabase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Submission management interface</p>
              <p className="text-sm text-gray-400 mt-1">Coming soon - view and manage all submissions</p>
            </div>
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Review Management</h3>
            <div className="text-center py-8">
              <FiClock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Review management interface</p>
              <p className="text-sm text-gray-400 mt-1">Coming soon - monitor review activity and assign reviewers</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
} 