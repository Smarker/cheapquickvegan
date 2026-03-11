"use client";

import { Heart, Printer } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFavorites } from "@/contexts/favorites-context";
import { ShareButtons } from "@/components/recipes/share-buttons";

interface RecipeMobileActionsProps {
  recipeId: string;
  recipeTitle: string;
  recipeDescription: string;
  recipeUrl: string;
  variant: "save" | "engage";
}

export function RecipeMobileActions({
  recipeId,
  recipeTitle,
  recipeDescription,
  recipeUrl,
  variant,
}: RecipeMobileActionsProps) {
  const { toggleFavorite, isFavorite } = useFavorites();
  const favorited = isFavorite(recipeId);

  if (variant === "save") {
    return (
      <div className="lg:hidden flex items-center justify-end gap-2 mt-0.5 mb-1 print:hidden">
        <button
          onClick={() => toggleFavorite(recipeId)}
          className={cn(
            "flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium transition-all duration-200 shadow-sm",
            favorited
              ? "bg-rose-500 text-white hover:bg-rose-600"
              : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
          )}
          aria-label={favorited ? "Remove from saved recipes" : "Save this recipe"}
        >
          <Heart
            className={cn(
              "w-3.5 h-3.5 flex-shrink-0 transition-colors",
              favorited ? "fill-white text-white" : "fill-none"
            )}
            strokeWidth={2}
          />
          {favorited ? "Saved" : "Save"}
        </button>

        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-muted text-sm font-medium text-muted-foreground hover:bg-muted/80 hover:text-foreground transition-all duration-200 shadow-sm"
          aria-label="Print recipe"
        >
          <Printer className="w-3.5 h-3.5 flex-shrink-0" />
          Print
        </button>
      </div>
    );
  }

  // engage variant — shown just before comments
  return (
    <div className="lg:hidden my-6 print:hidden">
      <div className="rounded-2xl border border-border bg-muted/20 px-5 py-4">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          Share with a friend
        </p>
        <ShareButtons
          recipeId={recipeId}
          recipeTitle={recipeTitle}
          recipeDescription={recipeDescription}
          recipeUrl={recipeUrl}
          variant="inline"
          showLabel={false}
          compact={false}
        />
      </div>
    </div>
  );
}
