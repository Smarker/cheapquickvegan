'use client';

/**
 * ReplyForm Component
 *
 * Form for submitting reply comments (no rating required).
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { replySchema, type ReplyInput } from '@/lib/validators/comment-schemas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { toast } from 'sonner';
import { Loader2, X } from 'lucide-react';
import { RateLimitBanner } from '@/components/ui/rate-limit-banner';

interface ReplyFormProps {
  recipeId: string;
  parentCommentId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ReplyForm({ recipeId, parentCommentId, onSuccess, onCancel }: ReplyFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rateLimitInfo, setRateLimitInfo] = useState<{ message: string; resetDate?: string } | null>(null);

  const form = useForm<ReplyInput>({
    resolver: zodResolver(replySchema),
    defaultValues: {
      name: '',
      email: '',
      commentText: '',
      recipeId,
      parentCommentId,
    },
  });

  const onSubmit = async (data: ReplyInput) => {
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

        throw new Error(result.error || 'Failed to submit reply');
      }

      // Store ownership token in localStorage
      if (result.ownershipToken && result.id) {
        localStorage.setItem(`comment-ownership-${result.id}`, result.ownershipToken);
      }

      toast.success('Reply submitted!', {
        description: 'Your reply is pending approval and will appear soon.',
      });

      // Reset form
      form.reset();

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to submit reply';
      toast.error('Submission failed', {
        description: message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="ml-8 mt-4 p-4 border rounded-lg bg-muted/50">
      {/* Rate limit banner */}
      {rateLimitInfo && (
        <RateLimitBanner
          message={rateLimitInfo.message}
        />
      )}

      <div className="flex items-center justify-between mb-4">
        <h4 className="font-medium">Reply to Comment</h4>
        {onCancel && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onCancel}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                <FormLabel>Your Reply *</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Write your reply..."
                    className="min-h-[100px] resize-none"
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

          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting ? 'Submitting...' : 'Submit Reply'}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}
