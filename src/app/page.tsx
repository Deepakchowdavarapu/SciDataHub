'use client';

import React from 'react';
import Link from 'next/link';
import { FiDatabase, FiCheckCircle, FiUsers, FiUpload, FiBarChart, FiShield } from 'react-icons/fi';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <main className="mt-16 mx-auto max-w-7xl px-4 sm:mt-24 sm:px-6 lg:mt-32">
          <div className="text-center">
            <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
              <span className="block">Scientific Data</span>
              <span className="block text-indigo-600">Collection Platform</span>
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              Streamline your research with our comprehensive platform for collecting, validating, and retrieving scientific data. 
              Built for researchers and citizen scientists.
            </p>
            <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
              <div className="rounded-md shadow">
                <Link 
                  href="/auth/register"
                  className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10 transition-colors"
                >
                  Get Started
                </Link>
              </div>
              <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
                <Link 
                  href="/public/explore"
                  className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10 transition-colors"
                >
                  Explore Data
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Powerful Features for Scientific Research
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
              Everything you need to collect, validate, and share scientific data effectively.
            </p>
          </div>

          <div className="mt-16">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {/* Feature 1 */}
              <div className="pt-6">
                <div className="flow-root bg-gray-50 rounded-lg px-6 pb-8">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-indigo-500 rounded-md shadow-lg">
                        <FiUpload className="h-6 w-6 text-white" />
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">Easy Data Submission</h3>
                    <p className="mt-5 text-base text-gray-500">
                      Submit data through intuitive forms or upload CSV/Excel files. Support for various data formats and validation.
                    </p>
                  </div>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="pt-6">
                <div className="flow-root bg-gray-50 rounded-lg px-6 pb-8">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-indigo-500 rounded-md shadow-lg">
                        <FiCheckCircle className="h-6 w-6 text-white" />
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">Automated Validation</h3>
                    <p className="mt-5 text-base text-gray-500">
                      Intelligent data validation ensures quality and consistency. Real-time error detection and suggestions.
                    </p>
                  </div>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="pt-6">
                <div className="flow-root bg-gray-50 rounded-lg px-6 pb-8">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-indigo-500 rounded-md shadow-lg">
                        <FiUsers className="h-6 w-6 text-white" />
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">Expert Review System</h3>
                    <p className="mt-5 text-base text-gray-500">
                      Peer review process with qualified reviewers ensures data accuracy and scientific rigor.
                    </p>
                  </div>
                </div>
              </div>

              {/* Feature 4 */}
              <div className="pt-6">
                <div className="flow-root bg-gray-50 rounded-lg px-6 pb-8">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-indigo-500 rounded-md shadow-lg">
                        <FiBarChart className="h-6 w-6 text-white" />
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">Analytics & Insights</h3>
                    <p className="mt-5 text-base text-gray-500">
                      Comprehensive analytics dashboard with data visualization and export capabilities.
                    </p>
                  </div>
                </div>
              </div>

              {/* Feature 5 */}
              <div className="pt-6">
                <div className="flow-root bg-gray-50 rounded-lg px-6 pb-8">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-indigo-500 rounded-md shadow-lg">
                        <FiShield className="h-6 w-6 text-white" />
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">Secure & Compliant</h3>
                    <p className="mt-5 text-base text-gray-500">
                      Enterprise-grade security with role-based access control and data privacy compliance.
                    </p>
                  </div>
                </div>
              </div>

              {/* Feature 6 */}
              <div className="pt-6">
                <div className="flow-root bg-gray-50 rounded-lg px-6 pb-8">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-indigo-500 rounded-md shadow-lg">
                        <FiDatabase className="h-6 w-6 text-white" />
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">Open Science Support</h3>
                    <p className="mt-5 text-base text-gray-500">
                      Support for open science initiatives with public data sharing and collaboration features.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* User Types Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Built for Every Type of Contributor
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
              Whether you&apos;re a professional researcher or a citizen scientist, we have tools for you.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {/* Researcher */}
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiUsers className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Researchers</h3>
              <p className="text-gray-600 text-sm">
                Professional researchers and academics with advanced data submission and analysis capabilities.
              </p>
            </div>

            {/* Reviewer */}
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiCheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Reviewers</h3>
              <p className="text-gray-600 text-sm">
                Expert reviewers who validate and approve scientific data submissions.
              </p>
            </div>

            {/* Citizen Scientist */}
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiUpload className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Citizen Scientists</h3>
              <p className="text-gray-600 text-sm">
                Public contributors who help collect valuable scientific observations and measurements.
              </p>
            </div>

            {/* Admin */}
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiShield className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Administrators</h3>
              <p className="text-gray-600 text-sm">
                Platform administrators who manage users, data, and system operations.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-indigo-700">
        <div className="max-w-2xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            <span className="block">Ready to start contributing?</span>
            <span className="block">Join the scientific community today.</span>
          </h2>
          <p className="mt-4 text-lg leading-6 text-indigo-200">
            Create your account and start submitting valuable scientific data that can help advance research and knowledge.
          </p>
          <Link
            href="/auth/register"
            className="mt-8 w-full inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50 sm:w-auto transition-colors"
          >
            Get Started Now
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 md:flex md:items-center md:justify-between lg:px-8">
          <div className="flex justify-center space-x-6 md:order-2">
            <p className="text-base text-gray-400">
              Built with ❤️ for the scientific community
            </p>
          </div>
          <div className="mt-8 md:mt-0 md:order-1">
            <p className="text-center text-base text-gray-400">
              &copy; 2025 SciDataHub. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
