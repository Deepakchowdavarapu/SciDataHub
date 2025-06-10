// User types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'researcher' | 'reviewer' | 'admin' | 'citizen';
  organization?: string;
  isActive: boolean;
  isVerified: boolean;
  profileImage?: string;
  bio?: string;
  permissions: string[];
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: 'researcher' | 'reviewer' | 'admin' | 'citizen';
  organization?: string;
}

// Submission types
export interface SubmissionMetadata {
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  timestamp: Date;
  equipment?: string;
  methodology?: string;
  units?: string;
  sampleSize?: number;
}

export interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

export interface FileUrl {
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  url: string;
}

export interface Submission {
  id: string;
  title: string;
  description: string;
  category: 'biology' | 'chemistry' | 'physics' | 'environmental' | 'medical' | 'other';
  dataType: 'form_data' | 'csv_upload' | 'excel_upload' | 'manual_entry';
  submittedBy: User;
  submitterType: 'researcher' | 'citizen';
  data: any;
  metadata: SubmissionMetadata;
  fileUrls?: FileUrl[];
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'revision_required';
  reviewedBy?: User;
  reviewComments?: string;
  reviewDate?: Date;
  validationStatus: 'not_validated' | 'valid' | 'invalid' | 'needs_review';
  validationErrors: ValidationError[];
  tags: string[];
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SubmissionRequest {
  title: string;
  description: string;
  category: string;
  data: any;
  metadata?: Partial<SubmissionMetadata>;
  submittedBy: string;
  submitterType?: 'researcher' | 'citizen';
  tags?: string[];
  isPublic?: boolean;
}

export interface SubmissionResponse {
  message: string;
  submissionId: string;
  validationStatus: string;
  validationErrors: ValidationError[];
  recordsProcessed?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  totalPages: number;
  currentPage: number;
  total: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface SubmissionsResponse extends PaginatedResponse<Submission> {
  submissions: Submission[];
}

// Review types
export interface ReviewRequest {
  reviewerId: string;
  decision: 'approved' | 'rejected' | 'revision_required';
  comments: string;
  suggestedChanges?: string;
}

export interface ReviewMetadata {
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

export interface ReviewSubmissionResponse {
  submission: Submission;
  reviewMetadata: ReviewMetadata;
}

export interface ReviewStats {
  totalReviewed: number;
  approved: number;
  rejected: number;
  revisionRequired: number;
  pending: number;
  underReview: number;
  approvalRate: string;
  averageReviewTimeHours: string;
  categoryBreakdown: CategoryStats[];
  topReviewers: ReviewerStats[];
}

export interface CategoryStats {
  _id: string;
  statuses: { status: string; count: number }[];
  total: number;
}

export interface ReviewerStats {
  reviewerId: string;
  reviewerName: string;
  reviewerEmail: string;
  totalReviewed: number;
  approved: number;
  rejected: number;
  revisionRequired: number;
  approvalRate: number;
}

// API Response types
export interface ApiResponse<T = any> {
  message?: string;
  data?: T;
  error?: string;
}

export interface ApiError {
  message: string;
  status?: number;
  details?: any;
}

// Form types
export interface DataEntryFormData {
  measurement: string;
  value: number;
  unit: string;
  timestamp: Date;
  location?: string;
  notes?: string;
}

export interface SearchFilters {
  category?: string;
  status?: string;
  submittedBy?: string;
  dataType?: string;
  search?: string;
  isPublic?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// Dashboard types
export interface DashboardStats {
  totalSubmissions: number;
  pendingSubmissions: number;
  approvedSubmissions: number;
  rejectedSubmissions: number;
  categoryStats: CategoryStats[];
  submitterTypeStats: { _id: string; count: number }[];
}

// Context types
export interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => Promise<void>;
}

export interface SubmissionContextType {
  submissions: Submission[];
  currentSubmission: Submission | null;
  isLoading: boolean;
  submitData: (data: SubmissionRequest) => Promise<SubmissionResponse>;
  uploadFile: (file: File, metadata: any) => Promise<SubmissionResponse>;
  getSubmissions: (filters?: SearchFilters) => Promise<SubmissionsResponse>;
  getSubmission: (id: string) => Promise<Submission>;
  updateSubmission: (id: string, updates: Partial<Submission>) => Promise<void>;
  deleteSubmission: (id: string) => Promise<void>;
}

// Component Props types
export interface SubmissionCardProps {
  submission: Submission;
  onView: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  showActions?: boolean;
}

export interface DataTableProps {
  data: any[];
  columns: string[];
  onRowClick?: (row: any) => void;
  loading?: boolean;
  pagination?: {
    current: number;
    total: number;
    pageSize: number;
    onChange: (page: number) => void;
  };
}

export interface FileUploadProps {
  onFileSelect: (file: File) => void;
  acceptedTypes?: string[];
  maxSize?: number;
  multiple?: boolean;
}

export interface ReviewActionProps {
  submission: Submission;
  onReviewSubmit: (decision: ReviewRequest) => void;
  isLoading?: boolean;
}

// Navigation types
export interface NavItem {
  label: string;
  href: string;
  icon?: string;
  roles?: string[];
} 