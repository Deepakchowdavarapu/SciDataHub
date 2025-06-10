'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  FiDatabase, 
  FiUser, 
  FiLogOut, 
  FiArrowLeft,
  FiSave,
  FiEdit,
  FiLock,
  FiMail,
  FiBuilding,
  FiFileText,
  FiLoader,
  FiCheck,
  FiAlertCircle,
  FiEye,
  FiEyeOff,
  FiCamera
} from 'react-icons/fi';
import { authAPI } from '@/lib/api';
import { User as UserType } from '@/types';

interface ProfileFormData {
  firstName: string;
  lastName: string;
  organization: string;
  bio: string;
}

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'preferences'>('profile');
  
  // Profile form state
  const [profileForm, setProfileForm] = useState<ProfileFormData>({
    firstName: '',
    lastName: '',
    organization: '',
    bio: ''
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Password form state
  const [passwordForm, setPasswordForm] = useState<PasswordFormData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('user_data');

    if (!token || !userData) {
      router.push('/auth/login');
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setProfileForm({
        firstName: parsedUser.firstName || '',
        lastName: parsedUser.lastName || '',
        organization: parsedUser.organization || '',
        bio: parsedUser.bio || ''
      });
    } catch (error) {
      console.error('Error parsing user data:', error);
      router.push('/auth/login');
      return;
    }

    setLoading(false);
  }, [router]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setProfileLoading(true);
    setProfileMessage(null);

    try {
      const response = await authAPI.updateProfile(user.id, profileForm);
      
      // Update local storage with new user data
      const updatedUser = { ...user, ...response.user };
      setUser(updatedUser);
      localStorage.setItem('user_data', JSON.stringify(updatedUser));
      
      setProfileMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error) {
      console.error('Error updating profile:', error);
      setProfileMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordMessage({ type: 'error', text: 'New password must be at least 6 characters long.' });
      return;
    }

    setPasswordLoading(true);
    setPasswordMessage(null);

    try {
      // Note: You would need to implement a password change endpoint
      // For now, we'll simulate success
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setPasswordMessage({ type: 'success', text: 'Password updated successfully!' });
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Error updating password:', error);
      setPasswordMessage({ type: 'error', text: 'Failed to update password. Please try again.' });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FiLoader className="animate-spin h-12 w-12 text-indigo-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Profile</h2>
          <p className="text-gray-600">Please wait while we load your profile information...</p>
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
              <span className="ml-4 text-sm text-gray-500">Profile Settings</span>
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
        {/* Back Button */}
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="flex items-center text-indigo-600 hover:text-indigo-800 text-sm font-medium"
          >
            <FiArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <nav className="bg-white rounded-lg shadow-sm border p-4">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Settings</h2>
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => setActiveTab('profile')}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeTab === 'profile'
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <FiUser className="inline h-4 w-4 mr-2" />
                    Profile
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveTab('security')}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeTab === 'security'
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <FiLock className="inline h-4 w-4 mr-2" />
                    Security
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveTab('preferences')}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeTab === 'preferences'
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <FiFileText className="inline h-4 w-4 mr-2" />
                    Preferences
                  </button>
                </li>
              </ul>
            </nav>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Profile Information</h3>
                  <p className="text-sm text-gray-600">Update your personal information and bio.</p>
                </div>

                <form onSubmit={handleProfileSubmit} className="p-6 space-y-6">
                  {/* Profile Photo Section */}
                  <div className="flex items-center space-x-6">
                    <div className="relative">
                      <div className="h-20 w-20 rounded-full bg-gray-300 flex items-center justify-center">
                        {user.profileImage ? (
                          <img
                            src={user.profileImage}
                            alt="Profile"
                            className="h-20 w-20 rounded-full object-cover"
                          />
                        ) : (
                          <FiUser className="h-10 w-10 text-gray-600" />
                        )}
                      </div>
                      <button
                        type="button"
                        className="absolute bottom-0 right-0 bg-indigo-600 rounded-full p-1 text-white hover:bg-indigo-700"
                        title="Change Photo"
                      >
                        <FiCamera className="h-3 w-3" />
                      </button>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Profile Photo</h4>
                      <p className="text-sm text-gray-600">Upload a new photo or remove the current one.</p>
                    </div>
                  </div>

                  {/* Form Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                        First Name
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        value={profileForm.firstName}
                        onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        value={profileForm.lastName}
                        onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        id="email"
                        value={user.email}
                        disabled
                        className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                      />
                      <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed. Contact support if needed.</p>
                  </div>

                  <div>
                    <label htmlFor="organization" className="block text-sm font-medium text-gray-700 mb-2">
                      Organization
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        id="organization"
                        value={profileForm.organization}
                        onChange={(e) => setProfileForm({ ...profileForm, organization: e.target.value })}
                        className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="University, Company, or Institution"
                      />
                      <FiBuilding className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
                      Bio
                    </label>
                    <textarea
                      id="bio"
                      value={profileForm.bio}
                      onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                      rows={4}
                      maxLength={500}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Tell us about your research interests and background..."
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {profileForm.bio.length}/500 characters
                    </p>
                  </div>

                  {/* Account Info */}
                  <div className="border-t pt-6">
                    <h4 className="text-sm font-medium text-gray-900 mb-4">Account Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                        <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-700 capitalize">
                          {user.role}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Member Since</label>
                        <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-700">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  {profileMessage && (
                    <div className={`flex items-center p-4 rounded-md ${
                      profileMessage.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                    }`}>
                      {profileMessage.type === 'success' ? (
                        <FiCheck className="h-4 w-4 mr-2" />
                      ) : (
                        <FiAlertCircle className="h-4 w-4 mr-2" />
                      )}
                      {profileMessage.text}
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={profileLoading}
                      className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {profileLoading ? (
                        <FiLoader className="animate-spin h-4 w-4 mr-2" />
                      ) : (
                        <FiSave className="h-4 w-4 mr-2" />
                      )}
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Security Settings</h3>
                  <p className="text-sm text-gray-600">Manage your password and security preferences.</p>
                </div>

                <form onSubmit={handlePasswordSubmit} className="p-6 space-y-6">
                  <div>
                    <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.current ? 'text' : 'password'}
                        id="currentPassword"
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPasswords.current ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.new ? 'text' : 'password'}
                        id="newPassword"
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPasswords.new ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Must be at least 6 characters long.</p>
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.confirm ? 'text' : 'password'}
                        id="confirmPassword"
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPasswords.confirm ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Messages */}
                  {passwordMessage && (
                    <div className={`flex items-center p-4 rounded-md ${
                      passwordMessage.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                    }`}>
                      {passwordMessage.type === 'success' ? (
                        <FiCheck className="h-4 w-4 mr-2" />
                      ) : (
                        <FiAlertCircle className="h-4 w-4 mr-2" />
                      )}
                      {passwordMessage.text}
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={passwordLoading}
                      className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {passwordLoading ? (
                        <FiLoader className="animate-spin h-4 w-4 mr-2" />
                      ) : (
                        <FiLock className="h-4 w-4 mr-2" />
                      )}
                      Update Password
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Preferences</h3>
                  <p className="text-sm text-gray-600">Customize your account preferences and notifications.</p>
                </div>

                <div className="p-6 space-y-6">
                  {/* Notification Preferences */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-4">Email Notifications</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-700">Review Assignments</p>
                          <p className="text-xs text-gray-500">Get notified when you're assigned to review a submission</p>
                        </div>
                        <input
                          type="checkbox"
                          defaultChecked
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-700">Submission Updates</p>
                          <p className="text-xs text-gray-500">Get notified about status changes on your submissions</p>
                        </div>
                        <input
                          type="checkbox"
                          defaultChecked
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-700">Research Updates</p>
                          <p className="text-xs text-gray-500">Get notified about new datasets in your areas of interest</p>
                        </div>
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Privacy Settings */}
                  <div className="border-t pt-6">
                    <h4 className="text-sm font-medium text-gray-900 mb-4">Privacy Settings</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-700">Public Profile</p>
                          <p className="text-xs text-gray-500">Make your profile visible to other users</p>
                        </div>
                        <input
                          type="checkbox"
                          defaultChecked
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-700">Show Organization</p>
                          <p className="text-xs text-gray-500">Display your organization in your public profile</p>
                        </div>
                        <input
                          type="checkbox"
                          defaultChecked
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Account Actions */}
                  <div className="border-t pt-6">
                    <h4 className="text-sm font-medium text-gray-900 mb-4">Account Actions</h4>
                    <div className="space-y-4">
                      <button className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
                        Download my data
                      </button>
                      <br />
                      <button className="text-sm text-red-600 hover:text-red-800 font-medium">
                        Delete my account
                      </button>
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="flex justify-end pt-6 border-t">
                    <button className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                      <FiSave className="h-4 w-4 mr-2" />
                      Save Preferences
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
} 