// app/page.tsx
import Image from "next/image";
import Link from "next/link";
import { getPostsFromCache, Post } from "@/lib/notion";

export default function HomePage() {
  const allPosts: Post[] = getPostsFromCache();

  // Get unique categories
  const categories = Array.from(
    new Set(allPosts.map((p) => p.category).filter(Boolean))
  );

  // Map first image for each category
  const categoryImages: Record<string, string> = {};
  for (const post of allPosts) {
    if (post.category && !categoryImages[post.category]) {
      categoryImages[post.category] = post.coverImage || "/images/placeholder.jpg";
    }
  }

  return (
    <div className="w-full px-4 sm:px-6 py-12">

      {/* HEADER: photo left, text right */}
      <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-16">
        
        {/* Photo */}
        <div className="relative w-32 h-32 flex-shrink-0 rounded-full overflow-hidden shadow-xl ring-2 ring-[#fefae0]">
          <Image
            src="/images/stephanie.jpg"
            alt="Stephanie"
            fill
            sizes="(max-width: 640px) 120px, (max-width: 1024px) 150px, 200px"
            className="rounded-full object-cover"
          />
        </div>

        {/* Text */}
        <div className="flex flex-col justify-center max-w-3xl w-full text-left">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-3">
            Welcome to CheapQuickVegan
          </h1>

          <p className="text-lg text-muted-foreground leading-relaxed">
            I'm Stephanie, a rock-climbing foodie who turns simple ingredients into
            amazing vegan meals to fuel an active lifestyle. Here, you can find
            quick, flavorful, no-fluff plant-based recipes. Each recipe comes with
            tips & substitutions to make it easy and tasty.
          </p>
        </div>
      </div>

    <h2 className="text-3xl sm:text-4xl font-bold mb-8">Recipe Categories</h2>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-6">
        {categories.map((cat) => (
          <Link
            key={cat}
            href={`/recipes/category/${cat.toLowerCase()}`}
            className="block group"
          >
            {/* Category Card */}
            <div className="bg-white dark:bg-neutral-800 shadow-lg rounded-xl overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">

              {/* Smaller Preview Image */}
              <div className="relative w-full aspect-[4/3] overflow-hidden">
                <Image
                  src={categoryImages[cat] || "/images/placeholder.jpg"}
                  alt={cat}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 16vw"
                  className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
                />
              </div>

              {/* Category Title */}
              <div className="p-2">
                <h3 className="text-md font-semibold text-gray-900 dark:text-white text-center">
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </h3>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
