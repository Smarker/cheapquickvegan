You are an SEO auditor for CheapQuickVegan.

Arguments: **$ARGUMENTS**

If the argument is `--technical`, run the technical site audit (Step 0 below). Otherwise, if a slug is provided, audit only that recipe. If no argument is given, audit all recipes. Skip to Step 1 for recipe audits.

---

## Step 0 — Technical site audit (--technical mode only)

Spawn four sub-agents in parallel using the Agent tool. Do NOT run them sequentially. Launch all four at once in a single response, each with `run_in_background: true`.

**Agent 1 — JSON-LD schema validation**
Check every page type (homepage, recipe pages, guide pages, category pages, blog posts) for correct structured data. Find the metadata/JSON-LD generation code in `src/`. Check required fields per schema.org (Recipe needs name, image, recipeIngredient, recipeInstructions, author; BreadcrumbList needs correct itemListElement with id/name/item). Identify missing required fields, incorrect types, or malformed structures. Return findings grouped by page type with file paths and line numbers. Rate: HIGH = missing required fields or broken schema, MEDIUM = missing recommended fields, LOW = minor issues.

**Agent 2 — Image alt text audit**
Find all `<img`, `<Image` (Next.js), and other image components in `src/`. For each, check if alt prop is present, empty, or generic ("image", "photo", "thumbnail", or bare title). Check how alt is populated — hardcoded, from Notion data, or generated. Return file paths and line numbers. Rate: HIGH = missing alt entirely or empty string fallback, MEDIUM = title-only or clearly generic, LOW = functional but improvable.

**Agent 3 — Internal linking analysis**
List all page routes from the app directory. Check which pages link to other pages — nav, related content sections, footer, ingredient-to-guide links. Identify orphan pages (no inbound internal links from content pages). Find missed cross-linking opportunities between recipes and guides (e.g., tofu recipe → tofu guide). Return file paths with specific suggestions. Rate: HIGH = page unreachable via internal links, MEDIUM = poorly linked, LOW = missed cross-link opportunity.

**Agent 4 — Breadcrumb & navigation audit**
Find all breadcrumb components and where they're rendered. Check which page types have breadcrumbs and which don't. Verify BreadcrumbList JSON-LD matches the visual breadcrumbs. Check breadcrumb URLs have no query params and use correct slug format. Check main nav for semantic `<nav>` with aria-label. Return file paths and line numbers. Rate: HIGH = JSON-LD and visual breadcrumbs mismatched or broken URLs, MEDIUM = page type missing breadcrumbs entirely, LOW = minor markup issues.

After all four agents complete, synthesize results into a single prioritized action plan:

```
── Technical SEO Audit ─────────────────────────────────────

🔴 HIGH priority (X issues)
   [file:line] — description

🟡 MEDIUM priority (X issues)
   [file:line] — description

🟢 LOW priority (X issues)
   [file:line] — description

───────────────────────────────────────────────────────────
Prioritized action plan:
1. [Most impactful fix] — affects [pages/components]
2. ...
```

---

---

## Step 1 — Load the cache

Read `recipes-cache.json` and `guides-cache.json` from the project root.

---

## Step 2 — Build a lookup map

Before auditing, build two maps from the cache data:

**Recipe ID map:** `{ [id: string]: { slug, primaryCategory } }` — maps each recipe's `id` UUID to its slug and `categories[0]`.

**Guide tag map:** For each guide in guides-cache.json, scan its `content` field for all `[recipes:TAG]` markers (regex: `\[recipes:([^\]]+)\]`). For each match, lowercase the captured value then strip any namespace prefix (`method:`, `theme:`, etc.) by taking everything after the first `:` if one is present. Collect the resulting values into a flat set called `guideTags`. Example: `[recipes:method:Air Fryer]` → `"air fryer"`, `[recipes:theme:tofu]` → `"tofu"`, `[recipes:Air Fryer]` → `"air fryer"`.

---

## Step 3 — Run the audit

For each recipe (or the specified one), check all four signals below. Collect every finding before outputting.

### 🔲 Missing FAQ content

Check if the recipe's `content` field contains at least one line matching `**Q:` (this is the format parsed by `generateFaqJsonLd` in `src/lib/seo/google-search-jsonld-builders.ts` to produce FAQPage JSON-LD at render time).

If no `**Q:` lines exist → flag as missing FAQ. FAQPage schema is the primary driver of PAA (People Also Ask) placement.

Do NOT search for `"@type": "FAQPage"` in the content — that text is never stored in the content field. The JSON-LD is generated dynamically from the `**Q:` / `A:` markdown format.

### 📄 Thin content (under ~600 words)

Count words in the `content` field. Flag recipes under 600 words.
Note: markdown syntax and headings inflate the count slightly — treat it as approximate.

### 🔗 No related recipes

Check the recipe's `relatedRecipes` field (an array of Notion UUIDs). If it is empty or absent → flag. This field drives the "Try these similar recipes" carousel rendered on the page.

Do NOT scan the prose content for `/recipes/` links — recipe cross-linking is handled entirely through the `relatedRecipes` field.

Also check same-category: using the recipe ID map built in Step 2, resolve each UUID in `relatedRecipes` to its `primaryCategory`. If none of the related recipes share the same `primaryCategory` as this recipe → flag as missing same-category link. Same-category linking is the highest-value signal for category page authority.

### 📚 No guide coverage

Check if any of the recipe's `tags` (lowercased) appear in `guideTags` (the set of `[recipes:TAG]` markers from guides-cache.json). If no overlap → flag. Guide coverage is what causes the recipe to appear in guide roundup pages, distributing authority to those pages.

Do NOT scan prose for `/guides/` links — guide linking is handled by `getRelatedGuides()` in `src/lib/notion.ts`, which matches `recipe.tags` against guide content markers.

---

## Step 4 — Output

If auditing **all recipes**, group findings by issue type. Within each group, list recipes sorted by severity (most issues first):

```
── SEO Audit ── X recipes scanned ─────────────────────────

🔲 Missing FAQ content (X recipes)
   - [slug] — [category]
   - [slug] — [category]

📄 Thin content under 600 words (X recipes)
   - [slug] — ~380 words
   - [slug] — ~510 words

🔗 No related recipes (X recipes)
   - [slug]
   - [slug]

🔗 No same-category related recipe (X recipes)
   - [slug] (category: meal) — has related recipes but none in same category
   - [slug] (category: breakfast)

📚 No guide coverage (X recipes)
   - [slug] — tags: [tag1, tag2]
   - [slug] — no tags

✅ Fully optimised (X recipes)
   - [slug], [slug], [slug]

───────────────────────────────────────────────────────────
Highest priority (fix these first):
1. [slug] — missing FAQ + no related recipes + no guide coverage
2. [slug] — thin (~310 words) + missing FAQ
```

If auditing a **single recipe**, output a compact per-signal checklist:

```
── SEO Audit: [slug] ──────────────────────────────────────

FAQ content       ✓ 3 Q&A pairs found — FAQPage JSON-LD will render
Word count        ⚑ ~380 words — run /recipe-copy expand [slug]
Related recipes   ✓ 4 related recipes set
Same-category     ⚑ none of the related recipes are [category] — run /recipe-copy links [slug]
Guide coverage    ⚑ tags [tag1, tag2] not found in any guide — run /recipe-copy links [slug]

───────────────────────────────────────────────────────────
```

Keep tone direct and actionable. Suggest the relevant skill command for each fixable gap.
