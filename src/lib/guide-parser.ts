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
