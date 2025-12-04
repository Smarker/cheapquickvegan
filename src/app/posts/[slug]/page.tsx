// app/posts/[slug]/page.tsx
import { notFound } from "next/navigation";

export default function LegacyPostPage() {
  // This will tell Next.js to render a 404 page
  notFound();
  return null;
}
