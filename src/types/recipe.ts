export interface Recipe {
  id: string;
  title: string;
  slug: string;
  description: string;
  coverImage: string;
  alt: string;
  content: string;
  tags?: string[];
  ingredients?: string[];
  date: string;
  lastUpdated: string;
  categories: string[];
  relatedRecipes: string[];
  recipeCuisine: string;
}

export interface RecipeInstruction {
  text: string;
  name: string;        // Auto-generated or manual
  url: string;         // Fragment identifier (#step-1)
  image?: string;      // Optional step image
}
