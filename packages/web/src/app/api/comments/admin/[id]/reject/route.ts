/**
 * Admin Reject Comment API Route
 *
 * PUT /api/comments/admin/[id]/reject - Reject a pending comment
 */

import { NextRequest, NextResponse } from 'next/server';
import { rejectComment } from '@/lib/db/comments';
import { requireAdminAuth } from '@/lib/auth/admin-auth';

/**
 * PUT /api/comments/admin/[id]/reject
 * Rejects a pending comment
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin authentication
    const authError = await requireAdminAuth();
    if (authError) return authError;

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
