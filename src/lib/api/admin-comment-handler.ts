import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/auth/admin-auth";

export function createAdminCommentHandler(
  action: string,
  actionFn: (id: string) => Promise<unknown>
) {
  return async function PUT(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
  ) {
    try {
      const authError = await requireAdminAuth();
      if (authError) return authError;

      const { id } = await params;
      const comment = await actionFn(id);

      return NextResponse.json({
        success: true,
        comment,
        message: `Comment ${action}ed successfully`,
      });
    } catch (error) {
      console.error(`Failed to ${action} comment:`, error);
      return NextResponse.json(
        { error: `Failed to ${action} comment` },
        { status: 500 }
      );
    }
  };
}
