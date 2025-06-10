'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { 
  FiDatabase, 
  FiArrowLeft, 
  FiDownload, 
  FiCalendar, 
  FiUser, 
  FiTag, 
  FiMapPin, 
  FiFileText,
  FiBarChart,
  FiLoader,
  FiAlertCircle,
  FiCheckCircle,
  FiEye,
  FiTrendingUp,
  FiStar,
  FiShare2,
  FiHeart,
  FiUsers
} from 'react-icons/fi';
import { dataAPI } from '@/lib/api';
import { Submission } from '@/types';

interface Dataset {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  submitter: {
    name: string;
    organization?: string;
    email?: string;
  };
  submissionDate: string;
  dataType: string;
  methodology?: string;
  location?: string;
  sampleSize?: string;
  keyFindings?: string;
  limitations?: string;
  downloadCount: number;
  rating: number;
  size: string;
  format: string;
  isVerified: boolean;
  isPublic: boolean;
  fileInfo?: {
    name: string;
    size: string;
    format: string;
  };
}

export default function DatasetDetailPage() {
  const params = useParams();
  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);

  // Sample data - In real app, this would be fetched based on ID
  const sampleDataset: Dataset = {
    id: '1',
    title: 'Climate Temperature Measurements 2023',
    description: `This comprehensive dataset contains temperature measurements collected from weather stations across North America during 2023. The data includes hourly temperature readings, daily averages, and monthly summaries from over 500 weather stations distributed across the United States and Canada.

The dataset was compiled as part of a multi-institutional climate monitoring initiative aimed at understanding regional temperature variations and long-term climate trends. All measurements have been quality-controlled and validated against known meteorological standards.

This dataset is particularly valuable for climate research, agricultural planning, and environmental impact studies. It provides a robust foundation for analyzing temperature patterns, identifying heat waves and cold snaps, and studying the effects of climate change on different regions.`,
    category: 'environmental',
    tags: ['climate', 'temperature', 'weather', 'north-america', 'meteorology', 'environment'],
    submitter: {
      name: 'Dr. Sarah Johnson',
      organization: 'Climate Research Institute',
      email: 'sarah.johnson@climateresearch.org'
    },
    submissionDate: '2023-12-15',
    dataType: 'quantitative',
    methodology: `Temperature data was collected using automated weather stations equipped with digital thermometers calibrated to ±0.1°C accuracy. Measurements were taken every hour and transmitted via satellite communication to central data processing centers. Data underwent automated quality control procedures including range checks, temporal consistency checks, and spatial coherence analysis.`,
    location: 'North America (United States and Canada)',
    sampleSize: '500+ weather stations, ~4.3 million data points',
    keyFindings: `Analysis reveals a warming trend of 0.8°C compared to the 30-year average, with particularly pronounced warming in northern regions. Summer temperatures showed greater variability than historical norms, with increased frequency of extreme heat events.`,
    limitations: `Some gaps in data coverage exist for remote Arctic regions. Urban heat island effects may influence readings from stations in metropolitan areas. Data quality varies by region based on maintenance schedules and equipment age.`,
    downloadCount: 1243,
    rating: 4.8,
    size: '2.3 MB',
    format: 'CSV',
    isVerified: true,
    isPublic: true,
    fileInfo: {
      name: 'climate_temperature_2023.csv',
      size: '2.3 MB',
      format: 'CSV'
    }
  };

  useEffect(() => {
    const loadDataset = async () => {
      setLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setDataset(sampleDataset);
      } catch (err) {
        setError('Failed to load dataset. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadDataset();
  }, [params.id]);

  const handleDownload = async () => {
    if (!dataset) return;
    
    setDownloading(true);
    try {
      // Simulate download process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real app, this would trigger an actual file download
      console.log('Downloading dataset:', dataset.id);
      
      // Update download count
      setDataset(prev => prev ? { ...prev, downloadCount: prev.downloadCount + 1 } : null);
      
    } catch (err) {
      console.error('Download failed:', err);
    } finally {
      setDownloading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<FiStar key={i} className="h-5 w-5 text-yellow-400 fill-current" />);
    }

    if (hasHalfStar) {
      stars.push(<FiStar key="half" className="h-5 w-5 text-yellow-400 fill-current opacity-50" />);
    }

    return stars;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FiLoader className="animate-spin h-12 w-12 text-indigo-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Dataset</h2>
          <p className="text-gray-600">Please wait while we fetch the data...</p>
        </div>
      </div>
    );
  }

  if (error || !dataset) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FiDatabase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Dataset Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'The requested dataset could not be found.'}</p>
          <Link
            href="/public/explore"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            <FiArrowLeft className="h-4 w-4 mr-2" />
            Back to Browse
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Content - removed duplicate header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Navigation */}
        <div className="mb-6">
          <Link
            href="/public/explore"
            className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
          >
            <FiArrowLeft className="h-4 w-4 mr-2" />
            Back to Browse Datasets
          </Link>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Dataset Header */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <h1 className="text-2xl font-bold text-gray-900 mr-3">{dataset.title}</h1>
                    {dataset.isVerified && (
                      <div className="flex items-center bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                        <FiCheckCircle className="h-3 w-3 mr-1" />
                        Verified
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                    <div className="flex items-center">
                      <FiUser className="h-4 w-4 mr-1" />
                      {dataset.submitter.name}
                      {dataset.submitter.organization && (
                        <span className="ml-1">• {dataset.submitter.organization}</span>
                      )}
                    </div>
                    <div className="flex items-center">
                      <FiCalendar className="h-4 w-4 mr-1" />
                      {formatDate(dataset.submissionDate)}
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 mb-4">
                    <div className="flex items-center">
                      {renderStars(dataset.rating)}
                      <span className="ml-2 text-sm font-medium text-gray-700">{dataset.rating}</span>
                      <span className="ml-1 text-sm text-gray-500">({dataset.downloadCount} downloads)</span>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2">
                    {dataset.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                      >
                        <FiTag className="h-3 w-3 mr-1" />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Description</h2>
              <div className="prose prose-sm max-w-none text-gray-700">
                {dataset.description.split('\n\n').map((paragraph, index) => (
                  <p key={index} className="mb-4 last:mb-0">{paragraph}</p>
                ))}
              </div>
            </div>

            {/* Methodology */}
            {dataset.methodology && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Methodology</h2>
                <p className="text-gray-700">{dataset.methodology}</p>
              </div>
            )}

            {/* Key Findings */}
            {dataset.keyFindings && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Key Findings</h2>
                <p className="text-gray-700">{dataset.keyFindings}</p>
              </div>
            )}

            {/* Limitations */}
            {dataset.limitations && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Limitations</h2>
                <p className="text-gray-700">{dataset.limitations}</p>
              </div>
            )}
          </div>

          {/* Right Column - Download & Info */}
          <div className="space-y-6">
            {/* Download Section */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Download Dataset</h3>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">File Format</span>
                  <span className="font-medium text-gray-900">{dataset.format}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">File Size</span>
                  <span className="font-medium text-gray-900">{dataset.size}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Downloads</span>
                  <span className="font-medium text-gray-900">{dataset.downloadCount.toLocaleString()}</span>
                </div>
              </div>

              <button
                onClick={handleDownload}
                disabled={downloading}
                className="w-full bg-indigo-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                {downloading ? (
                  <>
                    <FiLoader className="animate-spin h-4 w-4 mr-2" />
                    Downloading...
                  </>
                ) : (
                  <>
                    <FiDownload className="h-4 w-4 mr-2" />
                    Download Dataset
                  </>
                )}
              </button>

              <div className="mt-4 flex space-x-2">
                <button className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center">
                  <FiHeart className="h-4 w-4 mr-2" />
                  Save
                </button>
                <button className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center">
                  <FiShare2 className="h-4 w-4 mr-2" />
                  Share
                </button>
              </div>
            </div>

            {/* Dataset Information */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Dataset Information</h3>
              
              <div className="space-y-4">
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-1">Category</div>
                  <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                    {dataset.category}
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium text-gray-700 mb-1">Data Type</div>
                  <div className="text-sm text-gray-900 capitalize">{dataset.dataType}</div>
                </div>

                {dataset.location && (
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-1">Location</div>
                    <div className="flex items-start">
                      <FiMapPin className="h-4 w-4 text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
                      <div className="text-sm text-gray-900">{dataset.location}</div>
                    </div>
                  </div>
                )}

                {dataset.sampleSize && (
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-1">Sample Size</div>
                    <div className="text-sm text-gray-900">{dataset.sampleSize}</div>
                  </div>
                )}

                <div>
                  <div className="text-sm font-medium text-gray-700 mb-1">Visibility</div>
                  <div className="text-sm text-gray-900">{dataset.isPublic ? 'Public' : 'Private'}</div>
                </div>
              </div>
            </div>

            {/* Submitter Information */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Submitted By</h3>
              
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <FiUser className="h-5 w-5 text-indigo-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900">{dataset.submitter.name}</div>
                  {dataset.submitter.organization && (
                    <div className="text-sm text-gray-600">{dataset.submitter.organization}</div>
                  )}
                  {dataset.submitter.email && (
                    <div className="text-sm text-indigo-600 hover:text-indigo-800">
                      <a href={`mailto:${dataset.submitter.email}`}>{dataset.submitter.email}</a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 