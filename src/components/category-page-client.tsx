"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { RecipeSearchBar } from "./recipe-search-bar";
import { Post } from "@/lib/types";
import { filterRecipes } from "@/lib/utils";

interface CategoryPageClientProps {
  recipes: Post[];
  category: string;
}

export default function CategoryPageClient({ recipes, category }: CategoryPageClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const filteredRecipes = filterRecipes(recipes, searchQuery);

  return (
    <div className="w-full max-w-6xl mx-auto px-4">
      <div className="flex items-center justify-between mb-6 md:mb-8">
        <h1 className={`text-3xl sm:text-4xl font-bold ${isSearchExpanded ? 'hidden md:block' : ''}`}>
          {category}s
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
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredRecipes.map((post) => (
            <Link key={post.id} href={`/recipes/${post.slug}`} className="group relative block">
              <div className="bg-white dark:bg-neutral-800 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 rounded-lg overflow-hidden relative">
                <div className="relative w-full aspect-[5/4] overflow-hidden">
                  <Image
                    src={post.coverImage || "/images/placeholder.jpg"}
                    alt={post.alt || post.title}
                    fill
                    sizes="
                      (max-width: 640px) 100vw,
                      (max-width: 1024px) 50vw,
                      (max-width: 1280px) 33vw,
                      25vw
                    "
                    className="object-cover w-full h-full transition-transform duration-500 ease-in-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center text-white p-3 text-center text-xs sm:text-sm">
                    {(post.description?.split(".")[0] || "Click to view recipe") + "."}
                  </div>
                </div>
                <div className="p-2">
                  <h3 className="text-sm sm:text-base font-medium line-clamp-3 bg-gradient-to-t from-white/90 dark:from-neutral-800/80 px-2 py-1">
                    {post.title}
                  </h3>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
