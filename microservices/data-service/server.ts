import express from 'express';
import cors from 'cors';
import multer from 'multer';
import csv from 'csv-parser';
import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import connectDB from '../../shared/utils/database.js';
import Submission from '../../shared/models/Submission.js';

const app = express();
const PORT = process.env.DATA_SERVICE_PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use('/uploads', express.static('uploads'));

// Connect to database
connectDB();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req: express.Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    const uploadDir = 'uploads/submissions';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req: express.Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    const uniqueName = `${uuidv4()}-${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '10000000') // 10MB default
  },
  fileFilter: (req: express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedTypes = ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  }
});

// Data validation functions
type ValidationError = { field: string; message: string; severity: string };
const validateSubmissionData = (data: unknown, dataType: string): { isValid: boolean; errors: ValidationError[] } => {
  const errors: ValidationError[] = [];

  if (!data || (Array.isArray(data) && data.length === 0)) {
    errors.push({
      field: 'data',
      message: 'Data cannot be empty',
      severity: 'error'
    });
    return { isValid: false, errors };
  }

  if (dataType === 'form_data') {
    if (typeof data !== 'object' || Array.isArray(data) || data === null) {
      errors.push({
        field: 'data',
        message: 'Form data must be an object',
        severity: 'error'
      });
    }
  } else if (dataType === 'csv_upload' || dataType === 'excel_upload') {
    if (!Array.isArray(data)) {
      errors.push({
        field: 'data',
        message: 'Uploaded data must be an array of records',
        severity: 'error'
      });
    } else {
      if (data.length > 0) {
        const firstRowKeys = Object.keys(data[0]);
        data.forEach((row, index) => {
          const rowKeys = Object.keys(row);
          if (rowKeys.length !== firstRowKeys.length) {
            errors.push({
              field: `data[${index}]`,
              message: `Row ${index + 1} has inconsistent number of columns`,
              severity: 'warning'
            });
          }
        });
      }
    }
  }

  return {
    isValid: errors.filter(e => e.severity === 'error').length === 0,
    errors
  };
};

const parseCSVFile = (filePath: string): Promise<Record<string, unknown>[]> => {
  return new Promise((resolve, reject) => {
    const results: Record<string, unknown>[] = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data: Record<string, unknown>) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (error: unknown) => reject(error));
  });
};

const parseExcelFile = (filePath: string): Record<string, unknown>[] => {
  try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);
    return data as Record<string, unknown>[];
  } catch (error) {
    throw new Error(`Failed to parse Excel file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Routes

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'Data Service is running', timestamp: new Date().toISOString() });
});

// Submit form data
app.post('/api/data/submit', async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      data,
      metadata,
      submittedBy,
      submitterType,
      tags,
      isPublic
    } = req.body;

    // Validate the submission data
    const validation = validateSubmissionData(data, 'form_data');

    const submission = new Submission({
      title,
      description,
      category,
      dataType: 'form_data',
      data,
      metadata: {
        ...metadata,
        timestamp: new Date()
      },
      submittedBy,
      submitterType: submitterType || 'citizen',
      tags: tags || [],
      isPublic: isPublic || false,
      validationStatus: validation.isValid ? 'valid' : 'needs_review',
      validationErrors: validation.errors
    });

    await submission.save();

    res.status(201).json({
      message: 'Data submitted successfully',
      submissionId: submission._id,
      validationStatus: submission.validationStatus,
      validationErrors: submission.validationErrors
    });
  } catch (error) {
    console.error('Data submission error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Upload and submit file data
app.post('/api/data/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const {
      title,
      description,
      category,
      metadata,
      submittedBy,
      submitterType,
      tags,
      isPublic
    } = req.body;

    let parsedData: Record<string, unknown>[] = [];
    let dataType: string = '';

    // Parse file based on type
    if (req.file.mimetype === 'text/csv') {
      parsedData = await parseCSVFile(req.file.path);
      dataType = 'csv_upload';
    } else if (req.file.mimetype.includes('excel') || req.file.mimetype.includes('spreadsheet')) {
      parsedData = parseExcelFile(req.file.path);
      dataType = 'excel_upload';
    } else {
      return res.status(400).json({ message: 'Unsupported file type' });
    }

    // Validate the parsed data
    const validation = validateSubmissionData(parsedData, dataType);

    const submission = new Submission({
      title,
      description,
      category,
      dataType,
      data: parsedData,
      metadata: {
        ...JSON.parse(metadata || '{}'),
        timestamp: new Date()
      },
      fileUrls: [{
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        url: `/uploads/submissions/${req.file.filename}`
      }],
      submittedBy,
      submitterType: submitterType || 'citizen',
      tags: JSON.parse(tags || '[]'),
      isPublic: isPublic === 'true',
      validationStatus: validation.isValid ? 'valid' : 'needs_review',
      validationErrors: validation.errors
    });

    await submission.save();

    res.status(201).json({
      message: 'File uploaded and processed successfully',
      submissionId: submission._id,
      recordsProcessed: parsedData.length,
      validationStatus: submission.validationStatus,
      validationErrors: submission.validationErrors
    });
  } catch (error) {
    console.error('File upload error:', error);

    // Clean up uploaded file in case of error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({ message: 'File processing failed', error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Get submissions with filtering and pagination
app.get('/api/data/submissions', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      status,
      submittedBy,
      dataType,
      search,
      isPublic,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query: Record<string, unknown> = {};

    if (category) query.category = category;
    if (status) query.status = status;
    if (submittedBy) query.submittedBy = submittedBy;
    if (dataType) query.dataType = dataType;
    if (isPublic !== undefined) query.isPublic = isPublic === 'true';

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [typeof search === 'string' ? new RegExp(search, 'i') : search] } }
      ];
    }

    const sort: Record<string, 1 | -1> = {};
    sort[typeof sortBy === 'string' ? sortBy : 'createdAt'] = sortOrder === 'desc' ? -1 : 1;

    const pageNum = typeof page === 'string' ? parseInt(page, 10) : Number(page);
    const limitNum = typeof limit === 'string' ? parseInt(limit, 10) : Number(limit);

    const submissions = await Submission.find(query)
      .populate('submittedBy', 'firstName lastName email organization')
      .populate('reviewedBy', 'firstName lastName email')
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum)
      .sort(sort);

    const total = await Submission.countDocuments(query);

    res.json({
      submissions,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      total,
      hasNext: pageNum * limitNum < total,
      hasPrev: pageNum > 1
    });
  } catch (error) {
    console.error('Submissions fetch error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get single submission
app.get('/api/data/submissions/:id', async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id)
      .populate('submittedBy', 'firstName lastName email organization')
      .populate('reviewedBy', 'firstName lastName email');

    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    res.json({ submission });
  } catch (error) {
    console.error('Submission fetch error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update submission
app.put('/api/data/submissions/:id', async (req, res) => {
  try {
    const { title, description, category, data, metadata, tags, isPublic } = req.body;

    const submission = await Submission.findById(req.params.id);
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    // Re-validate data if it's being updated
    let validationResult: { isValid: boolean; errors: ValidationError[] } = { isValid: true, errors: [] };
    if (data) {
      validationResult = validateSubmissionData(data, submission.dataType);
    }

    const updateData = {
      ...(title && { title }),
      ...(description && { description }),
      ...(category && { category }),
      ...(data && { data }),
      ...(metadata && { metadata: { ...submission.metadata, ...metadata } }),
      ...(tags && { tags }),
      ...(isPublic !== undefined && { isPublic }),
      validationStatus: validationResult.isValid ? 'valid' : 'needs_review',
      validationErrors: validationResult.errors
    };

    const updatedSubmission = await Submission.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('submittedBy', 'firstName lastName email organization');

    res.json({
      message: 'Submission updated successfully',
      submission: updatedSubmission
    });
  } catch (error) {
    console.error('Submission update error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete submission
app.delete('/api/data/submissions/:id', async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id);
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    // Delete associated files
    if (submission.fileUrls && submission.fileUrls.length > 0) {
      submission.fileUrls.forEach(file => {
        const filePath = path.join('uploads/submissions', file.filename as string);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
    }

    await Submission.findByIdAndDelete(req.params.id);

    res.json({ message: 'Submission deleted successfully' });
  } catch (error) {
    console.error('Submission deletion error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get submission statistics
app.get('/api/data/stats', async (req, res) => {
  try {
    const totalSubmissions = await Submission.countDocuments();
    const pendingSubmissions = await Submission.countDocuments({ status: 'pending' });
    const approvedSubmissions = await Submission.countDocuments({ status: 'approved' });
    const rejectedSubmissions = await Submission.countDocuments({ status: 'rejected' });

    const categoryStats = await Submission.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const submitterTypeStats = await Submission.aggregate([
      { $group: { _id: '$submitterType', count: { $sum: 1 } } }
    ]);

    res.json({
      totalSubmissions,
      pendingSubmissions,
      approvedSubmissions,
      rejectedSubmissions,
      categoryStats,
      submitterTypeStats
    });
  } catch (error) {
    console.error('Stats fetch error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Export data
app.get('/api/data/export', async (req, res) => {
  try {
    const { format = 'json', category, status, startDate, endDate } = req.query;

    const query: Record<string, unknown> = {};
    if (category) query.category = category;
    if (status) query.status = status;
    if (startDate || endDate) {
      query.createdAt = {} as { $gte?: Date; $lte?: Date };
      if (startDate) (query.createdAt as { $gte?: Date }).$gte = new Date(startDate as string);
      if (endDate) (query.createdAt as { $lte?: Date }).$lte = new Date(endDate as string);
    }

    const submissions = await Submission.find(query)
      .populate('submittedBy', 'firstName lastName email organization')
      .select('-__v');

    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename=submissions.json');
      res.json(submissions);
    } else if (format === 'csv') {
      // Convert to CSV format
      const csvData = submissions.map(sub => {
        const submittedBy = sub.submittedBy as { firstName?: string; lastName?: string; email?: string };
        return {
          id: sub._id,
          title: sub.title,
          category: sub.category,
          status: sub.status,
          submitterName: `${submittedBy.firstName ?? ''} ${submittedBy.lastName ?? ''}`.trim(),
          submitterEmail: submittedBy.email ?? '',
          createdAt: sub.createdAt,
          updatedAt: sub.updatedAt
        };
      });

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=submissions.csv');

      // Simple CSV generation
      const headers = Object.keys(csvData[0] || {}).join(',');
      const rows = csvData.map(row => Object.values(row).join(','));
      res.send([headers, ...rows].join('\n'));
    }
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Data Service running on port ${PORT}`);
}); 