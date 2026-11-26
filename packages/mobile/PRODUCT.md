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
- No shop or links to the Notion meal planners in the app. The weekly planner may become a paid feature later; nothing else in the app is upsold.
- App ratings from development builds are never sent to the live site.
- Planned: Stephanie's own cooking videos and reels in the app, tap to play (never autoplay), shown beside the steps they demonstrate.
- Cooking journeys: each area (Italy & the Mediterranean, Asia, American classics, Latin America) has a few hikes graded as a whole (easy, medium, hard), with rest stops and travel guides along the way. A hand-drawn trail map shows every hike; cooks start wherever they like.

## Brand Commitments

- Name: **CheapQuickVegan**. Creator: Stephanie Marker.
- Calm everywhere, with whimsy only in moments the cook has earned or is waiting through: empty, loading and done. No streaks, badges, reminder notifications, confetti or autoplay video.
- One helper: a small tuxedo cat (after the site's tab icon). It lives only in cook mode (on the progress trail and the finish screen) and on journey pages (waiting at your next stop). It never appears elsewhere, never blocks content, and goes still under Reduce Motion.
- Cooked counts and journey progress are quiet records of what you've done, never streaks, rewards or nudges to come back.
- Finishing a journey leaves a **trail postcard**: a keepsake of the trail, the summit date and the recipes cooked along the way, kept in Kitchen under "Your journeys" and shareable. A memory, not a badge.
- No stop is ever required. "Take another path" walks past a recipe (shown with faint footprints, never a cross or "skipped"), and the summit counts stops cooked or passed. The postcard lists only what was cooked. Each summit offers "Suggest a recipe" by email.
- A started hike never changes under the cook. The first stop cooked or passed freezes that hike's stops for them; progress and the summit count only those. Recipes published later appear below the summit as optional "New since you started" side trips, never as extra stops. Hikes nobody has started yet use the latest recipes. A hike needs at least 3 stops to exist.
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
