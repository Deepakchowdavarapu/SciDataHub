'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  FiDatabase, 
  FiSearch, 
  FiFilter,
  FiDownload,
  FiEye,
  FiCalendar,
  FiUser,
  FiTag,
  FiTrendingUp,
  FiStar,
  FiLoader
} from 'react-icons/fi';

interface Dataset {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  submitter: {
    name: string;
    organization?: string;
  };
  submissionDate: string;
  dataType: string;
  downloadCount: number;
  rating: number;
  size: string;
  format: string;
  isVerified: boolean;
}

export default function ExploreDataPage() {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDataType, setSelectedDataType] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);

  // Sample data - In real app, this would come from API
  const sampleDatasets: Dataset[] = [
    {
      id: '1',
      title: 'Climate Temperature Measurements 2023',
      description: 'Comprehensive temperature data collected from weather stations across North America during 2023.',
      category: 'environmental',
      tags: ['climate', 'temperature', 'weather', 'north-america'],
      submitter: {
        name: 'Dr. Sarah Johnson',
        organization: 'Climate Research Institute'
      },
      submissionDate: '2023-12-15',
      dataType: 'quantitative',
      downloadCount: 1243,
      rating: 4.8,
      size: '2.3 MB',
      format: 'CSV',
      isVerified: true
    },
    {
      id: '2',
      title: 'Marine Biodiversity Survey - Pacific Coast',
      description: 'Species diversity data from marine ecosystems along the Pacific coastline.',
      category: 'biology',
      tags: ['marine', 'biodiversity', 'pacific', 'species'],
      submitter: {
        name: 'Marine Biology Lab',
        organization: 'UC San Diego'
      },
      submissionDate: '2023-11-20',
      dataType: 'mixed',
      downloadCount: 856,
      rating: 4.6,
      size: '5.1 MB',
      format: 'Excel',
      isVerified: true
    },
    {
      id: '3',
      title: 'Chemical Reaction Rates Study',
      description: 'Experimental data on chemical reaction rates under various temperature and pressure conditions.',
      category: 'chemistry',
      tags: ['chemistry', 'reactions', 'kinetics', 'experimental'],
      submitter: {
        name: 'Prof. Michael Chen',
        organization: 'MIT Chemistry Department'
      },
      submissionDate: '2023-10-05',
      dataType: 'quantitative',
      downloadCount: 432,
      rating: 4.4,
      size: '1.8 MB',
      format: 'JSON',
      isVerified: true
    },
    {
      id: '4',
      title: 'Urban Air Quality Monitoring Data',
      description: 'Air pollution measurements from sensors deployed across major urban areas.',
      category: 'environmental',
      tags: ['air-quality', 'pollution', 'urban', 'sensors'],
      submitter: {
        name: 'Environmental Research Group',
        organization: 'Stanford University'
      },
      submissionDate: '2023-09-12',
      dataType: 'quantitative',
      downloadCount: 2156,
      rating: 4.9,
      size: '12.7 MB',
      format: 'CSV',
      isVerified: true
    },
    {
      id: '5',
      title: 'Solar Panel Efficiency Analysis',
      description: 'Performance data from solar panel installations across different geographical locations.',
      category: 'engineering',
      tags: ['solar', 'energy', 'efficiency', 'renewable'],
      submitter: {
        name: 'Dr. Lisa Park',
        organization: 'Renewable Energy Institute'
      },
      submissionDate: '2023-08-28',
      dataType: 'quantitative',
      downloadCount: 678,
      rating: 4.3,
      size: '3.4 MB',
      format: 'Excel',
      isVerified: false
    }
  ];

  useEffect(() => {
    // Simulate loading data
    const loadData = async () => {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setDatasets(sampleDatasets);
      setLoading(false);
    };

    loadData();
  }, []);

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'biology', label: 'Biology' },
    { value: 'chemistry', label: 'Chemistry' },
    { value: 'physics', label: 'Physics' },
    { value: 'environmental', label: 'Environmental Science' },
    { value: 'medical', label: 'Medical Research' },
    { value: 'engineering', label: 'Engineering' },
    { value: 'social', label: 'Social Science' }
  ];

  const dataTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'quantitative', label: 'Quantitative' },
    { value: 'qualitative', label: 'Qualitative' },
    { value: 'mixed', label: 'Mixed Methods' },
    { value: 'observational', label: 'Observational' },
    { value: 'experimental', label: 'Experimental' }
  ];

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'popular', label: 'Most Downloaded' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'title', label: 'Title A-Z' }
  ];

  const filteredDatasets = datasets
    .filter(dataset => {
      const matchesSearch = dataset.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           dataset.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           dataset.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'all' || dataset.category === selectedCategory;
      const matchesDataType = selectedDataType === 'all' || dataset.dataType === selectedDataType;
      
      return matchesSearch && matchesCategory && matchesDataType;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime();
        case 'oldest':
          return new Date(a.submissionDate).getTime() - new Date(b.submissionDate).getTime();
        case 'popular':
          return b.downloadCount - a.downloadCount;
        case 'rating':
          return b.rating - a.rating;
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<FiStar key={i} className="h-4 w-4 text-yellow-400 fill-current" />);
    }

    if (hasHalfStar) {
      stars.push(<FiStar key="half" className="h-4 w-4 text-yellow-400 fill-current opacity-50" />);
    }

    return stars;
  };

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
              <span className="ml-4 text-sm text-gray-500">Explore Data</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                href="/auth/login"
                className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Login
              </Link>
              <Link 
                href="/auth/register"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Explore Scientific Datasets</h1>
          <p className="text-lg text-gray-600">
            Discover and access open scientific data from researchers worldwide
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search datasets by title, description, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Filter Toggle */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center text-gray-700 hover:text-indigo-600 transition-colors"
              >
                <FiFilter className="h-4 w-4 mr-2" />
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </button>
              
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500">
                  {filteredDatasets.length} dataset{filteredDatasets.length !== 1 ? 's' : ''} found
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Filters */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    {categories.map(category => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Data Type</label>
                  <select
                    value={selectedDataType}
                    onChange={(e) => setSelectedDataType(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    {dataTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <FiLoader className="animate-spin h-12 w-12 text-indigo-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Datasets</h2>
            <p className="text-gray-600">Fetching the latest scientific data...</p>
          </div>
        )}

        {/* Dataset Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDatasets.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <FiDatabase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No datasets found</h3>
                <p className="text-gray-600">Try adjusting your search terms or filters.</p>
              </div>
            ) : (
              filteredDatasets.map(dataset => (
                <div key={dataset.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                          {dataset.title}
                        </h3>
                        <div className="flex items-center text-sm text-gray-500">
                          <FiUser className="h-4 w-4 mr-1" />
                          <span>{dataset.submitter.name}</span>
                          {dataset.submitter.organization && (
                            <span className="ml-1">• {dataset.submitter.organization}</span>
                          )}
                        </div>
                      </div>
                      {dataset.isVerified && (
                        <div className="flex-shrink-0 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                          Verified
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                      {dataset.description}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {dataset.tags.slice(0, 3).map(tag => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                        >
                          <FiTag className="h-3 w-3 mr-1" />
                          {tag}
                        </span>
                      ))}
                      {dataset.tags.length > 3 && (
                        <span className="text-xs text-gray-500">
                          +{dataset.tags.length - 3} more
                        </span>
                      )}
                    </div>

                    {/* Metadata */}
                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-500 mb-4">
                      <div className="flex items-center">
                        <FiCalendar className="h-4 w-4 mr-1" />
                        <span>{formatDate(dataset.submissionDate)}</span>
                      </div>
                      <div className="flex items-center">
                        <FiTrendingUp className="h-4 w-4 mr-1" />
                        <span>{dataset.downloadCount} downloads</span>
                      </div>
                      <div className="flex items-center">
                        <span className="capitalize">{dataset.category}</span>
                      </div>
                      <div className="flex items-center">
                        <span>{dataset.size} • {dataset.format}</span>
                      </div>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center mb-4">
                      <div className="flex items-center mr-2">
                        {renderStars(dataset.rating)}
                      </div>
                      <span className="text-sm text-gray-600">
                        {dataset.rating.toFixed(1)}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-3">
                      <Link
                        href={`/public/dataset/${dataset.id}`}
                        className="flex-1 flex items-center justify-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                      >
                        <FiEye className="h-4 w-4 mr-1" />
                        View
                      </Link>
                      <button className="flex-1 flex items-center justify-center px-3 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
                        <FiDownload className="h-4 w-4 mr-1" />
                        Download
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Stats Section */}
        {!loading && filteredDatasets.length > 0 && (
          <div className="mt-12 bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Platform Statistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600">{datasets.length}</div>
                <div className="text-sm text-gray-500">Total Datasets</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {datasets.reduce((sum, d) => sum + d.downloadCount, 0).toLocaleString()}
                </div>
                <div className="text-sm text-gray-500">Total Downloads</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {Math.round(datasets.reduce((sum, d) => sum + d.rating, 0) / datasets.length * 10) / 10}
                </div>
                <div className="text-sm text-gray-500">Average Rating</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {datasets.filter(d => d.isVerified).length}
                </div>
                <div className="text-sm text-gray-500">Verified Datasets</div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
} 