import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { nanoid } from 'nanoid';
import { checkRateLimit, getClientIp } from '@/lib/security/rate-limit';

// New ratings allowed per IP per hour. Generous on purpose: many phones share one
// carrier IP, so this only stops floods, never a household or a busy network.
const NEW_RATINGS_PER_HOUR = 30;

/**
 * Quick rating endpoint - allows users to rate without leaving a full review.
 *
 * A rating belongs to whoever holds its ownership token (kept in the browser's
 * localStorage or the app's storage). We never match ratings by IP address:
 * phones on mobile data and people on shared Wi-Fi share IPs, and matching on
 * IP let one person's rating overwrite a stranger's.
 */
export async function POST(request: NextRequest) {
  try {
    const { recipeId, rating, ratingToken } = await request.json();

    if (!recipeId || rating == null) {
      return NextResponse.json(
        { error: 'Recipe ID and rating are required' },
        { status: 400 }
      );
    }

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be a whole number from 1 to 5' },
        { status: 400 }
      );
    }

    const clientIp = getClientIp(request);
    // ip_address is an INET column; store null rather than the 'unknown' placeholder.
    const ipAddress = clientIp === 'unknown' ? null : clientIp;
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // The token holder can change their own rating.
    if (typeof ratingToken === 'string' && ratingToken.length > 0) {
      const existing = await sql`
        SELECT id, rating FROM comments
        WHERE recipe_id = ${recipeId}
          AND ownership_token = ${ratingToken}
          AND comment_text = ''
        LIMIT 1
      `;

      if (existing.rows.length > 0) {
        await sql`
          UPDATE comments
          SET rating = ${rating},
              updated_at = CURRENT_TIMESTAMP
          WHERE id = ${existing.rows[0].id}
        `;

        return NextResponse.json({
          success: true,
          action: 'updated',
          message: 'Rating updated successfully',
          ratingToken,
          previousRating: parseInt(existing.rows[0].rating),
        });
      }
    }

    // Anything else is a new rating with a fresh token.
    const limit = checkRateLimit(`quick-rating:${clientIp}`, NEW_RATINGS_PER_HOUR, 60 * 60 * 1000);
    if (!limit.isAllowed) {
      return NextResponse.json(
        { error: 'Too many ratings from this network. Please try again in a little while.' },
        { status: 429 }
      );
    }

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
      commentId: result.rows[0].id,
    });
  } catch (error) {
    console.error('Error submitting quick rating:', error);
    return NextResponse.json(
      { error: 'Failed to submit rating' },
      { status: 500 }
    );
  }
}

/**
 * Get the caller's existing rating for a recipe, found by their token only.
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

    if (!ratingToken) {
      return NextResponse.json({ hasRated: false, rating: null });
    }

    const result = await sql`
      SELECT rating FROM comments
      WHERE recipe_id = ${recipeId}
        AND ownership_token = ${ratingToken}
        AND comment_text = ''
      LIMIT 1
    `;

    if (result.rows.length > 0) {
      return NextResponse.json({
        hasRated: true,
        rating: parseInt(result.rows[0].rating),
      });
    }

    return NextResponse.json({ hasRated: false, rating: null });
  } catch (error) {
    console.error('Error fetching user rating:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rating' },
      { status: 500 }
    );
  }
}
