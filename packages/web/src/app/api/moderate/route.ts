/**
 * One-Click Moderation API Route
 *
 * GET /api/moderate?token=xxx&action=approve
 * GET /api/moderate?token=xxx&action=reject
 *
 * Allows moderating comments directly from email links.
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyModerationToken } from '@/lib/auth/moderation-token';
import { approveComment, rejectComment } from '@/lib/db/comments';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const action = searchParams.get('action');

    if (!token || !action) {
      return new NextResponse(
        createHtmlResponse('Invalid Request', 'Missing token or action parameter.'),
        { status: 400, headers: { 'Content-Type': 'text/html' } }
      );
    }

    if (action !== 'approve' && action !== 'reject') {
      return new NextResponse(
        createHtmlResponse('Invalid Request', 'Action must be "approve" or "reject".'),
        { status: 400, headers: { 'Content-Type': 'text/html' } }
      );
    }

    // Verify token
    const commentId = await verifyModerationToken(token);

    if (!commentId) {
      return new NextResponse(
        createHtmlResponse('Invalid or Expired Link', 'This moderation link has expired or is invalid.'),
        { status: 401, headers: { 'Content-Type': 'text/html' } }
      );
    }

    // Perform action
    try {
      if (action === 'approve') {
        await approveComment(commentId);
      } else {
        await rejectComment(commentId);
      }

      const actionText = action === 'approve' ? 'approved' : 'rejected';
      return new NextResponse(
        createSuccessResponse(actionText),
        { status: 200, headers: { 'Content-Type': 'text/html' } }
      );
    } catch (error) {
      return new NextResponse(
        createHtmlResponse('Error', 'Comment not found or already moderated.'),
        { status: 404, headers: { 'Content-Type': 'text/html' } }
      );
    }
  } catch (error) {
    console.error('Moderation failed:', error);
    return new NextResponse(
      createHtmlResponse('Error', 'An error occurred while moderating the comment.'),
      { status: 500, headers: { 'Content-Type': 'text/html' } }
    );
  }
}

function createHtmlResponse(title: string, message: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      background: #f8f9fa;
    }
    .container {
      text-align: center;
      padding: 40px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      max-width: 500px;
    }
    h1 {
      color: #dc3545;
      margin-bottom: 20px;
    }
    p {
      color: #6c757d;
      line-height: 1.6;
    }
    a {
      display: inline-block;
      margin-top: 20px;
      padding: 12px 24px;
      background: #007bff;
      color: white;
      text-decoration: none;
      border-radius: 4px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>${title}</h1>
    <p>${message}</p>
    <a href="/admin/comments">Go to Admin Dashboard</a>
  </div>
</body>
</html>
  `;
}

function createSuccessResponse(action: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Comment ${action.charAt(0).toUpperCase() + action.slice(1)}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      background: #f8f9fa;
    }
    .container {
      text-align: center;
      padding: 40px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      max-width: 500px;
    }
    .success-icon {
      font-size: 64px;
      margin-bottom: 20px;
    }
    h1 {
      color: #28a745;
      margin-bottom: 20px;
    }
    p {
      color: #6c757d;
      line-height: 1.6;
    }
    a {
      display: inline-block;
      margin-top: 20px;
      padding: 12px 24px;
      background: #007bff;
      color: white;
      text-decoration: none;
      border-radius: 4px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="success-icon">✓</div>
    <h1>Comment ${action.charAt(0).toUpperCase() + action.slice(1)}!</h1>
    <p>The comment has been successfully ${action}.</p>
    <a href="/admin/comments">View Pending Comments</a>
  </div>
</body>
</html>
  `;
}
