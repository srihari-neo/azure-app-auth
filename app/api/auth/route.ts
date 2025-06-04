import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongoose';
import bcrypt from 'bcryptjs';
import User from '@/models/user';

export async function POST(request: NextRequest) {
  console.log('🚀 Auth API called');
  
  try {
    const body = await request.json();
    const { action, email, password } = body;
    console.log('📝 Request body:', { action, email: email ? '***@***.***' : 'undefined', password: password ? '[PROVIDED]' : 'undefined' });

    if (!action || !email || !password) {
      console.log('❌ Missing required fields');
      return NextResponse.json(
        { message: 'Action, email, and password are required' },
        { status: 400 }
      );
    }

    // Connect to MongoDB using Mongoose
    console.log('🔗 Attempting to connect to database...');
    await connectToDatabase();
    console.log('✅ Database connection successful');

    if (action === 'signup') {
      console.log('👤 Processing signup for:', email);
      
      // Check if user already exists
      console.log('🔍 Checking if user exists...');
      const existingUser = await User.findOne({ email });
      console.log('🔍 User exists check result:', !!existingUser);
      
      if (existingUser) {
        console.log('❌ User already exists');
        return NextResponse.json(
          { message: 'User already exists' },
          { status: 400 }
        );
      }

      // Hash password
      console.log('🔐 Hashing password...');
      const hashedPassword = await bcrypt.hash(password, 10);
      console.log('✅ Password hashed successfully');

      // Create new user
      console.log('💾 Creating new user...');
      const user = new User({
        email,
        password: hashedPassword,
      });

      console.log('💾 Saving user to database...');
      await user.save();
      console.log('✅ User saved successfully');

      return NextResponse.json(
        { message: 'User created successfully' },
        { status: 201 }
      );

    } else if (action === 'signin') {
      console.log('🔐 Processing signin for:', email);
      
      // Find user
      console.log('🔍 Looking for user in database...');
      const user = await User.findOne({ email });
      console.log('🔍 User found:', !!user);
      
      if (!user) {
        console.log('❌ User not found');
        return NextResponse.json(
          { message: 'Invalid credentials' },
          { status: 401 }
        );
      }

      // Verify password
      console.log('🔐 Verifying password...');
      const isMatch = await bcrypt.compare(password, user.password);
      console.log('🔐 Password match result:', isMatch);
      
      if (!isMatch) {
        console.log('❌ Password does not match');
        return NextResponse.json(
          { message: 'Invalid credentials' },
          { status: 401 }
        );
      }

      console.log('✅ Sign-in successful');
      // Return success
      return NextResponse.json(
        { message: 'Sign-in successful', user: { email: user.email } },
        { status: 200 }
      );

    } else {
      console.log('❌ Invalid action:', action);
      return NextResponse.json(
        { message: 'Invalid action' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('💥 Auth error occurred:', error);
    console.error('💥 Error name:', error instanceof Error ? error.name : 'Unknown');
    console.error('💥 Error message:', error instanceof Error ? error.message : 'Unknown error');
    console.error('💥 Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    // More specific error handling
    if (error instanceof Error) {
      if (error.message.includes('timeout')) {
        console.log('⏰ Database timeout detected');
        return NextResponse.json(
          { message: 'Database connection timeout. Please try again.' },
          { status: 503 }
        );
      }
      if (error.message.includes('E11000')) {
        console.log('🔄 Duplicate key error detected');
        return NextResponse.json(
          { message: 'User already exists' },
          { status: 400 }
        );
      }
    }
    
    console.log('❌ Returning internal server error');
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}