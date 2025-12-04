// app/posts/[slug]/page.tsx
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic"; // ensures server-side rendering

export default function LegacyPost() {
  return new Response("Gone", { status: 410 });
}
