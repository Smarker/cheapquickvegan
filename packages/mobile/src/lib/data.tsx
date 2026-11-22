import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AppGuide, AppRecipe } from '@cheapquickvegan/shared';
import { createContext, useContext, useEffect, useState } from 'react';
import { guides } from './journeys';
import { recipes } from './recipes';

/** Always the site's own domain, never a *.vercel.app preview. */
export const API_BASE = 'https://www.cheapquickvegan.com';
const STORE_KEY = 'cqv:data:v1';

type Snapshot = { recipes: AppRecipe[]; guides: AppGuide[]; updatedAt: string };

const VersionCtx = createContext(0);

function apply(s: Snapshot) {
  if (Array.isArray(s.recipes) && s.recipes.length) recipes.splice(0, recipes.length, ...s.recipes);
  if (Array.isArray(s.guides) && s.guides.length) guides.splice(0, guides.length, ...s.guides);
}

async function fetchJson<T>(path: string): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10_000);
  try {
    const res = await fetch(`${API_BASE}${path}`, { signal: controller.signal });
    if (!res.ok) throw new Error(`${path}: ${res.status}`);
    return (await res.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Keeps recipes and guides fresh. Order: bundled copy (instant) → last copy saved on the
 * phone → live data from the website's read-only API. Any failure leaves the current data
 * in place, so the app always works offline.
 */
export function DataProvider({ children }: { children: React.ReactNode }) {
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORE_KEY);
        if (saved && alive) {
          apply(JSON.parse(saved));
          setVersion((v) => v + 1);
        }
      } catch {}
      try {
        const [r, g] = await Promise.all([
          fetchJson<{ recipes: AppRecipe[] }>('/api/recipes'),
          fetchJson<{ guides: AppGuide[] }>('/api/guides'),
        ]);
        if (!alive || !r.recipes?.length) return;
        const snapshot: Snapshot = { recipes: r.recipes, guides: g.guides ?? [], updatedAt: new Date().toISOString() };
        apply(snapshot);
        setVersion((v) => v + 1);
        AsyncStorage.setItem(STORE_KEY, JSON.stringify(snapshot)).catch(() => {});
      } catch {
        // Offline, or the API isn't deployed yet: keep what we have.
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  return <VersionCtx.Provider value={version}>{children}</VersionCtx.Provider>;
}

/** Bumps whenever new recipe data arrives; include it in memo deps that read recipes or guides. */
export const useDataVersion = () => useContext(VersionCtx);
