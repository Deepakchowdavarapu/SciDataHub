import express, { Request, Response } from 'express';
import cors from 'cors';
import connectDB from '../../shared/utils/database.js';
import Submission from '../../shared/models/Submission.js';
import User from '../../shared/models/User.js';

const app = express();
const PORT = process.env.REVIEW_SERVICE_PORT || 3003;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to database
connectDB();

// Routes

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'Review Service is running', timestamp: new Date().toISOString() });
});

// Get submissions pending review
app.get('/api/review/pending', async (req: Request, res: Response) => {
  try {
    type PendingQuery = {
      page?: string | number;
      limit?: string | number;
      category?: string;
      submitterType?: string;
      validationStatus?: string;
      sortBy?: string;
      sortOrder?: string;
    };

    const {
      page = 1,
      limit = 10,
      category,
      submitterType,
      validationStatus,
      sortBy = 'createdAt',
      sortOrder = 'asc'
    } = req.query as PendingQuery;

    const query: Record<string, unknown> = {
      status: { $in: ['pending', 'under_review'] }
    };
    if (category) query.category = category;
    if (submitterType) query.submitterType = submitterType;
    if (validationStatus) query.validationStatus = validationStatus;

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
    console.error('Pending submissions fetch error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Assign submission for review
app.post('/api/review/assign/:submissionId', async (req: Request, res: Response) => {
  try {
    const { submissionId } = req.params;
    const { reviewerId } = req.body;

    // Verify reviewer exists and has review permissions
    const reviewer = await User.findById(reviewerId);
    if (!reviewer || !reviewer.permissions.includes('review_submission')) {
      return res.status(400).json({ message: 'Invalid reviewer or insufficient permissions' });
    }

    const submission = await Submission.findById(submissionId);
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    if (submission.status !== 'pending') {
      return res.status(400).json({ message: 'Submission is not available for assignment' });
    }

    submission.status = 'under_review';
    submission.reviewedBy = reviewerId;
    await submission.save();

    const updatedSubmission = await Submission.findById(submissionId)
      .populate('submittedBy', 'firstName lastName email organization')
      .populate('reviewedBy', 'firstName lastName email');

    res.json({
      message: 'Submission assigned for review',
      submission: updatedSubmission
    });
  } catch (error) {
    console.error('Review assignment error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Submit review decision
app.post('/api/review/submit/:submissionId', async (req: Request, res: Response) => {
  try {
    const { submissionId } = req.params;
    const { reviewerId, decision, comments, suggestedChanges } = req.body;

    // Validate decision
    const validDecisions = ['approved', 'rejected', 'revision_required'];
    if (!validDecisions.includes(decision)) {
      return res.status(400).json({ message: 'Invalid review decision' });
    }

    // Verify reviewer
    const reviewer = await User.findById(reviewerId);
    if (!reviewer || !reviewer.permissions.includes('review_submission')) {
      return res.status(400).json({ message: 'Invalid reviewer or insufficient permissions' });
    }

    const submission = await Submission.findById(submissionId);
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    if (submission.status !== 'under_review' || !(submission.reviewedBy && submission.reviewedBy.toString() === reviewerId)) {
      return res.status(400).json({ message: 'You are not authorized to review this submission' });
    }

    // Update submission with review decision
    submission.status = decision;
    submission.reviewComments = comments;
    submission.reviewDate = new Date();

    // If approved, mark as public if it was intended to be
    if (decision === 'approved' && submission.isPublic) {
      submission.isPublic = true;
    }

    // Add suggested changes for revision required
    if (decision === 'revision_required' && suggestedChanges) {
      submission.reviewComments += `\n\nSuggested Changes:\n${suggestedChanges}`;
    }

    await submission.save();

    const updatedSubmission = await Submission.findById(submissionId)
      .populate('submittedBy', 'firstName lastName email organization')
      .populate('reviewedBy', 'firstName lastName email');

    res.json({
      message: `Submission ${decision}`,
      submission: updatedSubmission
    });
  } catch (error) {
    console.error('Review submission error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get submissions reviewed by a specific reviewer
app.get('/api/review/reviewed/:reviewerId', async (req: Request, res: Response) => {
  try {
    const { reviewerId } = req.params;
    type ReviewedQuery = {
      page?: string | number;
      limit?: string | number;
      status?: string;
      category?: string;
      startDate?: string;
      endDate?: string;
    };

    const {
      page = 1,
      limit = 10,
      status,
      category,
      startDate,
      endDate
    } = req.query as ReviewedQuery;

    const query: Record<string, unknown> = { reviewedBy: reviewerId };
    if (status) (query as Record<string, unknown>).status = status;
    if (category) (query as Record<string, unknown>).category = category;
    if (startDate || endDate) {
      (query as Record<string, unknown>).reviewDate = {};
      if (startDate && typeof startDate === 'string') ((query as Record<string, unknown>).reviewDate as { $gte?: Date }).$gte = new Date(startDate);
      if (endDate && typeof endDate === 'string') ((query as Record<string, unknown>).reviewDate as { $lte?: Date }).$lte = new Date(endDate);
    }

    const pageNum = typeof page === 'string' ? parseInt(page, 10) : Number(page);
    const limitNum = typeof limit === 'string' ? parseInt(limit, 10) : Number(limit);

    const submissions = await Submission.find(query)
      .populate('submittedBy', 'firstName lastName email organization')
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum)
      .sort({ reviewDate: -1 });

    const total = await Submission.countDocuments(query);

    res.json({
      submissions,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      total
    });
  } catch (error) {
    console.error('Reviewed submissions fetch error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get review statistics
app.get('/api/review/stats', async (req: Request, res: Response) => {
  try {
    type StatsQuery = {
      reviewerId?: string;
      startDate?: string;
      endDate?: string;
    };
    const { reviewerId, startDate, endDate } = req.query as StatsQuery;

    const dateQuery: Record<string, unknown> = {};
    if (startDate || endDate) {
      dateQuery.reviewDate = {} as { $gte?: Date; $lte?: Date };
      if (startDate) (dateQuery.reviewDate as { $gte?: Date }).$gte = new Date(startDate as string);
      if (endDate) (dateQuery.reviewDate as { $lte?: Date }).$lte = new Date(endDate as string);
    }

    const baseQuery: Record<string, unknown> = { ...dateQuery };
    if (reviewerId) {
      baseQuery.reviewedBy = reviewerId;
    }

    const totalReviewed = await Submission.countDocuments({
      ...baseQuery,
      status: { $in: ['approved', 'rejected', 'revision_required'] }
    });

    const approved = await Submission.countDocuments({
      ...baseQuery,
      status: 'approved'
    });

    const rejected = await Submission.countDocuments({
      ...baseQuery,
      status: 'rejected'
    });

    const revisionRequired = await Submission.countDocuments({
      ...baseQuery,
      status: 'revision_required'
    });

    const pending = await Submission.countDocuments({
      status: 'pending'
    });

    const underReview = await Submission.countDocuments({
      status: 'under_review'
    });

    // Average review time
    const reviewTimeAgg = await Submission.aggregate([
      {
        $match: {
          ...baseQuery,
          status: { $in: ['approved', 'rejected', 'revision_required'] },
          reviewDate: { $exists: true }
        }
      },
      {
        $addFields: {
          reviewTimeHours: {
            $divide: [
              { $subtract: ['$reviewDate', '$createdAt'] },
              1000 * 60 * 60 // Convert to hours
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          avgReviewTime: { $avg: '$reviewTimeHours' },
          minReviewTime: { $min: '$reviewTimeHours' },
          maxReviewTime: { $max: '$reviewTimeHours' }
        }
      }
    ]);

    const reviewStats = reviewTimeAgg[0] || {
      avgReviewTime: 0,
      minReviewTime: 0,
      maxReviewTime: 0
    };

    // Category breakdown
    const categoryBreakdown = await Submission.aggregate([
      {
        $match: {
          ...baseQuery,
          status: { $in: ['approved', 'rejected', 'revision_required'] }
        }
      },
      {
        $group: {
          _id: { category: '$category', status: '$status' },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.category',
          statuses: {
            $push: {
              status: '$_id.status',
              count: '$count'
            }
          },
          total: { $sum: '$count' }
        }
      },
      {
        $sort: { total: -1 }
      }
    ]);

    // Top reviewers (if not filtering by specific reviewer)
    let topReviewers: Record<string, unknown>[] = [];
    if (!reviewerId) {
      topReviewers = await Submission.aggregate([
        {
          $match: {
            ...dateQuery,
            status: { $in: ['approved', 'rejected', 'revision_required'] },
            reviewedBy: { $exists: true }
          }
        },
        {
          $group: {
            _id: '$reviewedBy',
            totalReviewed: { $sum: 1 },
            approved: { $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] } },
            rejected: { $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] } },
            revisionRequired: { $sum: { $cond: [{ $eq: ['$status', 'revision_required'] }, 1, 0] } }
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'reviewer'
          }
        },
        {
          $unwind: '$reviewer'
        },
        {
          $project: {
            reviewerId: '$_id',
            reviewerName: { $concat: ['$reviewer.firstName', ' ', '$reviewer.lastName'] },
            reviewerEmail: '$reviewer.email',
            totalReviewed: 1,
            approved: 1,
            rejected: 1,
            revisionRequired: 1,
            approvalRate: { $multiply: [{ $divide: ['$approved', '$totalReviewed'] }, 100] }
          }
        },
        {
          $sort: { totalReviewed: -1 }
        },
        {
          $limit: 10
        }
      ]);
    }

    res.json({
      totalReviewed,
      approved,
      rejected,
      revisionRequired,
      pending,
      underReview,
      approvalRate: totalReviewed > 0 ? ((approved / totalReviewed) * 100).toFixed(2) : 0,
      averageReviewTimeHours: reviewStats.avgReviewTime ? reviewStats.avgReviewTime.toFixed(2) : 0,
      categoryBreakdown,
      topReviewers
    });
  } catch (error) {
    console.error('Review stats error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Batch approve/reject submissions
app.post('/api/review/batch', async (req: Request, res: Response) => {
  try {
    const { submissionIds, decision, comments, reviewerId } = req.body;

    // Validate decision
    const validDecisions = ['approved', 'rejected'];
    if (!validDecisions.includes(decision)) {
      return res.status(400).json({ message: 'Invalid batch decision. Only approve or reject allowed.' });
    }

    // Verify reviewer
    const reviewer = await User.findById(reviewerId);
    if (!reviewer || !reviewer.permissions.includes('review_submission')) {
      return res.status(400).json({ message: 'Invalid reviewer or insufficient permissions' });
    }

    const updateData = {
      status: decision,
      reviewedBy: reviewerId,
      reviewComments: comments || `Batch ${decision}`,
      reviewDate: new Date()
    };

    const result = await Submission.updateMany(
      {
        _id: { $in: submissionIds },
        status: { $in: ['pending', 'under_review'] }
      },
      updateData
    );

    res.json({
      message: `Batch operation completed: ${result.modifiedCount} submissions ${decision}`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Batch review error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get submission details for review
app.get('/api/review/submission/:submissionId', async (req: Request, res: Response) => {
  try {
    const submission = await Submission.findById(req.params.submissionId)
      .populate('submittedBy', 'firstName lastName email organization')
      .populate('reviewedBy', 'firstName lastName email');

    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    // Include additional metadata for review
    const reviewMetadata = {
      dataIntegrity: {
        hasValidationErrors: submission.validationErrors.length > 0,
        errorCount: submission.validationErrors.length,
        warningCount: submission.validationErrors.filter((e: { severity?: string | null }) => typeof e.severity === 'string' && e.severity === 'warning').length
      },
      submissionAge: {
        days: Math.floor((new Date().getTime() - new Date(submission.createdAt).getTime()) / (1000 * 60 * 60 * 24)),
        hours: Math.floor((new Date().getTime() - new Date(submission.createdAt).getTime()) / (1000 * 60 * 60))
      },
      dataSize: {
        recordCount: Array.isArray(submission.data) ? submission.data.length : 1,
        fields: Array.isArray(submission.data) && submission.data.length > 0
          ? Object.keys(submission.data[0]).length
          : Object.keys(submission.data || {}).length
      }
    };

    res.json({
      submission,
      reviewMetadata
    });
  } catch (error) {
    console.error('Review submission detail error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Release submission from review (unassign)
app.post('/api/review/release/:submissionId', async (req: Request, res: Response) => {
  try {
    const { submissionId } = req.params;
    const { reviewerId } = req.body;

    const submission = await Submission.findById(submissionId);
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    if (submission.status !== 'under_review') {
      return res.status(400).json({ message: 'Submission is not under review' });
    }

    if (submission.status !== 'under_review' || !(submission.reviewedBy && submission.reviewedBy.toString() === reviewerId)) {
      return res.status(400).json({ message: 'You are not assigned to review this submission' });
    }

    submission.status = 'pending';
    submission.reviewedBy = undefined;
    await submission.save();

    const updatedSubmission = await Submission.findById(submissionId)
      .populate('submittedBy', 'firstName lastName email organization');

    res.json({
      message: 'Submission released back to pending queue',
      submission: updatedSubmission
    });
  } catch (error) {
    console.error('Review release error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Review Service running on port ${PORT}`);
}); 