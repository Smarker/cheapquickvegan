// app/recipes/category/[cat]/page.tsx
import { getPostsFromCache, Post } from "@/lib/notion";
import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";

interface CategoryPageProps {
  params: Promise<{ cat: string }>;
}

const categoryDescriptions: Record<string, string> = {
  meal: "Easy vegan meal recipes that are cheap, quick, and delicious. Perfect for busy weeknights.",
  breakfast: "Start your day right with these affordable vegan breakfast recipes. Quick and satisfying.",
  dessert: "Indulge in delicious vegan desserts that won't break the bank. Sweet treats made simple.",
  side: "Complement your meals with these easy vegan side dishes. Budget-friendly and flavorful.",
  snack: "Healthy vegan snacks for any time of day. Quick, cheap, and satisfying bites.",
};

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { cat } = await params;
  const displayCategory = cat.charAt(0).toUpperCase() + cat.slice(1);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.cheapquickvegan.com";
  const description = categoryDescriptions[cat.toLowerCase()] ||
    `Browse our collection of vegan ${cat} recipes. Cheap, quick, and delicious.`;

  return {
    title: `${displayCategory} Recipes`,
    description,
    alternates: { canonical: `${siteUrl}/recipes/category/${cat}` },
    openGraph: {
      title: `${displayCategory} Recipes | Cheap Quick Vegan`,
      description,
      type: "website",
      url: `${siteUrl}/recipes/category/${cat}`,
      images: [
        {
          url: `${siteUrl}/opengraph-image.png`,
          width: 1200,
          height: 630,
          alt: `${displayCategory} vegan recipes`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${displayCategory} Recipes | Cheap Quick Vegan`,
      description,
      images: [`${siteUrl}/opengraph-image.png`],
    },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { cat } = await params;

  const allPosts: Post[] = getPostsFromCache().filter(
    (p) => p.categories?.some(
      (c) => c.toLowerCase() === cat.toLowerCase()
    )
  );

  const displayCategory = cat.charAt(0).toUpperCase() + cat.slice(1);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl sm:text-4xl font-bold mb-6">{displayCategory}s</h1>

      {allPosts.length === 0 ? (
        <p>No recipes found in this category.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {allPosts.map((post) => (
            <Link key={post.id} href={`/recipes/${post.slug}`} className="group relative block">
              {/* Card container */}
              <div className="bg-white dark:bg-neutral-800 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 rounded-lg overflow-hidden relative">
                {/* Image */}
                <div className="relative w-full aspect-[5/4] overflow-hidden">
                  <Image
                    src={post.coverImage || "/images/placeholder.jpg"}
                    alt={post.alt || post.title}
                    fill
                    sizes="
                      (max-width: 640px) 100vw,   /* mobile: full width */
                      (max-width: 1024px) 50vw,   /* tablets: 2 per row */
                      (max-width: 1280px) 33vw,   /* small desktops: 3 per row */
                      25vw                        /* large desktops: 4 per row */
                    "
                    className="object-cover w-full h-full transition-transform duration-500 ease-in-out group-hover:scale-105"
                  />

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center text-white p-3 text-center text-xs sm:text-sm">
                    {(post.description?.split(".")[0] || "Click to view recipe") + "."}
                  </div>
                </div>

                {/* Title */}
                <div className="p-2">
                  <h3 className="text-sm sm:text-base font-medium line-clamp-3 bg-gradient-to-t from-white/90 dark:from-neutral-800/80 px-2 py-1">
                    {post.title}
                  </h3>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
