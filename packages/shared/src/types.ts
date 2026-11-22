export interface RecipeInstruction {
  text: string;
  name: string;        // Auto-generated or manual
  url: string;         // Fragment identifier (#step-1)
  image?: string;      // Optional step image
}

/** A list under an optional subheading, e.g. "### Build the curry base". */
export interface RecipeGroup {
  name: string | null;
  items: string[];
}

export interface RecipeSections {
  ingredients: RecipeGroup[];
  steps: RecipeGroup[];
  tips: string[];
}
