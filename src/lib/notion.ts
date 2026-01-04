import dotenv from 'dotenv';
import path from 'path';

if (!process.env.VERCEL && !process.env.NOTION_TOKEN) {
  dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
}

import { Client } from "@notionhq/client";
import { NotionToMarkdown } from "notion-to-md";
import { PageObjectResponse, GetDatabaseResponse } from "@notionhq/client/build/src/api-endpoints";
import fs from "fs";
import { Recipe } from "@/types/recipe";
import { Guide } from "@/types/guide";

// Extended database response type for data sources (not in official SDK types)
type DatabaseWithDataSources = GetDatabaseResponse & {
  data_sources?: Array<{ id: string }>;
};

// Notion property value types
interface NotionSelectOption {
  name: string;
}

interface NotionRichText {
  plain_text: string;
}

interface RecipePageProperties {
  Title: { title: NotionRichText[] };
  Alt: { rich_text: NotionRichText[] };
  "Featured Image"?: { url: string };
  "Published Date"?: { date?: { start: string } };
  "Last Updated"?: { date?: { start: string } };
  Tags?: { multi_select: NotionSelectOption[] };
  Categories?: { multi_select: NotionSelectOption[] };
  "Related Recipes"?: { relation: Array<{ id: string }> };
  "Recipe Cuisine"?: { select?: NotionSelectOption };
}

interface GuidePageProperties {
  Title: { title: NotionRichText[] };
  Alt: { rich_text: NotionRichText[] };
  "Featured Image"?: { url: string };
  "Published Date"?: { date?: { start: string } };
  "Last Updated"?: { date?: { start: string } };
  Categories?: { multi_select: NotionSelectOption[] };
  "Related Guides"?: { relation: Array<{ id: string }> };
  City?: { select?: NotionSelectOption };
  Country?: { select?: NotionSelectOption };
  "Map Embed URL"?: { url?: string };
}

export const notion = new Client({ auth: process.env.NOTION_TOKEN, notionVersion: '2025-09-03'});
export const n2m = new NotionToMarkdown({ notionClient: notion });

// Cache the data source IDs to avoid repeated lookups
let cachedDataSourceId: string | null = null;
let cachedGuidesDataSourceId: string | null = null;

async function getDataSourceId(): Promise<string> {
  if (cachedDataSourceId) {
    return cachedDataSourceId;
  }

  const database = await notion.databases.retrieve({
    database_id: process.env.NOTION_DATABASE_ID!,
  }) as DatabaseWithDataSources;

  // Extract data source ID from the database response
  const dataSources = database.data_sources;
  if (!dataSources || dataSources.length === 0) {
    throw new Error("No data sources found in database");
  }

  const dataSourceId: string = dataSources[0].id;
  cachedDataSourceId = dataSourceId;
  return dataSourceId;
}

async function getGuidesDataSourceId(): Promise<string> {
  if (cachedGuidesDataSourceId) {
    return cachedGuidesDataSourceId;
  }

  const database = await notion.databases.retrieve({
    database_id: process.env.NOTION_GUIDES_DATABASE_ID!,
  }) as DatabaseWithDataSources;

  // Extract data source ID from the database response
  const dataSources = database.data_sources;
  if (!dataSources || dataSources.length === 0) {
    throw new Error("No data sources found in guides database");
  }

  const dataSourceId: string = dataSources[0].id;
  cachedGuidesDataSourceId = dataSourceId;
  return dataSourceId;
}


export async function getDatabaseStructure() {
  const dataSourceId = await getDataSourceId();
  const dataSource = await notion.dataSources.retrieve({
    data_source_id: dataSourceId,
  });
  return dataSource;
}

export function getRecipesFromCache(): Recipe[] {
  const cachePath = path.join(process.cwd(), "recipes-cache.json");
  if (fs.existsSync(cachePath)) {
    try {
      const cache = fs.readFileSync(cachePath, "utf-8");
      return JSON.parse(cache);
    } catch (error) {
      console.error("Error reading recipes cache:", error);
      return [];
    }
  }
  return [];
}

export async function fetchPublishedPosts() {
  // This function is now intended to be used only by the caching script.
  const dataSourceId = await getDataSourceId();

  const recipes = await notion.dataSources.query({
    data_source_id: dataSourceId,
    filter: {
      and: [
        {
          property: "Status",
          status: {
            equals: "Published",
          },
        },
      ],
    },
    sorts: [
      {
        property: "Published Date",
        direction: "descending",
      },
    ],
  });

  return recipes.results as PageObjectResponse[];
}

export async function getRecipe(slug: string): Promise<Recipe | null> {
  const recipes = getRecipesFromCache();
  const recipe = recipes.find((r) => r.slug === slug);
  return recipe || null;
}

export async function getRecipeFromNotion(pageId: string): Promise<Recipe | null> {
  try {
    const page = (await notion.pages.retrieve({
      page_id: pageId,
    })) as PageObjectResponse;
    const mdBlocks = await n2m.pageToMarkdown(pageId);
    const { parent: contentString } = n2m.toMarkdownString(mdBlocks);

    // Get first paragraph for description (excluding empty lines)
    const paragraphs = contentString
      .split("\n")
      .filter((line: string) => line.trim().length > 0);
    const firstParagraph = paragraphs[0] || "";
    const description =
      firstParagraph.slice(0, 160) + (firstParagraph.length > 160 ? "..." : "");

    const properties = page.properties as unknown as RecipePageProperties;
    const publishedDate = properties["Published Date"]?.date?.start || new Date().toISOString();
    const slug = properties['Featured Image']?.url
      ?.toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "untitled";
    const recipe: Recipe = {
      id: page.id,
      title: properties.Title.title[0]?.plain_text || "Untitled",
      alt: properties.Alt.rich_text[0]?.plain_text || "",
      slug,
      coverImage: `/images/${slug}.jpg`,
      description,
      date: publishedDate,
      lastUpdated: properties["Last Updated"]?.date?.start || publishedDate,
      content: contentString,
      tags: properties.Tags?.multi_select?.map((tag) => tag.name) || [],
      categories: properties.Categories?.multi_select?.map((cat) => cat.name) || [],
      relatedRecipes: properties["Related Recipes"]?.relation?.map((r) => r.id) || [],
      recipeCuisine: properties["Recipe Cuisine"]?.select?.name || "",
    };

    return recipe;
  } catch (error) {
    console.error("Error getting recipe:", error);
    return null;
  }
}

// ===== GUIDE FUNCTIONS =====

export function getGuidesFromCache(): Guide[] {
  const cachePath = path.join(process.cwd(), "guides-cache.json");
  if (fs.existsSync(cachePath)) {
    try {
      const cache = fs.readFileSync(cachePath, "utf-8");
      return JSON.parse(cache);
    } catch (error) {
      console.error("Error reading guides cache:", error);
      return [];
    }
  }
  return [];
}

export async function fetchPublishedGuides() {
  // This function is intended to be used only by the caching script.
  const dataSourceId = await getGuidesDataSourceId();

  const guides = await notion.dataSources.query({
    data_source_id: dataSourceId,
    filter: {
      and: [
        {
          property: "Status",
          status: {
            equals: "Published",
          },
        },
      ],
    },
    sorts: [
      {
        property: "Published Date",
        direction: "descending",
      },
    ],
  });

  return guides.results as PageObjectResponse[];
}

export async function getGuide(slug: string): Promise<Guide | null> {
  const guides = getGuidesFromCache();
  const guide = guides.find((g) => g.slug === slug);
  return guide || null;
}

function calculateReadingTime(content: string): string {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return `${minutes} min read`;
}

export async function getGuideFromNotion(pageId: string): Promise<Guide | null> {
  try {
    const page = (await notion.pages.retrieve({
      page_id: pageId,
    })) as PageObjectResponse;
    const mdBlocks = await n2m.pageToMarkdown(pageId);
    const { parent: contentString } = n2m.toMarkdownString(mdBlocks);

    // Get first real paragraph for description (skip headings and empty lines)
    const paragraphs = contentString
      .split("\n")
      .filter((line: string) => line.trim().length > 0 && !line.trim().startsWith("#"));
    const firstParagraph = paragraphs[0] || "";
    // Strip markdown syntax (bold, italic, links, etc.)
    const cleanParagraph = firstParagraph
      .replace(/\*\*([^*]+)\*\*/g, "$1") // bold
      .replace(/\*([^*]+)\*/g, "$1") // italic
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // links
      .replace(/`([^`]+)`/g, "$1") // inline code
      .trim();
    const description =
      cleanParagraph.slice(0, 160) + (cleanParagraph.length > 160 ? "..." : "");

    const properties = page.properties as unknown as GuidePageProperties;
    const publishedDate = properties["Published Date"]?.date?.start || new Date().toISOString();
    const slug = properties['Featured Image']?.url
      ?.toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "untitled";
    const guide: Guide = {
      id: page.id,
      title: properties.Title.title[0]?.plain_text || "Untitled",
      alt: properties.Alt.rich_text[0]?.plain_text || "",
      slug,
      coverImage: `/images/${slug}.jpg`,
      description,
      date: publishedDate,
      lastUpdated: properties["Last Updated"]?.date?.start || publishedDate,
      content: contentString,
      categories: properties.Categories?.multi_select?.map((cat) => cat.name) || [],
      relatedGuides: properties["Related Guides"]?.relation?.map((r) => r.id) || [],
      city: properties.City?.select?.name || undefined,
      country: properties.Country?.select?.name || undefined,
      readingTime: calculateReadingTime(contentString),
      mapEmbedUrl: properties["Map Embed URL"]?.url || undefined,
    };

    return guide;
  } catch (error) {
    console.error("Error getting guide:", error);
    return null;
  }
}
