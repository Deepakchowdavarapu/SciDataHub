import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // Extract form data
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const category = formData.get('category') as string;
    const keywords = formData.get('keywords') as string;
    const location = formData.get('location') as string;
    const collectionDate = formData.get('collectionDate') as string;
    const methodology = formData.get('methodology') as string;
    const sampleSize = formData.get('sampleSize') as string;
    const contactEmail = formData.get('contactEmail') as string;
    const submitterId = formData.get('submitterId') as string;
    const submissionType = formData.get('submissionType') as string;

    // Get files if any
    const files = formData.getAll('files') as File[];

    // Basic validation
    if (!title || !description || !category || !submitterId) {
      return NextResponse.json(
        { message: 'Missing required fields: title, description, category' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    // Get submitter information
    const submitter = await db.collection('users').findOne({ 
      _id: new ObjectId(submitterId) 
    });

    if (!submitter) {
      return NextResponse.json(
        { message: 'Invalid submitter ID' },
        { status: 400 }
      );
    }

    // Process files (for now, just store file info)
    const fileUrls = files.map(file => ({
      filename: `${Date.now()}_${file.name}`,
      originalName: file.name,
      mimetype: file.type,
      size: file.size,
      url: `/uploads/${Date.now()}_${file.name}` // Mock URL
    }));

    // Create submission document
    const submission = {
      title,
      description,
      category: category.toLowerCase(),
      dataType: submissionType === 'file' ? 'file_upload' : 'form_data',
      submittedBy: {
        id: submitter._id.toString(),
        firstName: submitter.firstName,
        lastName: submitter.lastName,
        email: submitter.email,
        organization: submitter.organization
      },
      submitterType: submitter.role === 'researcher' ? 'researcher' : 'citizen',
      data: {
        // Store form data as the data payload
        keywords: keywords?.split(',').map(k => k.trim()) || [],
        location,
        collectionDate: collectionDate ? new Date(collectionDate) : null,
        methodology,
        sampleSize: sampleSize ? parseInt(sampleSize) : null,
        contactEmail
      },
      metadata: {
        timestamp: new Date(),
        submissionMethod: submissionType,
        location: location ? { address: location } : null
      },
      fileUrls: fileUrls.length > 0 ? fileUrls : null,
      status: 'pending',
      validationStatus: 'not_validated',
      validationErrors: [],
      tags: keywords?.split(',').map(k => k.trim().toLowerCase()) || [],
      isPublic: true, // Default to public
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Insert submission
    const result = await db.collection('submissions').insertOne(submission);

    return NextResponse.json({
      message: 'Data submitted successfully',
      submissionId: result.insertedId.toString(),
      validationStatus: 'not_validated',
      validationErrors: [],
      recordsProcessed: files.length
    });

  } catch (error) {
    console.error('Data submission error:', error);
    return NextResponse.json(
      { message: 'Failed to submit data' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    let userId: string;

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      userId = decoded.userId;
    } catch (err) {
      return NextResponse.json(
        { message: 'Invalid token' },
        { status: 401 }
      );
    }

    const { db } = await connectToDatabase();

    // Get user's submissions
    const submissions = await db.collection('submissions')
      .find({ submitterId: userId })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({
      submissions: submissions.map(sub => ({
        ...sub,
        id: sub._id.toString(),
        _id: undefined
      }))
    });

  } catch (error) {
    console.error('Error fetching submissions:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 