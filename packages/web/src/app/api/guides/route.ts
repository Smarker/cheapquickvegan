import { NextResponse } from "next/server";
import { APP_CACHE_HEADERS, appGuides } from "@/lib/app-api";

/** Every guide in the app's shape. Read-only; used by the mobile app. */
export async function GET() {
  const guides = appGuides();
  return NextResponse.json({ guides, updatedAt: new Date().toISOString() }, { headers: APP_CACHE_HEADERS });
}
