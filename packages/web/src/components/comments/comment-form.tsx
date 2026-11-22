'use client';

/**
 * CommentForm Component
 *
 * Form for submitting top-level comments with ratings.
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { commentSchema, type CommentInput } from '@/lib/validators/comment-schemas';
import { StarRating } from './star-rating';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useFormField,
} from '@/components/ui/form';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { RateLimitBanner } from '@/components/ui/rate-limit-banner';

interface CommentFormProps {
  recipeId: string;
  onSuccess?: () => void;
}

export function CommentForm({ recipeId, onSuccess }: CommentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rateLimitInfo, setRateLimitInfo] = useState<{ message: string; resetDate?: string } | null>(null);

  const form = useForm<CommentInput>({
    resolver: zodResolver(commentSchema),
    defaultValues: {
      name: '',
      email: '',
      commentText: '',
      rating: undefined,
      recipeId,
    },
  });

  const onSubmit = async (data: CommentInput) => {
    setIsSubmitting(true);
    setRateLimitInfo(null);

    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        // Check for rate limit error
        if (response.status === 429) {
          const errorMessage = result.message || result.error || 'Too many comments. Please try again later.';

          // Format the reset date if provided
          let resetDate: string | undefined;
          if (result.resetTime) {
            const resetDateTime = new Date(result.resetTime);
            resetDate = resetDateTime.toLocaleString();
          }

          setRateLimitInfo({
            message: errorMessage,
            resetDate,
          });
          return; // Don't throw error, just show banner
        }

        throw new Error(result.error || 'Failed to submit comment');
      }

      // Store ownership token in localStorage
      if (result.ownershipToken && result.id) {
        localStorage.setItem(`comment-ownership-${result.id}`, result.ownershipToken);
      }

      toast.success('Comment submitted!', {
        description: 'Your comment is pending approval and will appear soon.',
      });

      // Reset form
      form.reset({
        name: '',
        email: data.email, // Keep email for convenience
        commentText: '',
        rating: undefined,
        recipeId,
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to submit comment';
      toast.error('Submission failed', {
        description: message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Leave a Comment</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Rate limit banner */}
        {rateLimitInfo && (
          <RateLimitBanner
            message={rateLimitInfo.message}
          />
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="rating"
              render={({ field }) => {
                const { formItemId } = useFormField();
                return (
                  <FormItem>
                    <FormLabel>Rating (optional)</FormLabel>
                    <StarRating
                      id={formItemId}
                      value={field.value || 0}
                      onChange={field.onChange}
                      size="lg"
                    />
                    <FormDescription>
                      Leave a rating if you tried the recipe, or skip it to ask a question. Click the same star again to clear your rating.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name (optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Your name or leave blank for Anonymous"
                      autoComplete="name"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email *</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="your@email.com"
                      autoComplete="email"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Required for moderation but will not be displayed publicly
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="commentText"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Comment *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Share your thoughts, ask a question, or tell us what you thought of this recipe..."
                      className="min-h-[120px] resize-none"
                      maxLength={1000}
                      autoComplete="off"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {field.value.length}/1000 characters
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting ? 'Submitting...' : 'Submit Comment'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
