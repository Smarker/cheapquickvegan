/**
 * Admin Newsletter Send API Route
 *
 * POST /api/admin/newsletter/send - Send newsletter to all active subscribers (requires admin auth)
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/auth/admin-auth';
import { getActiveSubscribers } from '@/lib/db/newsletter';
import { generateUnsubscribeToken } from '@/lib/auth/newsletter-token';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendNewsletterRequest {
  subject: string;
  content: string;
}

/**
 * POST /api/admin/newsletter/send
 * Sends newsletter to all active subscribers
 */
export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const authError = await requireAdminAuth();
    if (authError) return authError;

    // Parse request body
    const body = await request.json() as SendNewsletterRequest;
    const { subject, content } = body;

    // Validate input
    if (!subject || !subject.trim()) {
      return NextResponse.json(
        { error: 'Subject is required' },
        { status: 400 }
      );
    }

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    // Get all active subscribers
    const subscribers = await getActiveSubscribers();

    if (subscribers.length === 0) {
      return NextResponse.json(
        { error: 'No active subscribers', sent: 0 },
        { status: 400 }
      );
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.cheapquickvegan.com';

    // Send email to each subscriber
    let successCount = 0;
    let failCount = 0;

    for (const subscriber of subscribers) {
      try {
        // Generate unsubscribe token for this subscriber
        const unsubscribeToken = await generateUnsubscribeToken(subscriber.email);
        const unsubscribeUrl = `${siteUrl}/api/newsletter/unsubscribe?token=${unsubscribeToken}`;
        const displayName = subscriber.name || 'there';

        // Format content with proper line breaks
        const formattedContent = content
          .split('\n')
          .map(line => line.trim() === '' ? '<br>' : `<p style="margin: 0 0 15px 0; color: #495057;">${line}</p>`)
          .join('\n');

        const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
  <div style="background-color: #ffffff; border-radius: 12px; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
    <div style="text-align: center; margin-bottom: 30px;">
      <h1 style="color: #735d78; margin: 0 0 10px 0; font-size: 28px;">🌱 Cheap Quick Vegan</h1>
      <p style="color: #6c757d; margin: 0; font-size: 14px;">Delicious vegan recipes</p>
    </div>

    <div style="margin-bottom: 30px;">
      <h2 style="color: #2c3e50; margin: 0 0 15px 0; font-size: 22px;">Hi ${displayName}! 👋</h2>
      ${formattedContent}
    </div>

    <div style="text-align: center; margin-top: 40px;">
      <p style="margin: 0 0 15px 0; color: #6c757d; font-size: 14px;">Stay connected:</p>
      <div style="margin: 0;">
        <a href="https://instagram.com/cheapquickvegan" style="display: inline-block; color: #735d78; text-decoration: none; margin: 0 8px; padding: 8px 16px; border: 1px solid #735d78; border-radius: 6px; font-size: 14px; font-weight: 500;">Instagram</a>
        <a href="https://www.facebook.com/profile.php?id=61584092626079" style="display: inline-block; color: #735d78; text-decoration: none; margin: 0 8px; padding: 8px 16px; border: 1px solid #735d78; border-radius: 6px; font-size: 14px; font-weight: 500;">Facebook</a>
      </div>
    </div>

    <div style="text-align: center; color: #adb5bd; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6;">
      <p style="margin: 0 0 10px 0;">You're receiving this because you subscribed at ${siteUrl}</p>
      <p style="margin: 0;">
        <a href="${unsubscribeUrl}" style="color: #6c757d; text-decoration: underline;">Unsubscribe</a>
      </p>
    </div>
  </div>

  <div style="text-align: center; color: #6c757d; font-size: 12px; margin-top: 20px; padding: 20px;">
    <p style="margin: 0;">© ${new Date().getFullYear()} Cheap Quick Vegan. All rights reserved.</p>
  </div>
</body>
</html>
        `.trim();

        // Send email
        await resend.emails.send({
          from: 'Cheap Quick Vegan <noreply@cheapquickvegan.com>',
          replyTo: 'cheapquickvegan@gmail.com',
          to: subscriber.email,
          subject,
          html,
        });

        successCount++;
        console.log(`Newsletter sent to ${subscriber.email}`);
      } catch (emailError) {
        console.error(`Failed to send newsletter to ${subscriber.email}:`, emailError);
        failCount++;
      }
    }

    console.log(`Newsletter batch complete: ${successCount} sent, ${failCount} failed`);

    return NextResponse.json({
      message: 'Newsletter sent successfully',
      sent: successCount,
      failed: failCount,
      total: subscribers.length,
    });
  } catch (error) {
    console.error('Newsletter send error:', error);
    return NextResponse.json(
      { error: 'An error occurred while sending the newsletter' },
      { status: 500 }
    );
  }
}
