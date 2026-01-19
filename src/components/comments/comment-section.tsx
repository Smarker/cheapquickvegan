'use client';

/**
 * CommentSection Component
 *
 * Main wrapper for the comment system. Displays rating stats, comment form,
 * and list of approved comments.
 */

import { useState, useEffect, useCallback } from 'react';
import { Comment, AggregateRating } from '@/types/comment';
import { CommentForm } from './comment-form';
import { CommentList } from './comment-list';
import { StarRating } from './star-rating';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

interface CommentSectionProps {
  recipeId: string;
}

export function CommentSection({ recipeId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [aggregateRating, setAggregateRating] = useState<AggregateRating | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchComments = useCallback(async () => {
    try {
      const response = await fetch(`/api/comments?recipeId=${recipeId}`);

      if (!response.ok) {
        // In development without a database, fail silently
        if (process.env.NODE_ENV === 'development') {
          console.warn('Comments not available (database not configured)');
          setComments([]);
          setAggregateRating({ average: 0, count: 0, total: 0 });
          setIsLoading(false);
          return;
        }
        throw new Error('Failed to fetch comments');
      }

      const data = await response.json();
      setComments(data.comments || []);
      setAggregateRating(data.aggregateRating || { average: 0, count: 0, total: 0 });
    } catch (error) {
      console.error('Failed to fetch comments:', error);
      setComments([]);
      setAggregateRating({ average: 0, count: 0, total: 0 });
    } finally {
      setIsLoading(false);
    }
  }, [recipeId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleUpdate = () => {
    // Refresh comments after update
    fetchComments();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Rating Summary */}
      {aggregateRating && aggregateRating.count > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recipe Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="text-4xl font-bold">
                {aggregateRating.average.toFixed(1)}
              </div>
              <div className="flex flex-col gap-1">
                <StarRating
                  value={aggregateRating.average}
                  readonly
                  size="md"
                />
                <p className="text-sm text-muted-foreground">
                  Based on {aggregateRating.count} {aggregateRating.count === 1 ? 'review' : 'reviews'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Comment Form */}
      <CommentForm recipeId={recipeId} onSuccess={handleUpdate} />

      {/* Comments List */}
      <div>
        <h3 className="text-xl font-semibold mb-4">
          Reviews ({comments.length})
        </h3>
        <Separator className="mb-6" />
        <CommentList
          comments={comments}
          recipeId={recipeId}
          onUpdate={handleUpdate}
        />
      </div>
    </div>
  );
}
