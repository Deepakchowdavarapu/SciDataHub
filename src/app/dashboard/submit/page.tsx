'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DataSubmissionForm from '@/components/forms/DataSubmissionForm';
import { getUserData, getAuthToken } from '@/lib/api';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  organization?: string;
  permissions: string[];
}

export default function DataSubmissionPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check authentication
    const token = getAuthToken();
    const userData = getUserData();

    if (!token || !userData) {
      router.push('/auth/login');
      return;
    }

    setUser(userData);
    setLoading(false);
  }, [router]);

  const handleSubmission = async (formData: FormData) => {
    try {
      // Add user ID to submission
      formData.append('submitterId', user!.id);

      const token = getAuthToken();
      const response = await fetch('/api/data/submit', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Submission failed');
      }

      // Show success message and redirect
      alert('Data submitted successfully! Your submission is now pending review.');
      router.push('/dashboard/submissions');
    } catch (error) {
      console.error('Submission error:', error);
      throw error; // Re-throw to let the form handle the error
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Submit Scientific Data</h1>
          <p className="mt-2 text-gray-600">
            Share your research data with the scientific community. Your submission will be reviewed before publication.
          </p>
        </div>

        {/* User Info */}
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center">
              <span className="text-sm font-medium text-white">
                {user.firstName.charAt(0)}{user.lastName.charAt(0)}
              </span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">
                Submitting as: {user.firstName} {user.lastName}
              </p>
              <p className="text-sm text-gray-500">
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)} • {user.organization || 'Independent Researcher'}
              </p>
            </div>
          </div>
        </div>

        {/* Submission Form */}
        <DataSubmissionForm onSubmit={handleSubmission} />
      </div>
    </div>
  );
} 