# Cloudflare R2 Migration Plan

## Why

Images are currently committed to git (`/public/images`, `/public/recipes/images`,
`/public/guides/images`). Problems at scale:

- Git repo bloats with every new post → slower clones, slower Vercel checkout
- New post workflow requires manual compress → commit → push for every image
- No responsive sizing or format conversion

---

## Why R2 over Cloudinary

Cloudinary's main value is URL-based image transforms (resize, format conversion,
compression). **On Vercel, `next/image` already does all of that at the edge** —
so Cloudinary's transform layer is redundant. R2 is a dumb, cheap object store
with zero egress fees, which is exactly what you need when Vercel handles the
hard parts.

| | Cloudflare R2 | Cloudinary |
|---|---|---|
| Storage | 10GB free, then $0.015/GB | 25GB free |
| Egress | **Free** | 25GB free, then paid |
| Transforms | None (Vercel handles it) | URL-based (redundant on Vercel) |
| Auth/setup | Wrangler CLI or dashboard | API key |
| Lock-in | Low — plain HTTPS URLs | Low — plain HTTPS URLs |

---

## Free tier limits

R2 free tier (per month, permanent — not a trial):

- **10 GB** storage
- **1 million** Class A operations (uploads/writes)
- **10 million** Class B operations (reads/downloads)
- **Zero egress fees** always, regardless of tier

A blog with hundreds of posts and thousands of visitors will stay in the free
tier indefinitely.

---

## How it works with Next.js / Vercel

```
Browser → Vercel edge (next/image) → (cache miss only) → R2 origin
```

`next/image` fetches from R2 once, resizes and converts to WebP, then caches
the result at the Vercel edge. All subsequent requests for the same image at
the same size are served from Vercel's cache — R2 is barely touched.

**Add `minimumCacheTTL` to `next.config.ts`** to push that cache as long as possible:

```ts
images: {
  minimumCacheTTL: 2592000, // 30 days
  remotePatterns: [
    {
      protocol: "https",
      hostname: "pub-<your-r2-account-id>.r2.dev",
      pathname: "/**",
    },
  ],
},
```

---

## New post workflow (after migration)

**Before (current):**
1. Source or shoot photo
2. Compress/resize in Squoosh or ImageOptim
3. `git add` → `git commit` → `git push`
4. Image is in repo history forever

**After (R2):**
1. Source or shoot photo
2. Upload via Cloudflare dashboard or `wrangler r2 object put`
3. Copy the public URL — paste into Notion
4. Done. Vercel handles compression and responsive sizes automatically via `next/image`.

---

## Migration steps

### 1. Create an R2 bucket

- Go to [dash.cloudflare.com](https://dash.cloudflare.com) → R2 → Create bucket
- Name it something like `cheapquickvegan-images`
- Enable **public access** on the bucket (Settings → Public access → Allow)
- Note the public URL: `https://pub-<hash>.r2.dev`

### 2. Install Wrangler

```bash
npm install -g wrangler
wrangler login
```

### 3. Upload existing images to R2

Mirror the existing folder structure:

```bash
# Upload all existing images, preserving folder paths
wrangler r2 object put cheapquickvegan-images/images/ --file public/images/ --recursive
wrangler r2 object put cheapquickvegan-images/recipes/ --file public/recipes/images/ --recursive
wrangler r2 object put cheapquickvegan-images/guides/ --file public/guides/images/ --recursive
```

Verify a few URLs resolve: `https://pub-<hash>.r2.dev/recipes/tofu-scramble.jpg`

### 4. Update `next.config.ts`

```ts
const nextConfig: NextConfig = {
  images: {
    minimumCacheTTL: 2592000, // 30 days
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pub-<your-account-id>.r2.dev",
        pathname: "/**",
      },
      // Keep Notion S3 patterns while transitioning
      {
        protocol: "https",
        hostname: "prod-files-secure.s3.us-west-2.amazonaws.com",
        pathname: "/**",
      },
    ],
  },
};
```

### 5. Update the cache scripts

In `scripts/lib/cache-utils.ts`, `processMarkdownMedia` currently downloads
Notion/S3 images to `/public`. Instead, upload to R2 and store the R2 URL.

Install the AWS SDK (R2 is S3-compatible):

```bash
pnpm add @aws-sdk/client-s3
```

```ts
import { S3Client, PutObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";

const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.CF_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.CF_R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.CF_R2_SECRET_ACCESS_KEY!,
  },
});

const BUCKET = "cheapquickvegan-images";
const PUBLIC_BASE = `https://pub-${process.env.CF_R2_PUBLIC_ID}.r2.dev`;

async function uploadToR2(
  sourceUrl: string,
  key: string // e.g. "recipes/tofu-scramble.jpg"
): Promise<string | null> {
  // Skip if already uploaded
  try {
    await r2.send(new HeadObjectCommand({ Bucket: BUCKET, Key: key }));
    return `${PUBLIC_BASE}/${key}`; // already exists
  } catch {}

  try {
    const res = await fetch(sourceUrl);
    const body = Buffer.from(await res.arrayBuffer());
    const contentType = res.headers.get("content-type") ?? "image/jpeg";

    await r2.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: body,
        ContentType: contentType,
      })
    );
    return `${PUBLIC_BASE}/${key}`;
  } catch (err) {
    console.error("R2 upload failed:", err);
    return null;
  }
}
```

The `HeadObject` check means re-running the cache script won't re-upload images
that are already in R2 — same behaviour as the current file-existence check.

### 6. Add environment variables

```bash
# .env.local
CF_ACCOUNT_ID=your-account-id
CF_R2_ACCESS_KEY_ID=your-access-key
CF_R2_SECRET_ACCESS_KEY=your-secret-key
CF_R2_PUBLIC_ID=your-public-bucket-hash  # from the public r2.dev URL
```

Generate R2 API tokens at: Cloudflare dashboard → R2 → Manage R2 API tokens.
Add the same vars to Vercel project settings.

### 7. Remove images from git

Once all images are confirmed live on R2:

```bash
git rm -r --cached public/images public/recipes/images public/guides/images
echo "public/images/" >> .gitignore
echo "public/recipes/images/" >> .gitignore
echo "public/guides/images/" >> .gitignore
git commit -m "Remove committed images — now served from Cloudflare R2"
```

---

## Database migration (if moving to Cloudflare Pages)

R2 alone works fine while staying on Vercel — skip this section for now.
It only matters if you later move hosting to Cloudflare Pages.

### The situation

You're using `@vercel/postgres`, which is Neon (serverless Postgres) under the
hood — Vercel just resells it. The problem on Cloudflare Pages is that the Edge
Runtime doesn't support raw TCP connections, so the standard Postgres wire
protocol doesn't work. The fix is Neon's own package, which speaks HTTP/WebSockets
instead of TCP, making it edge-compatible.

**Your actual database doesn't move.** You just change how the app connects to it.

### Steps

**1. Swap the package**

```bash
pnpm remove @vercel/postgres
pnpm add @neondatabase/serverless
```

**2. Update the import in `src/lib/db/comments.ts` and `src/lib/db/shares.ts`**

```ts
// Before
import { sql } from '@vercel/postgres'

// After
import { neon } from '@neondatabase/serverless'
const sql = neon(process.env.DATABASE_URL!)
```

All the SQL queries (`sql\`SELECT * FROM comments\``, etc.) stay identical —
no schema changes, no data migration, no query rewrites.

**3. Update environment variables**

In Vercel, `@vercel/postgres` injects `POSTGRES_URL` automatically. With Neon
directly, point to the same database using the connection string from the Neon
dashboard:

```bash
# .env.local (and Cloudflare Pages environment variables)
DATABASE_URL=postgres://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
```

Find this in: [console.neon.tech](https://console.neon.tech) → your project →
Connection Details → copy the connection string.

### Why this is low risk

- Same Postgres database, same tables, same data
- The Neon free tier (0.5GB storage, 190 compute hours/month) covers a small blog indefinitely
- If you stay on Vercel forever, you never need to do this at all

---

## Cover images (special case)

Recipe and guide cover images currently use a convention-based local path in
`src/lib/notion.ts`:

```ts
coverImage: `/images/${slug}.jpg`
```

After migration, this should read the cover image URL directly from a Notion
page property so images are managed entirely from Notion, with no filename
convention to maintain.
