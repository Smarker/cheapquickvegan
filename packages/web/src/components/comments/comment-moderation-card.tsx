'use client';

/**
 * CommentModerationCard Component
 *
 * Displays a pending comment with approve/reject actions for admin moderation.
 */

import { useState } from 'react';
import { CommentWithRecipe } from '@/types/comment';
import { StarRating } from './star-rating';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Check, X, Loader2, MessageSquare, Reply } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface CommentModerationCardProps {
  comment: CommentWithRecipe;
  onModerated?: () => void;
}

export function CommentModerationCard({ comment, onModerated }: CommentModerationCardProps) {
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  const displayName = comment.name || 'Anonymous';
  const timeAgo = formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true });
  const isReply = comment.parentCommentId !== null;

  const handleApprove = async () => {
    setIsApproving(true);

    try {
      const response = await fetch(`/api/comments/admin/${comment.id}/approve`, {
        method: 'PUT',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to approve comment');
      }

      toast.success('Comment approved', {
        description: 'The comment is now visible on the recipe page.',
      });

      if (onModerated) {
        onModerated();
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to approve comment';
      toast.error('Approval failed', {
        description: message,
      });
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async () => {
    setIsRejecting(true);

    try {
      const response = await fetch(`/api/comments/admin/${comment.id}/reject`, {
        method: 'PUT',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to reject comment');
      }

      toast.success('Comment rejected', {
        description: 'The comment has been rejected and will not be displayed.',
      });

      if (onModerated) {
        onModerated();
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to reject comment';
      toast.error('Rejection failed', {
        description: message,
      });
    } finally {
      setIsRejecting(false);
    }
  };

  const isProcessing = isApproving || isRejecting;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <Badge variant={isReply ? 'outline' : 'default'}>
                {isReply ? (
                  <><Reply className="h-3 w-3 mr-1" /> Reply</>
                ) : (
                  <><MessageSquare className="h-3 w-3 mr-1" /> Review</>
                )}
              </Badge>
              {comment.recipeSlug && (
                <span className="text-sm text-muted-foreground">
                  Recipe ID: {comment.recipeSlug}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium">{displayName}</span>
              <span className="text-sm text-muted-foreground">•</span>
              <span className="text-sm text-muted-foreground">{comment.email}</span>
              <span className="text-sm text-muted-foreground">•</span>
              <span className="text-sm text-muted-foreground">{timeAgo}</span>
            </div>
          </div>
          {comment.rating && !isReply && (
            <StarRating value={comment.rating} readonly size="sm" />
          )}
        </div>
      </CardHeader>

      <CardContent>
        <div className="whitespace-pre-wrap break-words text-sm">
          {comment.commentText}
        </div>

        {comment.ipAddress && (
          <div className="mt-4 pt-4 border-t text-xs text-muted-foreground">
            <span>IP: {comment.ipAddress}</span>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex gap-2">
        <Button
          onClick={handleApprove}
          disabled={isProcessing}
          variant="default"
          size="sm"
          className="flex-1"
        >
          {isApproving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          <Check className="mr-2 h-4 w-4" />
          Approve
        </Button>
        <Button
          onClick={handleReject}
          disabled={isProcessing}
          variant="destructive"
          size="sm"
          className="flex-1"
        >
          {isRejecting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          <X className="mr-2 h-4 w-4" />
          Reject
        </Button>
      </CardFooter>
    </Card>
  );
}
