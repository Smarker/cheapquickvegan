import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Appearance } from 'react-native';
import { allergensIn, type Allergen } from './allergens';
import type { Recipe } from './recipes';
import type { Units } from './units';

const KEY = 'cqv:prefs:v1';
const OLD_UNITS_KEY = 'cqv:units:v1';

export type Theme = 'system' | 'light' | 'dark';

type Stored = {
  /** Null until the cook picks: recipes show as written. */
  units: Units | null;
  /** Equipment tags the cook doesn't have ("Air Fryer"). */
  missingGear: string[];
  avoid: Allergen[];
  autoHandsFree: boolean;
  helper: boolean;
  theme: Theme;
};

const DEFAULTS: Stored = { units: null, missingGear: [], avoid: [], autoHandsFree: false, helper: true, theme: 'system' };

export type RecipeWarnings = { contains: Allergen[]; needs: string[] };

type Prefs = Stored & {
  set: <K extends keyof Stored>(key: K, value: Stored[K]) => void;
  toggleGear: (tag: string) => void;
  toggleAvoid: (a: Allergen) => void;
  /** What this cook should know about a recipe: avoided allergens it seems to contain, gear they lack. */
  warningsFor: (r: Recipe) => RecipeWarnings;
  /** Whether a recipe belongs on Discover and in the fridge picker for this cook. */
  fits: (r: Recipe) => boolean;
};

const Ctx = createContext<Prefs | null>(null);

const allergenCache = new Map<string, Allergen[]>();
const allergensOf = (r: Recipe) => {
  const key = `${r.slug}:${r.ingredients.length}`;
  if (!allergenCache.has(key)) allergenCache.set(key, allergensIn(r.ingredients.flatMap((g) => g.items)));
  return allergenCache.get(key)!;
};

/** The cook's preferences, kept on the phone. Accounts can sync these later. */
export function PrefsProvider({ children }: { children: React.ReactNode }) {
  const [prefs, setPrefs] = useState<Stored>(DEFAULTS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    Promise.all([AsyncStorage.getItem(KEY), AsyncStorage.getItem(OLD_UNITS_KEY)])
      .then(([raw, oldUnits]) => {
        const stored = raw ? (JSON.parse(raw) as Partial<Stored>) : {};
        // Carry over the cups/grams choice from before preferences had their own screen.
        if (!raw && (oldUnits === 'grams' || oldUnits === 'volume')) stored.units = oldUnits;
        setPrefs({ ...DEFAULTS, ...stored });
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);
  useEffect(() => {
    if (loaded) AsyncStorage.setItem(KEY, JSON.stringify(prefs)).catch(() => {});
  }, [prefs, loaded]);
  useEffect(() => {
    Appearance.setColorScheme(prefs.theme === 'system' ? null : prefs.theme);
  }, [prefs.theme]);

  const set = useCallback(<K extends keyof Stored>(key: K, value: Stored[K]) => setPrefs((p) => ({ ...p, [key]: value })), []);
  const flip = <T,>(xs: T[], x: T) => (xs.includes(x) ? xs.filter((y) => y !== x) : [...xs, x]);

  const value = useMemo<Prefs>(() => {
    const warningsFor = (r: Recipe): RecipeWarnings => ({
      contains: allergensOf(r).filter((a) => prefs.avoid.includes(a)),
      needs: r.equipment.filter((e) => prefs.missingGear.includes(e)),
    });
    return {
      ...prefs,
      set,
      toggleGear: (tag) => setPrefs((p) => ({ ...p, missingGear: flip(p.missingGear, tag) })),
      toggleAvoid: (a) => setPrefs((p) => ({ ...p, avoid: flip(p.avoid, a) })),
      warningsFor,
      fits: (r) => {
        const w = warningsFor(r);
        return !w.contains.length && !w.needs.length;
      },
    };
  }, [prefs, set]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function usePrefs(): Prefs {
  const v = useContext(Ctx);
  if (!v) throw new Error('usePrefs must be used inside PrefsProvider');
  return v;
}

/** Shorthand for the cups/grams choice, used on the recipe page and in cook mode. */
export function useUnits() {
  const { units, set } = usePrefs();
  return { units, setUnits: (u: Units) => set('units', u) };
}
