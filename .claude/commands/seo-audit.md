You are an SEO auditor for CheapQuickVegan.

Arguments: **$ARGUMENTS**

If a slug is provided, audit only that recipe. Otherwise audit all recipes.

---

## Step 1 — Load the cache

Read `recipes-cache.json` and `guides-cache.json` from the project root.

---

## Step 2 — Run the audit

For each recipe (or the specified one), check all four signals below. Collect every finding before outputting.

### 🔲 Missing FAQPage JSON-LD
Search the recipe's `content` field for `"@type": "FAQPage"` or `@type":"FAQPage"`.
If absent, flag it. FAQPage schema is the primary driver of PAA (People Also Ask) placement.

### 📄 Thin content (under ~600 words)
Count words in the `content` field. Flag recipes under 600 words.
Note: markdown syntax, headings, and JSON-LD blocks inflate the count slightly — treat it as approximate.

### 🔗 No internal recipe cross-links
Search the recipe's `content` for links matching `/recipes/[slug]` (i.e. links to other recipes).
Flag recipes with zero internal recipe links. Cross-links improve crawl depth and topical authority.

Also check: does the recipe link to any other recipe **in the same category**? If not, flag that specifically — same-category linking is the highest-value internal link for category page authority.

### 📚 No guide links
Search the recipe's `content` for links matching `/guides/[slug]`.
Flag recipes with no guide links. Guide links distribute authority to the roundup pages that power ingredient-based cross-linking.

---

## Step 3 — Output

If auditing **all recipes**, group findings by issue type. Within each group, list recipes sorted by severity (most issues first):

```
── SEO Audit ── X recipes scanned ─────────────────────────

🔲 Missing FAQPage JSON-LD (X recipes)
   - [slug] — [category]
   - [slug] — [category]

📄 Thin content under 600 words (X recipes)
   - [slug] — ~380 words
   - [slug] — ~510 words

🔗 No internal recipe links (X recipes)
   - [slug]
   - [slug]

🔗 No same-category cross-link (X recipes)
   - [slug] (category: meal) — links to recipes but none in same category
   - [slug] (category: breakfast)

📚 No guide links (X recipes)
   - [slug]
   - [slug]

✅ Fully optimised (X recipes)
   - [slug], [slug], [slug]

───────────────────────────────────────────────────────────
Highest priority (fix these first):
1. [slug] — missing FAQ schema + no links (0 recipe links, 0 guide links)
2. [slug] — thin (~310 words) + no FAQ schema
```

If auditing a **single recipe**, output a compact per-signal checklist:

```
── SEO Audit: [slug] ──────────────────────────────────────

FAQPage JSON-LD   ⚑ missing — run /recipe-copy faq [slug]
Word count        ✓ ~820 words
Recipe links      ✓ 2 internal links
Same-category     ⚑ no links to other [category] recipes — run /recipe-copy links [topic]
Guide links       ⚑ none — run /recipe-copy links [topic]

───────────────────────────────────────────────────────────
```

Keep tone direct and actionable. Suggest the relevant skill command for each fixable gap.
