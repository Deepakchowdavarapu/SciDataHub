import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['biology', 'chemistry', 'physics', 'environmental', 'medical', 'other']
  },
  dataType: {
    type: String,
    required: true,
    enum: ['form_data', 'csv_upload', 'excel_upload', 'manual_entry']
  },
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  submitterType: {
    type: String,
    enum: ['researcher', 'citizen'],
    required: true
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  metadata: {
    location: {
      latitude: Number,
      longitude: Number,
      address: String
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    equipment: String,
    methodology: String,
    units: String,
    sampleSize: Number
  },
  fileUrls: [{
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    url: String
  }],
  status: {
    type: String,
    enum: ['pending', 'under_review', 'approved', 'rejected', 'revision_required'],
    default: 'pending'
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewComments: {
    type: String
  },
  reviewDate: {
    type: Date
  },
  validationStatus: {
    type: String,
    enum: ['not_validated', 'valid', 'invalid', 'needs_review'],
    default: 'not_validated'
  },
  validationErrors: [{
    field: String,
    message: String,
    severity: {
      type: String,
      enum: ['error', 'warning', 'info']
    }
  }],
  tags: [String],
  isPublic: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for better query performance
submissionSchema.index({ submittedBy: 1 });
submissionSchema.index({ status: 1 });
submissionSchema.index({ category: 1 });
submissionSchema.index({ createdAt: -1 });
submissionSchema.index({ 'metadata.timestamp': -1 });

export default mongoose.model('Submission', submissionSchema);