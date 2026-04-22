# Claude Guidelines for CheapQuickVegan

CheapQuickVegan is a Next.js-based vegan food and travel blog with a focus on SEO optimization and user experience.

## Project Context

This is a Next.js + TypeScript vegan cooking site. Key areas: recipe pages, guide/listicle pages, SEO (JSON-LD), ingredient database, Notion CMS integration. Tests are in a test directory — check for it before saying no tests exist. When making data/parser changes, verify with existing tests.

## General Rules

- Always prefer the simplest solution. Do not edit types, refactor abstractions, or add infrastructure unless explicitly asked.
- When the user says "just do X", do exactly X and nothing more.
- Ask before refactoring. If you think something should be restructured, say so and wait for approval before changing it.
- Before starting a dev server, check if one is already running on the expected port. Use `lsof -i :3000` or similar to verify.
- This is a TypeScript/Next.js project. Tests are located in the test directory — always check for existing tests before claiming none exist. Run `npm test` or relevant test commands after making changes to catch regressions.
- Before flagging missing features in audits or reviews, verify the feature doesn't already exist via dynamic generation, related fields, or other indirect implementations. Search the codebase thoroughly before reporting something as missing.

## UI & Styling

- When making UI/styling changes, make minimal targeted edits first. Do not change multiple CSS properties at once.
- After each change, describe exactly what was changed so the user can verify before proceeding.
- When a user requests a visual change (e.g., "show 3 items", "move photo to the right"), clarify the exact behavior before coding. "Show 3" could mean slice to 3 or display 3 at a time. "Search results" could mean modal or dropdown. Ask if ambiguous.
- When making UI/styling changes, make only the specific changes requested. Do not add extra UI elements (e.g., ratings, stars) or make assumptions about desired spacing/layout beyond what was explicitly asked.

## Git Workflow

- Before creating or switching branches, always `git pull` the base branch first.
- When working with multiple branches, confirm which branch should receive which changes before committing.

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
- `/recipes/category/[cat]` - Recipe category pages
- `/guides` - All guides listing
- `/guides/[slug]` - Individual guide pages
- `/guides/category/[cat]` - Guide category pages
- `/posts/[slug]` - Blog post pages
- `/about` - About page
- `/contact` - Contact page
- `/shop` - Shop page
- `/start-here` - Start here page
- `/privacy-policy` - Privacy policy
- `/disclaimer` - Disclaimer
- `/terms-and-conditions` - Terms and conditions
- `/thank-you` - Thank you page

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
