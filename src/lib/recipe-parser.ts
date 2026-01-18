import { RecipeInstruction } from "@/types/recipe";

export interface RecipeContent {
  ingredients: string[];
  instructions: RecipeInstruction[];
  prepTime?: string;
  cookTime?: string;
  totalTime?: string;
  recipeYield?: string;
}

/**
 * Auto-generate step name from instruction text
 * Extracts first 3-5 words (max 50 chars) and capitalizes first word
 */
export function generateStepName(text: string): string {
  // Remove markdown and list markers
  const cleanText = text.replace(/^[-*]\s*/, "").trim();

  // Split into words and take first few
  const words = cleanText.split(/\s+/);
  let name = "";

  for (let i = 0; i < Math.min(words.length, 5); i++) {
    const testName = name + (name ? " " : "") + words[i];
    if (testName.length > 50) break;
    name = testName;
  }

  // Capitalize first letter
  if (name) {
    name = name.charAt(0).toUpperCase() + name.slice(1);
  }

  return name || "Recipe Step";
}

/**
 * Extract manual step name if present in format: **Step Name:** instruction text
 * Returns { name: string, cleanText: string } or null if not found
 */
export function extractManualStepName(text: string): { name: string; cleanText: string } | null {
  const match = text.match(/^\*\*([^*]+):\*\*\s*(.+)/);
  if (match) {
    return {
      name: match[1].trim(),
      cleanText: match[2].trim(),
    };
  }
  return null;
}

/**
 * Extract step image from markdown syntax or Instagram URLs
 * Supports:
 * - Markdown images: ![alt](url)
 * - Instagram URLs: https://instagram.com/p/...
 * - Notion images: relative paths like /images/step.jpg
 */
export function extractStepImage(text: string): string | undefined {
  // Check for markdown image syntax
  const markdownImageMatch = text.match(/!\[([^\]]*)\]\(([^)]+)\)/);
  if (markdownImageMatch) {
    return markdownImageMatch[2];
  }

  // Check for Instagram URLs
  const instagramMatch = text.match(/(https?:\/\/(?:www\.)?instagram\.com\/p\/[a-zA-Z0-9_-]+)/);
  if (instagramMatch) {
    return instagramMatch[1];
  }

  return undefined;
}

export function parseRecipeContent(markdown: string): RecipeContent {
  const lines = markdown.split("\n").map((l) => l.trim());
  let section: "ingredients" | "instructions" | "details" | null = null;
  const ingredients: string[] = [];
  const instructionLines: string[] = [];
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
    else if (section === "instructions" && line) instructionLines.push(line);
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

  // Convert instruction lines to RecipeInstruction objects
  const instructions: RecipeInstruction[] = instructionLines.map((line, index) => {
    // Remove list markers
    const cleanedText = line.replace(/^[-*]\s*/, "").trim();

    // Check for manual step name
    const manualName = extractManualStepName(cleanedText);
    let stepName: string;
    let stepText: string;

    if (manualName) {
      stepName = manualName.name;
      stepText = manualName.cleanText;
    } else {
      stepName = generateStepName(cleanedText);
      stepText = cleanedText;
    }

    // Extract image if present
    const image = extractStepImage(stepText);

    return {
      text: stepText,
      name: stepName,
      url: `#step-${index + 1}`,
      image,
    };
  });

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
