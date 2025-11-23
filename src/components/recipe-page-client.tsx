"use client";

import PostCard from "./post-card";
import { Post } from "@/lib/types";

interface RecipePageClientProps {
  recipes: Post[];
}

export default function RecipePageClient({ recipes }: RecipePageClientProps) {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-3">
        All Recipes
      </h1>

      {/* Recipes Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-start">
        {recipes.map((recipe) => (
          <PostCard key={recipe.id} post={recipe} />
        ))}
      </div>
    </div>
  );
}
