import dotenv from 'dotenv';
import path from 'path';

if (!process.env.VERCEL && !process.env.NOTION_TOKEN) {
  dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
}

import { Client } from "@notionhq/client";
import { NotionToMarkdown } from "notion-to-md";
import { PageObjectResponse } from "@notionhq/client/";
import fs from "fs";

export const notion = new Client({ auth: process.env.NOTION_TOKEN, notionVersion: '2022-06-28'});
export const n2m = new NotionToMarkdown({ notionClient: notion });

export interface Post {
  id: string;
  title: string;
  alt: string;
  slug: string;
  coverImage: string;
  description: string;
  date: string;
  content: string;
  author?: string;
  tags?: string[];
  category: string;
  relatedRecipes: string[];
  categories: string[];
}

export async function getDatabaseStructure() {
  const database = await notion.databases.retrieve({
    database_id: process.env.NOTION_DATABASE_ID!,
  });
  return database;
}

export function getPostsFromCache(): Post[] {
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

export function getPostsByCategory(category: string) {
  const posts = getPostsFromCache();
  return posts.filter((p) => p.category?.toLowerCase() === category.toLowerCase());
}

export async function fetchPublishedPosts() {
  // This function is now intended to be used only by the caching script.
  // @ts-ignore - bypass TypeScript error with v4 SDK types
  const recipes = await notion.databases.query({
    database_id: process.env.NOTION_DATABASE_ID!,
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

export async function getPost(slug: string): Promise<Post | null> {
  const recipes = getPostsFromCache();
  const post = recipes.find((p) => p.slug === slug);
  return post || null;
}

export async function getPostFromNotion(pageId: string): Promise<Post | null> {
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

    const properties = page.properties as any;
    const post: Post = {
      id: page.id,
      title: properties.Title.title[0]?.plain_text || "Untitled",
      alt: properties.Alt.rich_text[0]?.plain_text || "",
      slug:
        properties['Featured Image']?.url
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-") // Replace any non-alphanumeric chars with dash
          .replace(/^-+|-+$/g, "") || // Remove leading/trailing dashes
        "untitled",
      coverImage: `/images/${properties['Featured Image']?.url}.jpg`,
      description,
      date:
        properties["Published Date"]?.date?.start || new Date().toISOString(),
      content: contentString,
      author: properties.Author?.people[0]?.name,
      tags: properties.Tags?.multi_select?.map((tag: any) => tag.name) || [],
      category: properties.Category?.select?.name,
      categories: properties.Categories?.multi_select?.map((cat: any) => cat.name) || [],
      relatedRecipes: properties["Related Recipes"]?.relation?.map((r: { id: any; }) => r.id) || [],
    };

    return post;
  } catch (error) {
    console.error("Error getting post:", error);
    return null;
  }
}
