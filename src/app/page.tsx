import { getPostsFromCache, Post } from "@/lib/notion";
import PostCard from "@/components/post-card";

import Image from "next/image";

export default function Home() {
  const posts = getPostsFromCache();

  return (
    <div className="max-w-6xl mx-auto px-4">
      <div className="flex flex-col md:flex-row items-center mb-12 gap-6">
        {/* Photo on the left */}
        <div className="relative w-40 h-40 flex-shrink-0 rounded-full overflow-hidden 
                        shadow-2xl ring-2 ring-[#fefae0]">
          <Image
            src="/images/stephanie.jpg"
            alt="Stephanie"
            fill
            className="rounded-full object-cover"
          />
        </div>

        {/* Text on the right */}
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl mb-4">
            Welcome to CheapQuickVegan
          </h1>
          <p className="text-lg text-muted-foreground">
            I'm Stephanie, a rock-climbing foodie who turns simple ingredients into amazing vegan meals. Cheap Quick Vegan serves quick, flavorful recipes—no fluff, just meals that actually work.
          </p>
        </div>
      </div>

      {/* Posts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}
