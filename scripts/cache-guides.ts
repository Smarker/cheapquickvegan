import { fetchPublishedGuides, getGuideFromNotion } from '../src/lib/notion';
import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import { URL } from 'url';
import crypto from 'crypto';

const IMAGES_DIR = path.join(process.cwd(), 'public', 'guides', 'images');

// Ensure the images directory exists
function ensureImagesDir() {
  if (!fs.existsSync(IMAGES_DIR)) {
    fs.mkdirSync(IMAGES_DIR, { recursive: true });
    console.log(`Created directory: ${IMAGES_DIR}`);
  }
}

// Generate a filename from URL - use hash to avoid issues with special characters
function generateFilename(url: string): string {
  // Extract the original filename from the URL path
  const urlObj = new URL(url);
  const pathname = urlObj.pathname;
  const originalFilename = path.basename(pathname);

  // Get extension from original filename
  const ext = path.extname(originalFilename) || '.jpg';

  // Create a short hash of just the path (not query params) to ensure uniqueness
  // This prevents duplicate downloads when Notion's signed URL params change
  const hash = crypto.createHash('md5').update(urlObj.pathname).digest('hex').slice(0, 12);

  // Clean the original filename (without extension) for readability
  const baseName = path.basename(originalFilename, ext)
    .replace(/[^a-zA-Z0-9-_]/g, '-')
    .slice(0, 50);

  return `${baseName}-${hash}${ext}`;
}

// Download an image from URL to local file
async function downloadImage(url: string, filepath: string): Promise<boolean> {
  return new Promise((resolve) => {
    const protocol = url.startsWith('https') ? https : http;

    const request = protocol.get(url, (response) => {
      // Handle redirects
      if (response.statusCode === 301 || response.statusCode === 302) {
        const redirectUrl = response.headers.location;
        if (redirectUrl) {
          downloadImage(redirectUrl, filepath).then(resolve);
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

// Extract all image URLs from markdown content
function extractImageUrls(markdown: string): string[] {
  const imageRegex = /!\[[^\]]*\]\(([^)]+)\)/g;
  const urls: string[] = [];
  let match;

  while ((match = imageRegex.exec(markdown)) !== null) {
    const url = match[1];
    // Only process Notion/S3 URLs that will expire
    if (url.includes('prod-files-secure.s3') || url.includes('notion.so')) {
      urls.push(url);
    }
  }

  return urls;
}

// Process markdown content: download images and replace URLs
async function processMarkdownImages(markdown: string, guideSlug: string): Promise<string> {
  const imageUrls = extractImageUrls(markdown);
  let processedMarkdown = markdown;

  for (const url of imageUrls) {
    const filename = generateFilename(url);
    const localPath = path.join(IMAGES_DIR, filename);
    const publicPath = `/guides/images/${filename}`;

    // Check if image already exists (avoid re-downloading)
    if (!fs.existsSync(localPath)) {
      console.log(`  Downloading: ${filename}`);
      const success = await downloadImage(url, localPath);
      if (!success) {
        console.error(`  Failed to download image for ${guideSlug}: ${filename}`);
        continue; // Keep original URL if download fails
      }
    } else {
      console.log(`  Using cached: ${filename}`);
    }

    // Replace the URL in markdown
    processedMarkdown = processedMarkdown.split(url).join(publicPath);
  }

  return processedMarkdown;
}

async function cacheGuides() {
  try {
    console.log('Fetching guides from Notion...');
    ensureImagesDir();

    const pages = await fetchPublishedGuides();
    const allGuides = [];

    for (const page of pages) {
      const guide = await getGuideFromNotion(page.id);
      if (guide) {
        console.log(`Processing images for: ${guide.title}`);
        // Download images and update markdown content
        guide.content = await processMarkdownImages(guide.content, guide.slug);
        allGuides.push(guide);
      }
    }

    const cachePath = path.join(process.cwd(), 'guides-cache.json');
    fs.writeFileSync(cachePath, JSON.stringify(allGuides, null, 2));

    console.log(`Successfully cached ${allGuides.length} guides with local images.`);
  } catch (error) {
    console.error('Error caching guides:', error);
    process.exit(1);
  }
}

cacheGuides();
