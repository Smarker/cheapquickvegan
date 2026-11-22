# Recipe Comment System - Setup Guide

This guide will walk you through setting up and deploying the full-featured comment system with ratings, moderation, and email notifications.

## Prerequisites

- Vercel account (for hosting and Postgres database)
- Resend account (for email notifications)

## 1. Database Setup

### Create Vercel Postgres Database

1. Go to your Vercel dashboard
2. Navigate to Storage → Create Database → Postgres
3. Name it (e.g., "cheapquickvegan-comments")
4. Select a region close to your users
5. Click "Create"

### Run Migration

1. Copy the connection string from Vercel dashboard
2. In Vercel dashboard, go to your database → Query tab
3. Copy and paste the contents of `migrations/001_create_comments_schema.sql`
4. Click "Run Query"

### Generate Admin Password Hash

```bash
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('YOUR_ADMIN_PASSWORD_HERE', 10).then(console.log)"
```

Copy the output hash.

### Update Admin Configuration

In the Vercel Postgres Query tab, run:

```sql
UPDATE admin_config
SET value = 'YOUR_BCRYPT_HASH_HERE'
WHERE key = 'admin_password_hash';

UPDATE admin_config
SET value = 'cheapquickvegan@gmail.com'
WHERE key = 'admin_email';
```

## 2. Email Setup (Resend)

### Create Resend Account

1. Go to [resend.com](https://resend.com)
2. Sign up for a free account
3. Verify your email

### Add Domain (Production)

1. In Resend dashboard, go to Domains
2. Click "Add Domain"
3. Enter `cheapquickvegan.com`
4. Add the DNS records shown to your domain provider
5. Wait for verification (can take up to 48 hours)

### For Testing (Sandbox Mode)

You can test with Resend's sandbox domain immediately:
- Emails will only be sent to the email address you verified with Resend
- No domain configuration needed

### Get API Key

1. In Resend dashboard, go to API Keys
2. Click "Create API Key"
3. Name it (e.g., "cheapquickvegan-production")
4. Copy the API key (save it somewhere safe)

## 3. Environment Variables

### Required Variables

Add these to your Vercel project's environment variables:

```bash
# Database (auto-configured by Vercel when you link the database)
POSTGRES_URL="postgres://..."
POSTGRES_PRISMA_URL="postgres://..."
POSTGRES_URL_NON_POOLING="postgres://..."

# JWT Secret (generate with: openssl rand -base64 32)
JWT_SECRET="your-generated-secret-here"

# Resend API Key
RESEND_API_KEY="re_..."

# Site URL
NEXT_PUBLIC_SITE_URL="https://www.cheapquickvegan.com"
```

### Generate JWT Secret

```bash
openssl rand -base64 32
```

Copy the output and use it as `JWT_SECRET`.

### Add to Vercel

1. Go to your Vercel project
2. Settings → Environment Variables
3. Add each variable above
4. Set scope to "Production", "Preview", and "Development"

## 4. Deploy to Vercel

### Link Database

If not already linked:

1. In Vercel project settings
2. Storage → Connect Store
3. Select your Postgres database
4. Click "Connect"

This will automatically add the `POSTGRES_*` environment variables.

### Deploy

```bash
git add .
git commit -m "Add recipe comment system with moderation"
git push origin main
```

Vercel will automatically deploy your changes.

## 5. Testing the System

### Test Comment Submission

1. Go to any recipe page on your site
2. Scroll to the comment section
3. Fill out the form and submit a review
4. You should see: "Comment pending approval"
5. Check your email for the moderation notification

### Test Admin Dashboard

1. Go to `https://www.cheapquickvegan.com/admin/login`
2. Enter the admin password you set earlier
3. You should see the pending comment
4. Click "Approve" or "Reject"
5. Refresh the recipe page to see the approved comment

### Test Email Notifications

You can create a test email endpoint:

```bash
curl -X POST https://www.cheapquickvegan.com/api/test-email \
  -H "Content-Type: application/json"
```

Or submit a comment and check the admin email.

## 6. Optional: Test in Development

### Local Database Setup

For local development, you can:

1. Use Vercel Postgres connection string in `.env.local`
2. Or set up a local Postgres instance

### Run Development Server

```bash
pnpm dev
```

Visit `http://localhost:3000` to test locally.

## 7. Security Checklist

- ✅ JWT_SECRET is a strong random string (32+ characters)
- ✅ Admin password is strong (use a password manager)
- ✅ Postgres database has restricted access (Vercel handles this)
- ✅ Environment variables are not committed to git
- ✅ RESEND_API_KEY is kept secret

## 8. Monitoring and Maintenance

### Check Pending Comments

Regularly visit `/admin/comments` to moderate new submissions.

### Email Notifications

You'll receive an email when:
- A new comment is submitted
- A new reply is posted

### Database Cleanup (Optional)

To clean up old rate limit records (run monthly):

```sql
DELETE FROM comment_rate_limits
WHERE window_start < NOW() - INTERVAL '7 days';
```

## 9. SEO Verification

### Test Rich Results

1. Go to [Google Rich Results Test](https://search.google.com/test/rich-results)
2. Enter a recipe URL with approved comments
3. Verify "AggregateRating" appears in the schema

### Example Expected Schema

```json
{
  "@type": "Recipe",
  "name": "Recipe Name",
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.5",
    "reviewCount": "12",
    "bestRating": "5",
    "worstRating": "1"
  }
}
```

## 10. Troubleshooting

### Comments Not Appearing

- Check if they're approved in admin dashboard
- Verify database connection
- Check browser console for errors

### Emails Not Sending

- Verify RESEND_API_KEY is correct
- Check Resend dashboard for logs
- Ensure domain is verified (or use sandbox mode for testing)
- Check admin_config table has correct admin_email

### Rate Limiting Issues

```sql
-- Reset rate limit for an IP
DELETE FROM comment_rate_limits WHERE ip_address = '123.456.789.0';

-- Check current rate limits
SELECT * FROM comment_rate_limits;
```

### Cannot Login to Admin

- Verify admin_password_hash in database
- Try generating a new hash
- Check browser cookies are enabled

### Database Connection Errors

- Verify environment variables are set
- Check Vercel Postgres is running
- Try restarting the Vercel deployment

## 11. Customization

### Change Rate Limits

```sql
UPDATE admin_config SET value = '10' WHERE key = 'rate_limit_max';
UPDATE admin_config SET value = '24' WHERE key = 'rate_limit_window_hours';
```

### Update Admin Email

```sql
UPDATE admin_config
SET value = 'newemail@example.com'
WHERE key = 'admin_email';
```

### Modify Email Template

Edit `src/lib/email/notifications.ts` and customize the HTML.

## 12. Backup and Recovery

### Export Comments

```sql
COPY (SELECT * FROM comments WHERE status = 'approved')
TO '/tmp/comments_backup.csv'
WITH CSV HEADER;
```

### Database Backup

Vercel provides automatic backups. You can also:
1. Export from Vercel dashboard
2. Use `pg_dump` with your connection string

## Support

If you encounter issues:
1. Check the Vercel deployment logs
2. Check the browser console for client errors
3. Verify all environment variables are set correctly
4. Test the database connection
5. Check Resend logs for email delivery status

## Next Steps

- Monitor comment submissions
- Respond to user comments by posting replies
- Consider adding more moderation features
- Track analytics on comment engagement
