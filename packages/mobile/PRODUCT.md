# Product

<!-- impeccable:product-schema 1 -->

## Platform

adaptive

## Users

The same main reader as the website (see `packages/web/PRODUCT.md`): a **weeknight home cook** on a budget, often new to vegan cooking, standing in the kitchen with the phone propped up and messy hands. In the app they want to answer one question: what can I make tonight with the time and gear I have?

## Product Purpose

The CheapQuickVegan app for iOS and Android, built with Expo. Readers find a recipe that fits tonight, cook it without losing their place, and come back to it. v1 covers browse and search, the recipe page with cook mode, and saved recipes. The grocery list comes in v1.1, sent through the share sheet. A live household list comes later, once accounts exist.

## Positioning

Stephanie's own cheap, quick recipes, shaped by her partner's Italian family, with real step sections, equipment tags and times. The app is a calm kitchen tool, not a feed.

## Capabilities and Constraints

- Expo, one codebase, adaptive per OS: iOS uses HIG navigation, controls and SF Symbols-style icons; Android uses Material 3 navigation, predictive Back and snackbars.
- Recipe data comes from the website's domain (`cheapquickvegan.com`), never `*.vercel.app`. Until the read-only API routes exist, a script copies published recipes from `packages/web/recipes-cache.json`.
- Shared recipe links always point to the canonical web URL, `/recipes/[slug]`.
- v1 has no accounts. Saved recipes are stored on the device and work offline.
- App ratings go to the website's `/api/ratings/quick` endpoint. Before launch, the IP fallback must stop matching phones on shared carrier IPs.
- Short display titles: a Notion "Short title" field is planned. Until it exists, the app shortens titles by dropping text in parentheses and after a colon.
- Cost per serving: not shown until a real data field exists. Planned for later.
- No shop, Notion meal planners or upsells in the app.
- Planned: Stephanie's own cooking videos and reels in the app, tap to play (never autoplay), shown beside the steps they demonstrate.
- Planned: cooking journeys, a trail per cuisine (Italian, Asian, American…) from easy to harder recipes, with rest stops and travel guides along the way, to help cooks try styles outside their comfort zone.

## Brand Commitments

- Name: **CheapQuickVegan**. Creator: Stephanie Marker.
- Calm everywhere, with whimsy only in moments the cook has earned or is waiting through: empty, loading and done. No streaks, badges, reminder notifications, confetti or autoplay video.
- One helper: a small tuxedo cat (after the site's tab icon). It lives only in cook mode (on the progress trail and the finish screen) and on journey pages (waiting at your next stop). It never appears elsewhere, never blocks content, and goes still under Reduce Motion.
- Cooked counts and journey progress are quiet records of what you've done, never streaks, rewards or nudges to come back.
- Stephanie will draw the SVG illustrations. Screens leave marked slots for them.
- Small text is always dark ink. Bright world colors are for filled shapes only.

## Evidence on Hand

Real recipe photos are served from `https://www.cheapquickvegan.com/images/<slug>-1x1.jpg` (and `-4x3`, `-16x9`). Real recipe titles, times, yields, categories and equipment tags. There are no testimonials or prices on hand, so none are shown.

## Product Principles

1. **Get to the recipe quickly.** Cooking starts within three taps of launch.
2. **Built for the kitchen.** One hand, mid-cook, large type, screen kept awake.
3. **Calm by default, playful on touch.** Motion springs only in response to the cook.
4. **Honest claims.** No invented prices, ratings or counts.
5. **Cooking is shared.** Saving, rating and (later) shared grocery lists help people cook together.

## Accessibility & Inclusion

Dynamic Type and Android font scale, touch targets of at least 44 pt / 48 dp, Reduce Motion respected everywhere, a designed dark mode, and text contrast of at least 4.5:1.
