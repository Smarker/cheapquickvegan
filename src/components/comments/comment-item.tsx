'use client';

/**
 * CommentItem Component
 *
 * Displays an individual comment with rating, actions, and reply functionality.
 */

import { useState, useEffect } from 'react';
import { Comment } from '@/types/comment';
import { StarRating } from './star-rating';
import { CommentActions } from './comment-actions';
import { ReplyForm } from './reply-form';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare } from 'lucide-react';

interface CommentItemProps {
  comment: Comment;
  recipeId: string;
  onUpdate?: () => void;
  isReply?: boolean;
}

export function CommentItem({ comment, recipeId, onUpdate, isReply = false }: CommentItemProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [ownershipToken, setOwnershipToken] = useState<string | null>(null);

  useEffect(() => {
    // Check localStorage for ownership token
    const token = localStorage.getItem(`comment-ownership-${comment.id}`);
    setOwnershipToken(token);
  }, [comment.id]);

  const displayName = comment.name || 'Anonymous';
  const timeAgo = formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true });

  const handleReplySuccess = () => {
    setShowReplyForm(false);
    if (onUpdate) {
      onUpdate();
    }
  };

  const isOwner = ownershipToken !== null;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium">{displayName}</span>
              <span className="text-sm text-muted-foreground">•</span>
              <span className="text-sm text-muted-foreground">{timeAgo}</span>
              {comment.rating && !isReply && (
                <>
                  <span className="text-sm text-muted-foreground">•</span>
                  <StarRating value={comment.rating} readonly size="sm" />
                </>
              )}
            </div>
          </div>

          {isOwner && ownershipToken && (
            <CommentActions
              commentId={comment.id}
              commentText={comment.commentText}
              ownershipToken={ownershipToken}
              onSuccess={onUpdate}
            />
          )}
        </div>

        {/* Comment Text */}
        <div className="text-sm whitespace-pre-wrap break-words">
          {comment.commentText}
        </div>

        {/* Reply Button (only for top-level comments) */}
        {!isReply && (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowReplyForm(!showReplyForm)}
            >
              <MessageSquare className="h-4 w-4 mr-1" />
              Reply
            </Button>
            {comment.replies && comment.replies.length > 0 && (
              <span className="text-sm text-muted-foreground">
                {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Reply Form */}
      {showReplyForm && (
        <ReplyForm
          recipeId={recipeId}
          parentCommentId={comment.id}
          onSuccess={handleReplySuccess}
          onCancel={() => setShowReplyForm(false)}
        />
      )}

      {/* Nested Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="ml-8 space-y-4 border-l-2 border-muted pl-4">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              recipeId={recipeId}
              onUpdate={onUpdate}
              isReply
            />
          ))}
        </div>
      )}
    </div>
  );
}
