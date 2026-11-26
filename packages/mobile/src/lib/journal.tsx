import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

// How each recipe turned out for this cook, with their own notes. Kept on the phone only:
// it shapes their Discover and greets them on the recipe next time. Site stars are separate
// and only sent when the cook picks them.

const KEY = 'cqv:journal:v1';

export type Verdict = 'loved' | 'good' | 'tweak';
export const VERDICTS: { key: Verdict; label: string }[] = [
  { key: 'loved', label: 'Loved it!' },
  { key: 'good', label: 'It was good' },
  { key: 'tweak', label: 'Needs some tweaking' },
];
export const verdictLabel = (v: Verdict) => VERDICTS.find((x) => x.key === v)!.label;

export type Entry = {
  verdict: Verdict | null;
  note: string;
  swaps: string;
  /** Stars sent to the website, and the token that lets this phone change them. */
  siteStars: number | null;
  siteToken: string | null;
  updatedAt: string;
};

const EMPTY: Omit<Entry, 'updatedAt'> = { verdict: null, note: '', swaps: '', siteStars: null, siteToken: null };

type Journal = {
  entry: (slug: string) => Entry | null;
  update: (slug: string, change: Partial<Omit<Entry, 'updatedAt'>>) => void;
  /** Slugs with this verdict, most recently updated first. */
  withVerdict: (v: Verdict) => string[];
};

const Ctx = createContext<Journal | null>(null);

export function JournalProvider({ children }: { children: React.ReactNode }) {
  const [entries, setEntries] = useState<Record<string, Entry>>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((raw) => raw && setEntries(JSON.parse(raw)))
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);
  useEffect(() => {
    if (loaded) AsyncStorage.setItem(KEY, JSON.stringify(entries)).catch(() => {});
  }, [entries, loaded]);

  const update = useCallback(
    (slug: string, change: Partial<Omit<Entry, 'updatedAt'>>) =>
      setEntries((e) => ({ ...e, [slug]: { ...EMPTY, ...e[slug], ...change, updatedAt: new Date().toISOString() } })),
    [],
  );

  const value = useMemo<Journal>(
    () => ({
      entry: (slug) => entries[slug] ?? null,
      update,
      withVerdict: (v) =>
        Object.entries(entries)
          .filter(([, e]) => e.verdict === v)
          .sort(([, a], [, b]) => b.updatedAt.localeCompare(a.updatedAt))
          .map(([slug]) => slug),
    }),
    [entries, update],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useJournal(): Journal {
  const v = useContext(Ctx);
  if (!v) throw new Error('useJournal must be used inside JournalProvider');
  return v;
}

/** Whether there's anything worth showing on the recipe page. */
export const hasNotes = (e: Entry | null): e is Entry => !!e && (!!e.verdict || !!e.note.trim() || !!e.swaps.trim());
