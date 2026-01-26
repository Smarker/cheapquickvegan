// app/page.tsx
import Image from "next/image";
import Link from "next/link";
import { getGuidesFromCache, getRecipesFromCache } from "@/lib/notion";
import { Recipe } from "@/types/recipe";
import { Guide } from "@/types/guide";
import { FavoritesSection } from "@/components/favorites/favorites-section";
import { JumpToFavorites } from "@/components/favorites/jump-to-favorites";

export default function HomePage() {
  const allRecipes: Recipe[] = getRecipesFromCache();
  const categories = ["Meal", "Breakfast", "Dessert", "Side", "Snack"];

  // Map first image for each category
  const categoryImages: Record<string, string> = {};
  for (const recipe of allRecipes) {
    if (recipe.categories && !categoryImages[recipe.categories[0]]) {
      categoryImages[recipe.categories[0]] =
        recipe.coverImage || "/images/placeholder.jpg";
    }
  }

  const featuredSlugs = [
    "fresh-vegan-no-cook-gazpacho",
    "vegan-tahini-maple-halva",
    "maesri-paste-weeknight-curry",
    "crispy-vegan-maple-baklava",
  ];

  const featuredRecipes = allRecipes.filter((r) =>
    featuredSlugs.includes(r.slug)
  );

  const allGuides: Guide[] = getGuidesFromCache();

  const featuredGuideSlugs = [
    "cusco-peru-vegan-food",
    "ollantaytambo-vegan-food-travel-guide",
    "aguas-calientes-vegan-food"
  ];

  const featuredGuides = allGuides.filter((r) =>
    featuredGuideSlugs.includes(r.slug)
  );

  return (
    <div className="w-full px-4 sm:px-6 py-12">

      {/* HEADER */}
      <div className="flex justify-center mb-16">
        <div className="w-full max-w-4xl">
          {/* Mobile: Photo + Title row, then content below */}
          <div className="flex flex-col md:hidden">
            <div className="flex flex-row items-center justify-center gap-4 mb-4">
              <div className="relative w-20 h-20 flex-shrink-0 rounded-full overflow-hidden shadow-xl ring-2 ring-[#fefae0]">
                <Image
                  src="/images/stephanie.jpg"
                  alt="Stephanie"
                  fill
                  sizes="80px"
                  className="rounded-full object-cover"
                />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                Welcome to CheapQuickVegan
              </h1>
            </div>
            <div className="flex flex-col gap-3 items-center">
              <p className="text-lg text-muted-foreground leading-relaxed">
                I'm Stephanie, a rock-climbing foodie who turns simple ingredients into
                amazing vegan meals to fuel an active lifestyle. Here, you can find
                quick, flavorful, no-fluff plant-based recipes and{" "}
                <a href="#featured-guides" className="text-primary hover:underline">
                  vegan travel guides
                </a>
                . Each recipe comes with tips & substitutions to make it easy and tasty.
              </p>
              <JumpToFavorites />
            </div>
          </div>

          {/* Desktop: Photo on left, vertically centered with content on right */}
          <div className="hidden md:flex flex-row items-center gap-8">
            <div className="relative w-32 h-32 flex-shrink-0 rounded-full overflow-hidden shadow-xl ring-2 ring-[#fefae0]">
              <Image
                src="/images/stephanie.jpg"
                alt="Stephanie"
                fill
                sizes="128px"
                className="rounded-full object-cover"
              />
            </div>
            <div className="flex flex-col gap-3 flex-1">
              <h1 className="text-4xl font-bold tracking-tight text-foreground">
                Welcome to CheapQuickVegan
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                I'm Stephanie, a rock-climbing foodie who turns simple ingredients into
                amazing vegan meals to fuel an active lifestyle. Here, you can find
                quick, flavorful, no-fluff plant-based recipes and{" "}
                <a href="#featured-guides" className="text-primary hover:underline">
                  vegan travel guides
                </a>
                . Each recipe comes with tips & substitutions to make it easy and tasty.
              </p>
              <div>
                <JumpToFavorites />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RECIPE CATEGORIES */}
      <h2 className="text-3xl sm:text-4xl font-bold mb-8">Recipe Categories</h2>

      <div className="grid grid-cols-2 sm:grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-6">
        {categories.map((cat) => (
          <Link
            key={cat}
            href={`/recipes/category/${cat.toLowerCase()}`}
            className="block group"
          >
            <div className="bg-white dark:bg-neutral-800 shadow-lg rounded-xl overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">

              <div className="relative w-full aspect-[4/3] overflow-hidden">
                <Image
                  src={categoryImages[cat] || "/images/placeholder.jpg"}
                  alt={cat}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 16vw"
                  className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
                />
              </div>

              <div className="p-2">
                <h3 className="text-md font-semibold text-gray-900 dark:text-white text-center">
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </h3>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* FEATURED RECIPES */}
      <h2 className="text-3xl sm:text-4xl font-bold mb-8 mt-12">
        Featured Recipes
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-6 mb-16">
        {featuredRecipes.map((featuredRecipe) => (
          <Link
            key={featuredRecipe.slug}
            href={`/recipes/${featuredRecipe.slug}`}
            className="block group"
          >
            <div className="bg-white dark:bg-neutral-800 shadow-lg rounded-xl overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">

              <div className="relative w-full aspect-[4/3] overflow-hidden">
                <Image
                  src={featuredRecipe.coverImage || "/images/placeholder.jpg"}
                  alt={featuredRecipe.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 16vw"
                  className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
                />
              </div>

              <div className="p-2">
                <h3 className="text-md font-semibold text-gray-900 dark:text-white text-center">
                  {featuredRecipe.title}
                </h3>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* YOUR FAVORITES */}
      <FavoritesSection allRecipes={allRecipes} />

      {/* FEATURED GUIDES */}
      <h2 id="featured-guides" className="text-3xl sm:text-4xl font-bold mb-8 mt-12">
        Featured Guides
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-16">
        {featuredGuides.map((featuredGuide) => (
          <Link
            key={featuredGuide.slug}
            href={`/guides/${featuredGuide.slug}`}
            className="block group"
          >
            <div className="bg-white dark:bg-neutral-800 shadow-lg rounded-xl overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">

              <div className="relative w-full aspect-[2/1] overflow-hidden">
                <Image
                  src={featuredGuide.coverImage || "/images/placeholder.jpg"}
                  alt={featuredGuide.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 16vw"
                  className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
                />
              </div>

              <div className="p-3">
                <h3 className="text-md font-semibold text-gray-900 dark:text-white text-center line-clamp-2 min-h-[3rem]">
                  {featuredGuide.title}
                </h3>
              </div>
            </div>
          </Link>
        ))}
      </div>

    </div>
  );
}
