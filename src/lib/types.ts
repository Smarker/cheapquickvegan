// src/lib/types.ts
export interface Post {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  coverImage?: string;
  alt: string;
  content: string;
  tags?: string[];
  author?: string;
  date: string;
  categories: string[];
  relatedRecipes: string[]; // note: relation IDs
}
