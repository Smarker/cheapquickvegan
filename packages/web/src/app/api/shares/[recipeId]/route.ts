import { NextRequest, NextResponse } from 'next/server';
import { getShareCounts } from '@/lib/db/shares';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ recipeId: string }> }
) {
  try {
    const { recipeId } = await params;

    if (!recipeId) {
      return NextResponse.json(
        { error: 'Recipe ID is required' },
        { status: 400 }
      );
    }

    const counts = await getShareCounts(recipeId);

    return NextResponse.json(counts);
  } catch (error) {
    console.error('Error fetching share counts:', error);
    // Return zero counts if database is not available (e.g., in development)
    return NextResponse.json({
      recipeId: (await params).recipeId,
      facebook: 0,
      whatsapp: 0,
      email: 0,
      native: 0,
      pinterest: 0,
      total: 0,
    });
  }
}
