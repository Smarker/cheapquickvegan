"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface CarouselItem {
  id: string;
  slug: string;
  title: string;
  coverImage: string;
  alt?: string;
}

interface ContentCarouselProps<T extends CarouselItem> {
  items: T[];
  basePath: string; // e.g., "/recipes" or "/guides"
  itemsPerPage?: number;
  showPageIndicators?: boolean;
  mobileItemWidth?: string;
}

export function ContentCarousel<T extends CarouselItem>({
  items,
  basePath,
  itemsPerPage = 4,
  showPageIndicators = true,
  mobileItemWidth = "w-[calc(50%-8px)]"
}: ContentCarouselProps<T>) {
  const [currentPage, setCurrentPage] = useState(0);

  if (items.length === 0) {
    return null;
  }

  const totalPages = Math.ceil(items.length / itemsPerPage);
  const startIndex = currentPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = items.slice(startIndex, endIndex);
  const hasMultiplePages = totalPages > 1;

  const goToNextPage = () => {
    setCurrentPage((prev) => (prev + 1) % totalPages);
  };

  const goToPrevPage = () => {
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
  };

  return (
    <>
      {/* Desktop: Grid with Chevrons */}
      <div className="hidden sm:flex items-center gap-4 mb-6">
        {/* Navigation Buttons */}
        {hasMultiplePages && (
          <button
            onClick={goToPrevPage}
            className="flex-shrink-0 text-primary hover:text-primary/80 transition-colors p-2"
            aria-label="Previous items"
          >
            <ChevronLeft className="h-8 w-8" strokeWidth={2.5} />
          </button>
        )}

        {/* Items Grid */}
        <div className={cn(
          "grid gap-6 flex-1",
          itemsPerPage === 4 && "grid-cols-4",
          itemsPerPage === 3 && "grid-cols-3",
          itemsPerPage === 2 && "grid-cols-2",
          itemsPerPage === 1 && "grid-cols-1"
        )}>
          {currentItems.map((item) => (
            <Link
              key={item.slug}
              href={`${basePath}/${item.slug}`}
              className="block group"
            >
              <div className="bg-white dark:bg-neutral-800 shadow-lg rounded-xl overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 h-full flex flex-col">
                <div className="relative w-full aspect-[4/3] overflow-hidden flex-shrink-0">
                  <Image
                    src={item.coverImage || "/images/placeholder.jpg"}
                    alt={item.alt || item.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 16vw"
                    className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
                  />
                </div>

                <div className="p-2 flex items-center justify-center">
                  <h3 className="text-md font-semibold text-gray-900 dark:text-white text-center line-clamp-2">
                    {item.title}
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
            aria-label="Next items"
          >
            <ChevronRight className="h-8 w-8" strokeWidth={2.5} />
          </button>
        )}
      </div>

      {/* Mobile: Swipeable Carousel */}
      <div className="sm:hidden mb-6">
        <div className="overflow-x-auto snap-x snap-mandatory scrollbar-hide -mx-4 px-4">
          <div className="flex gap-4 pb-2">
            {items.map((item) => (
              <Link
                key={item.slug}
                href={`${basePath}/${item.slug}`}
                className={cn("block group snap-start flex-shrink-0", mobileItemWidth)}
              >
                <div className="bg-white dark:bg-neutral-800 shadow-lg rounded-xl overflow-hidden hover:shadow-2xl transition-all duration-300 h-full flex flex-col">
                  <div className="relative w-full aspect-[4/3] overflow-hidden flex-shrink-0">
                    <Image
                      src={item.coverImage || "/images/placeholder.jpg"}
                      alt={item.alt || item.title}
                      fill
                      sizes="50vw"
                      className="object-cover transition-transform duration-500 ease-in-out group-active:scale-105"
                    />
                  </div>

                  <div className="p-2 flex items-center justify-center">
                    <h3 className="text-md font-semibold text-gray-900 dark:text-white text-center line-clamp-2">
                      {item.title}
                    </h3>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Page Indicators */}
      {showPageIndicators && hasMultiplePages && (
        <div className="hidden sm:flex justify-center gap-2 mb-6">
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
      {items.length > 2 && (
        <p className="sm:hidden text-center text-sm text-muted-foreground mb-6">
          Swipe to see more →
        </p>
      )}
    </>
  );
}
