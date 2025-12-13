// src/lib/types.ts
export interface Post {
  id: string;
  title: string;
  slug: string;
  description: string;
  coverImage?: string;
  alt: string;
  content: string;
  tags?: string[];
  date: string;
  categories: string[];
  relatedRecipes: string[]; // note: relation IDs
  recipeCuisine: string;
}
