/**
 * Newsletter Email Module
 *
 * Handles sending email notifications for newsletter subscriptions.
 */

import { Resend } from 'resend';
import { generateUnsubscribeToken } from '../auth/newsletter-token';

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Sends a verification email to confirm newsletter subscription
 * @param email - The subscriber's email address
 * @param name - The subscriber's name (optional)
 * @param verificationToken - The JWT verification token
 */
export async function sendVerificationEmail(
  email: string,
  name: string | null,
  verificationToken: string
): Promise<void> {
  try {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.cheapquickvegan.com';
    const verificationUrl = `${siteUrl}/api/newsletter/confirm?token=${verificationToken}`;
    const displayName = name || 'there';

    const subject = 'Confirm Your Newsletter Subscription';

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
      <p style="margin: 0 0 15px 0; color: #495057;">
        Thanks for subscribing to the Cheap Quick Vegan newsletter! You're one step away from getting delicious vegan recipes delivered to your inbox monthly.
      </p>
      <p style="margin: 0; color: #495057;">
        Please confirm your email address by clicking the button below:
      </p>
    </div>

    <div style="text-align: center; margin: 40px 0;">
      <a href="${verificationUrl}"
         style="display: inline-block; background-color: #735d78; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 6px rgba(115, 93, 120, 0.3);">
        ✓ Confirm Subscription
      </a>
    </div>

    <div style="background-color: #f8f9fa; border-left: 3px solid #735d78; padding: 15px; margin: 30px 0; border-radius: 4px;">
      <p style="margin: 0 0 10px 0; color: #495057; font-size: 14px;">
        <strong>What to expect:</strong>
      </p>
      <ul style="margin: 0; padding-left: 20px; color: #6c757d; font-size: 14px;">
        <li style="margin-bottom: 5px;">Monthly recipe ideas that are budget-friendly</li>
        <li style="margin-bottom: 5px;">Easy, delicious vegan meals</li>
        <li style="margin-bottom: 5px;">Exclusive content not available on the blog</li>
      </ul>
    </div>

    <div style="text-align: center; color: #adb5bd; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6;">
      <p style="margin: 0 0 5px 0;">This link will expire in 24 hours.</p>
      <p style="margin: 0;">If you didn't subscribe to this newsletter, you can safely ignore this email.</p>
    </div>
  </div>

  <div style="text-align: center; color: #6c757d; font-size: 12px; margin-top: 20px; padding: 20px;">
    <p style="margin: 0;">© ${new Date().getFullYear()} Cheap Quick Vegan. All rights reserved.</p>
  </div>
</body>
</html>
    `.trim();

    await resend.emails.send({
      from: 'Cheap Quick Vegan <noreply@cheapquickvegan.com>',
      replyTo: 'cheapquickvegan@gmail.com',
      to: email,
      subject,
      html,
    });

    console.log(`Verification email sent to ${email}`);
  } catch (error) {
    console.error('Failed to send verification email:', error);
    throw error; // Throw to handle in API route
  }
}

/**
 * Sends a welcome email after successful subscription confirmation
 * @param email - The subscriber's email address
 * @param name - The subscriber's name (optional)
 */
export async function sendWelcomeEmail(
  email: string,
  name: string | null
): Promise<void> {
  try {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.cheapquickvegan.com';
    const displayName = name || 'there';

    // Generate unsubscribe token
    const unsubscribeToken = await generateUnsubscribeToken(email);
    const unsubscribeUrl = `${siteUrl}/api/newsletter/unsubscribe?token=${unsubscribeToken}`;

    const subject = "You've Subscribed to CheapQuickVegan!";

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
      <h1 style="color: #735d78; margin: 0 0 10px 0; font-size: 28px;">🎉 Welcome ${displayName}!</h1>
      <p style="color: #6c757d; margin: 0; font-size: 16px;">You're now part of the Cheap Quick Vegan community</p>
    </div>

    <div style="margin-bottom: 30px;">
      <p style="margin: 0 0 15px 0; color: #495057; font-size: 16px;">
        Thanks for confirming your subscription! We're excited to share delicious vegan recipes and budget-friendly tips with you each month.
      </p>
    </div>

    <div style="background-color: #f1f8f4; border-radius: 8px; padding: 25px; margin: 30px 0;">
      <h3 style="color: #2c3e50; margin: 0 0 15px 0; font-size: 18px;">🌟 Get Started:</h3>
      <ul style="margin: 0; padding-left: 20px; color: #495057; font-size: 14px; line-height: 1.8;">
        <li style="margin-bottom: 8px;"><a href="${siteUrl}/recipes" style="color: #735d78; text-decoration: none; font-weight: 500;">Browse All Recipes</a></li>
        <li style="margin-bottom: 8px;"><a href="${siteUrl}/guides" style="color: #735d78; text-decoration: none; font-weight: 500;">Travel Guides</a></li>
        <li style="margin-bottom: 8px;"><a href="${siteUrl}" style="color: #735d78; text-decoration: none; font-weight: 500;">Visit the Blog</a></li>
      </ul>
    </div>

    <div style="background-color: #fff8e1; border-left: 3px solid #ffc107; padding: 15px; margin: 30px 0; border-radius: 4px;">
      <p style="margin: 0; color: #495057; font-size: 14px;">
        <strong>💡 Pro tip:</strong> Add our email to your contacts so our newsletters don't end up in promotions!
      </p>
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

    await resend.emails.send({
      from: 'Cheap Quick Vegan <noreply@cheapquickvegan.com>',
      replyTo: 'cheapquickvegan@gmail.com',
      to: email,
      subject,
      html,
    });

    console.log(`Welcome email sent to ${email}`);
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    // Don't throw - welcome email failure shouldn't break confirmation
  }
}
