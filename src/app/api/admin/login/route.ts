/**
 * Admin Login API Route
 *
 * POST /api/admin/login - Authenticate admin and create session
 */

import { NextRequest, NextResponse } from 'next/server';
import { adminLoginSchema } from '@/lib/validators/comment-schemas';
import { verifyAdminPassword, createAdminSession } from '@/lib/auth/admin-auth';
import { cookies } from 'next/headers';

/**
 * POST /api/admin/login
 * Authenticates admin with password and creates a session cookie
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validationResult = adminLoginSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const { password } = validationResult.data;

    // Verify password
    const isValid = await verifyAdminPassword(password);

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      );
    }

    // Create session token
    const sessionToken = await createAdminSession();

    // Set HTTP-only cookie
    const cookieStore = await cookies();
    cookieStore.set('admin-session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return NextResponse.json({
      success: true,
      message: 'Login successful',
    });
  } catch (error) {
    console.error('Admin login failed:', error);
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    );
  }
}
