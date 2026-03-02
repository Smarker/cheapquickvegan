/**
 * Shared caching utilities for recipes and guides
 * Handles downloading images/videos from Notion and updating markdown content
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import { URL } from 'url';

interface CacheConfig<T> {
  contentType: string; // 'recipes' or 'guides'
  imagesSubdir: string; // subdirectory under public/
  cacheFileName: string; // e.g., 'recipes-cache.json'
  fetchPages: () => Promise<any[]>;
  getContentFromNotion: (pageId: string) => Promise<T | null>;
}

// Generate a filename from URL - clean special characters
function generateFilename(url: string): string {
  const urlObj = new URL(url);
  const pathname = urlObj.pathname;
  const originalFilename = path.basename(pathname);

  // Get extension from original filename
  const ext = path.extname(originalFilename) || '.jpg';

  // Clean the original filename (without extension) for readability
  const baseName = path.basename(originalFilename, ext)
    .replace(/[^a-zA-Z0-9-_]/g, '-')
    .replace(/-+/g, '-') // Replace multiple dashes with single dash
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing dashes

  return `${baseName}${ext}`;
}

// Download a file from URL to local file
async function downloadFile(url: string, filepath: string): Promise<boolean> {
  return new Promise((resolve) => {
    const protocol = url.startsWith('https') ? https : http;

    const request = protocol.get(url, (response) => {
      // Handle redirects
      if (response.statusCode === 301 || response.statusCode === 302) {
        const redirectUrl = response.headers.location;
        if (redirectUrl) {
          downloadFile(redirectUrl, filepath).then(resolve);
          return;
        }
      }

      if (response.statusCode !== 200) {
        console.error(`Failed to download ${url}: HTTP ${response.statusCode}`);
        resolve(false);
        return;
      }

      const fileStream = fs.createWriteStream(filepath);
      response.pipe(fileStream);

      fileStream.on('finish', () => {
        fileStream.close();
        resolve(true);
      });

      fileStream.on('error', (err) => {
        fs.unlink(filepath, () => {}); // Delete partial file
        console.error(`Error writing file ${filepath}:`, err);
        resolve(false);
      });
    });

    request.on('error', (err) => {
      console.error(`Error downloading ${url}:`, err);
      resolve(false);
    });

    request.setTimeout(30000, () => {
      request.destroy();
      console.error(`Timeout downloading ${url}`);
      resolve(false);
    });
  });
}

// Extract all image and video URLs from markdown content
function extractMediaUrls(markdown: string): string[] {
  // Match both ![alt](url) for images and [text](url) for videos/media
  const mediaRegex = /!?\[[^\]]*\]\(([^)]+)\)/g;
  const urls: string[] = [];
  let match;

  while ((match = mediaRegex.exec(markdown)) !== null) {
    const url = match[1];
    // Only process Notion/S3 URLs that will expire
    if (url.includes('prod-files-secure.s3') || url.includes('notion.so')) {
      urls.push(url);
    }
  }

  return urls;
}

// Retry a function up to `retries` times on transient errors, with exponential backoff
async function withRetry<T>(
  fn: () => Promise<T>,
  retries = 3,
  baseDelayMs = 1500
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      lastError = err;
      const isTransient =
        err?.status === 502 || err?.status === 503 || err?.status === 429 ||
        err?.code === 'ETIMEDOUT' || err?.message?.includes('timeout') ||
        err?.message?.includes('Request timeout');
      if (attempt < retries && isTransient) {
        const delay = baseDelayMs * 2 ** (attempt - 1);
        console.warn(`  [retry ${attempt}/${retries}] ${err?.status ?? err?.message} — waiting ${delay}ms`);
        await new Promise((r) => setTimeout(r, delay));
      } else {
        throw err;
      }
    }
  }
  throw lastError;
}

// Run async tasks with a max concurrency limit
async function withConcurrency<T>(
  tasks: (() => Promise<T>)[],
  limit: number
): Promise<T[]> {
  const results: T[] = new Array(tasks.length);
  let index = 0;

  async function worker() {
    while (index < tasks.length) {
      const current = index++;
      results[current] = await tasks[current]();
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, tasks.length) }, () => worker()));
  return results;
}

// Check if file is a video by extension
function isVideoFile(filename: string): boolean {
  const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov'];
  const ext = path.extname(filename).toLowerCase();
  return videoExtensions.includes(ext);
}

// Process markdown content: download media and replace URLs
async function processMarkdownMedia(
  markdown: string,
  slug: string,
  imagesDir: string,
  publicPath: string
): Promise<string> {
  const mediaUrls = extractMediaUrls(markdown);
  if (mediaUrls.length === 0) return markdown;

  type DownloadResult = { url: string; filename: string; publicUrl: string | null };

  const tasks = mediaUrls.map((url) => async (): Promise<DownloadResult> => {
    const filename = generateFilename(url);
    const localPath = path.join(imagesDir, filename);
    const publicUrl = `${publicPath}/${filename}`;

    if (!fs.existsSync(localPath)) {
      console.log(`  Downloading: ${filename}`);
      const success = await downloadFile(url, localPath);
      if (!success) {
        console.error(`  Failed to download media for ${slug}: ${filename}`);
        return { url, filename, publicUrl: null };
      }
    } else {
      console.log(`  Using cached: ${filename}`);
    }

    return { url, filename, publicUrl };
  });

  // Download up to 6 images concurrently - S3 has no meaningful rate limit at this scale
  const results = await withConcurrency(tasks, 6);

  let processedMarkdown = markdown;
  for (const { url, filename, publicUrl } of results) {
    if (!publicUrl) continue; // keep original URL if download failed

    if (isVideoFile(filename)) {
      const linkPattern = new RegExp(`\\[([^\\]]+)\\]\\(${url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\)`, 'g');
      const videoTag = `<video controls width="100%" style="max-width: 800px; border-radius: 8px;">\n  <source src="${publicUrl}" type="video/mp4">\n  Your browser does not support the video tag.\n</video>`;
      processedMarkdown = processedMarkdown.replace(linkPattern, videoTag);
    } else {
      processedMarkdown = processedMarkdown.split(url).join(publicUrl);
    }
  }

  return processedMarkdown;
}

/**
 * Generic cache builder for recipes/guides
 * Pass --slug <value> to refresh only the entry matching that slug.
 */
export async function buildCache<T extends { content: string; title: string; slug: string; id: string }>(
  config: CacheConfig<T>
): Promise<void> {
  const slugArg = process.argv.find((a) => a.startsWith('--slug='))?.replace('--slug=', '')
    ?? (process.argv.includes('--slug') ? process.argv[process.argv.indexOf('--slug') + 1] : undefined);

  try {
    console.log(`Fetching ${config.contentType} from Notion...`);

    // Ensure images directory exists
    const imagesDir = path.join(process.cwd(), 'public', config.imagesSubdir, 'images');
    if (!fs.existsSync(imagesDir)) {
      fs.mkdirSync(imagesDir, { recursive: true });
      console.log(`Created directory: ${imagesDir}`);
    }

    // Load existing cache so we can fall back to stale entries on transient Notion errors
    const cachePath = path.join(process.cwd(), config.cacheFileName);
    const existingCache: T[] = fs.existsSync(cachePath)
      ? JSON.parse(fs.readFileSync(cachePath, 'utf-8'))
      : [];
    const existingById = new Map(existingCache.map((c) => [c.id, c]));

    const allPages = await config.fetchPages();

    let pages = allPages;
    if (slugArg) {
      const cachedEntry = existingCache.find((c) => c.slug === slugArg);
      if (!cachedEntry) {
        console.error(
          `No cached ${config.contentType} found with slug "${slugArg}". ` +
          `Run without --slug to do a full cache refresh first.`
        );
        process.exit(1);
      }
      pages = allPages.filter((p) => p.id === cachedEntry.id);
      if (pages.length === 0) {
        console.error(`Page "${slugArg}" not found in Notion (may have been deleted or unpublished).`);
        process.exit(1);
      }
      console.log(`Refreshing single entry: ${slugArg}`);
    }

    let skipped = 0;

    // Process pages 3 at a time - Notion API allows ~3 req/s average
    const pageResults = await withConcurrency(
      pages.map((page) => async () => {
        let content: T | null = null;
        try {
          content = await withRetry(() => config.getContentFromNotion(page.id));
        } catch (err: any) {
          console.error(`  [error] page ${page.id}: ${err?.status ?? err?.message}`);
        }

        if (!content) {
          // Fall back to stale cache entry so the recipe isn't dropped
          const stale = existingById.get(page.id) ?? null;
          if (stale) {
            console.warn(`  [stale] using cached entry for page ${page.id}`);
            skipped++;
          }
          return stale;
        }

        console.log(`Processing images for: ${content.title}`);
        content.content = await processMarkdownMedia(
          content.content,
          content.slug,
          imagesDir,
          `/${config.imagesSubdir}/images`
        );
        return content;
      }),
      3
    );

    const freshContent = pageResults.filter((c): c is T => c !== null);

    // When refreshing a single slug, merge with the rest of the existing cache
    let allContent: T[];
    if (slugArg) {
      const freshById = new Map(freshContent.map((c) => [c.id, c]));
      allContent = existingCache.map((c) => freshById.get(c.id) ?? c);
      // If the slug wasn't in the existing cache (new entry), append it
      for (const entry of freshContent) {
        if (!existingCache.some((c) => c.id === entry.id)) {
          allContent.push(entry);
        }
      }
    } else {
      allContent = freshContent;
    }

    fs.writeFileSync(cachePath, JSON.stringify(allContent, null, 2));

    const fresh = freshContent.length - skipped;
    console.log(
      `Successfully cached ${allContent.length} ${config.contentType} with local images` +
      (skipped > 0 ? ` (${fresh} fresh, ${skipped} kept from previous cache due to errors)` : '') +
      '.'
    );
  } catch (error) {
    console.error(`Error caching ${config.contentType}:`, error);
    process.exit(1);
  }
}
