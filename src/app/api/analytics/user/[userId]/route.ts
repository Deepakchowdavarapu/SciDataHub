import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || 'month';
    const userId = params.userId;

    const { db } = await connectToDatabase();

    // Calculate date range based on timeRange
    const now = new Date();
    let startDate = new Date();
    
    switch (timeRange) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default: // month
        startDate.setMonth(now.getMonth() - 1);
    }

    // Get user's submissions
    const userSubmissions = await db.collection('submissions').find({
      'submittedBy.id': userId,
      createdAt: { $gte: startDate }
    }).toArray();

    // Calculate analytics
    const totalSubmissions = userSubmissions.length;
    const approvedSubmissions = userSubmissions.filter(s => s.status === 'approved').length;
    const pendingReviews = userSubmissions.filter(s => s.status === 'pending' || s.status === 'under_review').length;

    // Category breakdown
    const categoryBreakdown: { [key: string]: number } = {};
    userSubmissions.forEach(submission => {
      const category = submission.category || 'Other';
      categoryBreakdown[category] = (categoryBreakdown[category] || 0) + 1;
    });

    // Weekly stats for the last 4 weeks
    const weeklyStats = [];
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date();
      weekStart.setDate(now.getDate() - (i * 7) - 7);
      const weekEnd = new Date();
      weekEnd.setDate(now.getDate() - (i * 7));
      
      const weekSubmissions = userSubmissions.filter(s => {
        const submissionDate = new Date(s.createdAt);
        return submissionDate >= weekStart && submissionDate < weekEnd;
      });

      weeklyStats.push({
        week: `Week ${4 - i}`,
        submissions: weekSubmissions.length
      });
    }

    // Recent submissions (last 5)
    const recentSubmissions = userSubmissions
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
      .map(submission => ({
        id: submission._id.toString(),
        title: submission.title,
        category: submission.category,
        status: submission.status,
        submittedAt: submission.createdAt,
        submittedBy: submission.submittedBy?.firstName + ' ' + submission.submittedBy?.lastName,
        views: Math.floor(Math.random() * 1000) + 100, // Mock data
        downloads: Math.floor(Math.random() * 100) + 10 // Mock data
      }));

    const analyticsData = {
      totalSubmissions,
      approvedSubmissions,
      pendingReviews,
      totalUsers: 1, // For user analytics, this is just the user themselves
      recentSubmissions,
      categoryBreakdown,
      weeklyStats
    };

    return NextResponse.json(analyticsData);

  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
} 