/**
 * Comment Edit/Delete API Routes
 *
 * PUT /api/comments/[id] - Edit a comment
 * DELETE /api/comments/[id] - Delete a comment
 */

import { NextRequest, NextResponse } from 'next/server';
import { editCommentSchema, deleteCommentSchema } from '@/lib/validators/comment-schemas';
import { getCommentById, updateComment, deleteComment } from '@/lib/db/comments';
import { verifyOwnershipToken } from '@/lib/auth/ownership-token';
import { sanitizeCommentText } from '@/lib/sanitize';
import { validateInput, checkCommentContent } from '@/lib/api/comment-validation';
import { sendNewCommentEmail } from '@/lib/email/notifications';
import { getRecipesFromCache } from '@/lib/notion';

/**
 * PUT /api/comments/[id]
 * Updates a comment's text (requires valid ownership token)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Validate input
    const validation = validateInput(editCommentSchema, body);
    if (!validation.ok) return validation.response;
    const { commentText, ownershipToken } = validation.data;

    // Verify comment exists
    const comment = await getCommentById(id);

    if (!comment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      );
    }

    // Verify ownership
    const isValid = await verifyOwnershipToken(ownershipToken, id);

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid or expired ownership token' },
        { status: 403 }
      );
    }

    // Sanitize input
    const sanitizedText = sanitizeCommentText(commentText);

    // Check for suspicious content
    const contentError = checkCommentContent(sanitizedText, "updated");
    if (contentError) return contentError;

    // Update comment
    const updatedComment = await updateComment(id, sanitizedText);

    // Send email notification for re-approval (non-blocking)
    const recipes = getRecipesFromCache();
    const recipe = recipes.find(r => r.id === updatedComment.recipeId);

    sendNewCommentEmail(
      updatedComment,
      recipe?.title,
      recipe?.slug
    ).catch((error) => {
      console.error('Failed to send email notification:', error);
    });

    return NextResponse.json({
      success: true,
      comment: updatedComment,
      message: 'Comment updated successfully and is pending re-approval',
    });
  } catch (error) {
    console.error('Failed to update comment:', error);
    return NextResponse.json(
      { error: 'Failed to update comment' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/comments/[id]
 * Deletes a comment (requires valid ownership token)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Validate input
    const deleteValidation = validateInput(deleteCommentSchema, body);
    if (!deleteValidation.ok) return deleteValidation.response;
    const { ownershipToken } = deleteValidation.data;

    // Verify comment exists
    const comment = await getCommentById(id);

    if (!comment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      );
    }

    // Verify ownership
    const isValid = await verifyOwnershipToken(ownershipToken, id);

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid or expired ownership token' },
        { status: 403 }
      );
    }

    // Delete comment (cascade deletes replies)
    await deleteComment(id);

    return NextResponse.json({
      success: true,
      message: 'Comment deleted successfully',
    });
  } catch (error) {
    console.error('Failed to delete comment:', error);
    return NextResponse.json(
      { error: 'Failed to delete comment' },
      { status: 500 }
    );
  }
}
