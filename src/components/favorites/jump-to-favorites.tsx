"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { useFavorites } from "@/contexts/favorites-context";

export function JumpToFavorites() {
  const { getFavorites } = useFavorites();
  const [hasFavorites, setHasFavorites] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const favorites = getFavorites();
    setHasFavorites(favorites.length > 0);
  }, [getFavorites]);

  if (!mounted || !hasFavorites) {
    return null;
  }

  const scrollToFavorites = () => {
    const favoritesSection = document.getElementById("favorites-section");
    if (favoritesSection) {
      const yOffset = -100; // Offset to show title above viewport
      const y = favoritesSection.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  return (
    <button
      onClick={scrollToFavorites}
      className="inline-flex items-center gap-2 text-sm font-medium mt-3 px-4 py-2 rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors backdrop-blur-sm border border-primary/20"
    >
      <Heart className="h-4 w-4 fill-current" />
      Jump to Your Favorites
    </button>
  );
}
