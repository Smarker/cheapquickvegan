# Recipe Share Feature Setup Guide

This guide explains the new recipe sharing feature implementation for SEO optimization and social reach.

## Features Implemented

### Share Buttons
- ✅ Facebook Share
- ✅ WhatsApp Share
- ✅ Email Share
- ✅ Native Share API (mobile devices)
- 🔲 Pinterest Share (placeholder ready, UI hidden until Pinterest integration)

### Tracking & Analytics
- ✅ Share count display with real-time updates
- ✅ UTM parameters for tracking share sources
- ✅ Vercel Analytics integration
- ✅ Database tracking for share events
- ✅ Platform-specific analytics

### Placement
- **Table of Contents Sidebar**: Share buttons integrated at the bottom of TOC
  - Desktop: Sticky sidebar on the right
  - Mobile: Accessible via the TOC drawer button (bottom-right)

### Design Decisions
- **Circle Icons**: Compact, recognizable icons for each platform
- **Notification-Style Counts**: Red bubble badges (like unread messages on phone apps) show share counts
- **Clear Distinction**: "Follow:" label on Instagram/Facebook profile links vs "SHARE THIS RECIPE" header for share buttons
- **Space Efficient**: Integrated into existing TOC rather than taking up additional horizontal space
- **Non-Intrusive**: No floating buttons - everything in one organized location

## Database Setup

### 1. Run Migration

Apply the shares table migration:

```bash
# Connect to your Vercel Postgres database
psql "your-vercel-postgres-connection-string"

# Run the migration
\i migrations/002_create_shares_schema.sql
```

Or using Vercel CLI:

```bash
vercel env pull .env.local
# Then connect and run migration
```

### 2. Verify Table

```sql
-- Check if table exists
SELECT * FROM shares LIMIT 1;

-- Check indexes
\d shares
```

## SEO Optimizations

### UTM Parameters
Every share includes tracking parameters:
- `utm_source`: Platform name (facebook, whatsapp, email, native)
- `utm_medium`: Always "social"
- `utm_campaign`: Always "recipe_share"

Example: `https://cheapquickvegan.com/recipes/vegan-tacos?utm_source=facebook&utm_medium=social&utm_campaign=recipe_share`

### Pre-populated Share Text

Each platform has optimized share text:

**Facebook**: Uses OpenGraph data (title, description, image) - already configured ✅

**WhatsApp**:
```
Check out this delicious vegan recipe: {Recipe Title}

{Recipe URL with UTM}
```

**Email**:
```
Subject: Recipe: {Recipe Title}

Body:
I thought you might enjoy this vegan recipe!

{Recipe Title}

{Recipe Description}

Check it out here: {Recipe URL with UTM}

From Cheap Quick Vegan
```

**Native Share API**: Uses Web Share API with title, text, and URL

## Analytics Tracking

### Vercel Analytics Events
Every share triggers:
```typescript
track("recipe_shared", {
  recipeId: string,
  platform: string,
  recipeTitle: string,
});
```

### Database Tracking
Every share is logged to `shares` table with:
- Recipe ID
- Platform
- Timestamp
- IP Address (optional)
- User Agent (optional)

### Viewing Analytics

**Most Shared Recipes**:
```sql
SELECT
  recipe_id,
  COUNT(*) as total_shares,
  COUNT(*) FILTER (WHERE platform = 'facebook') as facebook_shares,
  COUNT(*) FILTER (WHERE platform = 'whatsapp') as whatsapp_shares,
  COUNT(*) FILTER (WHERE platform = 'email') as email_shares,
  COUNT(*) FILTER (WHERE platform = 'native') as native_shares
FROM shares
GROUP BY recipe_id
ORDER BY total_shares DESC
LIMIT 10;
```

**Shares Over Time**:
```sql
SELECT
  DATE(created_at) as date,
  COUNT(*) as shares
FROM shares
GROUP BY DATE(created_at)
ORDER BY date DESC
LIMIT 30;
```

**Platform Breakdown**:
```sql
SELECT
  platform,
  COUNT(*) as count
FROM shares
GROUP BY platform
ORDER BY count DESC;
```

## Pinterest Integration (TODO)

Pinterest sharing is ready to implement but hidden in the UI. To enable:

### 1. Add Pinterest Meta Tags

Already have OpenGraph tags. Enhance with Pinterest-specific meta:

```tsx
// In recipe page metadata
{
  other: {
    'article:author': 'Stephanie Marker',
    'article:published_time': publishedTime,
  }
}
```

### 2. Enable Pinterest Share Button

In `src/components/recipes/share-buttons.tsx`, uncomment the Pinterest section around line 95:

```typescript
// Uncomment these lines:
const handlePinterestShare = () => {
  const url = generateShareUrl("pinterest");
  const pinterestUrl = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&description=${encodeURIComponent(recipeTitle)}`;
  window.open(pinterestUrl, "_blank", "width=600,height=400");
  trackShareEvent("pinterest");
};
```

Then add to `shareButtons` array:

```typescript
{
  id: "pinterest",
  label: "Pinterest",
  icon: Pin, // Import from lucide-react
  onClick: handlePinterestShare,
  color: "hover:bg-[#E60023] hover:text-white",
  count: shareCounts?.pinterest || 0,
},
```

### 3. Pinterest Rich Pins

Apply for Rich Pins at: https://developers.pinterest.com/tools/url-debugger/

This will show recipe details, ratings, and cook time when pinned.

## Component Usage

### Basic Usage

```tsx
import { ShareButtons } from "@/components/recipes/share-buttons";

<ShareButtons
  recipeId={recipe.id}
  recipeTitle={recipe.title}
  recipeDescription={recipe.description}
  recipeUrl={`${SITE_URL}/recipes/${recipe.slug}`}
  variant="inline"  // or "floating"
  showLabel={true}  // Show "Share:" label
/>
```

### Props

- `recipeId`: Unique recipe identifier
- `recipeTitle`: Recipe title for share text
- `recipeDescription`: Recipe description for share text
- `recipeUrl`: Full URL to recipe (without UTM params - added automatically)
- `variant`: "inline" | "floating" (default: "inline")
- `showLabel`: boolean - Show "Share:" text (default: true)
- `className`: Additional CSS classes

## Share Count Display

Share counts update in real-time:
- Badge appears on button when count > 0
- Shows "99+" for counts over 99
- Total count displayed for inline variant
- Hover tooltips on desktop floating variant

## Accessibility

All buttons include:
- Proper `aria-label` attributes
- Keyboard navigation support
- Focus indicators
- Screen reader friendly count badges

## Mobile Optimization

- Native Share API shows when available (iOS Safari, Android Chrome)
- Floating buttons position at bottom on mobile
- Responsive sizing and spacing
- Touch-friendly button sizes

## Performance

- Share counts cached client-side
- Optimistic updates on share click
- Non-blocking analytics tracking
- Minimal bundle size impact (~2KB gzipped)

## Testing

### Manual Testing

1. **Facebook Share**: Opens dialog, pre-populated with OpenGraph data
2. **WhatsApp Share**: Opens WhatsApp with pre-formatted message
3. **Email Share**: Opens mail client with subject and body
4. **Native Share**: Shows system share sheet (mobile only)

### Analytics Testing

Share a recipe and verify:
1. Vercel Analytics dashboard shows "recipe_shared" event
2. Database `shares` table has new row
3. Share count increments in UI
4. UTM parameters appear in shared URL

### SEO Testing

1. Share on Facebook - verify OpenGraph preview
2. Copy shared link - verify UTM parameters
3. Test shared link - ensure it loads correctly
4. Check Google Analytics for UTM tracking (if configured)

## Troubleshooting

### Share Counts Not Showing

1. Check database connection
2. Verify migration ran successfully
3. Check browser console for errors
4. Verify API route is accessible: `/api/shares/{recipeId}`

### Native Share Not Appearing

- Only available on mobile devices or Safari
- Requires HTTPS in production
- Check `navigator.share` availability

### Analytics Not Tracking

1. Verify Vercel Analytics is configured
2. Check environment variables
3. Look for console errors
4. Test in production (analytics may not work in dev)

## Future Enhancements

- [ ] Pinterest sharing with image selection
- [ ] Print recipe button with optimized print stylesheet
- [ ] Copy link button with clipboard API
- [ ] Share to Instagram Stories (requires API access)
- [ ] Twitter/X sharing
- [ ] LinkedIn sharing for food bloggers
- [ ] Share count leaderboard on homepage

## SEO Impact Metrics

Track these metrics to measure SEO impact:

1. **Social Traffic**: GA4 source/medium reports
2. **Backlinks**: Monitor for natural links from shares
3. **Engagement**: Avg session duration from social
4. **Conversions**: Recipe saves/comments from shared traffic
5. **Viral Coefficient**: Shares per recipe view

## Support

For issues or questions:
- Check browser console for errors
- Verify database tables exist
- Test API routes directly
- Review share button implementation in `src/components/recipes/share-buttons.tsx`
