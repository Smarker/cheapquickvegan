import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const SAVED_KEY = 'cqv:saved:v1';
const COOKED_KEY = 'cqv:cooked:v1';
const WEEK_KEY = 'cqv:week:v1';
const FIRST_COOKED_KEY = 'cqv:first-cooked:v1';
const SUMMITS_KEY = 'cqv:summits:v1';
const PASSED_KEY = 'cqv:passed:v1';

/** A recipe planned for this week, and how many times it had been cooked when it was added. */
export type WeekEntry = { slug: string; cookedAtAdd: number };

type Saved = {
  isSaved: (slug: string) => boolean;
  toggle: (slug: string) => void;
  slugs: string[];
  /** Increments on every new save, so the Saved tab can bounce in reply. */
  bounceTick: number;
  bounce: () => void;
  /** How many times each recipe has been cooked to the end in cook mode. */
  cookedCount: (slug: string) => number;
  markCooked: (slug: string) => number;
  /** Take back the last "cooked" (an accidental tap). */
  unmarkCooked: (slug: string) => void;
  /** Recipes planned for this week, in the order they were added. */
  week: WeekEntry[];
  inWeek: (slug: string) => boolean;
  toggleWeek: (slug: string) => void;
  /** Cooked since it was added to this week. */
  cookedThisWeek: (slug: string) => boolean;
  clearCookedFromWeek: () => void;
  /** When a recipe was first cooked to the end (ISO date), for journey postcards. */
  firstCookedOn: (slug: string) => string | undefined;
  /** Journeys summited, by region id, with the date. */
  summits: Record<string, string>;
  markSummit: (regionId: string) => void;
  /** Journey stops the cook chose to walk past ("take another path"), as "region:slug". */
  isPassed: (regionId: string, slug: string) => boolean;
  togglePassed: (regionId: string, slug: string) => void;
};

const Ctx = createContext<Saved | null>(null);

function usePersisted<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    AsyncStorage.getItem(key)
      .then((raw) => {
        if (raw) setValue(JSON.parse(raw));
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, [key]);
  useEffect(() => {
    if (loaded) AsyncStorage.setItem(key, JSON.stringify(value)).catch(() => {});
  }, [key, value, loaded]);
  return [value, setValue] as const;
}

/** Saved recipes (newest first) and cooked counts, kept on the device so they survive restarts. */
export function SavedProvider({ children }: { children: React.ReactNode }) {
  const [slugs, setSlugs] = usePersisted<string[]>(SAVED_KEY, []);
  const [cooked, setCooked] = usePersisted<Record<string, number>>(COOKED_KEY, {});
  const [week, setWeek] = usePersisted<WeekEntry[]>(WEEK_KEY, []);
  const [firstCooked, setFirstCooked] = usePersisted<Record<string, string>>(FIRST_COOKED_KEY, {});
  const [summits, setSummits] = usePersisted<Record<string, string>>(SUMMITS_KEY, {});
  const [passed, setPassed] = usePersisted<string[]>(PASSED_KEY, []);
  const [bounceTick, setBounceTick] = useState(0);

  const toggle = useCallback(
    (slug: string) => setSlugs((s) => (s.includes(slug) ? s.filter((x) => x !== slug) : [slug, ...s])),
    [setSlugs],
  );
  const bounce = useCallback(() => setBounceTick((n) => n + 1), []);
  const markCooked = useCallback(
    (slug: string) => {
      const next = (cooked[slug] ?? 0) + 1;
      setCooked((c) => ({ ...c, [slug]: (c[slug] ?? 0) + 1 }));
      setFirstCooked((f) => (f[slug] ? f : { ...f, [slug]: new Date().toISOString() }));
      return next;
    },
    [cooked, setCooked, setFirstCooked],
  );

  const value = useMemo(
    () => ({
      slugs,
      toggle,
      isSaved: (slug: string) => slugs.includes(slug),
      bounceTick,
      bounce,
      cookedCount: (slug: string) => cooked[slug] ?? 0,
      markCooked,
      unmarkCooked: (slug: string) => setCooked((c) => ((c[slug] ?? 0) > 0 ? { ...c, [slug]: c[slug] - 1 } : c)),
      week,
      inWeek: (slug: string) => week.some((w) => w.slug === slug),
      toggleWeek: (slug: string) =>
        setWeek((w) => (w.some((x) => x.slug === slug) ? w.filter((x) => x.slug !== slug) : [...w, { slug, cookedAtAdd: cooked[slug] ?? 0 }])),
      cookedThisWeek: (slug: string) => {
        const w = week.find((x) => x.slug === slug);
        return !!w && (cooked[slug] ?? 0) > w.cookedAtAdd;
      },
      clearCookedFromWeek: () => setWeek((w) => w.filter((x) => (cooked[x.slug] ?? 0) <= x.cookedAtAdd)),
      firstCookedOn: (slug: string) => firstCooked[slug],
      summits,
      markSummit: (regionId: string) => setSummits((s) => (s[regionId] ? s : { ...s, [regionId]: new Date().toISOString() })),
      isPassed: (regionId: string, slug: string) => passed.includes(`${regionId}:${slug}`),
      togglePassed: (regionId: string, slug: string) => {
        const key = `${regionId}:${slug}`;
        setPassed((list) => (list.includes(key) ? list.filter((k) => k !== key) : [...list, key]));
      },
    }),
    [slugs, toggle, bounceTick, bounce, cooked, markCooked, week, setWeek, firstCooked, summits, setSummits, passed, setPassed],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSaved(): Saved {
  const v = useContext(Ctx);
  if (!v) throw new Error('useSaved must be used inside SavedProvider');
  return v;
}

export const useSavedBounce = () => useSaved().bounce;
