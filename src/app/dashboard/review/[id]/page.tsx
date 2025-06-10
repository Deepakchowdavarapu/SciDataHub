'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { 
  FiDatabase, 
  FiUser, 
  FiLogOut, 
  FiArrowLeft,
  FiCheck,
  FiX,
  FiEdit,
  FiDownload,
  FiExternalLink,
  FiAlertCircle,
  FiLoader,
  FiCalendar,
  FiMapPin,
  FiFileText,
  FiBarChart,
  FiStar,
  FiClock,
  FiEye,
  FiInfo
} from 'react-icons/fi';
import { reviewAPI } from '@/lib/api';
import { Submission, User as UserType, ReviewRequest } from '@/types';

interface ReviewMetadata {
  dataIntegrity: {
    hasValidationErrors: boolean;
    errorCount: number;
    warningCount: number;
  };
  submissionAge: {
    days: number;
    hours: number;
  };
  dataSize: {
    recordCount: number;
    fields: number;
  };
}

export default function ReviewSubmissionPage() {
  const router = useRouter();
  const params = useParams();
  const submissionId = params.id as string;
  
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [reviewMetadata, setReviewMetadata] = useState<ReviewMetadata | null>(null);
  const [submissionLoading, setSubmissionLoading] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(false);
  
  const [reviewDecision, setReviewDecision] = useState<'approved' | 'rejected' | 'revision_required'>('approved');
  const [reviewComments, setReviewComments] = useState('');
  const [suggestedChanges, setSuggestedChanges] = useState('');
  const [showReviewForm, setShowReviewForm] = useState(false);

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
    if (user && submissionId) {
      loadSubmission();
    }
  }, [user, submissionId]);

  const loadSubmission = async () => {
    setSubmissionLoading(true);
    try {
      const response = await reviewAPI.getSubmissionForReview(submissionId);
      setSubmission(response.submission);
      setReviewMetadata(response.reviewMetadata);
    } catch (error) {
      console.error('Error loading submission:', error);
      // If submission not found or not accessible, redirect back
      router.push('/dashboard/review');
    } finally {
      setSubmissionLoading(false);
    }
  };

  const handleAssignToSelf = async () => {
    if (!user || !submission) return;
    
    try {
      await reviewAPI.assignReview(submission.id, user.id);
      loadSubmission(); // Refresh the submission data
    } catch (error) {
      console.error('Error assigning submission:', error);
    }
  };

  const handleSubmitReview = async () => {
    if (!user || !submission) return;
    
    setReviewLoading(true);
    try {
      const reviewData: ReviewRequest = {
        reviewerId: user.id,
        decision: reviewDecision,
        comments: reviewComments,
        suggestedChanges: reviewDecision === 'revision_required' ? suggestedChanges : undefined
      };

      await reviewAPI.submitReview(submission.id, reviewData);
      router.push('/dashboard/review'); // Redirect back to review queue
    } catch (error) {
      console.error('Error submitting review:', error);
    } finally {
      setReviewLoading(false);
    }
  };

  const handleReleaseSubmission = async () => {
    if (!user || !submission) return;
    
    try {
      await reviewAPI.releaseSubmission(submission.id, user.id);
      loadSubmission(); // Refresh the submission data
    } catch (error) {
      console.error('Error releasing submission:', error);
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
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        <Icon className="w-4 h-4 mr-2" />
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
      <span className={`inline-flex items-center px-3 py-1 rounded-md text-sm font-medium ${colors[category as keyof typeof colors] || colors.other}`}>
        {category.charAt(0).toUpperCase() + category.slice(1)}
      </span>
    );
  };

  const renderDataPreview = () => {
    if (!submission?.data) return null;

    const data = submission.data;
    
    if (Array.isArray(data)) {
      // CSV/Excel data
      const sample = data.slice(0, 5); // Show first 5 rows
      const headers = sample.length > 0 ? Object.keys(sample[0]) : [];
      
      return (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {headers.map((header, idx) => (
                  <th key={idx} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sample.map((row, idx) => (
                <tr key={idx}>
                  {headers.map((header, cellIdx) => (
                    <td key={cellIdx} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {String(row[header] || '')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {data.length > 5 && (
            <p className="text-sm text-gray-500 mt-2 text-center">
              Showing 5 of {data.length} rows
            </p>
          )}
        </div>
      );
    } else {
      // Form data
      return (
        <div className="space-y-4">
          {Object.entries(data).map(([key, value]) => (
            <div key={key} className="border-b pb-2">
              <dt className="text-sm font-medium text-gray-500 capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </dt>
              <dd className="mt-1 text-sm text-gray-900">
                {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
              </dd>
            </div>
          ))}
        </div>
      );
    }
  };

  if (loading || submissionLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FiLoader className="animate-spin h-12 w-12 text-indigo-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Submission</h2>
          <p className="text-gray-600">Please wait while we load the submission details...</p>
        </div>
      </div>
    );
  }

  if (!user || !submission) {
    return null;
  }

  const isAssignedToUser = submission.reviewedBy?.id === user.id;
  const canReview = submission.status === 'under_review' && isAssignedToUser;
  const canAssign = submission.status === 'pending';

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
              <span className="ml-4 text-sm text-gray-500">Review Submission</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/dashboard/review" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
                Review Queue
              </Link>
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
        {/* Back Button */}
        <div className="mb-6">
          <Link
            href="/dashboard/review"
            className="flex items-center text-indigo-600 hover:text-indigo-800 text-sm font-medium"
          >
            <FiArrowLeft className="h-4 w-4 mr-2" />
            Back to Review Queue
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Submission Header */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">{submission.title}</h1>
                  <div className="flex items-center space-x-4">
                    {getStatusBadge(submission.status)}
                    {getCategoryBadge(submission.category)}
                  </div>
                </div>
                <div className="text-right text-sm text-gray-500">
                  Submitted {new Date(submission.createdAt).toLocaleDateString()}
                </div>
              </div>
              
              <p className="text-gray-700 leading-relaxed">{submission.description}</p>

              {/* Submitter Info */}
              <div className="mt-6 flex items-center justify-between pt-6 border-t">
                <div className="flex items-center">
                  <FiUser className="h-5 w-5 text-gray-400 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {submission.submittedBy?.firstName} {submission.submittedBy?.lastName}
                    </p>
                    <p className="text-sm text-gray-500">
                      {submission.submittedBy?.organization || 'Independent Researcher'}
                      <span className="ml-2 capitalize">• {submission.submitterType}</span>
                    </p>
                  </div>
                </div>
                
                {submission.reviewedBy && (
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Assigned to:</p>
                    <p className="text-sm font-medium text-gray-900">
                      {submission.reviewedBy.firstName} {submission.reviewedBy.lastName}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Validation Issues */}
            {submission.validationErrors.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <FiAlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
                  <h3 className="text-lg font-medium text-yellow-800">Validation Issues</h3>
                </div>
                <div className="space-y-3">
                  {submission.validationErrors.map((error, idx) => (
                    <div key={idx} className="flex items-start">
                      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mr-3 ${
                        error.severity === 'error' ? 'bg-red-100 text-red-800' :
                        error.severity === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {error.severity}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{error.field}</p>
                        <p className="text-sm text-gray-600">{error.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Research Details */}
            {submission.metadata && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Research Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {submission.metadata.methodology && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Methodology</dt>
                      <dd className="mt-1 text-sm text-gray-900">{submission.metadata.methodology}</dd>
                    </div>
                  )}
                  
                  {submission.metadata.equipment && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Equipment</dt>
                      <dd className="mt-1 text-sm text-gray-900">{submission.metadata.equipment}</dd>
                    </div>
                  )}
                  
                  {submission.metadata.sampleSize && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Sample Size</dt>
                      <dd className="mt-1 text-sm text-gray-900">{submission.metadata.sampleSize}</dd>
                    </div>
                  )}
                  
                  {submission.metadata.units && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Units</dt>
                      <dd className="mt-1 text-sm text-gray-900">{submission.metadata.units}</dd>
                    </div>
                  )}
                  
                  {submission.metadata.location && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Location</dt>
                      <dd className="mt-1 text-sm text-gray-900 flex items-center">
                        <FiMapPin className="h-4 w-4 mr-1" />
                        {submission.metadata.location.address || 
                         `${submission.metadata.location.latitude}, ${submission.metadata.location.longitude}`}
                      </dd>
                    </div>
                  )}
                  
                  {submission.metadata.timestamp && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Data Collection Date</dt>
                      <dd className="mt-1 text-sm text-gray-900 flex items-center">
                        <FiCalendar className="h-4 w-4 mr-1" />
                        {new Date(submission.metadata.timestamp).toLocaleDateString()}
                      </dd>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Data Preview */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Data Preview</h3>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  {reviewMetadata && (
                    <>
                      <span className="flex items-center">
                        <FiBarChart className="h-4 w-4 mr-1" />
                        {reviewMetadata.dataSize.recordCount} records
                      </span>
                      <span className="flex items-center">
                        <FiFileText className="h-4 w-4 mr-1" />
                        {reviewMetadata.dataSize.fields} fields
                      </span>
                    </>
                  )}
                </div>
              </div>
              <div className="border rounded-lg overflow-hidden">
                {renderDataPreview()}
              </div>
            </div>

            {/* Files */}
            {submission.fileUrls && submission.fileUrls.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Attached Files</h3>
                <div className="space-y-3">
                  {submission.fileUrls.map((file, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <FiFileText className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{file.originalName}</p>
                          <p className="text-sm text-gray-500">
                            {file.mimetype} • {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center px-3 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-800"
                      >
                        <FiDownload className="h-4 w-4 mr-1" />
                        Download
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Review Actions */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Review Actions</h3>
              
              {canAssign && (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">This submission is pending assignment.</p>
                  <button
                    onClick={handleAssignToSelf}
                    className="w-full flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm font-medium"
                  >
                    <FiExternalLink className="h-4 w-4 mr-2" />
                    Assign to Me
                  </button>
                </div>
              )}

              {isAssignedToUser && submission.status === 'under_review' && (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">You are assigned to review this submission.</p>
                  
                  {!showReviewForm ? (
                    <div className="space-y-3">
                      <button
                        onClick={() => setShowReviewForm(true)}
                        className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium"
                      >
                        <FiCheck className="h-4 w-4 mr-2" />
                        Submit Review
                      </button>
                      <button
                        onClick={handleReleaseSubmission}
                        className="w-full flex items-center justify-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm font-medium"
                      >
                        Release Assignment
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Decision</label>
                        <select
                          value={reviewDecision}
                          onChange={(e) => setReviewDecision(e.target.value as any)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                        >
                          <option value="approved">Approve</option>
                          <option value="rejected">Reject</option>
                          <option value="revision_required">Request Revision</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Comments</label>
                        <textarea
                          value={reviewComments}
                          onChange={(e) => setReviewComments(e.target.value)}
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                          placeholder="Provide detailed feedback about your review decision..."
                          required
                        />
                      </div>

                      {reviewDecision === 'revision_required' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Suggested Changes</label>
                          <textarea
                            value={suggestedChanges}
                            onChange={(e) => setSuggestedChanges(e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                            placeholder="List specific changes the submitter should make..."
                          />
                        </div>
                      )}

                      <div className="flex space-x-3">
                        <button
                          onClick={handleSubmitReview}
                          disabled={reviewLoading || !reviewComments.trim()}
                          className="flex-1 flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {reviewLoading ? (
                            <FiLoader className="animate-spin h-4 w-4 mr-2" />
                          ) : (
                            <FiCheck className="h-4 w-4 mr-2" />
                          )}
                          Submit
                        </button>
                        <button
                          onClick={() => setShowReviewForm(false)}
                          className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 text-sm font-medium"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {!canAssign && !isAssignedToUser && (
                <p className="text-sm text-gray-600">
                  This submission is assigned to another reviewer or already reviewed.
                </p>
              )}
            </div>

            {/* Submission Statistics */}
            {reviewMetadata && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Submission Statistics</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Age</span>
                    <span className="text-sm font-medium text-gray-900">
                      {reviewMetadata.submissionAge.days} days
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Data Records</span>
                    <span className="text-sm font-medium text-gray-900">
                      {reviewMetadata.dataSize.recordCount.toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Data Fields</span>
                    <span className="text-sm font-medium text-gray-900">
                      {reviewMetadata.dataSize.fields}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Validation Issues</span>
                    <span className={`text-sm font-medium ${
                      reviewMetadata.dataIntegrity.errorCount > 0 ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {reviewMetadata.dataIntegrity.errorCount} errors, {reviewMetadata.dataIntegrity.warningCount} warnings
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Previous Review Comments */}
            {submission.reviewComments && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Previous Review</h3>
                <div className="text-sm text-gray-700 whitespace-pre-wrap">
                  {submission.reviewComments}
                </div>
                {submission.reviewDate && (
                  <p className="text-xs text-gray-500 mt-3">
                    Reviewed on {new Date(submission.reviewDate).toLocaleDateString()}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
} 