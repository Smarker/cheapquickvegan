"use client";

import { useCallback } from "react";
import RecipeCard from "./recipe-card";
import RecipeCardCompact from "./recipe-card-compact";
import { RecipeSearchBar } from "./recipe-search-bar";
import { Recipe } from "@/types/recipe";
import { filterRecipes } from "@/lib/utils";
import { useFavorites } from "@/contexts/favorites-context";
import GenericListPage from "@/components/common/generic-list-page";

type CardVariant = "detailed" | "compact";

interface RecipeListPageProps {
  recipes: Recipe[];
  title: string;
  cardVariant?: CardVariant;
}

export default function RecipeListPage({
  recipes,
  title,
  cardVariant = "detailed",
}: RecipeListPageProps) {
  const { isFavorite } = useFavorites();

  const sortByFavorites = useCallback(
    (items: Recipe[]) => {
      return items.sort((a, b) => {
        const aFavorited = isFavorite(a.id);
        const bFavorited = isFavorite(b.id);
        if (aFavorited && !bFavorited) return -1;
        if (!aFavorited && bFavorited) return 1;
        return 0;
      });
    },
    [isFavorite]
  );

  return (
    <GenericListPage
      items={recipes}
      title={title}
      cardVariant={cardVariant}
      searchBar={(props) => <RecipeSearchBar {...props} />}
      filterFn={filterRecipes}
      sortFn={sortByFavorites}
      renderDetailedCard={(recipe) => <RecipeCard recipe={recipe} />}
      renderCompactCard={(recipe) => <RecipeCardCompact recipe={recipe} />}
      getItemKey={(recipe) => recipe.id}
      itemTypeName="recipes"
    />
  );
}
