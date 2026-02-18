import { NextRequest } from "next/server";

export function getClientIpAddress(
  request: NextRequest,
  fallback = "127.0.0.1"
): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded
    ? forwarded.split(",")[0].trim()
    : request.headers.get("x-real-ip") || fallback;
}
