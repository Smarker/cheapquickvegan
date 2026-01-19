/**
 * Admin Comments API Route
 *
 * GET /api/comments/admin - Get all pending comments (requires admin auth)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getPendingComments } from '@/lib/db/comments';
import { verifyAdminSession } from '@/lib/auth/admin-auth';
import { cookies } from 'next/headers';

/**
 * GET /api/comments/admin
 * Returns all pending comments for admin moderation
 */
export async function GET(request: NextRequest) {
  try {
    // Verify admin session
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('admin-session')?.value;

    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Unauthorized - No session token' },
        { status: 401 }
      );
    }

    const isAdmin = await verifyAdminSession(sessionToken);

    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid session' },
        { status: 401 }
      );
    }

    // Fetch pending comments
    const comments = await getPendingComments();

    return NextResponse.json({
      comments,
      count: comments.length,
    });
  } catch (error) {
    console.error('Failed to fetch pending comments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pending comments' },
      { status: 500 }
    );
  }
}
