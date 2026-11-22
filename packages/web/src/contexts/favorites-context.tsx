"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface FavoriteMetadata {
  recipeId: string;
  addedAt: number;
  lastToggledAt: number;
}

interface FavoritesContextValue {
  toggleFavorite: (recipeId: string) => void;
  isFavorite: (recipeId: string) => boolean;
  getFavorites: () => FavoriteMetadata[];
}

const FavoritesContext = createContext<FavoritesContextValue | undefined>(undefined);

const STORAGE_KEY = "cqv-favorites";

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<FavoriteMetadata[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    setMounted(true);

    // Load favorites from localStorage
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setFavorites(Array.isArray(parsed) ? parsed : []);
      } catch (error) {
        console.error("[Favorites] Failed to parse localStorage data:", error);
        setFavorites([]);
      }
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (typeof window === "undefined") return;

    // Save favorites to localStorage whenever they change
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  }, [favorites, mounted]);

  const toggleFavorite = (recipeId: string) => {
    const now = Date.now();
    setFavorites((prev) => {
      const existing = prev.find((f) => f.recipeId === recipeId);

      if (existing) {
        // Remove from favorites
        return prev.filter((f) => f.recipeId !== recipeId);
      } else {
        // Add to favorites
        return [...prev, { recipeId, addedAt: now, lastToggledAt: now }];
      }
    });
  };

  const isFavorite = (recipeId: string): boolean => {
    return favorites.some((f) => f.recipeId === recipeId);
  };

  const getFavorites = (): FavoriteMetadata[] => {
    return favorites;
  };

  return (
    <FavoritesContext.Provider value={{ toggleFavorite, isFavorite, getFavorites }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }
  return context;
};
