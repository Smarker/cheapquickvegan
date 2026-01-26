/**
 * Admin Comments API Route
 *
 * GET /api/comments/admin - Get all pending comments (requires admin auth)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getPendingComments } from '@/lib/db/comments';
import { requireAdminAuth } from '@/lib/auth/admin-auth';

/**
 * GET /api/comments/admin
 * Returns all pending comments for admin moderation
 */
export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const authError = await requireAdminAuth();
    if (authError) return authError;

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
