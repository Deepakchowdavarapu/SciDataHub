import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
  try {
    const { 
      email, 
      password, 
      firstName, 
      lastName, 
      role, 
      organization 
    } = await request.json();

    // Validate required fields
    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { message: 'Email, password, first name, and last name are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json(
        { message: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    // Check if user already exists
    const existingUser = await db.collection('users').findOne({ 
      email: email.toLowerCase() 
    });

    if (existingUser) {
      return NextResponse.json(
        { message: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Set permissions based on role
    let permissions = ['create_submission'];
    if (role === 'reviewer') {
      permissions.push('review_submission');
    } else if (role === 'admin') {
      permissions.push('review_submission', 'manage_users', 'admin_access');
    }

    // Create user object
    const newUser = {
      email: email.toLowerCase(),
      password: hashedPassword,
      firstName,
      lastName,
      role: role || 'citizen',
      organization: organization || '',
      permissions,
      isActive: true,
      isVerified: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Insert user into database
    const result = await db.collection('users').insertOne(newUser);

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: result.insertedId.toString(), 
        email: newUser.email, 
        role: newUser.role,
        permissions: newUser.permissions
      },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Return user data without password
    const userData = {
      id: result.insertedId.toString(),
      email: newUser.email,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      role: newUser.role,
      organization: newUser.organization,
      permissions: newUser.permissions,
      isActive: newUser.isActive,
      isVerified: newUser.isVerified,
      createdAt: newUser.createdAt,
      updatedAt: newUser.updatedAt
    };

    return NextResponse.json({
      message: 'User registered successfully',
      token,
      user: userData
    }, { status: 201 });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 