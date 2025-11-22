"use client";

import { useState } from "react";
import PostCard from "./post-card";
import Image from "next/image";
import { Post } from "@/lib/types";

interface HomeClientProps {
  posts: Post[];
}

export default function HomeClient({ posts }: HomeClientProps) {
  // get unique categories
  const categories = Array.from(
    new Set(posts.map((p) => p.category).filter((c): c is string => !!c))
  );

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // filter posts by selected category
  const filteredPosts = selectedCategory
    ? posts.filter((p) => p.category === selectedCategory)
    : posts;

  return (
    <div className="max-w-6xl mx-auto px-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center mb-12 gap-6">
        <div className="relative w-40 h-40 flex-shrink-0 rounded-full overflow-hidden shadow-2xl ring-2 ring-[#fefae0]">
          <Image
            src="/images/stephanie.jpg"
            alt="Stephanie"
            fill
            className="rounded-full object-cover"
          />
        </div>
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl mb-4">
            Welcome to CheapQuickVegan
          </h1>
          <p className="text-lg text-muted-foreground">
            I'm Stephanie, a rock-climbing foodie who turns simple ingredients into
            amazing vegan meals to fuel an active lifestyle. Here, you can find
            quick, flavorful, no-fluff plant-based recipes. Each recipe comes with
            tips & substitutions to make it easy and tasty.
          </p>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-3 py-1 rounded ${
            !selectedCategory
              ? "bg-foreground text-background"
              : "bg-gray-200 dark:bg-gray-700 text-foreground"
          }`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1 rounded ${
              selectedCategory === cat
                ? "bg-foreground text-background"
                : "bg-gray-200 dark:bg-gray-700 text-foreground"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Posts Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredPosts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}
