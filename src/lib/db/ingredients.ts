import { sql } from '@vercel/postgres';

export interface Ingredient {
  id: string;
  name: string;
  slug: string | null;
  aliases: string[] | null;
  categoryTags: string[] | null;
  parentId: string | null;
  noParent: boolean;
}

export interface IngredientRow extends Ingredient {
  parentName: string | null;
  recipeCount: number;
  updatedAt: string | null;
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
    SELECT id, name, slug, aliases, category_tags, parent_id, no_parent
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
    RETURNING id, name, slug, aliases, category_tags, parent_id, no_parent
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

export async function listAllIngredients(): Promise<IngredientRow[]> {
  const { rows } = await sql`
    SELECT i.id, i.name, i.slug, i.aliases, i.category_tags, i.parent_id, i.no_parent,
           i.updated_at,
           p.name AS parent_name,
           COUNT(DISTINCT ri.recipe_id) AS recipe_count
    FROM ingredients i
    LEFT JOIN ingredients p ON i.parent_id = p.id
    LEFT JOIN recipe_ingredients ri ON ri.ingredient_id = i.id
    GROUP BY i.id, i.name, i.slug, i.aliases, i.category_tags, i.parent_id, i.no_parent, i.updated_at, p.name
    ORDER BY i.name
  `;
  return rows.map((row: any) => ({
    ...rowToIngredient(row),
    parentName: row.parent_name ?? null,
    recipeCount: Number(row.recipe_count),
    updatedAt: row.updated_at ? new Date(row.updated_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' }) : null,
  }));
}

export async function deleteIngredient(id: string): Promise<void> {
  await sql`DELETE FROM ingredients WHERE id = ${id}::uuid`;
}

export async function updateIngredient(
  id: string,
  fields: {
    name?: string;
    slug?: string;
    parentId: string | null;
    categoryTags: string[] | null;
    aliases: string[] | null;
    noParent?: boolean;
  }
): Promise<Ingredient> {
  const { rows } = await sql`
    UPDATE ingredients
    SET name           = COALESCE(${fields.name ?? null}, name),
        slug           = COALESCE(${fields.slug ?? null}, slug),
        parent_id      = ${fields.parentId}::uuid,
        category_tags  = ${fields.categoryTags as any}::text[],
        aliases        = ${fields.aliases as any}::text[],
        no_parent      = ${fields.noParent ?? false},
        updated_at     = CURRENT_TIMESTAMP
    WHERE id = ${id}::uuid
    RETURNING id, name, slug, aliases, category_tags, parent_id, no_parent
  `;
  return rowToIngredient(rows[0]);
}

// Returns recipe slugs that use a given ingredient, walking the parent→child hierarchy.
// Cached by Next.js — invalidate with revalidateTag('recipe_ingredients') after a sync.
export async function getRecipesByIngredient(ingredientSlug: string): Promise<string[]> {
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
    noParent: row.no_parent ?? false,
  };
}
