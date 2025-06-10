import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    
    // Find user by email
    const user = await db.collection('users').findOne({ 
      email: email.toLowerCase() 
    });

    if (!user) {
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Check if user is active
    if (!user.isActive) {
      return NextResponse.json(
        { message: 'Account is deactivated' },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Update last login
    await db.collection('users').updateOne(
      { _id: user._id },
      { $set: { lastLogin: new Date() } }
    );

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id.toString(), 
        email: user.email, 
        role: user.role,
        permissions: user.permissions || []
      },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Return user data without password
    const userData = {
      id: user._id.toString(),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      organization: user.organization,
      permissions: user.permissions || [],
      lastLogin: new Date(),
      isActive: user.isActive,
      isVerified: user.isVerified || false,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    return NextResponse.json({
      message: 'Login successful',
      token,
      user: userData
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 