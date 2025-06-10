'use client';

import React, { useState, useEffect } from 'react';
import { FiDatabase, FiUsers, FiCheckCircle, FiClock, FiTrendingUp, FiEye, FiDownload, FiBarChart2 } from 'react-icons/fi';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

interface AnalyticsData {
  totalSubmissions: number;
  approvedSubmissions: number;
  pendingReviews: number;
  totalUsers: number;
  recentSubmissions: Submission[];
  categoryBreakdown: { [key: string]: number };
  weeklyStats: { week: string; submissions: number; }[];
}

interface Submission {
  id: string;
  title: string;
  category: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  submittedBy: string;
  views?: number;
  downloads?: number;
}

interface AnalyticsDashboardProps {
  userRole?: string;
  userId?: string;
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ userRole = 'researcher', userId }) => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange, userId]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const endpoint = userRole === 'admin' 
        ? `/api/analytics/admin?timeRange=${timeRange}`
        : `/api/analytics/user/${userId}?timeRange=${timeRange}`;
      
      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      } else {
        // Mock data for development
        setAnalytics({
          totalSubmissions: 147,
          approvedSubmissions: 89,
          pendingReviews: 23,
          totalUsers: 342,
          recentSubmissions: [
            {
              id: '1',
              title: 'Climate Data Analysis for Urban Areas',
              category: 'Environmental',
              status: 'approved',
              submittedAt: '2024-01-15T10:00:00Z',
              submittedBy: 'Dr. Sarah Johnson',
              views: 1240,
              downloads: 89
            },
            {
              id: '2',
              title: 'COVID-19 Vaccination Efficacy Study',
              category: 'Medical',
              status: 'pending',
              submittedAt: '2024-01-14T15:30:00Z',
              submittedBy: 'Dr. Michael Chen'
            },
            {
              id: '3',
              title: 'Machine Learning Performance Metrics',
              category: 'Engineering',
              status: 'approved',
              submittedAt: '2024-01-13T09:15:00Z',
              submittedBy: 'Prof. Emma Davis',
              views: 876,
              downloads: 134
            }
          ],
          categoryBreakdown: {
            'Environmental': 35,
            'Medical': 28,
            'Physics': 22,
            'Biology': 31,
            'Chemistry': 19,
            'Engineering': 12
          },
          weeklyStats: [
            { week: 'Week 1', submissions: 12 },
            { week: 'Week 2', submissions: 18 },
            { week: 'Week 3', submissions: 15 },
            { week: 'Week 4', submissions: 23 }
          ]
        });
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = 'px-2 py-1 rounded-full text-xs font-medium';
    switch (status) {
      case 'approved':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'pending':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'rejected':
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const calculateApprovalRate = () => {
    if (!analytics) return 0;
    return Math.round((analytics.approvedSubmissions / analytics.totalSubmissions) * 100);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <div className="h-32 bg-gray-200 rounded"></div>
          </Card>
        ))}
      </div>
    );
  }

  if (!analytics) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-gray-500">Unable to load analytics data</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
        <div className="flex space-x-2">
          {(['week', 'month', 'year'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                timeRange === range
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-blue-100">
                <FiDatabase className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Submissions</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.totalSubmissions}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-green-100">
                <FiCheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.approvedSubmissions}</p>
                <p className="text-xs text-green-600">{calculateApprovalRate()}% approval rate</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-yellow-100">
                <FiClock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Review</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.pendingReviews}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {userRole === 'admin' && (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-purple-100">
                  <FiUsers className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.totalUsers}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Submissions by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(analytics.categoryBreakdown).map(([category, count]) => {
                const percentage = Math.round((count / analytics.totalSubmissions) * 100);
                return (
                  <div key={category} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">{category}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-indigo-600 h-2 rounded-full" 
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-500 w-8">{count}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Weekly Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Submission Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.weeklyStats.map((stat, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">{stat.week}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${(stat.submissions / 25) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-500 w-8">{stat.submissions}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Submissions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Submissions</CardTitle>
            <FiTrendingUp className="h-5 w-5 text-gray-400" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.recentSubmissions.map((submission) => (
              <div key={submission.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-gray-900">{submission.title}</h4>
                  <div className="flex items-center space-x-4 mt-1">
                    <span className="text-xs text-gray-500">{submission.category}</span>
                    <span className="text-xs text-gray-500">by {submission.submittedBy}</span>
                    <span className="text-xs text-gray-500">{formatDate(submission.submittedAt)}</span>
                  </div>
                  {submission.views !== undefined && (
                    <div className="flex items-center space-x-4 mt-2">
                      <div className="flex items-center text-xs text-gray-500">
                        <FiEye className="h-3 w-3 mr-1" />
                        {submission.views} views
                      </div>
                      <div className="flex items-center text-xs text-gray-500">
                        <FiDownload className="h-3 w-3 mr-1" />
                        {submission.downloads} downloads
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <span className={getStatusBadge(submission.status)}>
                    {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsDashboard; 