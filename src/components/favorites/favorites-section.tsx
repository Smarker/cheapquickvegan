"use client";

import { useState, useEffect } from "react";
import { useFavorites } from "@/contexts/favorites-context";
import { Recipe } from "@/types/recipe";
import { ContentCarousel } from "@/components/common/content-carousel";

interface FavoritesSectionProps {
  allRecipes: Recipe[];
}

export function FavoritesSection({ allRecipes }: FavoritesSectionProps) {
  const { getFavorites } = useFavorites();
  const [favoriteRecipes, setFavoriteRecipes] = useState<Recipe[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const favIds = getFavorites()
      .sort((a, b) => b.lastToggledAt - a.lastToggledAt)
      .map((f) => f.recipeId);
    const recipes = allRecipes.filter((r) => favIds.includes(r.id));
    setFavoriteRecipes(recipes);
  }, [allRecipes, getFavorites, mounted]);

  if (!mounted || favoriteRecipes.length === 0) {
    return null;
  }

  return (
    <div id="favorites-section" className="mb-16">
      <h2 className="text-3xl sm:text-4xl font-bold mb-8 mt-12">
        <span className="relative inline-block">
          <span className="relative z-10">Your Favorites</span>
          <span className="absolute bottom-1 left-0 right-0 h-3 bg-[#BC6C25]/30 -rotate-1"></span>
        </span>
      </h2>

      <ContentCarousel items={favoriteRecipes} basePath="/recipes" />
    </div>
  );
}
