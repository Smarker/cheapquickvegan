/**
 * Email Notification Module
 *
 * Handles sending email notifications for comment moderation.
 */

import { Resend } from 'resend';
import { Comment } from '@/types/comment';
import { getAdminConfig } from '../auth/admin-auth';
import { generateModerationToken } from '../auth/moderation-token';

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Sends an email notification to admin when a new comment is submitted
 * @param comment - The comment that was submitted
 * @param recipeTitle - The title of the recipe (optional)
 * @param recipeSlug - The slug of the recipe (optional)
 */
export async function sendNewCommentEmail(
  comment: Comment,
  recipeTitle?: string,
  recipeSlug?: string
): Promise<void> {
  try {
    const adminEmail = await getAdminConfig('admin_email');

    if (!adminEmail) {
      console.error('Admin email not configured');
      return;
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.cheapquickvegan.com';
    const isReply = comment.parentCommentId !== null;
    const displayName = comment.name || 'Anonymous';

    // Generate one-click moderation token (same token for both actions)
    const moderationToken = await generateModerationToken(comment.id);

    const subject = isReply
      ? `New Reply on Recipe${recipeTitle ? `: ${recipeTitle}` : ''}`
      : `New Review on Recipe${recipeTitle ? `: ${recipeTitle}` : ''}`;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
    <h2 style="margin: 0 0 10px 0; color: #2c3e50;">
      ${isReply ? '💬 New Reply' : '⭐ New Review'}
    </h2>
    ${recipeTitle && recipeSlug ? `
      <p style="margin: 0; color: #6c757d;">
        On recipe: <a href="${siteUrl}/recipes/${recipeSlug}" style="color: #007bff; text-decoration: none;"><strong>${recipeTitle}</strong></a>
      </p>
    ` : recipeTitle ? `
      <p style="margin: 0; color: #6c757d;">On recipe: <strong>${recipeTitle}</strong></p>
    ` : ''}
  </div>

  <div style="background-color: #ffffff; border: 1px solid #dee2e6; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
    <div style="margin-bottom: 15px;">
      <strong>From:</strong> ${displayName}${comment.email ? ` (${comment.email})` : ''}
    </div>

    ${!isReply && comment.rating ? `
    <div style="margin-bottom: 15px;">
      <strong>Rating:</strong> ${'⭐'.repeat(comment.rating)} (${comment.rating}/5)
    </div>
    ` : ''}

    <div style="margin-bottom: 15px;">
      <strong>Comment:</strong>
      <div style="background-color: #f8f9fa; border-left: 3px solid #007bff; padding: 10px; margin-top: 5px; white-space: pre-wrap;">
        ${comment.commentText}
      </div>
    </div>

    <div style="font-size: 12px; color: #adb5bd; border-top: 1px solid #dee2e6; padding-top: 10px; margin-top: 10px;">
      ${comment.ipAddress ? `IP: ${comment.ipAddress === '::1' ? 'localhost (dev)' : comment.ipAddress}` : ''}
      ${!recipeSlug && comment.recipeId ? ` • Recipe ID: ${comment.recipeId}` : ''}
    </div>
  </div>

  <div style="text-align: center; margin: 30px 0;">
    <a href="${siteUrl}/api/moderate?token=${moderationToken}&action=approve"
       style="display: inline-block; background-color: #28a745; color: #ffffff; text-decoration: none; padding: 12px 30px; border-radius: 5px; font-weight: bold; margin: 0 5px;">
      ✓ Approve
    </a>
    <a href="${siteUrl}/api/moderate?token=${moderationToken}&action=reject"
       style="display: inline-block; background-color: #dc3545; color: #ffffff; text-decoration: none; padding: 12px 30px; border-radius: 5px; font-weight: bold; margin: 0 5px;">
      ✗ Reject
    </a>
  </div>

  <div style="text-align: center; color: #6c757d; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6;">
    <p>This is an automated notification from Cheap Quick Vegan.</p>
    <p>Or visit the <a href="${siteUrl}/admin/comments" style="color: #007bff;">admin dashboard</a> to review all pending comments.</p>
  </div>
</body>
</html>
    `.trim();

    await resend.emails.send({
      from: 'Cheap Quick Vegan <noreply@cheapquickvegan.com>',
      to: adminEmail,
      subject,
      html,
    });

    console.log(`Email notification sent for comment ${comment.id}`);
  } catch (error) {
    console.error('Failed to send email notification:', error);
    // Don't throw error - email failure shouldn't break comment submission
  }
}

/**
 * Sends a test email to verify email configuration
 * @param toEmail - The email address to send the test to
 */
export async function sendTestEmail(toEmail: string): Promise<boolean> {
  try {
    await resend.emails.send({
      from: 'Cheap Quick Vegan <noreply@cheapquickvegan.com>',
      to: toEmail,
      subject: 'Test Email - Comment System',
      html: `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; padding: 20px;">
  <h2>Email Test Successful!</h2>
  <p>Your email notification system is working correctly.</p>
  <p>You will receive notifications at this email address when new comments are submitted.</p>
</body>
</html>
      `.trim(),
    });

    return true;
  } catch (error) {
    console.error('Test email failed:', error);
    return false;
  }
}
