"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useFavorites } from "@/contexts/favorites-context";
import { Recipe } from "@/types/recipe";
import { cn } from "@/lib/utils";

interface FavoritesSectionProps {
  allRecipes: Recipe[];
}

export function FavoritesSection({ allRecipes }: FavoritesSectionProps) {
  const { getFavorites } = useFavorites();
  const [favoriteRecipes, setFavoriteRecipes] = useState<Recipe[]>([]);
  const [mounted, setMounted] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);

  const itemsPerPage = 4;

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

  const totalPages = Math.ceil(favoriteRecipes.length / itemsPerPage);
  const startIndex = currentPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRecipes = favoriteRecipes.slice(startIndex, endIndex);
  const hasMultiplePages = totalPages > 1;

  const goToNextPage = () => {
    setCurrentPage((prev) => (prev + 1) % totalPages);
  };

  const goToPrevPage = () => {
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
  };

  return (
    <div id="favorites-section">
      <h2 className="text-3xl sm:text-4xl font-bold mb-8 mt-12">
        Your Favorites
      </h2>

      {/* Desktop: Grid with Chevrons */}
      <div className="hidden sm:flex items-center gap-4 mb-6">
        {/* Navigation Buttons */}
        {hasMultiplePages && (
          <button
            onClick={goToPrevPage}
            className="flex-shrink-0 text-primary hover:text-primary/80 transition-colors p-2"
            aria-label="Previous favorites"
          >
            <ChevronLeft className="h-8 w-8" strokeWidth={2.5} />
          </button>
        )}

        {/* Recipes Grid */}
        <div className="grid grid-cols-4 gap-6 flex-1">
          {currentRecipes.map((favoriteRecipe) => (
            <Link
              key={favoriteRecipe.slug}
              href={`/recipes/${favoriteRecipe.slug}`}
              className="block group"
            >
              <div className="bg-white dark:bg-neutral-800 shadow-lg rounded-xl overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 h-full flex flex-col">
                <div className="relative w-full aspect-[4/3] overflow-hidden">
                  <Image
                    src={favoriteRecipe.coverImage || "/images/placeholder.jpg"}
                    alt={favoriteRecipe.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 16vw"
                    className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
                  />
                </div>

                <div className="p-2 flex-1 flex items-center justify-center">
                  <h3 className="text-md font-semibold text-gray-900 dark:text-white text-center line-clamp-2 min-h-[3rem]">
                    {favoriteRecipe.title}
                  </h3>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {hasMultiplePages && (
          <button
            onClick={goToNextPage}
            className="flex-shrink-0 text-primary hover:text-primary/80 transition-colors p-2"
            aria-label="Next favorites"
          >
            <ChevronRight className="h-8 w-8" strokeWidth={2.5} />
          </button>
        )}
      </div>

      {/* Mobile: Swipeable Carousel */}
      <div className="sm:hidden mb-6">
        <div className="overflow-x-auto snap-x snap-mandatory scrollbar-hide -mx-4 px-4">
          <div className="flex gap-4 pb-2">
            {favoriteRecipes.map((favoriteRecipe) => (
              <Link
                key={favoriteRecipe.slug}
                href={`/recipes/${favoriteRecipe.slug}`}
                className="block group snap-start flex-shrink-0 w-[calc(50%-8px)]"
              >
                <div className="bg-white dark:bg-neutral-800 shadow-lg rounded-xl overflow-hidden hover:shadow-2xl transition-all duration-300 h-full flex flex-col">
                  <div className="relative w-full aspect-[4/3] overflow-hidden">
                    <Image
                      src={favoriteRecipe.coverImage || "/images/placeholder.jpg"}
                      alt={favoriteRecipe.title}
                      fill
                      sizes="50vw"
                      className="object-cover transition-transform duration-500 ease-in-out group-active:scale-105"
                    />
                  </div>

                  <div className="p-2 flex-1 flex items-center justify-center">
                    <h3 className="text-md font-semibold text-gray-900 dark:text-white text-center line-clamp-2 min-h-[3rem]">
                      {favoriteRecipe.title}
                    </h3>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Page Indicators */}
      {hasMultiplePages && (
        <div className="hidden sm:flex justify-center gap-2 mb-16">
          {Array.from({ length: totalPages }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentPage(index)}
              className={cn(
                "w-2 h-2 rounded-full transition-all",
                index === currentPage
                  ? "bg-primary w-8"
                  : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
              )}
              aria-label={`Go to page ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Mobile scroll indicator text */}
      {favoriteRecipes.length > 2 && (
        <p className="sm:hidden text-center text-sm text-muted-foreground mb-16">
          Swipe to see more →
        </p>
      )}
    </div>
  );
}
