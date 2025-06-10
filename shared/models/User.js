const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['researcher', 'reviewer', 'admin', 'citizen'],
    default: 'citizen'
  },
  organization: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  profileImage: {
    type: String
  },
  bio: {
    type: String,
    maxlength: 500
  },
  permissions: [{
    type: String,
    enum: ['create_submission', 'review_submission', 'manage_users', 'admin_access']
  }],
  lastLogin: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for better query performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });

module.exports = mongoose.model('User', userSchema); 