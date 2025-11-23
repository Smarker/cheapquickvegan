import HomeClient from "@/components/home-client";
import { getPostsFromCache, Post } from "@/lib/notion";

export default function HomePage() {
  // fetch recipes server-side (Node APIs safe here)
  const recipes: Post[] = getPostsFromCache();

  return <HomeClient recipes={recipes} />;
}
