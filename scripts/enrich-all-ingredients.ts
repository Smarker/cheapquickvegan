/**
 * Full ingredient enrichment pass.
 *
 * - Auto-applies missing category_tags and aliases to the DB (safe, reversible in admin UI)
 * - Prints parent recommendations for you to set manually in the admin UI
 *
 * Run: pnpm tsx scripts/enrich-all-ingredients.ts
 *      pnpm tsx scripts/enrich-all-ingredients.ts --dry-run   ← preview only, no DB writes
 */
import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { sql } from '@vercel/postgres';
const dryRun = process.argv.includes('--dry-run');

// ─── Enrichment data ──────────────────────────────────────────────────────────
// Only entries not already covered by the seed-tags-aliases script.
// parent: string   → suggest this parent (must already exist in DB or be flagged for insertion)
// noParent: true   → confirmed no parent needed
// categoryTags     → overrides/adds if currently empty
// aliases          → overrides/adds if currently empty

const ENRICHMENT: Record<string, {
  categoryTags?: string[];
  aliases?: string[];
  parent?: string;       // suggest this parent in the report
  noParent?: boolean;    // confirmed no parent needed
  insertParent?: boolean; // parent needs to be inserted as virtual ingredient
}> = {
  // ── Ingredients with no enrichment at all ────────────────────────────────
  'adobo paste':              { categoryTags: ['condiment', 'spice'], aliases: ['chipotle paste', 'chipotle adobo paste'], noParent: true },
  'chili lime seasoning':     { categoryTags: ['spice', 'seasoning'], noParent: true },
  'cinnamon stick':           { categoryTags: ['spice'], parent: 'ground cinnamon' },
  'cookie butter spread':     { categoryTags: ['condiment', 'sweetener'], aliases: ['speculoos spread', 'Biscoff spread'], noParent: true },
  'crinkle cut dill pickle':  { categoryTags: ['condiment', 'fermented'], aliases: ['dill pickle', 'crinkle cut pickle'], parent: 'pickle juice' },
  'flax egg':                 { categoryTags: ['baking', 'egg-alternative'], parent: 'ground flaxseed' },
  'ginger':                   { categoryTags: ['spice', 'aromatic'], aliases: ['fresh ginger', 'ginger root'], noParent: true },
  'greek vegan yogurt':       { categoryTags: ['dairy-alternative'], aliases: ['vegan greek yogurt', 'plant-based greek yogurt'], parent: 'vegan vanilla yogurt' },
  'green onion stalk':        { categoryTags: ['vegetable', 'allium'], aliases: ['scallion stalk', 'spring onion stalk'], parent: 'scallion' },
  'instant yeast':            { categoryTags: ['baking', 'leavening'], aliases: ['fast-action yeast', 'rapid rise yeast'], noParent: true },
  'jalapeno pepper':          { categoryTags: ['vegetable', 'spicy'], aliases: ['jalapeño', 'jalapeño pepper'], noParent: true },
  'jasmine rice':             { categoryTags: ['grain', 'rice'], aliases: ['Thai jasmine rice'], noParent: true },
  'ketchup':                  { categoryTags: ['condiment'], aliases: ['tomato ketchup', 'catsup'], noParent: true },
  'leek':                     { categoryTags: ['vegetable', 'allium'], noParent: true },
  'miso paste':               { categoryTags: ['condiment', 'umami', 'fermented'], aliases: ['white miso', 'miso'], noParent: true },
  'mixed dried herbs':        { categoryTags: ['herb', 'spice'], aliases: ['dried mixed herbs', 'Italian seasoning'], noParent: true },
  'mixed nut':                { categoryTags: ['nut', 'protein'], aliases: ['mixed nuts'], noParent: true },
  'nutmeg':                   { categoryTags: ['spice', 'baking'], aliases: ['ground nutmeg'], noParent: true },
  'oat flour':                { categoryTags: ['grain', 'flour', 'baking'], aliases: ['oat flour, gluten-free'], noParent: true },
  'onion powder':             { categoryTags: ['spice', 'seasoning'], aliases: ['dehydrated onion'], noParent: true },
  'orange liqueur':           { categoryTags: ['condiment'], aliases: ['triple sec', 'Cointreau'], noParent: true },
  'oregano':                  { categoryTags: ['herb', 'spice'], aliases: ['dried oregano'], noParent: true },
  'peppermint candy':         { categoryTags: ['sweetener'], aliases: ['peppermint candies', 'candy cane pieces'], noParent: true },
  'pickle juice':             { categoryTags: ['condiment', 'fermented'], aliases: ['pickle brine'], noParent: true },
  'pine nut':                 { categoryTags: ['nut'], aliases: ['pine nuts', 'pignoli'], noParent: true },
  'plant protein powder':     { categoryTags: ['protein'], aliases: ['vegan protein powder', 'plant-based protein powder'], noParent: true },
  'plant-based egg roll wrapper': { categoryTags: ['grain', 'baking'], aliases: ['egg roll wrapper', 'spring roll wrapper'], noParent: true },
  'potato':                   { categoryTags: ['vegetable', 'starchy'], aliases: ['potatoes'], noParent: true },
  'red bell pepper':          { categoryTags: ['vegetable'], aliases: ['red capsicum', 'red sweet pepper'], parent: 'bell pepper' },
  'red chili flakes':         { categoryTags: ['spice', 'seasoning'], aliases: ['crushed red pepper', 'chili flakes'], parent: 'red pepper flakes' },
  'sherry vinegar':           { categoryTags: ['condiment', 'acidic'], noParent: true },
  'sichuan chili oil':        { categoryTags: ['condiment', 'oil', 'spicy'], aliases: ['chili oil', 'Sichuan chili crisp'], noParent: true },
  'sriracha':                 { categoryTags: ['condiment', 'spicy'], aliases: ['sriracha sauce', 'rooster sauce'], noParent: true },
  'stale bread':              { categoryTags: ['grain', 'baking'], aliases: ['day-old bread', 'leftover bread'], noParent: true },
  'tajin seasoning':          { categoryTags: ['spice', 'seasoning'], aliases: ['Tajín', 'chili lime powder'], noParent: true },
  'thai red curry paste':     { categoryTags: ['condiment', 'spice'], aliases: ['red curry paste'], noParent: true },
  'toast':                    { categoryTags: ['grain', 'baking'], aliases: ['toasted bread'], noParent: true },
  'tomato paste':             { categoryTags: ['condiment', 'umami'], aliases: ['concentrated tomato paste'], parent: 'tomato' },
  'tortilla':                 { categoryTags: ['grain', 'baking'], aliases: ['flour tortilla', 'wheat tortilla'], noParent: true },
  'vegan burger patty':       { categoryTags: ['meat-alternative', 'protein'], aliases: ['plant-based burger', 'veggie burger patty'], noParent: true },
  'vegan chicken strip':      { categoryTags: ['meat-alternative', 'protein'], aliases: ['plant-based chicken', 'vegan chicken'], noParent: true },
  'vegan chocolate chunk':    { categoryTags: ['baking', 'sweetener'], aliases: ['vegan chocolate chips', 'dairy-free chocolate chunks'], parent: 'vegan dark chocolate chip' },
  'vegan cream cheese':       { categoryTags: ['dairy-alternative', 'cheese-alternative'], aliases: ['plant-based cream cheese', 'dairy-free cream cheese'], noParent: true },
  'vegan dark chocolate chip':{ categoryTags: ['baking', 'sweetener'], aliases: ['vegan chocolate chips', 'dairy-free chocolate chips'], noParent: true },
  'vegan egg':                { categoryTags: ['protein', 'egg-alternative'], aliases: ['plant-based egg', 'vegan egg substitute'], noParent: true },
  'vegan everything bagel':   { categoryTags: ['grain', 'baking'], aliases: ['everything bagel', 'vegan bagel'], noParent: true },
  'vegan ground beef':        { categoryTags: ['meat-alternative', 'protein'], aliases: ['plant-based ground beef', 'vegan mince'], noParent: true },
  'vegan liquid egg':         { categoryTags: ['protein', 'egg-alternative'], aliases: ['liquid vegan egg', 'plant-based liquid egg'], parent: 'vegan egg' },
  'vegan marshmallow':        { categoryTags: ['sweetener', 'baking'], aliases: ['vegan marshmallows', 'dairy-free marshmallows'], noParent: true },
  'vegan mayonnaise':         { categoryTags: ['condiment', 'dairy-alternative'], aliases: ['vegan mayo', 'plant-based mayo'], noParent: true },
  'vegan phyllo dough':       { categoryTags: ['grain', 'baking'], aliases: ['vegan filo pastry', 'dairy-free phyllo'], noParent: true },
  'vegan pizza dough':        { categoryTags: ['grain', 'baking'], aliases: ['pizza dough', 'vegan pizza base'], noParent: true },
  'vegan ramen noodle':       { categoryTags: ['grain'], aliases: ['ramen noodles', 'vegan ramen'], noParent: true },
  'vegan sausage':            { categoryTags: ['meat-alternative', 'protein'], aliases: ['plant-based sausage', 'vegan sausages'], noParent: true },
  'vegan sour cream':         { categoryTags: ['dairy-alternative'], aliases: ['plant-based sour cream', 'dairy-free sour cream'], noParent: true },
  'vegetable bouillon':       { categoryTags: ['condiment'], aliases: ['veggie bouillon', 'vegetable stock cube'], parent: 'vegetable broth' },
  'white wine':               { categoryTags: ['condiment'], aliases: ['dry white wine'], noParent: true },
  'whole grain old style mustard': { categoryTags: ['condiment'], aliases: ['whole grain mustard', 'grainy mustard'], noParent: true },

  // ── Already have tags/aliases but no parent decision ─────────────────────
  'arborio rice':             { noParent: true },
  'artichoke heart':          { noParent: true },
  'balsamic vinegar':         { noParent: true },
  'carrot':                   { noParent: true },
  'cashew':                   { noParent: true },
  'cauliflower':              { noParent: true },
  'cayenne':                  { noParent: true },
  'chinese five spice powder':{ noParent: true },
  'cocoa powder':             { parent: 'unsweetened cocoa powder' },
  'corn':                     { noParent: true },
  'cornstarch':               { noParent: true },
  'cucumber':                 { noParent: true },
  'ground cardamom':          { noParent: true },
  'ground cumin':             { noParent: true },
  'ground flaxseed':          { noParent: true },
  'ground white pepper':      { noParent: true },
  'hot sauce':                { noParent: true },
  'medjool date':             { noParent: true },
  'onion powder':             { noParent: true },
  'orange liqueur':           { noParent: true },
  'portobello mushroom':      { noParent: true },
  'powdered sugar':           { parent: 'sugar' },
  'red wine vinegar':         { noParent: true },
  'sesame seed':              { noParent: true },
  'tahini':                   { noParent: true },
  'tomato':                   { noParent: true },
  'walnut':                   { noParent: true },
};

async function main() {
  if (dryRun) console.log('DRY RUN — no DB writes\n');

  const rows = await sql`
    SELECT i.id, i.name, p.name AS parent_name, i.no_parent, i.category_tags, i.aliases
    FROM ingredients i
    LEFT JOIN ingredients p ON p.id = i.parent_id
    ORDER BY i.name
  `;

  const parentRecommendations: Array<{ name: string; parent: string; insertNeeded?: boolean }> = [];
  const noParentConfirmed: string[] = [];
  let tagsApplied = 0;
  let aliasesApplied = 0;
  let noParentApplied = 0;

  for (const row of rows) {
    const enrichment = ENRICHMENT[row.name];
    if (!enrichment) continue;

    const newTags = enrichment.categoryTags && (!row.category_tags || row.category_tags.length === 0)
      ? enrichment.categoryTags : null;
    const newAliases = enrichment.aliases && (!row.aliases || row.aliases.length === 0)
      ? enrichment.aliases : null;
    const setNoParent = enrichment.noParent && !row.no_parent && !row.parent_name;

    if (newTags || newAliases || setNoParent) {
      const tagsToWrite = newTags ?? row.category_tags;
      const aliasesToWrite = newAliases ?? row.aliases;
      const noParentToWrite = setNoParent ? true : (row.no_parent ?? false);

      if (!dryRun) {
        await sql`
          UPDATE ingredients
          SET category_tags = ${tagsToWrite as string[]},
              aliases       = ${aliasesToWrite as string[]},
              no_parent     = ${noParentToWrite},
              updated_at    = CURRENT_TIMESTAMP
          WHERE id = ${row.id}
        `;
      }

      const parts = [];
      if (newTags) { parts.push(`tags: [${newTags.join(', ')}]`); tagsApplied++; }
      if (newAliases) { parts.push(`aliases: [${newAliases.join(', ')}]`); aliasesApplied++; }
      if (setNoParent) { parts.push('no_parent = true'); noParentApplied++; }
      if (parts.length) console.log(`[set] ${row.name} — ${parts.join(' · ')}`);
    }

    // Collect parent recommendations for the report
    if (enrichment.parent && !row.parent_name) {
      parentRecommendations.push({ name: row.name, parent: enrichment.parent, insertNeeded: enrichment.insertParent });
    }
  }

  console.log(`\n${'─'.repeat(60)}`);
  console.log(`Applied: ${tagsApplied} tags · ${aliasesApplied} aliases · ${noParentApplied} no-parent flags\n`);

  if (parentRecommendations.length > 0) {
    console.log('🌳 PARENT RELATIONSHIPS TO SET IN ADMIN UI');
    console.log('─'.repeat(60));
    for (const r of parentRecommendations) {
      const note = r.insertNeeded ? '  ⚠️  parent needs to be inserted first' : '';
      console.log(`  "${r.name}"  →  "${r.parent}"${note}`);
    }
    console.log(`\n${parentRecommendations.length} parent relationship(s) to set manually.\n`);
  } else {
    console.log('✅ No parent relationships pending.\n');
  }
}

main().catch((err) => { console.error(err); process.exit(1); });
