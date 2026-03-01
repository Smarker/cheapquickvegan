'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { LogOut, MessageSquare, Wheat, RefreshCw, Check, X, Trash2, Filter } from 'lucide-react';
import { toast } from 'sonner';

interface IngredientRow {
  id: string;
  name: string;
  slug: string | null;
  parentId: string | null;
  parentName: string | null;
  categoryTags: string[] | null;
  aliases: string[] | null;
  recipeCount: number;
  noParent: boolean;
  updatedAt: string | null;
}

interface RowEdit {
  name: string;
  parentId: string;
  categoryTags: string;
  aliases: string;
  noParent: boolean;
}

// ─── ParentPicker ────────────────────────────────────────────────────────────
// Autocomplete input for picking a parent ingredient.
// Also suggests the most likely parent by progressively stripping leading words
// from the ingredient name until a match is found in the ingredient list.

interface ParentPickerProps {
  ingredientId: string;
  ingredientName: string;
  value: string;           // selected parent id, "" = none
  onChange: (id: string) => void;
  allIngredients: IngredientRow[];
  suppressSuggestion?: boolean;
}

function ParentPicker({ ingredientId, ingredientName, value, onChange, allIngredients, suppressSuggestion }: ParentPickerProps) {
  const selectedName = allIngredients.find((i) => i.id === value)?.name ?? '';
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Auto-suggest: strip one leading word at a time and look for a match
  const suggested = useMemo(() => {
    const words = ingredientName.split(' ');
    for (let i = 1; i < words.length; i++) {
      const candidate = words.slice(i).join(' ');
      const match = allIngredients.find(
        (ing) => ing.id !== ingredientId && ing.name.toLowerCase() === candidate.toLowerCase()
      );
      if (match) return match;
    }
    return null;
  }, [ingredientName, ingredientId, allIngredients]);

  // Filtered list based on query
  const suggestions = useMemo(() => {
    const q = query.toLowerCase();
    return allIngredients
      .filter((i) => i.id !== ingredientId && (!q || i.name.toLowerCase().includes(q)))
      .slice(0, 8);
  }, [query, ingredientId, allIngredients]);

  const select = (id: string) => {
    onChange(id);
    setQuery('');
    setOpen(false);
  };

  const clear = () => {
    onChange('');
    setQuery('');
  };

  return (
    <div ref={ref} className="relative w-full">
      {/* Auto-suggest chip */}
      {suggested && value !== suggested.id && !suppressSuggestion && (
        <button
          type="button"
          onClick={() => select(suggested.id)}
          className="mb-1 inline-flex items-center gap-1 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200 text-xs px-2 py-0.5 hover:bg-amber-200 dark:hover:bg-amber-800 transition-colors"
        >
          <span>→ {suggested.name}</span>
        </button>
      )}

      {/* Selected state or search input */}
      {value ? (
        <div className="flex items-center gap-1 rounded-md border border-input bg-muted/40 px-2 py-1.5 text-sm">
          <span className="flex-1 truncate">{selectedName}</span>
          <button type="button" onClick={clear} className="text-muted-foreground hover:text-foreground shrink-0">
            <X className="h-3 w-3" />
          </button>
        </div>
      ) : (
        <input
          className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="Search…"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
        />
      )}

      {/* Dropdown */}
      {open && !value && (
        <ul className="absolute z-50 mt-1 w-full max-h-48 overflow-auto rounded-md border bg-popover shadow-md text-sm">
          <li>
            <button
              type="button"
              className="w-full px-3 py-1.5 text-left text-muted-foreground hover:bg-accent"
              onClick={() => { onChange(''); setOpen(false); setQuery(''); }}
            >
              — none —
            </button>
          </li>
          {suggestions.map((i) => (
            <li key={i.id}>
              <button
                type="button"
                className="w-full px-3 py-1.5 text-left hover:bg-accent"
                onClick={() => select(i.id)}
              >
                {i.name}
              </button>
            </li>
          ))}
          {suggestions.length === 0 && (
            <li className="px-3 py-2 text-muted-foreground">No matches</li>
          )}
        </ul>
      )}
    </div>
  );
}

// ─── TagInput ─────────────────────────────────────────────────────────────────
// Comma-separated tags stored as a single string, displayed as pills.

function TagInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  const [inputVal, setInputVal] = useState('');
  const tags = value ? value.split(',').map((t) => t.trim()).filter(Boolean) : [];

  const addTag = (raw: string) => {
    const tag = raw.trim();
    if (!tag || tags.includes(tag)) { setInputVal(''); return; }
    onChange([...tags, tag].join(', '));
    setInputVal('');
  };

  const removeTag = (tag: string) => {
    onChange(tags.filter((t) => t !== tag).join(', '));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(inputVal);
    } else if (e.key === 'Backspace' && inputVal === '' && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  return (
    <div>
      <input
        className="w-full rounded-md border border-input bg-background px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        placeholder={placeholder ?? 'Add tag…'}
        value={inputVal}
        onChange={(e) => setInputVal(e.target.value.replace(',', ''))}
        onKeyDown={handleKeyDown}
        onBlur={() => { if (inputVal.trim()) addTag(inputVal); }}
      />
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1.5">
          {tags.map((tag) => (
            <span key={tag} className="inline-flex items-center gap-0.5 rounded-full bg-muted text-xs px-2 py-0.5">
              {tag}
              <button type="button" onClick={() => removeTag(tag)} className="text-muted-foreground hover:text-foreground">
                <X className="h-2.5 w-2.5" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function AdminIngredientsPage() {
  const router = useRouter();
  const [ingredients, setIngredients] = useState<IngredientRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filter, setFilter] = useState('');
  const [orphansOnly, setOrphansOnly] = useState(false);
  const [deleting, setDeleting] = useState<Record<string, boolean>>({});
  const [edits, setEdits] = useState<Record<string, RowEdit>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState<Record<string, boolean>>({});

  const fetchIngredients = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/ingredients');
      if (res.status === 401) { router.push('/admin/login'); return; }
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      const rows: IngredientRow[] = data.ingredients;
      setIngredients(rows);
      const initial: Record<string, RowEdit> = {};
      for (const row of rows) {
        initial[row.id] = {
          name: row.name,
          parentId: row.parentId ?? '',
          categoryTags: (row.categoryTags ?? []).join(', '),
          aliases: (row.aliases ?? []).join(', '),
          noParent: row.noParent ?? false,
        };
      }
      setEdits(initial);
    } catch {
      toast.error('Failed to load ingredients');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [router]);

  useEffect(() => { fetchIngredients(); }, [fetchIngredients]);

  const handleRefresh = () => { setIsRefreshing(true); fetchIngredients(); };

  const handleDelete = async (id: string) => {
    setDeleting((prev) => ({ ...prev, [id]: true }));
    try {
      const res = await fetch('/api/admin/ingredients', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Delete failed');
      setIngredients((prev) => prev.filter((i) => i.id !== id));
      setEdits((prev) => { const next = { ...prev }; delete next[id]; return next; });
    } catch {
      toast.error('Failed to delete ingredient');
    } finally {
      setDeleting((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleLogout = () => {
    document.cookie = 'admin-session=; Max-Age=0; path=/;';
    router.push('/admin/login');
  };

  const setEdit = (id: string, field: keyof RowEdit, value: string | boolean) => {
    setEdits((prev) => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
    setSaved((prev) => ({ ...prev, [id]: false }));
  };

  const handleSave = async (id: string, overrides?: Partial<RowEdit>) => {
    const base = edits[id];
    if (!base) return;
    const edit = overrides ? { ...base, ...overrides } : base;
    setSaving((prev) => ({ ...prev, [id]: true }));
    try {
      const res = await fetch('/api/admin/ingredients', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          name: edit.name.trim() || undefined,
          parentId: edit.parentId || null,
          categoryTags: edit.categoryTags
            ? edit.categoryTags.split(',').map((t) => t.trim()).filter(Boolean)
            : null,
          aliases: edit.aliases
            ? edit.aliases.split(',').map((a) => a.trim()).filter(Boolean)
            : null,
          noParent: edit.noParent,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Save failed');
      const { ingredient } = data;
      setSaved((prev) => ({ ...prev, [id]: true }));
      setIngredients((prev) =>
        prev.map((row) =>
          row.id === id
            ? {
                ...row,
                name: ingredient.name,
                slug: ingredient.slug,
                parentId: ingredient.parentId,
                parentName: ingredients.find((i) => i.id === ingredient.parentId)?.name ?? null,
                categoryTags: ingredient.categoryTags,
                aliases: ingredient.aliases,
                noParent: ingredient.noParent,
              }
            : row
        )
      );
    } catch {
      toast.error('Failed to save ingredient');
    } finally {
      setSaving((prev) => ({ ...prev, [id]: false }));
    }
  };

  // IDs that are referenced as a parent by at least one other ingredient
  const parentIds = useMemo(
    () => new Set(ingredients.map((i) => i.parentId).filter(Boolean) as string[]),
    [ingredients]
  );

  const filtered = useMemo(() => {
    const q = filter.toLowerCase();
    let list = orphansOnly ? ingredients.filter((i) => i.recipeCount === 0 && !parentIds.has(i.id)) : ingredients;
    if (q) {
      list = list.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          (i.parentName ?? '').toLowerCase().includes(q) ||
          (i.categoryTags ?? []).some((t) => t.toLowerCase().includes(q))
      );
    }
    // Sort: unreviewed rows first, reviewed (has parent or noParent=true) at the bottom.
    // Within each section, group children under their parent, then alphabetically.
    const isReviewed = (r: IngredientRow) => !!r.parentId || r.noParent || parentIds.has(r.id);
    return [...list].sort((a, b) => {
      const aDone = isReviewed(a) ? 1 : 0;
      const bDone = isReviewed(b) ? 1 : 0;
      if (aDone !== bDone) return aDone - bDone;
      const aGroup = (a.parentName ?? a.name).toLowerCase();
      const bGroup = (b.parentName ?? b.name).toLowerCase();
      if (aGroup !== bGroup) return aGroup < bGroup ? -1 : 1;
      if (!a.parentId && b.parentId) return -1;
      if (a.parentId && !b.parentId) return 1;
      return a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1;
    });
  }, [ingredients, filter, orphansOnly]);

  // IDs of parents that have at least one child present in the filtered list
  const filteredParentIds = useMemo(
    () => new Set(filtered.map((r) => r.parentId).filter(Boolean) as string[]),
    [filtered]
  );

  if (isLoading) {
    return (
      <div className="container max-w-5xl mx-auto p-6 space-y-4">
        <Skeleton className="h-32 w-full" />
        {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
      </div>
    );
  }

  return (
    <div className="container max-w-5xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Wheat className="h-6 w-6" />
                Ingredient Manager
              </CardTitle>
              <CardDescription>
                Set parent ingredients and category tags for cross-linking
              </CardDescription>
            </div>
            <div className="flex flex-col items-end gap-1 shrink-0">
              <Badge variant="outline" className="text-lg px-3 py-1">
                {ingredients.length} ingredients
              </Badge>
              {ingredients.filter((i) => i.recipeCount === 0 && !parentIds.has(i.id)).length > 0 && (
                <span className="text-xs text-red-600 dark:text-red-400">
                  {ingredients.filter((i) => i.recipeCount === 0 && !parentIds.has(i.id)).length} orphans
                </span>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            <Button onClick={handleRefresh} disabled={isRefreshing} variant="outline" size="sm">
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              onClick={() => setOrphansOnly((v) => !v)}
              variant={orphansOnly ? 'default' : 'outline'}
              size="sm"
            >
              <Filter className="h-4 w-4 mr-2" />
              Orphans only
            </Button>
            <Button onClick={() => router.push('/admin/comments')} variant="outline" size="sm">
              <MessageSquare className="h-4 w-4 mr-2" />
              Comments
            </Button>
            <Button onClick={handleLogout} variant="ghost" size="sm">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </CardContent>
      </Card>

      <Input
        placeholder="Filter by name, parent, or tag…"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="max-w-sm"
      />

      <p className="text-xs text-muted-foreground">
        <strong>Parent</strong>: the more-generic ingredient (e.g. "granulated sugar" → "sugar").
        The <span className="text-amber-700 dark:text-amber-400 font-medium">→ suggestion</span> is auto-detected from the name — click to accept.
        {' '}<strong>Category tags</strong>: comma-separated (e.g. sweetener, protein, dairy-alternative).
        {' '}<strong>Aliases</strong>: comma-separated alternate names / plural forms.
      </p>

      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium w-[22%]">Ingredient</th>
              <th className="text-left px-4 py-3 font-medium w-[24%]">Parent</th>
              <th className="text-left px-4 py-3 font-medium w-[22%]">Category tags</th>
              <th className="text-left px-4 py-3 font-medium w-[20%]">Aliases</th>
              <th className="px-4 py-3 w-[12%]" />
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                  No ingredients match &ldquo;{filter}&rdquo;
                </td>
              </tr>
            )}
            {filtered.map((row, idx) => {
              const edit = edits[row.id];
              if (!edit) return null;
              const isSaving = saving[row.id];
              const isSaved = saved[row.id];
              const isDeleting = deleting[row.id];
              const isOrphan = row.recipeCount === 0 && !parentIds.has(row.id);

              // Grouping: is this row a child whose parent is visible in the filtered list?
              const isGroupParent = filteredParentIds.has(row.id);
              const isChild = !!row.parentId && filtered.some((r) => r.id === row.parentId);
              const prevRow = filtered[idx - 1];
              // Suppress top border when this child immediately follows its parent or a sibling
              const suppressBorder = isChild && (prevRow?.id === row.parentId || prevRow?.parentId === row.parentId);

              const hasParentDecision = !!edit.parentId || edit.noParent;
              const hasTags = edit.categoryTags.trim().length > 0;
              const hasAliases = edit.aliases.trim().length > 0;
              // noParent = true means the user has consciously reviewed this ingredient
              // and decided it needs no further enrichment — green without requiring tags/aliases.
              // If a parent is set, tags + aliases are still required for green.
              const isDone = edit.noParent ? hasParentDecision : (hasParentDecision && hasTags && hasAliases);

              return (
                <tr
                  key={row.id}
                  className={[
                    'hover:bg-muted/20',
                    !suppressBorder && idx > 0 ? 'border-t' : '',
                    isDone ? 'bg-green-50/40 dark:bg-green-950/10' : '',
                    isGroupParent ? 'border-l-2 border-l-blue-400' : '',
                    isChild && !isDone ? 'bg-blue-50/20 dark:bg-blue-950/10 border-l-2 border-l-blue-200 dark:border-l-blue-800' : '',
                    isChild && isDone ? 'border-l-2 border-l-blue-200 dark:border-l-blue-800' : '',
                  ].filter(Boolean).join(' ')}
                >
                  <td className="py-2 align-top pt-3 pr-4" style={{ paddingLeft: isChild ? '2rem' : '1rem' }}>
                    {isChild && (
                      <span className="text-muted-foreground text-xs mr-1">↳</span>
                    )}
                    <div className="flex items-center gap-1.5 flex-wrap mb-1">
                      {isDone && (
                        <span className="text-xs rounded-full bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 px-1.5 py-0.5">
                          ✓ enriched{row.updatedAt ? ` · ${row.updatedAt}` : ''}
                        </span>
                      )}
                      {isGroupParent && (
                        <span className="text-xs rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-1.5 py-0.5">
                          parent
                        </span>
                      )}
                      {isOrphan && (
                        <span className="text-xs rounded-full bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 px-1.5 py-0.5">
                          orphan
                        </span>
                      )}
                    </div>
                    <Input
                      className="h-8 text-sm font-medium"
                      value={edit.name}
                      onChange={(e) => setEdit(row.id, 'name', e.target.value)}
                    />
                  </td>

                  <td className="px-4 py-2 align-top pt-3">
                    {(edit.noParent && !edit.parentId) ? (
                      <div className="flex items-center gap-1.5">
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200 text-xs px-2 py-0.5">
                          <Check className="h-3 w-3" />
                          No parent
                        </span>
                        <button
                          type="button"
                          title="Undo"
                          onClick={() => {
                            setEdit(row.id, 'noParent', false);
                          }}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <ParentPicker
                          ingredientId={row.id}
                          ingredientName={row.name}
                          value={edit.parentId}
                          onChange={(id) => setEdit(row.id, 'parentId', id)}
                          allIngredients={ingredients}
                          suppressSuggestion={parentIds.has(row.id)}
                        />
                        {!edit.parentId && (
                          <button
                            type="button"
                            onClick={() => {
                              setEdits((prev) => ({ ...prev, [row.id]: { ...prev[row.id], noParent: true, parentId: '' } }));
                              handleSave(row.id, { noParent: true, parentId: '' });
                            }}
                            className="mt-1 text-xs text-muted-foreground hover:text-green-700 dark:hover:text-green-400 transition-colors"
                          >
                            ✓ No parent needed
                          </button>
                        )}
                      </>
                    )}
                  </td>

                  <td className="px-4 py-2 align-top pt-3">
                    <TagInput
                      value={edit.categoryTags}
                      onChange={(v) => setEdit(row.id, 'categoryTags', v)}
                      placeholder="Add tag…"
                    />
                  </td>

                  <td className="px-4 py-2 align-top pt-3">
                    <TagInput
                      value={edit.aliases}
                      onChange={(v) => setEdit(row.id, 'aliases', v)}
                      placeholder="Add alias…"
                    />
                  </td>

                  <td className="px-4 py-2 align-top pt-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {isOrphan && (
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={isDeleting}
                          onClick={() => handleDelete(row.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950 w-8 px-0"
                          title="Delete orphan"
                        >
                          {isDeleting ? (
                            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" />
                          )}
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant={isSaved ? 'ghost' : 'outline'}
                        disabled={isSaving}
                        onClick={() => handleSave(row.id)}
                        className="w-16"
                      >
                        {isSaved ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : isSaving ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          'Save'
                        )}
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
