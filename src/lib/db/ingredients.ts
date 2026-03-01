import { sql } from '@vercel/postgres';

export interface Ingredient {
  id: string;
  name: string;
  slug: string | null;
  aliases: string[] | null;
  categoryTags: string[] | null;
  parentId: string | null;
}

export function toIngredientSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

export async function findIngredientByName(name: string): Promise<Ingredient | null> {
  const { rows } = await sql`
    SELECT id, name, slug, aliases, category_tags, parent_id
    FROM ingredients
    WHERE LOWER(name) = LOWER(${name})
    LIMIT 1
  `;
  return rows[0] ? rowToIngredient(rows[0]) : null;
}

// Insert a new ingredient or return the existing one (matched by name).
// Nutrition fields are left NULL — filled later via USDA or manually.
export async function upsertIngredient(data: {
  name: string;
  slug?: string;
}): Promise<Ingredient> {
  const slug = data.slug ?? toIngredientSlug(data.name);
  const { rows } = await sql`
    INSERT INTO ingredients (name, slug, source)
    VALUES (${data.name}, ${slug}, 'parsed')
    ON CONFLICT (name) DO UPDATE
      SET slug = COALESCE(ingredients.slug, EXCLUDED.slug),
          updated_at = CURRENT_TIMESTAMP
    RETURNING id, name, slug, aliases, category_tags, parent_id
  `;
  return rowToIngredient(rows[0]);
}

// Replace all recipe→ingredient links for one recipe (idempotent).
export async function syncRecipeIngredients(
  recipeSlug: string,
  recipeId: string,
  items: Array<{
    ingredientId: string | null;
    rawText: string;
    quantity: string | null;
    notes: string | null;
    displayOrder: number;
  }>
): Promise<void> {
  await sql`DELETE FROM recipe_ingredients WHERE recipe_slug = ${recipeSlug}`;

  for (const item of items) {
    await sql`
      INSERT INTO recipe_ingredients
        (recipe_id, recipe_slug, ingredient_id, raw_text, quantity, notes, display_order)
      VALUES
        (${recipeId}, ${recipeSlug}, ${item.ingredientId ?? null},
         ${item.rawText}, ${item.quantity ?? null}, ${item.notes ?? null}, ${item.displayOrder})
    `;
  }
}

// Returns recipe slugs that use a given ingredient, walking the parent→child hierarchy.
// Cached by Next.js — invalidate with revalidateTag('recipe_ingredients') after a sync.
export async function getRecipesByIngredient(ingredientSlug: string): Promise<string[]> {
  'use cache';

  const { rows } = await sql`
    WITH RECURSIVE ingredient_tree AS (
      SELECT id FROM ingredients WHERE slug = ${ingredientSlug}
      UNION ALL
      SELECT i.id
      FROM ingredients i
      JOIN ingredient_tree t ON i.parent_id = t.id
    )
    SELECT DISTINCT ri.recipe_slug
    FROM recipe_ingredients ri
    WHERE ri.ingredient_id IN (SELECT id FROM ingredient_tree)
    ORDER BY ri.recipe_slug
  `;
  return rows.map((r: any) => r.recipe_slug);
}

function rowToIngredient(row: any): Ingredient {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug ?? null,
    aliases: row.aliases ?? null,
    categoryTags: row.category_tags ?? null,
    parentId: row.parent_id ?? null,
  };
}
