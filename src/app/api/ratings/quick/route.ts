import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { nanoid } from 'nanoid';

/**
 * Quick rating endpoint - allows users to rate without leaving a full review
 * Users get one rating per recipe, but can update it
 */
export async function POST(request: NextRequest) {
  try {
    const { recipeId, rating, ratingToken } = await request.json();

    if (!recipeId || !rating) {
      return NextResponse.json(
        { error: 'Recipe ID and rating are required' },
        { status: 400 }
      );
    }

    // Validate rating is 1-5
    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Get IP and User Agent for tracking
    const ipAddress = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Check if user already rated this recipe (by token or IP)
    let existingRating = null;

    if (ratingToken) {
      // Check by token first (more reliable)
      const tokenCheck = await sql`
        SELECT id, rating FROM comments
        WHERE recipe_id = ${recipeId}
          AND ownership_token = ${ratingToken}
          AND comment_text = ''
        LIMIT 1
      `;
      if (tokenCheck.rows.length > 0) {
        existingRating = tokenCheck.rows[0];
      }
    }

    if (!existingRating) {
      // Check by IP address
      const ipCheck = await sql`
        SELECT id, rating, ownership_token FROM comments
        WHERE recipe_id = ${recipeId}
          AND ip_address = ${ipAddress}
          AND comment_text = ''
        ORDER BY created_at DESC
        LIMIT 1
      `;
      if (ipCheck.rows.length > 0) {
        existingRating = ipCheck.rows[0];
      }
    }

    if (existingRating) {
      // Update existing rating
      await sql`
        UPDATE comments
        SET rating = ${rating},
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ${existingRating.id}
      `;

      return NextResponse.json({
        success: true,
        action: 'updated',
        message: 'Rating updated successfully',
        ratingToken: existingRating.ownership_token || ratingToken,
        previousRating: parseInt(existingRating.rating)
      });
    } else {
      // Create new rating
      const newToken = nanoid(32);
      const result = await sql`
        INSERT INTO comments (
          recipe_id,
          name,
          email,
          comment_text,
          rating,
          status,
          ownership_token,
          ip_address,
          user_agent
        ) VALUES (
          ${recipeId},
          NULL,
          ${`quick-rating-${nanoid(10)}@anonymous.local`},
          '',
          ${rating},
          'approved',
          ${newToken},
          ${ipAddress},
          ${userAgent}
        )
        RETURNING id
      `;

      return NextResponse.json({
        success: true,
        action: 'created',
        message: 'Rating submitted successfully',
        ratingToken: newToken,
        commentId: result.rows[0].id
      });
    }
  } catch (error) {
    console.error('Error submitting quick rating:', error);
    return NextResponse.json(
      { error: 'Failed to submit rating' },
      { status: 500 }
    );
  }
}

/**
 * Get user's existing rating for a recipe
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const recipeId = searchParams.get('recipeId');
    const ratingToken = searchParams.get('ratingToken');

    if (!recipeId) {
      return NextResponse.json(
        { error: 'Recipe ID is required' },
        { status: 400 }
      );
    }

    const ipAddress = request.ip || request.headers.get('x-forwarded-for') || 'unknown';

    // Check for existing rating by token or IP
    let query;
    if (ratingToken) {
      query = sql`
        SELECT rating FROM comments
        WHERE recipe_id = ${recipeId}
          AND ownership_token = ${ratingToken}
          AND comment_text = ''
        LIMIT 1
      `;
    } else {
      query = sql`
        SELECT rating FROM comments
        WHERE recipe_id = ${recipeId}
          AND ip_address = ${ipAddress}
          AND comment_text = ''
        ORDER BY created_at DESC
        LIMIT 1
      `;
    }

    const result = await query;

    if (result.rows.length > 0) {
      return NextResponse.json({
        hasRated: true,
        rating: parseInt(result.rows[0].rating)
      });
    }

    return NextResponse.json({
      hasRated: false,
      rating: null
    });
  } catch (error) {
    console.error('Error fetching user rating:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rating' },
      { status: 500 }
    );
  }
}
