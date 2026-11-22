export interface Recipe {
  id: string;
  title: string;
  slug: string;
  description: string;
  coverImage: string;
  alt: string;
  content: string;
  tags?: string[];
  date: string;
  lastUpdated: string;
  categories: string[];
  relatedRecipes: string[];
  recipeCuisine: string;
  status?: string;
  /** Short card title for the app, from Notion "Short Title". */
  shortTitle?: string;
  /** Easy / Medium / Challenge, from Notion "Difficulty". */
  difficulty?: string;
}

export type { RecipeInstruction } from "@cheapquickvegan/shared";
