import axios, { AxiosResponse, AxiosError } from 'axios';
import type { 
  AuthResponse, 
  LoginRequest, 
  RegisterRequest, 
  User, 
  Submission, 
  SubmissionRequest, 
  SubmissionResponse, 
  SubmissionsResponse, 
  ReviewRequest, 
  ReviewSubmissionResponse, 
  ReviewStats, 
  DashboardStats,
  SearchFilters,
  ApiError
} from '@/types';

// API Configuration - Use Next.js API routes instead of direct microservice calls
const BASE_URL = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';

const authApi = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

const dataApi = axios.create({
  baseURL: BASE_URL,
  timeout: 30000, // Longer timeout for file uploads
});

const reviewApi = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

// Request interceptor to add auth token
const addAuthToken = (config: any) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

authApi.interceptors.request.use(addAuthToken);
dataApi.interceptors.request.use(addAuthToken);
reviewApi.interceptors.request.use(addAuthToken);

// Response interceptor for error handling
const handleApiError = (error: AxiosError): Promise<never> => {
  const apiError: ApiError = {
    message: 'An unexpected error occurred',
    status: error.response?.status || 500,
    details: error.response?.data || error.message
  };

  if (error.response?.data && typeof error.response.data === 'object') {
    const errorData = error.response.data as any;
    apiError.message = errorData.message || apiError.message;
  }

  // Handle specific error cases
  if (error.response?.status === 401) {
    // Token expired or invalid
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    if (typeof window !== 'undefined') {
      window.location.href = '/auth/login';
    }
  }

  return Promise.reject(apiError);
};

authApi.interceptors.response.use(
  (response) => response,
  handleApiError
);

dataApi.interceptors.response.use(
  (response) => response,
  handleApiError
);

reviewApi.interceptors.response.use(
  (response) => response,
  handleApiError
);

// Authentication API
export const authAPI = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response: AxiosResponse<AuthResponse> = await authApi.post('/api/auth/login', credentials);
    return response.data;
  },

  register: async (userData: RegisterRequest): Promise<AuthResponse> => {
    const response: AxiosResponse<AuthResponse> = await authApi.post('/api/auth/register', userData);
    return response.data;
  },

  verifyToken: async (token: string): Promise<{ valid: boolean; user: User }> => {
    const response = await authApi.post('/api/auth/verify', { token });
    return response.data;
  },

  getProfile: async (userId: string): Promise<{ user: User }> => {
    const response = await authApi.get(`/api/auth/profile/${userId}`);
    return response.data;
  },

  updateProfile: async (userId: string, updates: Partial<User>): Promise<{ user: User }> => {
    const response = await authApi.put(`/api/auth/profile/${userId}`, updates);
    return response.data;
  },

  getUsers: async (filters?: { page?: number; limit?: number; role?: string; search?: string }) => {
    const params = new URLSearchParams();
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.role) params.append('role', filters.role);
    if (filters?.search) params.append('search', filters.search);

    const response = await authApi.get(`/api/auth/users?${params.toString()}`);
    return response.data;
  },

  healthCheck: async (): Promise<{ status: string; timestamp: string }> => {
    const response = await authApi.get('/health');
    return response.data;
  }
};

// Data API
export const dataAPI = {
  submitData: async (submissionData: SubmissionRequest): Promise<SubmissionResponse> => {
    const response: AxiosResponse<SubmissionResponse> = await dataApi.post('/api/data/submit', submissionData);
    return response.data;
  },

  uploadFile: async (file: File, metadata: any): Promise<SubmissionResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    
    // Add metadata fields to form data
    Object.keys(metadata).forEach(key => {
      if (metadata[key] !== undefined && metadata[key] !== null) {
        formData.append(key, typeof metadata[key] === 'object' ? JSON.stringify(metadata[key]) : metadata[key]);
      }
    });

    const response: AxiosResponse<SubmissionResponse> = await dataApi.post('/api/data/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getSubmissions: async (filters?: SearchFilters): Promise<SubmissionsResponse> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
    }

    const response: AxiosResponse<SubmissionsResponse> = await dataApi.get(`/api/data/submissions?${params.toString()}`);
    return response.data;
  },

  getSubmission: async (id: string): Promise<{ submission: Submission }> => {
    const response = await dataApi.get(`/api/data/submissions/${id}`);
    return response.data;
  },

  updateSubmission: async (id: string, updates: Partial<Submission>): Promise<{ submission: Submission }> => {
    const response = await dataApi.put(`/api/data/submissions/${id}`, updates);
    return response.data;
  },

  deleteSubmission: async (id: string): Promise<{ message: string }> => {
    const response = await dataApi.delete(`/api/data/submissions/${id}`);
    return response.data;
  },

  getStats: async (): Promise<DashboardStats> => {
    const response: AxiosResponse<DashboardStats> = await dataApi.get('/api/data/stats');
    return response.data;
  },

  exportData: async (format: 'json' | 'csv', filters?: { category?: string; status?: string; startDate?: string; endDate?: string }): Promise<Blob> => {
    const params = new URLSearchParams();
    params.append('format', format);
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
    }

    const response = await dataApi.get(`/api/data/export?${params.toString()}`, {
      responseType: 'blob'
    });
    return response.data;
  },

  healthCheck: async (): Promise<{ status: string; timestamp: string }> => {
    const response = await dataApi.get('/health');
    return response.data;
  }
};

// Review API
export const reviewAPI = {
  getPendingSubmissions: async (filters?: {
    page?: number;
    limit?: number;
    category?: string;
    submitterType?: string;
    validationStatus?: string;
    sortBy?: string;
    sortOrder?: string;
  }): Promise<SubmissionsResponse> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }

    const response: AxiosResponse<SubmissionsResponse> = await reviewApi.get(`/api/review/pending?${params.toString()}`);
    return response.data;
  },

  assignReview: async (submissionId: string, reviewerId: string): Promise<{ submission: Submission }> => {
    const response = await reviewApi.post(`/api/review/assign/${submissionId}`, { reviewerId });
    return response.data;
  },

  submitReview: async (submissionId: string, reviewData: ReviewRequest): Promise<{ submission: Submission }> => {
    const response = await reviewApi.post(`/api/review/submit/${submissionId}`, reviewData);
    return response.data;
  },

  getReviewedSubmissions: async (reviewerId: string, filters?: {
    page?: number;
    limit?: number;
    status?: string;
    category?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<SubmissionsResponse> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
    }

    const response = await reviewApi.get(`/api/review/reviewed/${reviewerId}?${params.toString()}`);
    return response.data;
  },

  getReviewStats: async (filters?: {
    reviewerId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<ReviewStats> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
    }

    const response: AxiosResponse<ReviewStats> = await reviewApi.get(`/api/review/stats?${params.toString()}`);
    return response.data;
  },

  batchReview: async (submissionIds: string[], decision: 'approved' | 'rejected', comments: string, reviewerId: string): Promise<{ modifiedCount: number }> => {
    const response = await reviewApi.post('/api/review/batch', {
      submissionIds,
      decision,
      comments,
      reviewerId
    });
    return response.data;
  },

  getSubmissionForReview: async (submissionId: string): Promise<ReviewSubmissionResponse> => {
    const response: AxiosResponse<ReviewSubmissionResponse> = await reviewApi.get(`/api/review/submission/${submissionId}`);
    return response.data;
  },

  releaseSubmission: async (submissionId: string, reviewerId: string): Promise<{ submission: Submission }> => {
    const response = await reviewApi.post(`/api/review/release/${submissionId}`, { reviewerId });
    return response.data;
  },

  healthCheck: async (): Promise<{ status: string; timestamp: string }> => {
    const response = await reviewApi.get('/health');
    return response.data;
  }
};

// Utility functions
export const setAuthToken = (token: string) => {
  localStorage.setItem('auth_token', token);
};

export const getAuthToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

export const removeAuthToken = () => {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user_data');
};

export const saveUserData = (user: User) => {
  localStorage.setItem('user_data', JSON.stringify(user));
};

export const getUserData = (): User | null => {
  const userData = localStorage.getItem('user_data');
  return userData ? JSON.parse(userData) : null;
};

// Health check for all services
export const checkServicesHealth = async (): Promise<{
  auth: boolean;
  data: boolean;
  review: boolean;
}> => {
  const results = {
    auth: false,
    data: false,
    review: false
  };

  try {
    await authAPI.healthCheck();
    results.auth = true;
  } catch (error) {
    console.error('Auth service health check failed:', error);
  }

  try {
    await dataAPI.healthCheck();
    results.data = true;
  } catch (error) {
    console.error('Data service health check failed:', error);
  }

  try {
    await reviewAPI.healthCheck();
    results.review = true;
  } catch (error) {
    console.error('Review service health check failed:', error);
  }

  return results;
}; 