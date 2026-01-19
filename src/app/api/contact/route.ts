import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { checkContactRateLimit, incrementContactRateLimit } from "@/lib/db/contact-rate-limit";
import { sanitizeFormData } from "@/lib/security/sanitize";
import { getAdminConfig } from "@/lib/auth/admin-auth";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const rawData = await request.json();

    // Check honeypot field FIRST (before rate limiting)
    // This way bots don't consume rate limit quota
    if (rawData.website && rawData.website.trim().length > 0) {
      console.log("Honeypot triggered - potential bot submission, website field:", rawData.website);
      // Return success to fool bots, but don't actually send email
      return NextResponse.json(
        { message: "Message sent successfully" },
        { status: 200 }
      );
    }

    // Rate limiting (only for legitimate requests) - using database (2 per week)
    const forwarded = request.headers.get('x-forwarded-for');
    const clientIp = forwarded ? forwarded.split(',')[0].trim() : request.headers.get('x-real-ip') || '127.0.0.1';
    console.log('Contact form - Client IP:', clientIp);

    const rateLimit = await checkContactRateLimit(clientIp);
    console.log('Rate limit check:', { isAllowed: rateLimit.isAllowed, remaining: rateLimit.remainingSubmissions });

    if (!rateLimit.isAllowed) {
      console.log('Rate limit exceeded for IP:', clientIp);
      const resetDate = new Date(rateLimit.windowStart.getTime() + (7 * 24 * 60 * 60 * 1000));
      return NextResponse.json(
        { error: `Too many submissions. You can submit again after ${resetDate.toLocaleDateString()}.` },
        { status: 429 }
      );
    }

    // Sanitize all inputs
    const sanitized = sanitizeFormData(rawData);
    const { name, email, subject, message } = sanitized;

    // Validate required fields (after sanitization)
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Email validation is handled in sanitizeEmail
    if (!email) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Map subject values to friendly names
    const subjectMap: { [key: string]: string } = {
      "recipe-question": "Recipe Question or Substitution",
      "recipe-suggestion": "Recipe Suggestion",
      "collaboration": "Collaboration Inquiry",
      "feedback": "General Feedback",
      "other": "Other"
    };

    const subjectText = subjectMap[subject] || subject;

    // Get admin email from database
    const adminEmail = await getAdminConfig('admin_email');

    console.log('Contact form - Admin email retrieved:', adminEmail);

    if (!adminEmail) {
      console.error('Admin email not configured');
      return NextResponse.json(
        { error: "Server configuration error. Please try again later." },
        { status: 500 }
      );
    }

    // Send email via Resend
    console.log('Attempting to send contact form email to:', adminEmail);
    const emailResult = await resend.emails.send({
      from: "Cheap Quick Vegan <noreply@cheapquickvegan.com>",
      to: adminEmail,
      replyTo: email,
      subject: `Contact Form: ${subjectText}`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Contact Form Submission</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
    <h2 style="margin: 0 0 10px 0; color: #2c3e50;">
      📧 New Contact Form Submission
    </h2>
    <p style="margin: 0; color: #6c757d;">
      Topic: <strong>${subjectText}</strong>
    </p>
  </div>

  <div style="background-color: #ffffff; border: 1px solid #dee2e6; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
    <div style="margin-bottom: 15px;">
      <strong>From:</strong> ${name}
    </div>

    <div style="margin-bottom: 15px;">
      <strong>Email:</strong> <a href="mailto:${email}" style="color: #007bff; text-decoration: none;">${email}</a>
    </div>

    <div style="margin-bottom: 15px;">
      <strong>Message:</strong>
      <div style="background-color: #f8f9fa; border-left: 3px solid #007bff; padding: 10px; margin-top: 5px; white-space: pre-wrap;">
${message}
      </div>
    </div>
  </div>

  <div style="text-align: center; color: #6c757d; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6;">
    <p>This is an automated notification from Cheap Quick Vegan.</p>
    <p>You can reply directly to this email to respond to ${name}.</p>
  </div>
</body>
</html>
      `.trim(),
    });

    console.log('Email send result:', JSON.stringify(emailResult, null, 2));
    console.log(`Contact form submission sent from ${email} to ${adminEmail}`);

    // Increment rate limit after successful submission
    await incrementContactRateLimit(clientIp);

    return NextResponse.json(
      { message: "Message sent successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing contact form:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
