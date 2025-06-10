'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  FiDatabase, 
  FiUser, 
  FiLogOut, 
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiEye,
  FiEdit,
  FiTrash2,
  FiDownload,
  FiLoader,
  FiPlus,
  FiCalendar,
  FiTag
} from 'react-icons/fi';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  organization?: string;
  permissions: string[];
}

interface Submission {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  submissionDate: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'needs_revision';
  reviewComments?: string;
  dataType: string;
  isPublic: boolean;
  fileInfo?: {
    name: string;
    size: string;
    format: string;
  };
  downloadCount: number;
  lastModified: string;
}

export default function SubmissionsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title' | 'status'>('newest');

  // Sample data - In real app, this would come from API
  const sampleSubmissions: Submission[] = [
    {
      id: '1',
      title: 'Climate Temperature Measurements 2023',
      description: 'Comprehensive temperature data collected from weather stations across North America during 2023.',
      category: 'environmental',
      tags: ['climate', 'temperature', 'weather'],
      submissionDate: '2023-12-15',
      status: 'approved',
      dataType: 'quantitative',
      isPublic: true,
      fileInfo: {
        name: 'climate_data_2023.csv',
        size: '2.3 MB',
        format: 'CSV'
      },
      downloadCount: 124,
      lastModified: '2023-12-15'
    },
    {
      id: '2',
      title: 'Urban Air Quality Study',
      description: 'Air quality measurements from urban sensors deployed in major cities.',
      category: 'environmental',
      tags: ['air-quality', 'urban', 'pollution'],
      submissionDate: '2023-11-28',
      status: 'under_review',
      dataType: 'quantitative',
      isPublic: true,
      fileInfo: {
        name: 'air_quality_urban.xlsx',
        size: '5.1 MB',
        format: 'Excel'
      },
      downloadCount: 0,
      lastModified: '2023-11-28'
    },
    {
      id: '3',
      title: 'Biodiversity Survey Data',
      description: 'Species count and diversity data from local ecosystems.',
      category: 'biology',
      tags: ['biodiversity', 'species', 'ecology'],
      submissionDate: '2023-10-10',
      status: 'needs_revision',
      reviewComments: 'Please provide more detailed methodology description and add sample size information.',
      dataType: 'mixed',
      isPublic: false,
      downloadCount: 0,
      lastModified: '2023-10-10'
    },
    {
      id: '4',
      title: 'Solar Panel Efficiency Data',
      description: 'Performance measurements from residential solar installations.',
      category: 'engineering',
      tags: ['solar', 'energy', 'efficiency'],
      submissionDate: '2023-09-15',
      status: 'rejected',
      reviewComments: 'Insufficient data validation and missing control group information.',
      dataType: 'quantitative',
      isPublic: false,
      downloadCount: 0,
      lastModified: '2023-09-15'
    },
    {
      id: '5',
      title: 'Water Quality Analysis',
      description: 'Chemical analysis of water samples from various sources.',
      category: 'chemistry',
      tags: ['water', 'quality', 'chemistry'],
      submissionDate: '2023-12-01',
      status: 'pending',
      dataType: 'quantitative',
      isPublic: true,
      downloadCount: 0,
      lastModified: '2023-12-01'
    }
  ];

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('user_data');

    if (!token || !userData) {
      router.push('/auth/login');
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      
      // Simulate loading submissions
      setTimeout(() => {
        setSubmissions(sampleSubmissions);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error parsing user data:', error);
      router.push('/auth/login');
      return;
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    router.push('/');
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: FiClock, text: 'Pending' },
      under_review: { color: 'bg-blue-100 text-blue-800', icon: FiEye, text: 'Under Review' },
      approved: { color: 'bg-green-100 text-green-800', icon: FiCheckCircle, text: 'Approved' },
      rejected: { color: 'bg-red-100 text-red-800', icon: FiXCircle, text: 'Rejected' },
      needs_revision: { color: 'bg-orange-100 text-orange-800', icon: FiEdit, text: 'Needs Revision' }
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    const IconComponent = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <IconComponent className="h-3 w-3 mr-1" />
        {config.text}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredSubmissions = submissions
    .filter(submission => {
      if (filter === 'all') return true;
      return submission.status === filter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime();
        case 'oldest':
          return new Date(a.submissionDate).getTime() - new Date(b.submissionDate).getTime();
        case 'title':
          return a.title.localeCompare(b.title);
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

  const getStatusCounts = () => {
    return {
      all: submissions.length,
      pending: submissions.filter(s => s.status === 'pending').length,
      approved: submissions.filter(s => s.status === 'approved').length,
      rejected: submissions.filter(s => s.status === 'rejected').length
    };
  };

  const statusCounts = getStatusCounts();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FiLoader className="animate-spin h-12 w-12 text-indigo-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Submissions</h2>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/dashboard" className="flex items-center">
                <FiDatabase className="h-8 w-8 text-indigo-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">SciDataHub</span>
              </Link>
              <span className="ml-4 text-sm text-gray-500">My Submissions</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-sm text-gray-700">
                <FiUser className="h-4 w-4 mr-2" />
                <span>{user.firstName} {user.lastName}</span>
                <span className="ml-2 px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs capitalize">
                  {user.role}
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
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Submissions</h1>
            <p className="text-lg text-gray-600">
              Track and manage your data submissions
            </p>
          </div>
          <Link
            href="/dashboard/submit"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            <FiPlus className="h-4 w-4 mr-2" />
            New Submission
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FiDatabase className="h-8 w-8 text-gray-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Submissions</p>
                <p className="text-2xl font-semibold text-gray-900">{statusCounts.all}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FiClock className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pending Review</p>
                <p className="text-2xl font-semibold text-gray-900">{statusCounts.pending}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FiCheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Approved</p>
                <p className="text-2xl font-semibold text-gray-900">{statusCounts.approved}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FiDownload className="h-8 w-8 text-indigo-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Downloads</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {submissions.reduce((sum, s) => sum + s.downloadCount, 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Controls */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            {/* Status Filter */}
            <div className="flex space-x-2">
              {[
                { key: 'all', label: 'All', count: statusCounts.all },
                { key: 'pending', label: 'Pending', count: statusCounts.pending },
                { key: 'approved', label: 'Approved', count: statusCounts.approved },
                { key: 'rejected', label: 'Rejected', count: statusCounts.rejected }
              ].map(({ key, label, count }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key as any)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    filter === key
                      ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                      : 'text-gray-500 hover:text-gray-700 border border-transparent'
                  }`}
                >
                  {label} ({count})
                </button>
              ))}
            </div>

            {/* Sort */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="title">Title A-Z</option>
                <option value="status">Status</option>
              </select>
            </div>
          </div>
        </div>

        {/* Submissions List */}
        {filteredSubmissions.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
            <FiDatabase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {filter === 'all' ? 'No submissions yet' : `No ${filter} submissions`}
            </h3>
            <p className="text-gray-600 mb-6">
              {filter === 'all' 
                ? 'Start contributing to science by submitting your first dataset.'
                : `You don't have any ${filter} submissions at the moment.`}
            </p>
            <Link
              href="/dashboard/submit"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              <FiPlus className="h-4 w-4 mr-2" />
              Submit Data
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredSubmissions.map((submission) => (
              <div key={submission.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {submission.title}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">
                            {submission.description}
                          </p>
                        </div>
                        <div className="flex-shrink-0 ml-4">
                          {getStatusBadge(submission.status)}
                        </div>
                      </div>

                      {/* Metadata */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-500 mb-4">
                        <div className="flex items-center">
                          <FiCalendar className="h-4 w-4 mr-1" />
                          <span>Submitted {formatDate(submission.submissionDate)}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="capitalize">{submission.category}</span>
                        </div>
                        <div className="flex items-center">
                          <span>{submission.isPublic ? 'Public' : 'Private'}</span>
                        </div>
                      </div>

                      {/* Tags */}
                      {submission.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {submission.tags.map(tag => (
                            <span
                              key={tag}
                              className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                            >
                              <FiTag className="h-3 w-3 mr-1" />
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* File Info */}
                      {submission.fileInfo && (
                        <div className="flex items-center text-sm text-gray-500 mb-4">
                          <span>{submission.fileInfo.name} • {submission.fileInfo.size} • {submission.fileInfo.format}</span>
                        </div>
                      )}

                      {/* Review Comments */}
                      {submission.reviewComments && (
                        <div className="bg-orange-50 border border-orange-200 rounded-md p-3 mb-4">
                          <p className="text-sm text-orange-800">
                            <strong>Review Comments:</strong> {submission.reviewComments}
                          </p>
                        </div>
                      )}

                      {/* Stats */}
                      {submission.status === 'approved' && (
                        <div className="flex items-center text-sm text-gray-500 mb-4">
                          <FiDownload className="h-4 w-4 mr-1" />
                          <span>{submission.downloadCount} downloads</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex space-x-3">
                      <Link
                        href={`/dashboard/submissions/${submission.id}`}
                        className="flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                      >
                        <FiEye className="h-4 w-4 mr-1" />
                        View Details
                      </Link>
                      
                      {(submission.status === 'needs_revision' || submission.status === 'rejected') && (
                        <Link
                          href={`/dashboard/submissions/${submission.id}/edit`}
                          className="flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                        >
                          <FiEdit className="h-4 w-4 mr-1" />
                          Edit
                        </Link>
                      )}

                      {submission.status === 'approved' && (
                        <Link
                          href={`/public/dataset/${submission.id}`}
                          className="flex items-center px-3 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                        >
                          <FiEye className="h-4 w-4 mr-1" />
                          View Public
                        </Link>
                      )}
                    </div>

                    <div className="flex space-x-2">
                      <button className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                        <FiTrash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
} 