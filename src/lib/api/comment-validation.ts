import { NextResponse } from "next/server";
import { ZodSchema } from "zod";
import { containsSuspiciousContent } from "@/lib/sanitize";

export function validateInput<T>(
  schema: ZodSchema<T>,
  body: unknown
): { ok: true; data: T } | { ok: false; response: NextResponse } {
  const result = schema.safeParse(body);
  if (!result.success) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Invalid input", details: result.error.errors },
        { status: 400 }
      ),
    };
  }
  return { ok: true, data: result.data };
}

export function checkCommentContent(
  text: string,
  action = "submitted"
): NextResponse | null {
  if (containsSuspiciousContent(text)) {
    return NextResponse.json(
      { error: `Comment contains suspicious content and cannot be ${action}` },
      { status: 400 }
    );
  }
  return null;
}
