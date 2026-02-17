# Cloudinary Migration Plan

## Why

Images are currently committed to git (`/public/images`, `/public/recipes/images`,
`/public/guides/images` — ~77MB total). Problems at scale:

- Git repo bloats with every new post → slower clones, slower Vercel checkout
- New post workflow requires manual compress → commit → push for every image
- No responsive sizing or format conversion (serving full-size JPG to mobile)

Cloudinary handles compression, format conversion (WebP/AVIF), and responsive
resizing automatically via URL parameters. Images live outside git entirely.

---

## How bandwidth actually works with Next.js

A common concern is Cloudinary's 25GB/month free bandwidth limit. In practice
it stretches much further than raw traffic suggests because of how `next/image` works:

```
Browser → Vercel edge cache → (cache miss only) → Cloudinary origin
```

Vercel fetches from Cloudinary **once per image per size variant**, optimizes it,
and serves all subsequent requests from its edge cache. With a long
`minimumCacheTTL`, Cloudinary bandwidth consumption becomes nearly negligible.

**Add this to `next.config.ts`:**

```ts
images: {
  minimumCacheTTL: 2592000, // 30 days in seconds
  // ...existing remotePatterns
}
```

With 30-day caching, a post getting 50k views/month still only pulls each image
from Cloudinary ~once per month. The free tier holds comfortably through early
growth stages.

---

## New post workflow (after migration)

**Before (current):**
1. Source or shoot photo
2. Open in Photoshop / Squoosh / ImageOptim
3. Resize, compress, export
4. `git add` → `git commit` → `git push`
5. Image is now in the repo forever, bloating history

**After (Cloudinary):**
1. Source or shoot photo
2. Drag into Cloudinary dashboard (or use mobile app)
3. Copy the URL — paste into Notion
4. Done. Cloudinary handles compression, WebP conversion, and responsive sizes.

---

## URL-based transformations

Cloudinary URLs carry transformation parameters, so you can get different
versions of the same image without uploading multiple files:

```
# Original upload
https://res.cloudinary.com/your-account/image/upload/v1/recipes/tofu-scramble.jpg

# Auto format + quality (WebP on browsers that support it)
https://res.cloudinary.com/your-account/image/upload/f_auto,q_auto/v1/recipes/tofu-scramble.jpg

# Thumbnail for recipe cards (400px wide)
https://res.cloudinary.com/your-account/image/upload/f_auto,q_auto,w_400/v1/recipes/tofu-scramble.jpg

# Hero image (1200px wide)
https://res.cloudinary.com/your-account/image/upload/f_auto,q_auto,w_1200/v1/recipes/tofu-scramble.jpg
```

The `f_auto,q_auto` preset is the most useful default — Cloudinary picks the
best format and quality level automatically.

---

## Migration steps

### 1. Set up Cloudinary account

- Sign up at cloudinary.com (free tier: 25GB storage, 25GB bandwidth)
- Note your **cloud name** from the dashboard

### 2. Add Cloudinary domain to `next.config.ts`

```ts
images: {
  minimumCacheTTL: 2592000,
  remotePatterns: [
    {
      protocol: "https",
      hostname: "res.cloudinary.com",
      pathname: "/**",
    },
    // keep existing Notion patterns during transition
    {
      protocol: "https",
      hostname: "prod-files-secure.s3.us-west-2.amazonaws.com",
      pathname: "/**",
    },
  ],
},
```

### 3. Upload existing images to Cloudinary

Use the Cloudinary CLI or dashboard bulk upload. Mirror the existing folder
structure (`recipes/`, `guides/`, `images/`) to keep things organised.

```bash
npm install -g cloudinary-cli
cld config -n <cloud_name> -k <api_key> -s <api_secret>
cld uploader upload_large public/images/* --folder images
cld uploader upload_large public/recipes/images/* --folder recipes
cld uploader upload_large public/guides/images/* --folder guides
```

### 4. Update the cache scripts

In `scripts/lib/cache-utils.ts`, `processMarkdownMedia` currently downloads
Notion/S3 images to `/public` and replaces URLs with local paths. Instead,
upload to Cloudinary and store the Cloudinary URL:

```ts
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function uploadToCloudinary(url: string, folder: string): Promise<string | null> {
  try {
    const result = await cloudinary.uploader.upload(url, {
      folder,
      overwrite: false,      // skip if already uploaded (same public_id)
      resource_type: 'auto',
    });
    // Return f_auto,q_auto transform URL
    return result.secure_url.replace('/upload/', '/upload/f_auto,q_auto/');
  } catch (err) {
    console.error('Cloudinary upload failed:', err);
    return null;
  }
}
```

The `overwrite: false` option means re-running the cache script won't re-upload
images that already exist in Cloudinary — same caching behaviour as the current
file-existence check.

### 5. Add environment variables

```bash
# .env.local
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

Add the same vars to Vercel project settings.

### 6. Remove images from git

Once all images are confirmed live on Cloudinary:

```bash
git rm -r --cached public/images public/recipes/images public/guides/images
echo "public/images/" >> .gitignore
echo "public/recipes/images/" >> .gitignore
echo "public/guides/images/" >> .gitignore
git commit -m "Remove committed images — now served from Cloudinary"
```

> **Note:** This removes them from the working tree going forward but they
> remain in git history. To scrub them from history entirely (reduces repo
> size significantly) use `git filter-repo` — only worth doing if repo size
> is a real concern.

---

## Alternatives considered

| Option | Storage cost | Bandwidth cost | Transforms | Authoring DX |
|---|---|---|---|---|
| **Cloudinary** (recommended) | 25GB free | 25GB free | URL-based, excellent | Best |
| **Cloudflare R2 + Images** | $0.015/GB | Free egress | URL-based | Good |
| **Bunny.net** | ~$0.01/GB | ~$0.01/GB | Limited | Okay |
| **Git + repo** (current) | Repo bloat | Via Vercel | None | Slow |

Cloudflare R2 becomes cheaper than Cloudinary at high storage/transform volume,
but Cloudinary's free tier and developer experience make it the right starting point.

---

## Cover images (special case)

Recipe and guide cover images are currently derived from a hardcoded pattern in
`src/lib/notion.ts`:

```ts
coverImage: `/images/${slug}.jpg`
```

After migration, this should read a "Cover Image URL" property from Notion
directly (already set as a Notion page property), so the image is managed
entirely from Notion without any convention-based filename mapping.
