import Link from "next/link";
import Image from "next/image";
import { Recipe } from "@/types/recipe";
import { FavoriteButton } from "./favorite-button";

interface RecipeCardCompactProps {
  recipe: Recipe;
  fromCategory?: string;
}

export default function RecipeCardCompact({ recipe, fromCategory }: RecipeCardCompactProps) {
  const href = fromCategory
    ? `/recipes/${recipe.slug}?from=${fromCategory.toLowerCase()}`
    : `/recipes/${recipe.slug}`;

  return (
    <Link href={href} className="group relative block">
      <div className="bg-white dark:bg-neutral-800 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 rounded-lg overflow-hidden relative">
        <div className="relative w-full aspect-[5/4] overflow-hidden">
          <Image
            src={recipe.coverImage || "/images/placeholder.jpg"}
            alt={recipe.alt || recipe.title}
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
            {(recipe.description?.split(".")[0] || "Click to view recipe") + "."}
          </div>
          <FavoriteButton recipeId={recipe.id} />
        </div>
        <div className="p-2">
          <h3 className="text-sm sm:text-base font-medium line-clamp-3 bg-gradient-to-t from-white/90 dark:from-neutral-800/80 px-2 py-1">
            {recipe.title}
          </h3>
        </div>
      </div>
    </Link>
  );
}
