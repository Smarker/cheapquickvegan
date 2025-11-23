// app/recipes/category/[cat]/page.tsx
import { getPostsFromCache, Post } from "@/lib/notion";
import Image from "next/image";
import Link from "next/link";

interface CategoryPageProps {
  params: Promise<{ cat: string }>;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { cat } = await params;

  const allPosts: Post[] = getPostsFromCache().filter(
    (p) => p.category?.toLowerCase() === cat.toLowerCase()
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
