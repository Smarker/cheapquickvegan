// app/page.tsx
import Image from "next/image";
import Link from "next/link";
import { getGuidesFromCache, getRecipesFromCache } from "@/lib/notion";
import { Recipe } from "@/types/recipe";
import { Guide } from "@/types/guide";
import { FavoritesSection } from "@/components/favorites/favorites-section";
import { JumpToFavorites } from "@/components/favorites/jump-to-favorites";
import { Sparkles } from "lucide-react";

export default function HomePage() {
  const allRecipes: Recipe[] = getRecipesFromCache();
  const categories = [
    { name: "Meal", description: "Hearty main dishes perfect for lunch or dinner" },
    { name: "Breakfast", description: "Start your day with delicious plant-based options" },
    { name: "Dessert", description: "Sweet treats that are completely vegan" },
    { name: "Side", description: "Perfect accompaniments to round out any meal" },
    { name: "Snack", description: "Quick bites for when hunger strikes" }
  ];

  // Map first image for each category
  const categoryImages: Record<string, string> = {};
  for (const recipe of allRecipes) {
    if (recipe.categories && !categoryImages[recipe.categories[0]]) {
      categoryImages[recipe.categories[0]] =
        recipe.coverImage || "/images/placeholder.jpg";
    }
  }

  const categoryNames = categories.map(c => c.name);

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
    <div className="w-full px-4 sm:px-6 py-4">

      {/* HERO SECTION - Compact */}
      <section className="relative pb-2 px-4 mb-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-3 lg:gap-14 items-start lg:items-center">
            <div className="relative shrink-0 mx-auto lg:mx-0">
              <div className="relative w-28 h-28 sm:w-32 sm:h-32 lg:w-40 lg:h-40">
                {/* Decorative Frame */}
                <div className="absolute -inset-2 bg-[#BC6C25]/20 rounded-[2rem] blur-xl" />
                <div className="hidden lg:block absolute -inset-2 border-2 border-[#606C38]/30 dark:border-[#a3b18a]/30 rounded-[1.5rem] rotate-3" />

                {/* Main Image */}
                <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl">
                  <Image
                    src="/images/stephanie.jpg"
                    alt="Stephanie Marker, creator of CheapQuickVegan"
                    fill
                    sizes="(max-width: 640px) 112px, (max-width: 1024px) 128px, 160px"
                    className="object-cover"
                    priority
                  />
                </div>
              </div>
            </div>

            {/* Text Column */}
            <div className="space-y-1.5 min-w-0 flex-1 text-center lg:text-left">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight tracking-tight">
                <span className="block text-foreground/90 text-xl sm:text-2xl lg:text-3xl mb-1">Welcome to</span>
                <span className="relative inline-block">
                  <span className="relative z-10 text-[#606C38] dark:text-white">CheapQuickVegan</span>
                  <span className="absolute bottom-0 left-0 right-0 h-2 bg-[#BC6C25]/30 -rotate-1 -z-0"></span>
                </span>
              </h1>

              <p className="text-sm sm:text-base text-foreground/70 leading-snug max-w-2xl pt-1">
                I'm Stephanie, a rock-climbing foodie who turns simple ingredients into
                amazing vegan meals. Find quick, flavorful plant-based recipes and{" "}
                <a href="#featured-guides" className="text-primary hover:underline">
                  vegan travel guides
                </a>
                {" "}with tips & substitutions to make cooking easy.
              </p>

              <div className="pt-0.5">
                <JumpToFavorites />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* RECIPE CATEGORIES */}
      <h2 className="text-3xl sm:text-4xl font-bold mb-8">
        <span className="relative inline-block">
          <span className="relative z-10">Recipe Categories</span>
          <span className="absolute bottom-1 left-0 right-0 h-3 bg-[#606C38]/30 -rotate-1"></span>
        </span>
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-6">
        {categories.map((cat) => (
          <Link
            key={cat.name}
            href={`/recipes/category/${cat.name.toLowerCase()}`}
            className="block group"
          >
            <div className="bg-white dark:bg-neutral-800 shadow-lg rounded-xl overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">

              <div className="relative w-full aspect-[4/3] overflow-hidden">
                <Image
                  src={categoryImages[cat.name] || "/images/placeholder.jpg"}
                  alt={`${cat.name} - ${cat.description}`}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 16vw"
                  className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
                />
              </div>

              <div className="p-3">
                <h3 className="text-md font-semibold text-gray-900 dark:text-white text-center mb-1">
                  {cat.name.charAt(0).toUpperCase() + cat.name.slice(1)}
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 text-center line-clamp-2">
                  {cat.description}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* FEATURED RECIPES */}
      <h2 className="text-3xl sm:text-4xl font-bold mb-8 mt-12">
        <span className="relative inline-block">
          <span className="relative z-10">Featured Recipes</span>
          <span className="absolute bottom-1 left-0 right-0 h-3 bg-[#BC6C25]/30 -rotate-1"></span>
        </span>
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
        <span className="relative inline-block">
          <span className="relative z-10">Featured Guides</span>
          <span className="absolute bottom-1 left-0 right-0 h-3 bg-[#735d78]/30 -rotate-1"></span>
        </span>
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
