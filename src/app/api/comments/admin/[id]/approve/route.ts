/**
 * Admin Approve Comment API Route
 *
 * PUT /api/comments/admin/[id]/approve - Approve a pending comment
 */

import { NextRequest, NextResponse } from 'next/server';
import { approveComment } from '@/lib/db/comments';
import { verifyAdminSession } from '@/lib/auth/admin-auth';
import { cookies } from 'next/headers';

/**
 * PUT /api/comments/admin/[id]/approve
 * Approves a pending comment
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

    // Approve comment
    const comment = await approveComment(id);

    return NextResponse.json({
      success: true,
      comment,
      message: 'Comment approved successfully',
    });
  } catch (error) {
    console.error('Failed to approve comment:', error);
    return NextResponse.json(
      { error: 'Failed to approve comment' },
      { status: 500 }
    );
  }
}
