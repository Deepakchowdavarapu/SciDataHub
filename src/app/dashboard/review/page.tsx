'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  FiDatabase, 
  FiUser, 
  FiLogOut, 
  FiFilter,
  FiSearch,
  FiClock,
  FiEye,
  FiCheck,
  FiX,
  FiEdit,
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiDownload,
  FiExternalLink,
  FiAlertCircle,
  FiLoader,
  FiRefreshCw
} from 'react-icons/fi';
import { reviewAPI } from '@/lib/api';
import { Submission, User as UserType } from '@/types';

interface ReviewFilters {
  category: string;
  submitterType: string;
  validationStatus: string;
  sortBy: string;
  sortOrder: string;
  search: string;
}

export default function ReviewQueuePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedSubmissions, setSelectedSubmissions] = useState<string[]>([]);
  
  const [filters, setFilters] = useState<ReviewFilters>({
    category: '',
    submitterType: '',
    validationStatus: '',
    sortBy: 'createdAt',
    sortOrder: 'asc',
    search: ''
  });

  const [showFilters, setShowFilters] = useState(false);
  const [showBatchActions, setShowBatchActions] = useState(false);

  useEffect(() => {
    // Check if user is authenticated and has review permissions
    const token = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('user_data');

    if (!token || !userData) {
      router.push('/auth/login');
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      if (!parsedUser.permissions.includes('review_submission')) {
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
      loadSubmissions();
    }
  }, [user, currentPage, filters]);

  const loadSubmissions = async () => {
    setSubmissionsLoading(true);
    try {
      const response = await reviewAPI.getPendingSubmissions({
        page: currentPage,
        limit: 10,
        category: filters.category || undefined,
        submitterType: filters.submitterType || undefined,
        validationStatus: filters.validationStatus || undefined,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder
      });

      setSubmissions(response.submissions);
      setTotalPages(response.totalPages);
      setTotal(response.total);
    } catch (error) {
      console.error('Error loading submissions:', error);
    } finally {
      setSubmissionsLoading(false);
    }
  };

  const handleAssignToSelf = async (submissionId: string) => {
    if (!user) return;
    
    try {
      await reviewAPI.assignReview(submissionId, user.id);
      loadSubmissions(); // Refresh the list
    } catch (error) {
      console.error('Error assigning submission:', error);
    }
  };

  const handleBatchAction = async (action: 'approved' | 'rejected') => {
    if (!user || selectedSubmissions.length === 0) return;

    const comments = prompt(`Please provide ${action} comments for batch action:`);
    if (!comments) return;

    try {
      await reviewAPI.batchReview(selectedSubmissions, action, comments, user.id);
      setSelectedSubmissions([]);
      loadSubmissions();
    } catch (error) {
      console.error('Error performing batch action:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    router.push('/');
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: FiClock, text: 'Pending' },
      under_review: { color: 'bg-blue-100 text-blue-800', icon: FiEye, text: 'Under Review' },
      approved: { color: 'bg-green-100 text-green-800', icon: FiCheck, text: 'Approved' },
      rejected: { color: 'bg-red-100 text-red-800', icon: FiX, text: 'Rejected' },
      revision_required: { color: 'bg-orange-100 text-orange-800', icon: FiEdit, text: 'Needs Revision' }
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    if (!config) return null;

    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.text}
      </span>
    );
  };

  const getCategoryBadge = (category: string) => {
    const colors = {
      biology: 'bg-green-100 text-green-800',
      chemistry: 'bg-blue-100 text-blue-800',
      physics: 'bg-purple-100 text-purple-800',
      environmental: 'bg-emerald-100 text-emerald-800',
      medical: 'bg-red-100 text-red-800',
      other: 'bg-gray-100 text-gray-800'
    };

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${colors[category as keyof typeof colors] || colors.other}`}>
        {category.charAt(0).toUpperCase() + category.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FiLoader className="animate-spin h-12 w-12 text-indigo-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Review Queue</h2>
          <p className="text-gray-600">Please wait while we load pending submissions...</p>
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
              <span className="ml-4 text-sm text-gray-500">Review Queue</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
                Dashboard
              </Link>
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
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Review Queue</h1>
              <p className="text-lg text-gray-600">
                {total} submissions pending review
              </p>
            </div>
            <button
              onClick={() => loadSubmissions()}
              className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 text-sm font-medium text-gray-700"
            >
              <FiRefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="p-4">
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search submissions..."
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
              
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm font-medium"
              >
                <FiFilter className="h-4 w-4 mr-2" />
                Filters
                <FiChevronDown className={`h-4 w-4 ml-2 transform transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>

              {selectedSubmissions.length > 0 && (
                <button
                  onClick={() => setShowBatchActions(!showBatchActions)}
                  className="flex items-center px-4 py-2 bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200 text-sm font-medium"
                >
                  Batch Actions ({selectedSubmissions.length})
                  <FiChevronDown className={`h-4 w-4 ml-2 transform transition-transform ${showBatchActions ? 'rotate-180' : ''}`} />
                </button>
              )}
            </div>

            {/* Filter Options */}
            {showFilters && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 pt-4 border-t">
                <select
                  value={filters.category}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                >
                  <option value="">All Categories</option>
                  <option value="biology">Biology</option>
                  <option value="chemistry">Chemistry</option>
                  <option value="physics">Physics</option>
                  <option value="environmental">Environmental</option>
                  <option value="medical">Medical</option>
                  <option value="other">Other</option>
                </select>

                <select
                  value={filters.submitterType}
                  onChange={(e) => setFilters({ ...filters, submitterType: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                >
                  <option value="">All Submitters</option>
                  <option value="researcher">Researchers</option>
                  <option value="citizen">Citizens</option>
                </select>

                <select
                  value={filters.validationStatus}
                  onChange={(e) => setFilters({ ...filters, validationStatus: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                >
                  <option value="">All Validation Status</option>
                  <option value="not_validated">Not Validated</option>
                  <option value="valid">Valid</option>
                  <option value="invalid">Invalid</option>
                  <option value="needs_review">Needs Review</option>
                </select>

                <select
                  value={filters.sortBy}
                  onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                >
                  <option value="createdAt">Date Submitted</option>
                  <option value="title">Title</option>
                  <option value="category">Category</option>
                  <option value="submitterType">Submitter Type</option>
                </select>

                <select
                  value={filters.sortOrder}
                  onChange={(e) => setFilters({ ...filters, sortOrder: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                >
                  <option value="asc">Ascending</option>
                  <option value="desc">Descending</option>
                </select>
              </div>
            )}

            {/* Batch Actions */}
            {showBatchActions && selectedSubmissions.length > 0 && (
              <div className="mt-4 flex items-center space-x-4 pt-4 border-t">
                <span className="text-sm text-gray-600">Selected {selectedSubmissions.length} submissions:</span>
                <button
                  onClick={() => handleBatchAction('approved')}
                  className="flex items-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium"
                >
                  <FiCheck className="h-4 w-4 mr-1" />
                  Batch Approve
                </button>
                <button
                  onClick={() => handleBatchAction('rejected')}
                  className="flex items-center px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm font-medium"
                >
                  <FiX className="h-4 w-4 mr-1" />
                  Batch Reject
                </button>
                <button
                  onClick={() => setSelectedSubmissions([])}
                  className="text-sm text-gray-600 hover:text-gray-800"
                >
                  Clear Selection
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Submissions List */}
        <div className="bg-white rounded-lg shadow-sm border">
          {submissionsLoading ? (
            <div className="p-8 text-center">
              <FiLoader className="animate-spin h-8 w-8 text-indigo-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading submissions...</p>
            </div>
          ) : submissions.length === 0 ? (
            <div className="p-8 text-center">
              <FiClock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No pending submissions</h3>
              <p className="text-gray-600">All submissions have been reviewed or there are no submissions to review.</p>
            </div>
          ) : (
            <>
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b bg-gray-50 text-sm font-medium text-gray-700">
                <div className="col-span-1">
                  <input
                    type="checkbox"
                    checked={selectedSubmissions.length === submissions.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedSubmissions(submissions.map(s => s.id));
                      } else {
                        setSelectedSubmissions([]);
                      }
                    }}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                </div>
                <div className="col-span-4">Title</div>
                <div className="col-span-2">Category</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-2">Submitted</div>
                <div className="col-span-1">Actions</div>
              </div>

              {/* Table Body */}
              {submissions.map((submission) => (
                <div key={submission.id} className="grid grid-cols-12 gap-4 px-6 py-4 border-b hover:bg-gray-50 items-center">
                  <div className="col-span-1">
                    <input
                      type="checkbox"
                      checked={selectedSubmissions.includes(submission.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedSubmissions([...selectedSubmissions, submission.id]);
                        } else {
                          setSelectedSubmissions(selectedSubmissions.filter(id => id !== submission.id));
                        }
                      }}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                  </div>
                  
                  <div className="col-span-4">
                    <div className="font-medium text-gray-900 mb-1">{submission.title}</div>
                    <div className="text-sm text-gray-600 line-clamp-2">{submission.description}</div>
                    <div className="flex items-center mt-2 text-sm text-gray-500">
                      <FiUser className="h-3 w-3 mr-1" />
                      {submission.submittedBy?.firstName} {submission.submittedBy?.lastName}
                      {submission.submittedBy?.organization && (
                        <span className="ml-2">• {submission.submittedBy.organization}</span>
                      )}
                    </div>
                  </div>

                  <div className="col-span-2">
                    {getCategoryBadge(submission.category)}
                    <div className="mt-1 text-xs text-gray-500 capitalize">
                      {submission.submitterType}
                    </div>
                  </div>

                  <div className="col-span-2">
                    {getStatusBadge(submission.status)}
                    {submission.validationErrors.length > 0 && (
                      <div className="flex items-center mt-1 text-xs text-orange-600">
                        <FiAlertCircle className="h-3 w-3 mr-1" />
                        {submission.validationErrors.length} validation issues
                      </div>
                    )}
                  </div>

                  <div className="col-span-2 text-sm text-gray-600">
                    {new Date(submission.createdAt).toLocaleDateString()}
                    <div className="text-xs text-gray-500">
                      {new Date(submission.createdAt).toLocaleTimeString()}
                    </div>
                  </div>

                  <div className="col-span-1">
                    <div className="flex items-center space-x-2">
                      <Link
                        href={`/dashboard/review/${submission.id}`}
                        className="p-2 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-md"
                        title="Review Submission"
                      >
                        <FiEye className="h-4 w-4" />
                      </Link>
                      
                      {submission.status === 'pending' && (
                        <button
                          onClick={() => handleAssignToSelf(submission.id)}
                          className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md"
                          title="Assign to Self"
                        >
                          <FiExternalLink className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, total)} of {total} results
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </button>
              
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-2 text-sm font-medium rounded-md ${
                        currentPage === page
                          ? 'bg-indigo-600 text-white'
                          : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <FiChevronRight className="h-4 w-4 ml-1" />
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
} 