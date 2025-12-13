"use client";

import { useState } from "react";
import RecipeCard from "./recipe-card";
import { RecipeSearchBar } from "./recipe-search-bar";
import { Recipe } from "@/lib/types";
import { filterRecipes } from "@/lib/utils";

interface RecipePageClientProps {
  recipes: Recipe[];
}

export default function RecipePageClient({ recipes }: RecipePageClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const filteredRecipes = filterRecipes(recipes, searchQuery);

  return (
    <div className="w-full max-w-6xl mx-auto px-4">
      <div className="flex items-center justify-between mb-6 md:mb-8">
        <h1 className={`text-3xl sm:text-4xl font-bold tracking-tight text-foreground ${isSearchExpanded ? 'hidden md:block' : ''}`}>
          All Recipes
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
          {filteredRecipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      )}
    </div>
  );
}
