"use client";

import { useState, useMemo } from "react";
import RecipeCard from "./recipe-card";
import RecipeCardCompact from "./recipe-card-compact";
import { RecipeSearchBar } from "./recipe-search-bar";
import { Recipe } from "@/types/recipe";
import { filterRecipes } from "@/lib/utils";
import { useFavorites } from "@/contexts/favorites-context";

type CardVariant = "detailed" | "compact";

interface RecipeListPageProps {
  recipes: Recipe[];
  title: string;
  cardVariant?: CardVariant;
  fromCategory?: string;
}

const gridClasses: Record<CardVariant, string> = {
  detailed: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8",
  compact: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6",
};

export default function RecipeListPage({
  recipes,
  title,
  cardVariant = "detailed",
  fromCategory,
}: RecipeListPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const { isFavorite } = useFavorites();

  const filteredRecipes = useMemo(() => {
    const filtered = filterRecipes(recipes, searchQuery);
    // Sort favorited recipes first
    return filtered.sort((a, b) => {
      const aFavorited = isFavorite(a.id);
      const bFavorited = isFavorite(b.id);
      if (aFavorited && !bFavorited) return -1;
      if (!aFavorited && bFavorited) return 1;
      return 0;
    });
  }, [recipes, searchQuery, isFavorite]);

  return (
    <div className="w-full max-w-6xl mx-auto px-4">
      <div className="flex items-center justify-between mb-6 md:mb-8">
        <h1
          className={`text-3xl sm:text-4xl font-bold tracking-tight text-foreground ${isSearchExpanded ? "hidden md:block" : ""}`}
        >
          {title}
        </h1>
        <RecipeSearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          onExpandChange={setIsSearchExpanded}
        />
      </div>

      {filteredRecipes.length === 0 ? (
        <p className="text-muted-foreground">
          No recipes found{searchQuery && ` for "${searchQuery}"`}.
        </p>
      ) : (
        <div className={`grid ${gridClasses[cardVariant]} w-full`}>
          {filteredRecipes.map((recipe) =>
            cardVariant === "detailed" ? (
              <RecipeCard key={recipe.id} recipe={recipe} fromCategory={fromCategory} />
            ) : (
              <RecipeCardCompact key={recipe.id} recipe={recipe} fromCategory={fromCategory} />
            )
          )}
        </div>
      )}
    </div>
  );
}
