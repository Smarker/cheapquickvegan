export interface RecipeContent {
  ingredients: string[];
  instructions: string[];
  prepTime?: string;
  cookTime?: string;
  totalTime?: string;
  recipeYield?: string;
}

export function parseRecipeContent(markdown: string): RecipeContent {
  const lines = markdown.split("\n").map((l) => l.trim());
  let section: "ingredients" | "instructions" | "details" | null = null;
  const ingredients: string[] = [];
  const instructions: string[] = [];
  let prepTime: string | undefined;
  let cookTime: string | undefined;
  let totalTime: string | undefined;
  let recipeYield: string | undefined;

  for (const line of lines) {
    if (/^##\s*Recipe Details/i.test(line)) {
      section = "details";
    }
    else if (/^##\s*Ingredients/i.test(line)) section = "ingredients";
    else if (/^##\s*Instructions/i.test(line)) section = "instructions";
    else if (/^##\s*/.test(line)) section = null;
    else if (section === "ingredients" && line) ingredients.push(line);
    else if (section === "instructions" && line) instructions.push(line);
    else if (section === "details" && line) {
      const prepMatch = line.match(/\*\*?Prep Time:\*\*?\s*(.*)/i);
      const cookMatch  = line.match(/\*\*?Cook Time:\*\*?\s*(.*)/i);
      const totalMatch = line.match(/\*\*?Total Time:\*\*?\s*(.*)/i);
      const yieldMatch = line.match(/\*\*?Yield:\*\*?\s*(.*)/i);

      if (prepMatch) prepTime = convertToISO8601(prepMatch[1]);
      if (cookMatch) cookTime = convertToISO8601(cookMatch[1]);
      if (totalMatch) totalTime = convertToISO8601(totalMatch[1]);
      if (yieldMatch) recipeYield = yieldMatch[1];
    }
  }

  if (!totalTime && prepTime && cookTime) totalTime = sumDurations(prepTime, cookTime);

  return { ingredients, instructions, prepTime, cookTime, totalTime, recipeYield };
}

export function convertToISO8601(timeStr: string): string {
  const hrMatch = timeStr.match(/(\d+)\s*hr/);
  const minMatch = timeStr.match(/(\d+)\s*min/);
  const hours = hrMatch ? parseInt(hrMatch[1], 10) : 0;
  const minutes = minMatch ? parseInt(minMatch[1], 10) : 0;
  return `PT${hours > 0 ? hours + "H" : ""}${minutes > 0 ? minutes + "M" : ""}`;
}

export function sumDurations(prep: string, cook: string): string {
  const prepMatch = prep.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  const cookMatch = cook.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  const prepH = prepMatch?.[1] ? parseInt(prepMatch[1], 10) : 0;
  const prepM = prepMatch?.[2] ? parseInt(prepMatch[2], 10) : 0;
  const cookH = cookMatch?.[1] ? parseInt(cookMatch[1], 10) : 0;
  const cookM = cookMatch?.[2] ? parseInt(cookMatch[2], 10) : 0;
  const totalMinutes = prepM + cookM;
  const totalHours = prepH + cookH + Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;
  return `PT${totalHours > 0 ? totalHours + "H" : ""}${remainingMinutes > 0 ? remainingMinutes + "M" : ""}`;
}
