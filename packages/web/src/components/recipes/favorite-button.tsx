"use client";

import { Heart } from "lucide-react";
import { useFavorites } from "@/contexts/favorites-context";
import { cn } from "@/lib/utils";

interface FavoriteButtonProps {
  recipeId: string;
}

export function FavoriteButton({ recipeId }: FavoriteButtonProps) {
  const { toggleFavorite, isFavorite } = useFavorites();
  const favorited = isFavorite(recipeId);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(recipeId);
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        "absolute top-[16px] right-4 z-30",
        "hover:scale-110 transition-transform",
        "focus:outline-none"
      )}
      aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
      type="button"
    >
      <Heart
        className={cn("h-6 w-6 fill-current", favorited ? "text-rose-600" : "text-muted-foreground/80")}
        strokeWidth={2}
        style={{
          filter: favorited
            ? 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.4))'
            : 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3))',
          stroke: 'white',
          strokeWidth: '1.5px'
        }}
      />
    </button>
  );
}
