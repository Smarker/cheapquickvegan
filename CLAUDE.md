# Claude Guidelines for CheapQuickVegan

CheapQuickVegan is a Next.js-based vegan food and travel blog with a focus on SEO optimization and user experience.

## Architecture Notes

- **Framework:** Next.js 16 with App Router
- **Content Source:** Notion API (cached)
- **Styling:** Tailwind CSS with shadcn/ui components
- **Database:** Vercel Postgres (for comments and ratings)

### src/lib vs src/components

`src/lib` is purely data and logic — no React, no JSX, no `.tsx` files. If a file needs to render anything, it belongs in `src/components` instead.

## Critical SEO Rules

### Never change URL structures

Do not modify URL patterns or add query parameters to existing routes. URL changes harm SEO by creating duplicate content issues, breaking external links and backlinks, losing accumulated search engine rankings, and fragmenting page authority.

Current URL patterns that must remain unchanged:
- `/` - Homepage
- `/recipes` - All recipes listing
- `/recipes/[slug]` - Individual recipe pages
- `/recipes/category/[category]` - Category pages
- `/about` - About page
- `/favorites` - Favorites page

If you need to provide context about where a user came from, use client-side state management (React state, context, localStorage) or session storage. Never reflect navigation state in the URL.

### SEO priorities

1. Clean, semantic URL structures
2. Proper schema.org markup (Recipe, BreadcrumbList)
3. Canonical URLs in metadata
4. OpenGraph and Twitter card tags
5. Sitemap generation
6. Image optimization with alt text

### Other SEO rules

- Always use the recipe's primary category (first in array) for breadcrumbs
- Maintain consistent internal linking patterns
- Ensure all recipe links point to `/recipes/[slug]` without query parameters
- Keep structured data (JSON-LD) synchronized with page content

## Splitting PRs

When asked to split work across multiple PRs, ensure that each PR leaves master in a buildable, import-safe state on its own. If a PR deletes or renames files that are still imported by files in master, those import updates must be in the same PR — not a follow-up. If that's not possible without coupling the PRs, consolidate them into a single PR instead.

## Refactor PR structure

When refactoring, split changes across two PRs:

1. **Logic PR** — new/renamed/consolidated functions, helper files, type changes. No JSX or CSS changes.
2. **UI PR** — swap call sites to use the new helpers, update JSX, update imports. No new logic.

This lets the UI changes be visually verified in isolation without noise from logic diffs.
