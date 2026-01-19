/**
 * Comments API Route
 *
 * GET /api/comments?recipeId=xxx - Fetch approved comments for a recipe
 * POST /api/comments - Submit a new comment or reply
 */

import { NextRequest, NextResponse } from 'next/server';
import { commentSchema, replySchema } from '@/lib/validators/comment-schemas';
import { createComment, getApprovedComments, getAggregateRating } from '@/lib/db/comments';
import { checkRateLimit, incrementRateLimit } from '@/lib/db/rate-limit';
import { generateOwnershipToken } from '@/lib/auth/ownership-token';
import { sanitizeCommentText, sanitizeName, sanitizeEmail, containsSuspiciousContent } from '@/lib/sanitize';
import { sendNewCommentEmail } from '@/lib/email/notifications';
import { getRecipesFromCache } from '@/lib/notion';
import { getAdminConfig } from '@/lib/auth/admin-auth';

/**
 * GET /api/comments?recipeId=xxx
 * Fetches approved comments and aggregate rating for a recipe
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const recipeId = searchParams.get('recipeId');

    if (!recipeId) {
      return NextResponse.json(
        { error: 'Recipe ID is required' },
        { status: 400 }
      );
    }

    const [comments, aggregateRating] = await Promise.all([
      getApprovedComments(recipeId),
      getAggregateRating(recipeId),
    ]);

    return NextResponse.json({
      comments,
      aggregateRating,
    });
  } catch (error) {
    console.error('Failed to fetch comments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/comments
 * Creates a new comment or reply
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Determine if this is a comment or reply
    const isReply = !!body.parentCommentId;
    const schema = isReply ? replySchema : commentSchema;

    // Validate input
    const validationResult = schema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Get IP address for rate limiting
    const forwarded = request.headers.get('x-forwarded-for');
    const ipAddress = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || '127.0.0.1';

    // Check rate limit
    const rateLimit = await checkRateLimit(ipAddress);

    if (!rateLimit.isAllowed) {
      // Get rate limit window configuration to calculate reset time
      const windowHours = parseInt(await getAdminConfig('rate_limit_window_hours') || '1');
      const resetTime = new Date(rateLimit.windowStart.getTime() + windowHours * 60 * 60 * 1000);

      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: 'You have submitted too many comments. Please try again later.',
          remainingComments: rateLimit.remainingComments,
          resetTime: resetTime.toISOString(),
        },
        { status: 429 }
      );
    }

    // Sanitize inputs
    const sanitizedCommentText = sanitizeCommentText(data.commentText);
    const sanitizedName = sanitizeName(data.name || null);
    const sanitizedEmail = sanitizeEmail(data.email);

    // Check for suspicious content
    if (containsSuspiciousContent(sanitizedCommentText)) {
      return NextResponse.json(
        { error: 'Comment contains suspicious content and cannot be submitted' },
        { status: 400 }
      );
    }

    // Generate ownership token
    const comment = await createComment({
      recipeId: data.recipeId,
      parentCommentId: 'parentCommentId' in data ? data.parentCommentId : undefined,
      name: sanitizedName,
      email: sanitizedEmail,
      commentText: sanitizedCommentText,
      rating: 'rating' in data ? (data.rating ?? null) : null,
      ownershipToken: '', // Will be updated below
      ipAddress,
      userAgent: request.headers.get('user-agent') || '',
    });

    // Generate ownership token with comment ID
    const ownershipToken = await generateOwnershipToken(comment.id, sanitizedEmail);

    // Update comment with ownership token
    // Note: We need to update the comment in the database with the token
    // For now, we'll return it and the frontend will store it
    // In production, you might want to store this in the database

    // Increment rate limit
    await incrementRateLimit(ipAddress);

    // Send email notification to admin (non-blocking)
    // Get recipe info for email
    const recipes = getRecipesFromCache();
    const recipe = recipes.find(r => r.id === data.recipeId);

    sendNewCommentEmail(
      comment,
      recipe?.title,
      recipe?.slug
    ).catch((error) => {
      console.error('Failed to send email notification:', error);
      // Don't fail the request if email fails
    });

    return NextResponse.json({
      success: true,
      id: comment.id,
      ownershipToken,
      message: 'Comment submitted successfully and is pending approval',
    });
  } catch (error) {
    console.error('Failed to create comment:', error);
    return NextResponse.json(
      { error: 'Failed to submit comment' },
      { status: 500 }
    );
  }
}
