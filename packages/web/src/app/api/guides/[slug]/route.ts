import { NextResponse } from "next/server";
import { APP_CACHE_HEADERS, appGuides } from "@/lib/app-api";

/** One guide in the app's shape, or 404. */
export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = appGuides().find((g) => g.slug === slug);
  if (!guide) return NextResponse.json({ error: "Guide not found" }, { status: 404 });
  return NextResponse.json({ guide }, { headers: APP_CACHE_HEADERS });
}
