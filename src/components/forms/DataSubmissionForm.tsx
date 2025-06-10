'use client';

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FiUpload, FiFile, FiX, FiAlertCircle, FiCheck } from 'react-icons/fi';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

interface DataSubmissionFormProps {
  onSubmit?: (data: FormData) => void;
  initialData?: any;
}

interface FormField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'email' | 'textarea' | 'select' | 'date';
  required?: boolean;
  options?: string[];
  placeholder?: string;
  helpText?: string;
}

const DataSubmissionForm: React.FC<DataSubmissionFormProps> = ({ onSubmit, initialData }) => {
  const [submissionType, setSubmissionType] = useState<'form' | 'file'>('form');
  const [formData, setFormData] = useState(initialData || {});
  const [files, setFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  // Dynamic form fields based on submission type
  const formFields: FormField[] = [
    { name: 'title', label: 'Data Title', type: 'text', required: true, placeholder: 'Enter a descriptive title for your data' },
    { name: 'description', label: 'Description', type: 'textarea', required: true, placeholder: 'Describe your data and methodology' },
    { name: 'category', label: 'Category', type: 'select', required: true, options: ['Environmental', 'Medical', 'Physics', 'Chemistry', 'Biology', 'Other'] },
    { name: 'keywords', label: 'Keywords', type: 'text', placeholder: 'Comma-separated keywords', helpText: 'Add keywords to help others find your data' },
    { name: 'location', label: 'Collection Location', type: 'text', placeholder: 'Where was this data collected?' },
    { name: 'collectionDate', label: 'Collection Date', type: 'date', required: true },
    { name: 'methodology', label: 'Methodology', type: 'textarea', placeholder: 'Describe how the data was collected' },
    { name: 'sampleSize', label: 'Sample Size', type: 'number', placeholder: 'Number of samples or observations' },
    { name: 'contactEmail', label: 'Contact Email', type: 'email', required: true, placeholder: 'For questions about this data' }
  ];

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(prev => [...prev, ...acceptedFiles]);
    setErrors(prev => ({ ...prev, files: '' }));
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'text/plain': ['.txt'],
      'application/json': ['.json']
    },
    maxFiles: 5,
    maxSize: 10 * 1024 * 1024 // 10MB
  });

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleInputChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Validate required fields
    formFields.forEach(field => {
      if (field.required && !formData[field.name]) {
        newErrors[field.name] = `${field.label} is required`;
      }
    });

    // Validate file upload for file submission type
    if (submissionType === 'file' && files.length === 0) {
      newErrors.files = 'Please upload at least one file';
    }

    // Validate email format
    if (formData.contactEmail && !/\S+@\S+\.\S+/.test(formData.contactEmail)) {
      newErrors.contactEmail = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const submitData = new FormData();
      
      // Add form data
      Object.entries(formData).forEach(([key, value]) => {
        submitData.append(key, value);
      });

      // Add files
      files.forEach(file => {
        submitData.append('files', file);
      });

      submitData.append('submissionType', submissionType);
      submitData.append('submittedAt', new Date().toISOString());

      if (onSubmit) {
        await onSubmit(submitData);
      } else {
        // Default submission logic
        const response = await fetch('/api/data/submit', {
          method: 'POST',
          body: submitData,
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          }
        });

        if (!response.ok) {
          throw new Error('Submission failed');
        }

        alert('Data submitted successfully!');
        setFormData({});
        setFiles([]);
      }
    } catch (error) {
      console.error('Submission error:', error);
      alert('Failed to submit data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderField = (field: FormField) => {
    const value = formData[field.name] || '';
    const error = errors[field.name];

    if (field.type === 'select') {
      return (
        <div key={field.name} className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            {field.label} {field.required && <span className="text-red-500">*</span>}
          </label>
          <select
            value={value}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="">Select {field.label}</option>
            {field.options?.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          {error && <p className="text-sm text-red-600">{error}</p>}
          {field.helpText && <p className="text-sm text-gray-500">{field.helpText}</p>}
        </div>
      );
    }

    if (field.type === 'textarea') {
      return (
        <div key={field.name} className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            {field.label} {field.required && <span className="text-red-500">*</span>}
          </label>
          <textarea
            value={value}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            rows={4}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          {field.helpText && <p className="text-sm text-gray-500">{field.helpText}</p>}
        </div>
      );
    }

    return (
      <Input
        key={field.name}
        label={field.label}
        type={field.type}
        value={value}
        onChange={(e) => handleInputChange(field.name, e.target.value)}
        placeholder={field.placeholder}
        error={error}
        helpText={field.helpText}
        required={field.required}
      />
    );
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Submit Scientific Data</CardTitle>
        <p className="text-gray-600">Share your research data with the scientific community</p>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Submission Type Toggle */}
          <div className="flex space-x-4 p-1 bg-gray-100 rounded-lg">
            <button
              type="button"
              onClick={() => setSubmissionType('form')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                submissionType === 'form'
                  ? 'bg-white text-indigo-600 shadow'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Manual Entry
            </button>
            <button
              type="button"
              onClick={() => setSubmissionType('file')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                submissionType === 'file'
                  ? 'bg-white text-indigo-600 shadow'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              File Upload
            </button>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {formFields.slice(0, 4).map(renderField)}
          </div>

          {/* File Upload Section */}
          {submissionType === 'file' && (
            <div className="space-y-4">
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  isDragActive
                    ? 'border-indigo-400 bg-indigo-50'
                    : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'
                }`}
              >
                <input {...getInputProps()} />
                <FiUpload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-900">
                  {isDragActive ? 'Drop files here' : 'Upload data files'}
                </p>
                <p className="text-gray-500 mt-2">
                  Drag and drop CSV, Excel, or text files here, or click to browse
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  Maximum file size: 10MB. Up to 5 files.
                </p>
              </div>

              {files.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900">Uploaded Files:</h4>
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                      <div className="flex items-center">
                        <FiFile className="h-5 w-5 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">{file.name}</span>
                        <span className="text-xs text-gray-500 ml-2">
                          ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <FiX className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {errors.files && (
                <div className="flex items-center text-red-600 text-sm">
                  <FiAlertCircle className="h-4 w-4 mr-1" />
                  {errors.files}
                </div>
              )}
            </div>
          )}

          {/* Additional Information */}
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Additional Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {formFields.slice(4).map(renderField)}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-6 border-t">
            <Button
              type="submit"
              loading={loading}
              className="px-8"
            >
              Submit Data
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default DataSubmissionForm; 