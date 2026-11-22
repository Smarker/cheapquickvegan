/**
 * Apply remaining missing aliases, tags, and no-parent flags.
 * Run: pnpm tsx scripts/enrich-remaining.ts
 */
import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { neon } from '@neondatabase/serverless';
const sql = neon(process.env.POSTGRES_URL!);
const dryRun = process.argv.includes('--dry-run');

const ENRICHMENT: Record<string, {
  categoryTags?: string[];
  aliases?: string[];
  noParent?: boolean;
}> = {
  // ── Need no-parent + have tags/aliases already ───────────────────────────
  'olive oil':                  { noParent: true },
  'maple syrup':                { noParent: true },
  'ground black pepper':        { noParent: true },
  'vanilla extract':            { noParent: true },
  'vegan butter':               { noParent: true },
  'garlic':                     { noParent: true },
  'ground cinnamon':            { noParent: true },
  'oat milk':                   { noParent: true, aliases: ['oat milk barista', 'homemade oat milk'] },
  'soy sauce':                  { noParent: true },
  'sesame oil':                 { noParent: true },
  'spinach':                    { noParent: true },
  'tofu':                       { noParent: true },
  'bell pepper':                { noParent: true },
  'cocoa powder':               { noParent: true },
  'plant-based milk':           { noParent: true },
  'rice wine vinegar':          { noParent: true },
  'turmeric':                   { noParent: true },
  'vegetable broth':            { noParent: true },
  'white rice':                 { noParent: true },
  'basil':                      { noParent: true },
  'blueberry':                  { noParent: true },
  'bread flour':                { noParent: true },
  'dill':                       { noParent: true },
  'full-fat coconut milk':      { noParent: true },
  'paprika':                    { noParent: true },
  'parsley':                    { noParent: true },
  'red pepper flakes':          { noParent: true },
  'rosemary':                   { noParent: true },
  'salsa':                      { noParent: true },
  'scallion':                   { noParent: true },
  'vegan shredded mozzarella cheese': { noParent: true },
  'vegan vanilla yogurt':       { noParent: true },
  'cilantro':                   { noParent: true },
  'kidney bean':                { noParent: true },
  'lemon':                      { noParent: true, aliases: ['fresh lemon', 'whole lemon'] },
  'sourdough starter':          { noParent: true, aliases: ['wild yeast starter', 'levain'] },
  'cumin':                      { noParent: true, aliases: ['cumin seeds', 'whole cumin'] },
  'cinnamon stick':             { noParent: true, aliases: ['cinnamon sticks', 'whole cinnamon stick'] },
  'onion':                      { noParent: true, aliases: ['brown onion', 'cooking onion'] },
  'greek vegan yogurt':         { noParent: true },
  'crinkle cut dill pickle':    { noParent: true },
  'lime juice':                 { noParent: true },

  // ── Need aliases only ────────────────────────────────────────────────────
  'water':                      { noParent: true },
  'coconut oil':                { noParent: true, aliases: ['refined coconut oil', 'melted coconut oil'] },
  'baking powder':              { noParent: true, aliases: ['double-acting baking powder'] },
  'red onion':                  { noParent: true, aliases: ['red onions'] },
  'hot sauce':                  { noParent: true, aliases: ['hot pepper sauce', 'chilli sauce'] },
  'peanut butter':              { noParent: true, aliases: ['natural peanut butter', 'creamy peanut butter'] },
  'red wine vinegar':           { noParent: true, aliases: ['red wine vinegar'] },
  'almond flour':               { aliases: ['ground almonds', 'almond meal'] }, // keep parent: almond
  'artichoke heart':            { noParent: true, aliases: ['artichoke hearts', 'canned artichoke hearts'] },
  'balsamic vinegar':           { noParent: true, aliases: ['balsamic', 'aged balsamic vinegar'] },
  'carrot':                     { noParent: true, aliases: ['carrots', 'fresh carrot'] },
  'cauliflower':                { noParent: true, aliases: ['cauliflower florets', 'cauliflower head'] },
  'chili lime seasoning':       { noParent: true, aliases: ['chili lime powder', 'lime chili seasoning'] },
  'chinese five spice powder':  { noParent: true, aliases: ['five spice', 'five-spice powder', '5 spice'] },
  'cucumber':                   { noParent: true, aliases: ['cucumbers', 'fresh cucumber'] },
  'fine sea salt':              { aliases: ['fine salt', 'sea salt'] }, // keep parent: salt
  'flax egg':                   { aliases: ['flax egg (1 tbsp ground flaxseed + 3 tbsp water)'] }, // keep parent: ground flaxseed
  'ground cardamom':            { noParent: true, aliases: ['cardamom powder', 'green cardamom'] },
  'ground flaxseed':            { noParent: true, aliases: ['flaxseed meal', 'milled flaxseed', 'linseed'] },
  'leek':                       { noParent: true, aliases: ['leeks', 'leek stalk'] },
  'onion powder':               { noParent: true, aliases: ['onion granules', 'dehydrated onion'] },
  'sherry vinegar':             { noParent: true, aliases: ['aged sherry vinegar'] },
  'table salt':                 { aliases: ['iodized salt', 'regular salt'] }, // keep parent: salt
  'white onion':                { aliases: ['white onions'] }, // keep parent: onion
  'yellow onion':               { aliases: ['yellow onions', 'brown onion'] }, // keep parent: onion

  // ── Need tags + aliases ──────────────────────────────────────────────────
  'nutritional yeast':          { categoryTags: ['seasoning', 'dairy-alternative', 'fortified'], aliases: ['nooch', 'nutritional yeast flakes'], noParent: true },
  'corn tortilla':              { categoryTags: ['grain', 'baking'], aliases: ['corn tortillas', 'tortillas de maíz', 'maize tortilla'] }, // keep parent: tortilla
  'orange liqueur':             { categoryTags: ['condiment'], aliases: ['triple sec', 'Cointreau', 'Grand Marnier'], noParent: true },

  // ── Virtual parent — needs tags + aliases ────────────────────────────────
  'almond':                     { categoryTags: ['nut', 'protein'], aliases: ['almonds', 'whole almonds'], noParent: true },
};

async function main() {
  if (dryRun) console.log('DRY RUN — no DB writes\n');
  let updated = 0;

  for (const [name, e] of Object.entries(ENRICHMENT)) {
    const rows = await sql`SELECT id, category_tags, aliases, no_parent FROM ingredients WHERE name = ${name}`;
    if (rows.length === 0) { console.log(`[skip] not found: ${name}`); continue; }
    const row = rows[0];

    const newTags = e.categoryTags && !row.category_tags?.length ? e.categoryTags : null;
    const newAliases = e.aliases && !row.aliases?.length ? e.aliases : null;
    const setNoParent = e.noParent && !row.no_parent;

    if (!newTags && !newAliases && !setNoParent) continue;

    if (!dryRun) {
      await sql`
        UPDATE ingredients
        SET category_tags = ${(newTags ?? row.category_tags) as string[]},
            aliases       = ${(newAliases ?? row.aliases) as string[]},
            no_parent     = ${e.noParent ? true : (row.no_parent ?? false)},
            updated_at    = CURRENT_TIMESTAMP
        WHERE id = ${row.id}
      `;
    }

    const parts = [];
    if (newTags) parts.push(`tags: [${newTags.join(', ')}]`);
    if (newAliases) parts.push(`aliases: [${newAliases.join(', ')}]`);
    if (setNoParent) parts.push('no_parent = true');
    console.log(`[set] ${name} — ${parts.join(' · ')}`);
    updated++;
  }

  console.log(`\nDone. ${updated} updated.`);
}

main().catch((err) => { console.error(err); process.exit(1); });
