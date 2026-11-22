# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

The main reader is a **weeknight home cook**: someone new to vegan cooking or curious about it, on a budget, who usually arrives from Google, Pinterest or Instagram looking for one specific recipe. They often cook from a phone in the kitchen with their hands busy, and they want to know fast whether the recipe is cheap, quick and made from ingredients they can find.

Secondary audiences seen in the content: people who are already vegan and want new ideas, especially Italian-style twists on classics, and vegan travelers reading the destination guides (Peru, Patagonia).

Households that cook together, such as couples, are a confirmed audience for grocery planning (see Capabilities).

## Product Purpose

CheapQuickVegan is Stephanie Marker's vegan food and travel blog. It publishes affordable, fast vegan recipes made with everyday ingredients, along with guides (roundups, pantry and equipment listicles, vegan travel guides). Its mission is to make vegan eating simple, affordable and delicious for everyone.

Success, in priority order as confirmed:
1. **Search traffic / SEO**: recipes and guides rank and earn rich results (Recipe, BreadcrumbList schema).
2. **Engagement**: ratings, comments, favorites and repeat cooking.
3. **Social following**: Instagram and Facebook growth and repeat visitors.
4. **Easy grocery tracking**: making it simple to collect and share the ingredients for CheapQuickVegan recipes.

The shop (Notion recipe bundles and meal planners, sold through Stripe) exists, but it was not chosen as a primary goal.

## Positioning

The recipes come from one person and are shaped by her partner's extended Italian family. They show how small, simple changes make a big difference to classic dishes (for example, adding plant milk to focaccia to make it crispier). Every recipe is cheap and quick and uses ingredients sold at any grocery store. The blog combines this with first-hand vegan travel guides.

## Operating Context

- Content is written in Notion and cached at build time (`recipes-cache.json`, `guides-cache.json`). At the time of writing there are about 40 recipes and 7 guides.
- Readers find recipes through search, Pinterest and Instagram links. On recipe pages they jump to the recipe, use cook mode (keeps the screen awake), rate, comment, favorite and share.
- Stephanie moderates comments and manages ingredients in `/admin`.

## Capabilities and Constraints

- Next.js 16 App Router, Tailwind and shadcn/ui, Vercel Postgres for comments and ratings, light and dark themes.
- **URL structures are frozen** for SEO (see CLAUDE.md). Navigation state is never put in query parameters.
- JSON-LD must always match the visible page content. Breadcrumbs use the recipe's primary category.
- GDPR consent (Klaro) controls analytics.
- An ingredient database exists (canonicalized and enriched ingredients).
- **Open decision: grocery list sharing.** The user wants to make it easy to track the grocery items for CheapQuickVegan recipes, and to share ingredient lists with a partner or others (for example, the way a couple shares a Google Keep list). The site has no grocery list feature yet. It may fit the planned mobile app better than the website.
- **Planned: a React Native (Expo) mobile app** in `packages/mobile`. It will use the site's own domain and read-only recipe and guide API routes. It will get its own product and platform record once it exists. Web design choices should keep that app in mind.
- Planned move from Vercel to Cloudflare, as a separate effort.

## Brand Commitments

- Name: **CheapQuickVegan**. Creator: Stephanie Marker, "Creator & Recipe Developer".
- Voice: friendly, first person, encouraging and good for beginners, practical about budget and time. Light use of emoji in copy is already established (for example, on Start Here).
- Social accounts: Instagram `@cheapquickvegan`, Facebook. Contact: cheapquickvegan@gmail.com.

## Evidence on Hand

- Real recipe photography and step images come from Notion. The creator portrait is `public/images/stephanie-about.jpg`. The OG image is `src/opengraph-image.png`.
- The About story (how she started cooking vegan, the Italian family influence) is on `src/app/about/page.tsx`.
- Ratings and comments are real reader data stored in Postgres.
- There are no press mentions, partnerships, traffic numbers or testimonials on hand. Do not make any up.

## Product Principles

1. **Get to the recipe quickly.** The reader came for one dish. Cost, time and ingredients should be clear right away.
2. **Built for the kitchen.** Pages should work on a phone, one-handed, mid-cook.
3. **SEO is part of the product.** Clean URLs, accurate schema and canonical metadata are never traded away for a feature.
4. **Everyday ingredients, honest claims.** Cheap and quick have to be true of every recipe.
5. **Cooking is shared.** Favorites, ratings, comments and (later) shared grocery lists help people cook together and come back.
