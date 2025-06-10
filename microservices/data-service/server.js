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
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/submissions';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 // 10MB default
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV and Excel files are allowed'), false);
    }
  }
});

// Data validation functions
const validateSubmissionData = (data, dataType) => {
  const errors = [];

  if (!data || (Array.isArray(data) && data.length === 0)) {
    errors.push({
      field: 'data',
      message: 'Data cannot be empty',
      severity: 'error'
    });
    return { isValid: false, errors };
  }

  if (dataType === 'form_data') {
    // Validate form data structure
    if (typeof data !== 'object') {
      errors.push({
        field: 'data',
        message: 'Form data must be an object',
        severity: 'error'
      });
    }
  } else if (dataType === 'csv_upload' || dataType === 'excel_upload') {
    // Validate array data structure
    if (!Array.isArray(data)) {
      errors.push({
        field: 'data',
        message: 'Uploaded data must be an array of records',
        severity: 'error'
      });
    } else {
      // Check if all records have consistent structure
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

const parseCSVFile = (filePath) => {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (error) => reject(error));
  });
};

const parseExcelFile = (filePath) => {
  try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);
    return data;
  } catch (error) {
    throw new Error(`Failed to parse Excel file: ${error.message}`);
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

    let parsedData;
    let dataType;

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
    
    res.status(500).json({ message: 'File processing failed', error: error.message });
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

    let query = {};
    
    if (category) query.category = category;
    if (status) query.status = status;
    if (submittedBy) query.submittedBy = submittedBy;
    if (dataType) query.dataType = dataType;
    if (isPublic !== undefined) query.isPublic = isPublic === 'true';
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const submissions = await Submission.find(query)
      .populate('submittedBy', 'firstName lastName email organization')
      .populate('reviewedBy', 'firstName lastName email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort(sort);

    const total = await Submission.countDocuments(query);

    res.json({
      submissions,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total,
      hasNext: page * limit < total,
      hasPrev: page > 1
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
    let validationResult = { isValid: true, errors: [] };
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
        const filePath = path.join('uploads/submissions', file.filename);
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
    
    let query = {};
    if (category) query.category = category;
    if (status) query.status = status;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
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
      const csvData = submissions.map(sub => ({
        id: sub._id,
        title: sub.title,
        category: sub.category,
        status: sub.status,
        submitterName: `${sub.submittedBy.firstName} ${sub.submittedBy.lastName}`,
        submitterEmail: sub.submittedBy.email,
        createdAt: sub.createdAt,
        updatedAt: sub.updatedAt
      }));

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