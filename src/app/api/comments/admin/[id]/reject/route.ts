/**
 * Admin Reject Comment API Route
 *
 * PUT /api/comments/admin/[id]/reject - Reject a pending comment
 */

import { NextRequest, NextResponse } from 'next/server';
import { rejectComment } from '@/lib/db/comments';
import { verifyAdminSession } from '@/lib/auth/admin-auth';
import { cookies } from 'next/headers';

/**
 * PUT /api/comments/admin/[id]/reject
 * Rejects a pending comment
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    // Reject comment
    const comment = await rejectComment(id);

    return NextResponse.json({
      success: true,
      comment,
      message: 'Comment rejected successfully',
    });
  } catch (error) {
    console.error('Failed to reject comment:', error);
    return NextResponse.json(
      { error: 'Failed to reject comment' },
      { status: 500 }
    );
  }
}
