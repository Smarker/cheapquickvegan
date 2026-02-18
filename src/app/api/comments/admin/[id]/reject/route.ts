import { NextRequest } from 'next/server';
import { rejectComment } from '@/lib/db/comments';
import { createAdminCommentHandler } from '@/lib/api/admin-comment-handler';

export const PUT: (
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) => Promise<Response> = createAdminCommentHandler("reject", rejectComment);
