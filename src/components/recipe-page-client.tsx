"use client";

import { useState } from "react";
import PostCard from "./post-card";
import { RecipeSearchBar } from "./recipe-search-bar";
import { Post } from "@/lib/types";

interface RecipePageClientProps {
  recipes: Post[];
}

function filterRecipes(recipes: Post[], query: string): Post[] {
  if (!query) return recipes;
  const q = query.toLowerCase();
  return recipes.filter((recipe) => recipe.title.toLowerCase().includes(q));
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
            <PostCard key={recipe.id} post={recipe} />
          ))}
        </div>
      )}
    </div>
  );
}
