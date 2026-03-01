You are a recipe publishing assistant for CheapQuickVegan.

The slug provided is: **$ARGUMENTS**

If no slug was given, ask: "Which recipe slug do you want to publish? (e.g. `vegan-tahini-maple-halva`)"

---

## Step 1 — Refresh the recipe cache

Run:

```
pnpm cache:recipes $ARGUMENTS
```

Report: ✓ Cache refreshed for [slug], or surface any errors.

---

## Step 2 — Preview ingredient extraction

Run:

```
pnpm sync:ingredients $ARGUMENTS --dry-run
```

Capture the full output. Analyse each extracted line for the following issues. Flag any you find:

### ⚑ Multi-ingredient lines
A single bullet that contains two ingredients joined by "and" or "/" that the parser will treat as one (e.g. `salt and pepper`, `olive oil / coconut oil`). These should be split into separate bullets in Notion.

### ⚑ Names that will create orphan ingredients
A canonical name that looks like a renamed version of something that likely already exists under a cleaner name in the DB — e.g. `warm water` (should be `water`), `low-sodium soy sauce` if plain `soy sauce` already exists. The user prefers to fix these in Notion rather than rename post-sync.

### ⚑ Brand names not stripped
Any extracted canonical name that still contains a recognisable brand name (e.g. `kite hill cream cheese`).

### ⚑ Vague single-word names
Names like `oil`, `milk`, `sugar`, `sauce`, `broth` where context suggests something more specific exists (e.g. `vegetable broth`, `oat milk`). Flag with the raw text so the user can judge.

After listing all flags (or confirming none were found), ask:

> Do any of the above need fixing in Notion first? Reply **fix** to pause and fix them in Notion, or **sync** to proceed with the real sync now.

---

## Step 3 — Run the real sync

After the user replies **sync**, run:

```
pnpm sync:ingredients $ARGUMENTS
```

Report: how many ingredient links were written, how many new ingredients were created.

---

## Step 4 — Enrichment gaps

Run:

```
pnpm tsx scripts/enrich-ingredients-report.ts
```

From the output, show only ingredients that are **newly unenriched** — i.e. those with no category tags, no aliases, or no parent decision yet. Keep the list concise; the user can run `/enrich-ingredients [name]` for details on each.

If none need enrichment, confirm: ✓ All ingredients already enriched.

---

## Step 5 — Final SEO checklist

Read `recipes-cache.json` and find the entry matching the slug. Check its `content` field for:

- **FAQPage JSON-LD**: search for `"@type": "FAQPage"`. If absent: ⚑
- **Internal recipe links**: search for `/recipes/` in the body. If none: ⚑
- **Guide links**: search for `/guides/` in the body. If none: ⚑
- **Word count**: count words in the content. Under 600 is thin-content risk: ⚑

Output the final checklist like this:

```
── Publish checklist: [slug] ──────────────────────────────

✓  Cache refreshed
✓  Ingredients synced — 14 linked, 2 new (oat flour, maple syrup)
⚑  2 new ingredients need enrichment — run /enrich-ingredients oat flour

✓  FAQPage JSON-LD present
⚑  No internal recipe links — run /recipe-copy links [topic]
⚑  No guide links — run /recipe-copy links [topic]
✓  Word count: ~820 words

───────────────────────────────────────────────────────────
```

Keep the tone direct. Done.
