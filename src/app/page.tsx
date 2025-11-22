import HomeClient from "@/components/home-client";
import { getPostsFromCache, Post } from "@/lib/notion";

export default function HomePage() {
  // fetch posts server-side (Node APIs safe here)
  const posts: Post[] = getPostsFromCache();

  return <HomeClient posts={posts} />;
}
