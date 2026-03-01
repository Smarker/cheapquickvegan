import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/auth/admin-auth';
import { listAllIngredients, updateIngredient, deleteIngredient, toIngredientSlug } from '@/lib/db/ingredients';

export async function DELETE(req: NextRequest) {
  const authError = await requireAdminAuth();
  if (authError) return authError;

  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    await deleteIngredient(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Failed to delete ingredient:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function GET() {
  const authError = await requireAdminAuth();
  if (authError) return authError;

  const ingredients = await listAllIngredients();
  return NextResponse.json({ ingredients });
}

export async function PATCH(req: NextRequest) {
  const authError = await requireAdminAuth();
  if (authError) return authError;

  try {
    const { id, name, parentId, categoryTags, aliases, noParent } = await req.json();

    if (!id) {
      return NextResponse.json({ error: 'Missing ingredient id' }, { status: 400 });
    }

    const ingredient = await updateIngredient(id, {
      name: name ?? undefined,
      slug: name ? toIngredientSlug(name) : undefined,
      parentId: parentId ?? null,
      categoryTags: categoryTags ?? null,
      aliases: aliases ?? null,
      noParent: noParent ?? false,
    });

    return NextResponse.json({ ingredient });
  } catch (error) {
    console.error('Failed to update ingredient:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
