/**
 * Admin Approve Comment API Route
 *
 * PUT /api/comments/admin/[id]/approve - Approve a pending comment
 */

import { NextRequest, NextResponse } from 'next/server';
import { approveComment } from '@/lib/db/comments';
import { requireAdminAuth } from '@/lib/auth/admin-auth';

/**
 * PUT /api/comments/admin/[id]/approve
 * Approves a pending comment
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
