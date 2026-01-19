'use client';

/**
 * CommentList Component
 *
 * Displays a list of comments with nested replies.
 */

import { Comment } from '@/types/comment';
import { CommentItem } from './comment-item';
import { Separator } from '@/components/ui/separator';

interface CommentListProps {
  comments: Comment[];
  recipeId: string;
  onUpdate?: () => void;
}

export function CommentList({ comments, recipeId, onUpdate }: CommentListProps) {
  if (comments.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No reviews yet. Be the first to share your thoughts!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {comments.map((comment, index) => (
        <div key={comment.id}>
          <CommentItem
            comment={comment}
            recipeId={recipeId}
            onUpdate={onUpdate}
          />
          {index < comments.length - 1 && <Separator className="mt-6" />}
        </div>
      ))}
    </div>
  );
}
