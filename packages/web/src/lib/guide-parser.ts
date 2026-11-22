import { ContentSection } from "@/types/content";

// Re-export for backwards compatibility
export type GuideSection = ContentSection;

export interface GuideContent {
  sections: ContentSection[];
}

/**
 * Parse guide content to extract sections for table of contents
 */
export function parseGuideContent(markdown: string): GuideContent {
  const lines = markdown.split("\n");
  const sections: GuideSection[] = [];

  for (const line of lines) {
    // Match H2 and H3 headings (## or ###)
    const h2Match = line.match(/^##\s+(.+)/);
    const h3Match = line.match(/^###\s+(.+)/);

    if (h2Match) {
      const title = h2Match[1].trim();
      const id = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      sections.push({ id, title, level: 2 });
    } else if (h3Match) {
      const title = h3Match[1].trim();
      const id = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      sections.push({ id, title, level: 3 });
    }
  }

  return { sections };
}

/**
 * Calculate reading time based on word count
 * Average reading speed: 200 words per minute
 */
export function calculateReadingTime(content: string): string {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return `${minutes} min read`;
}

/**
 * Extract Instagram post URLs from markdown content
 */
export function extractInstagramEmbeds(content: string): string[] {
  const instagramRegex = /https?:\/\/(?:www\.)?instagram\.com\/(?:p|reel)\/([A-Za-z0-9_-]+)/g;
  const matches = content.matchAll(instagramRegex);
  const urls: string[] = [];

  for (const match of matches) {
    urls.push(match[0]);
  }

  return urls;
}

/**
 * Generate table of contents from guide content
 */
export function generateTOC(markdown: string): ContentSection[] {
  const { sections } = parseGuideContent(markdown);
  return sections;
}

// ─── Roundup content parsing ───────────────────────────────────────────────

export type RoundupContentPart =
  | { type: "content"; text: string }
  | { type: "recipes"; source: "method"; tag: string }       // [recipes:method:Air Fryer]
  | { type: "recipes"; source: "ingredient"; slug: string }  // [recipes:ingredient:tofu]
  | { type: "recipes"; source: "theme"; tag: string };       // [recipes:theme:protein]

/**
 * Split content on [recipes:TYPE:VALUE] placeholders.
 * Supported types: method, ingredient, theme.
 * Unrecognised types or old-format [recipes:TagName] (no type prefix) are omitted.
 */
export function parseRoundupContent(content: string): RoundupContentPart[] {
  const placeholderRegex = /\[recipes:([^\]]+)\]/g;
  const parts: RoundupContentPart[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = placeholderRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: "content", text: content.slice(lastIndex, match.index) });
    }

    const inner = match[1].trim();
    const colonIdx = inner.indexOf(":");
    if (colonIdx !== -1) {
      const sourceType = inner.slice(0, colonIdx).trim();
      const value = inner.slice(colonIdx + 1).trim();
      if (sourceType === "method") {
        parts.push({ type: "recipes", source: "method", tag: value });
      } else if (sourceType === "ingredient") {
        parts.push({ type: "recipes", source: "ingredient", slug: value });
      } else if (sourceType === "theme") {
        parts.push({ type: "recipes", source: "theme", tag: value });
      }
      // Unrecognised type: omit
    }
    // Old format without type prefix: omit

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    parts.push({ type: "content", text: content.slice(lastIndex) });
  }

  return parts;
}

// ─── Listicle content parsing ──────────────────────────────────────────────

export type ListicleContentPart =
  | { type: "content"; text: string }
  | { type: "listicle"; name: string; emoji: string; tagline: string; image: string; recipeTag: string };

export interface ClosingSection {
  eyebrow: string;
  heading: string;
  body: string;
}

export function extractClosingSection(content: string): { content: string; closing: ClosingSection | null } {
  const match = content.match(/\[closing:([^\]]+)\]/);
  if (!match) return { content, closing: null };
  const [rawEyebrow = "", rawHeading = "", rawBody = ""] = match[1].split("|").map((s) => s.trim());
  return {
    content: content.replace(match[0], ""),
    closing: { eyebrow: rawEyebrow, heading: rawHeading, body: rawBody },
  };
}

export function parseListicleContent(content: string): ListicleContentPart[] {
  const placeholderRegex = /\[listicle:([^\]]+)\]/g;
  const parts: ListicleContentPart[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = placeholderRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: "content", text: content.slice(lastIndex, match.index) });
    }
    const [rawName, rawEmoji = "🌱", rawTagline = "", rawImage = "", rawTag = ""] = match[1]
      .split("|")
      .map((s) => s.trim());
    parts.push({
      type: "listicle",
      name: rawName,
      emoji: rawEmoji,
      tagline: rawTagline,
      image: rawImage,
      recipeTag: rawTag || rawName,
    });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    parts.push({ type: "content", text: content.slice(lastIndex) });
  }

  return parts;
}
