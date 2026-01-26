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
  let processedMarkdown = markdown;

  for (const url of mediaUrls) {
    const filename = generateFilename(url);
    const localPath = path.join(imagesDir, filename);
    const publicUrl = `${publicPath}/${filename}`;

    // Check if file already exists (avoid re-downloading)
    if (!fs.existsSync(localPath)) {
      console.log(`  Downloading: ${filename}`);
      const success = await downloadFile(url, localPath);
      if (!success) {
        console.error(`  Failed to download media for ${slug}: ${filename}`);
        continue; // Keep original URL if download fails
      }
    } else {
      console.log(`  Using cached: ${filename}`);
    }

    // For videos, replace markdown link with HTML video tag
    if (isVideoFile(filename)) {
      // Match [text](url) pattern and replace with <video> tag
      const linkPattern = new RegExp(`\\[([^\\]]+)\\]\\(${url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\)`, 'g');
      const videoTag = `<video controls width="100%" style="max-width: 800px; border-radius: 8px;">\n  <source src="${publicUrl}" type="video/mp4">\n  Your browser does not support the video tag.\n</video>`;
      processedMarkdown = processedMarkdown.replace(linkPattern, videoTag);
    } else {
      // For images, just replace the URL
      processedMarkdown = processedMarkdown.split(url).join(publicUrl);
    }
  }

  return processedMarkdown;
}

/**
 * Generic cache builder for recipes/guides
 */
export async function buildCache<T extends { content: string; title: string; slug: string }>(
  config: CacheConfig<T>
): Promise<void> {
  try {
    console.log(`Fetching ${config.contentType} from Notion...`);

    // Ensure images directory exists
    const imagesDir = path.join(process.cwd(), 'public', config.imagesSubdir, 'images');
    if (!fs.existsSync(imagesDir)) {
      fs.mkdirSync(imagesDir, { recursive: true });
      console.log(`Created directory: ${imagesDir}`);
    }

    const pages = await config.fetchPages();
    const allContent = [];

    for (const page of pages) {
      const content = await config.getContentFromNotion(page.id);
      if (content) {
        console.log(`Processing images for: ${content.title}`);
        // Download media and update markdown content
        content.content = await processMarkdownMedia(
          content.content,
          content.slug,
          imagesDir,
          `/${config.imagesSubdir}/images`
        );
        allContent.push(content);
      }
    }

    const cachePath = path.join(process.cwd(), config.cacheFileName);
    fs.writeFileSync(cachePath, JSON.stringify(allContent, null, 2));

    console.log(`Successfully cached ${allContent.length} ${config.contentType} with local images.`);
  } catch (error) {
    console.error(`Error caching ${config.contentType}:`, error);
    process.exit(1);
  }
}
