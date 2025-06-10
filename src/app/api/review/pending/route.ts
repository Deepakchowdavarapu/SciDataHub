import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Forward the request to the review microservice
    const reviewServiceUrl = `http://localhost:${process.env.REVIEW_SERVICE_PORT || 3003}/api/review/pending?${searchParams.toString()}`;
    
    const response = await fetch(reviewServiceUrl);
    
    if (!response.ok) {
      // If review service is not available, return mock data
      if (response.status === 500 || !response.ok) {
        return NextResponse.json({
          submissions: [],
          totalPages: 0,
          currentPage: 1,
          total: 0,
          hasNext: false,
          hasPrev: false,
          message: 'Review service temporarily unavailable'
        });
      }
      
      const errorData = await response.text();
      return NextResponse.json(
        { message: 'Review service error', details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Review proxy error:', error);
    
    // Return mock data if service is unavailable
    return NextResponse.json({
      submissions: [],
      totalPages: 0,
      currentPage: 1,
      total: 0,
      hasNext: false,
      hasPrev: false,
      message: 'Review service temporarily unavailable'
    });
  }
} 