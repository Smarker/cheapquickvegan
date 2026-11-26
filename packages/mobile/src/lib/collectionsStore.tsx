import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { createCollection, deleteCollection, removeEverywhere, renameCollection, restoreCollection, toggleInCollection, type Collection } from './collections';
import { useSaved } from './saved';

// Collections, kept on the phone. The logic is in collections.ts.

const KEY = 'cqv:collections:v1';

type Store = {
  collections: Collection[];
  create: (name: string, firstSlug?: string) => void;
  rename: (id: string, name: string) => void;
  remove: (id: string) => void;
  /** Puts a deleted collection back where it was (Undo). */
  restore: (c: Collection, at: number) => void;
  toggle: (id: string, slug: string) => void;
};
const Ctx = createContext<Store | null>(null);

export function CollectionsProvider({ children }: { children: React.ReactNode }) {
  const saved = useSaved();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((raw) => raw && setCollections(JSON.parse(raw)))
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);
  useEffect(() => {
    if (loaded) AsyncStorage.setItem(KEY, JSON.stringify(collections)).catch(() => {});
  }, [collections, loaded]);
  // Unsaving a recipe takes it out of every collection.
  useEffect(() => {
    if (!loaded) return;
    setCollections((list) => {
      const stray = list.flatMap((c) => c.slugs).filter((s) => !saved.isSaved(s));
      return stray.length ? stray.reduce(removeEverywhere, list) : list;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saved.slugs, loaded]);

  const value = useMemo<Store>(
    () => ({
      collections,
      create: (name, firstSlug) => setCollections((l) => createCollection(l, name, `${Date.now()}`, firstSlug)),
      rename: (id, name) => setCollections((l) => renameCollection(l, id, name)),
      remove: (id) => setCollections((l) => deleteCollection(l, id)),
      restore: (c, at) => setCollections((l) => restoreCollection(l, c, at)),
      toggle: (id, slug) => setCollections((l) => toggleInCollection(l, id, slug)),
    }),
    [collections],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCollections(): Store {
  const v = useContext(Ctx);
  if (!v) throw new Error('useCollections must be used inside CollectionsProvider');
  return v;
}
