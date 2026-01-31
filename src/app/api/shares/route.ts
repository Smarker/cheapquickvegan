import { NextRequest, NextResponse } from 'next/server';
import { trackShare } from '@/lib/db/shares';
import { SharePlatform } from '@/types/share';

export async function POST(request: NextRequest) {
  try {
    const { recipeId, platform } = await request.json();

    if (!recipeId || !platform) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate platform
    const validPlatforms: SharePlatform[] = ['facebook', 'whatsapp', 'email', 'native', 'pinterest'];
    if (!validPlatforms.includes(platform)) {
      return NextResponse.json(
        { error: 'Invalid platform' },
        { status: 400 }
      );
    }

    // Get IP and User Agent for analytics
    const ipAddress = request.headers.get('x-forwarded-for') ||
                      request.headers.get('x-real-ip') ||
                      'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    const shareEvent = await trackShare({
      recipeId,
      platform,
      ipAddress,
      userAgent,
    });

    return NextResponse.json({ success: true, shareEvent });
  } catch (error) {
    console.error('Error tracking share:', error);
    return NextResponse.json(
      { error: 'Failed to track share' },
      { status: 500 }
    );
  }
}
