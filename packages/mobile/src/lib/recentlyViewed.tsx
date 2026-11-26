import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

// Recipes this cook opened lately, newest first, so they can pick up where they left off.
// Kept on the phone.

const KEY = 'cqv:recently-viewed:v1';
const KEEP = 10;

type Viewed = { slugs: string[]; add: (slug: string) => void; clear: () => void };
const Ctx = createContext<Viewed | null>(null);

/** Newest first, no repeats, at most KEEP. */
export const withViewed = (slugs: string[], slug: string) => [slug, ...slugs.filter((s) => s !== slug)].slice(0, KEEP);

export function RecentlyViewedProvider({ children }: { children: React.ReactNode }) {
  const [slugs, setSlugs] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((raw) => raw && setSlugs((s) => [...new Set([...s, ...JSON.parse(raw)])].slice(0, KEEP)))
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);
  useEffect(() => {
    if (loaded) AsyncStorage.setItem(KEY, JSON.stringify(slugs)).catch(() => {});
  }, [slugs, loaded]);

  const add = useCallback((slug: string) => setSlugs((s) => withViewed(s, slug)), []);
  const value = useMemo<Viewed>(() => ({ slugs, add, clear: () => setSlugs([]) }), [slugs, add]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useRecentlyViewed(): Viewed {
  const v = useContext(Ctx);
  if (!v) throw new Error('useRecentlyViewed must be used inside RecentlyViewedProvider');
  return v;
}
