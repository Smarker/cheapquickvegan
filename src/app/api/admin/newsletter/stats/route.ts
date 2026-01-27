/**
 * Admin Newsletter Stats API Route
 *
 * GET /api/admin/newsletter/stats - Get newsletter statistics (requires admin auth)
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/auth/admin-auth';
import { getActiveSubscriberCount, getPendingSubscriptionCount } from '@/lib/db/newsletter';

/**
 * GET /api/admin/newsletter/stats
 * Returns newsletter statistics for admin dashboard
 */
export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const authError = await requireAdminAuth();
    if (authError) return authError;

    // Fetch statistics
    const activeSubscribers = await getActiveSubscriberCount();
    const pendingSubscriptions = await getPendingSubscriptionCount();

    return NextResponse.json({
      activeSubscribers,
      pendingSubscriptions,
      total: activeSubscribers + pendingSubscriptions,
    });
  } catch (error) {
    console.error('Failed to fetch newsletter stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch newsletter statistics' },
      { status: 500 }
    );
  }
}
