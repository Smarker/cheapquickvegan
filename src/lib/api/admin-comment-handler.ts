import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/auth/admin-auth";

const ACTION_LABELS = {
  approve: "approved",
  reject: "rejected",
} as const;

type Action = keyof typeof ACTION_LABELS;

export function createAdminCommentHandler(
  action: Action,
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
      const pastTense = ACTION_LABELS[action];

      return NextResponse.json({
        success: true,
        comment,
        message: `Comment ${pastTense} successfully`,
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
