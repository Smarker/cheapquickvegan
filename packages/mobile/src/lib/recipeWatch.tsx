import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useDataVersion } from './data';
import { changesBetween, snapshotOf, type RecipeSnapshot } from './recipeChanges';
import { recipes } from './recipes';
import { useSaved } from './saved';

// Remembers each saved recipe as it was when saved, so the app can say what changed since.

const KEY = 'cqv:saved-snapshots:v1';

type Watch = {
  /** What changed in a saved recipe since it was saved (or since the cook last said "Got it"). */
  changesFor: (slug: string) => string[];
  /** The cook has seen the changes: remember the recipe as it is now. */
  acknowledge: (slug: string) => void;
};
const Ctx = createContext<Watch | null>(null);

export function RecipeWatchProvider({ children }: { children: React.ReactNode }) {
  const saved = useSaved();
  const version = useDataVersion();
  const [snaps, setSnaps] = useState<Record<string, RecipeSnapshot>>({});
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((raw) => raw && setSnaps(JSON.parse(raw)))
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);
  useEffect(() => {
    if (loaded) AsyncStorage.setItem(KEY, JSON.stringify(snaps)).catch(() => {});
  }, [snaps, loaded]);

  // Remember newly saved recipes as they are now, and forget unsaved ones. Only once newer data
  // than the bundled copy has loaded, so an old bundled copy never shows up as an "update".
  useEffect(() => {
    if (!loaded) return;
    setSnaps((prev) => {
      const next: Record<string, RecipeSnapshot> = {};
      let changed = false;
      for (const slug of saved.slugs) {
        if (prev[slug]) next[slug] = prev[slug];
        else {
          const r = recipes.find((x) => x.slug === slug);
          if (r && version > 0) {
            next[slug] = snapshotOf(r);
            changed = true;
          }
        }
      }
      if (Object.keys(prev).some((s) => !next[s])) changed = true;
      return changed ? next : prev;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saved.slugs, version, loaded]);

  const value = useMemo<Watch>(
    () => ({
      changesFor: (slug) => {
        const snap = snaps[slug];
        const r = recipes.find((x) => x.slug === slug);
        return snap && r ? changesBetween(snap, snapshotOf(r)) : [];
      },
      acknowledge: (slug) => {
        const r = recipes.find((x) => x.slug === slug);
        if (r) setSnaps((s) => ({ ...s, [slug]: snapshotOf(r) }));
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [snaps, version],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useRecipeWatch(): Watch {
  const v = useContext(Ctx);
  if (!v) throw new Error('useRecipeWatch must be used inside RecipeWatchProvider');
  return v;
}
