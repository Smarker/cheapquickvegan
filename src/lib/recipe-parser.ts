import { RecipeInstruction } from "@/types/recipe";

export interface RecipeContent {
  ingredients: string[];
  instructions: RecipeInstruction[];
  prepTime?: string;
  cookTime?: string;
  chillTime?: string;
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
  let chillTime: string | undefined;
  let totalTime: string | undefined;
  let recipeYield: string | undefined;

  for (const line of lines) {
    if (/^##\s*Recipe Details/i.test(line)) {
      section = "details";
    }
    else if (/^##\s*Ingredients/i.test(line)) section = "ingredients";
    else if (/^##\s*Instructions/i.test(line)) section = "instructions";
    else if (/^##[^#]/.test(line)) section = null;
    else if (section === "ingredients" && line && /^[-*]\s/.test(line)) ingredients.push(line);
    else if (section === "instructions" && line) instructionLines.push(line);
    else if (section === "details" && line) {
      const prepMatch = line.match(/\*\*?Prep Time:\*\*?\s*(.*)/i);
      const cookMatch  = line.match(/\*\*?Cook Time:\*\*?\s*(.*)/i);
      const chillMatch = line.match(/\*\*?Chill Time:\*\*?\s*(.*)/i);
      const totalMatch = line.match(/\*\*?Total Time:\*\*?\s*(.*)/i);
      const yieldMatch = line.match(/\*\*?Yield:\*\*?\s*(.*)/i);

      if (prepMatch) prepTime = convertToISO8601(prepMatch[1]);
      if (cookMatch) cookTime = convertToISO8601(cookMatch[1]);
      if (chillMatch) chillTime = convertToISO8601(chillMatch[1]);
      if (totalMatch) totalTime = convertToISO8601(totalMatch[1]);
      if (yieldMatch) recipeYield = yieldMatch[1];
    }
  }

  // Calculate total time if not provided
  if (!totalTime) {
    const times = [prepTime, cookTime, chillTime].filter(Boolean) as string[];
    if (times.length > 0) {
      totalTime = times.reduce((acc, time) => sumDurations(acc, time));
    }
  }

  // Parse instructions - support both old bullet format and new labeled/H3 format
  const instructions: RecipeInstruction[] = parseInstructions(instructionLines);

  return { ingredients, instructions, prepTime, cookTime, chillTime, totalTime, recipeYield };
}

/**
 * Parse instruction lines into RecipeInstruction objects
 * Supports multiple formats for backwards compatibility and SEO:
 * 1. H3 headers: ### Step Name (followed by text on next line)
 * 2. Bold block labels: **Step Name** (followed by text on next line)
 * 3. Inline bold labels: **Step Name:** text (on same line)
 * 4. Bullet points: - Step text (auto-generates name)
 */
function parseInstructions(lines: string[]): RecipeInstruction[] {
  const instructions: RecipeInstruction[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Format 1: H3 step header (### Step Name)
    const h3Match = line.match(/^###\s+(.+)/);
    if (h3Match) {
      const stepName = h3Match[1].trim();
      let stepText = "";
      i++;
      // Collect following lines until next header or bullet
      while (i < lines.length) {
        const nextLine = lines[i];
        if (/^###\s+/.test(nextLine) || /^\*\*[^*]+\*\*\s*$/.test(nextLine) || /^[-*]\s+/.test(nextLine)) {
          break;
        }
        stepText += (stepText ? " " : "") + nextLine;
        i++;
      }

      if (stepText.trim()) {
        const image = extractStepImage(stepText);
        instructions.push({
          text: stepText.trim(),
          name: stepName,
          url: `#step-${instructions.length + 1}`,
          image,
        });
      }
      continue;
    }

    // Format 2: Bold block header (**Step Name** on its own line)
    const boldHeaderMatch = line.match(/^\*\*([^*:]+)\*\*\s*$/);
    if (boldHeaderMatch) {
      const stepName = boldHeaderMatch[1].trim();
      let stepText = "";
      i++;
      // Collect following lines until next header or bullet
      while (i < lines.length) {
        const nextLine = lines[i];
        if (/^###\s+/.test(nextLine) || /^\*\*[^*]+\*\*\s*$/.test(nextLine) || /^[-*]\s+/.test(nextLine)) {
          break;
        }
        stepText += (stepText ? " " : "") + nextLine;
        i++;
      }

      if (stepText.trim()) {
        const image = extractStepImage(stepText);
        instructions.push({
          text: stepText.trim(),
          name: stepName,
          url: `#step-${instructions.length + 1}`,
          image,
        });
      }
      continue;
    }

    // Format 3 & 4: Inline label or bullet point
    const cleanedText = line.replace(/^[-*]\s*/, "").trim();

    // Check for inline manual step name (**Name:** text)
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

    const image = extractStepImage(stepText);
    instructions.push({
      text: stepText,
      name: stepName,
      url: `#step-${instructions.length + 1}`,
      image,
    });

    i++;
  }

  return instructions;
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
