"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Recipe {
  id: string;
  slug: string;
  title: string;
  coverImage: string;
  alt?: string;
}

interface ContactRecipesCarouselProps {
  recipes: Recipe[];
}

export function ContactRecipesCarousel({ recipes }: ContactRecipesCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (recipes.length === 0) {
    return null;
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % recipes.length);
  };

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + recipes.length) % recipes.length);
  };

  const currentRecipe = recipes[currentIndex];

  return (
    <div className="space-y-3">
      {/* Desktop & Mobile: Single recipe with navigation */}
      <div className="flex items-center gap-3">
        {recipes.length > 1 && (
          <button
            onClick={goToPrev}
            className="flex-shrink-0 text-primary hover:text-primary/80 transition-colors p-1"
            aria-label="Previous recipe"
          >
            <ChevronLeft className="h-6 w-6" strokeWidth={2.5} />
          </button>
        )}

        <Link
          href={`/recipes/${currentRecipe.slug}`}
          className="block group flex-1"
        >
          <div className="bg-white dark:bg-neutral-800 shadow-lg rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300">
            <div className="relative w-full aspect-video overflow-hidden">
              <Image
                src={currentRecipe.coverImage || "/images/placeholder.jpg"}
                alt={currentRecipe.alt || currentRecipe.title}
                fill
                sizes="(max-width: 768px) 100vw, 400px"
                className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
              />
            </div>
            <div className="p-3 flex items-center justify-center">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white text-center line-clamp-2">
                {currentRecipe.title}
              </h3>
            </div>
          </div>
        </Link>

        {recipes.length > 1 && (
          <button
            onClick={goToNext}
            className="flex-shrink-0 text-primary hover:text-primary/80 transition-colors p-1"
            aria-label="Next recipe"
          >
            <ChevronRight className="h-6 w-6" strokeWidth={2.5} />
          </button>
        )}
      </div>

      {/* Page indicators */}
      {recipes.length > 1 && (
        <div className="flex justify-center gap-2">
          {recipes.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex
                  ? "bg-primary w-6"
                  : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
              }`}
              aria-label={`Go to recipe ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
