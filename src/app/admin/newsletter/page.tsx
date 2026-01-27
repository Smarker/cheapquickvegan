'use client';

/**
 * Admin Newsletter Dashboard
 *
 * Compose and send newsletters to all active subscribers.
 */

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Mail, Send, LogOut, Users, MessageSquare, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

interface NewsletterFormData {
  subject: string;
  content: string;
}

export default function AdminNewsletterPage() {
  const router = useRouter();
  const [subscriberCount, setSubscriberCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  const form = useForm<NewsletterFormData>({
    defaultValues: {
      subject: '',
      content: '',
    },
  });

  const fetchSubscriberCount = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/newsletter/stats');

      if (response.status === 401) {
        router.push('/admin/login');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch subscriber count');
      }

      const data = await response.json();
      setSubscriberCount(data.activeSubscribers || 0);
    } catch (error) {
      console.error('Failed to fetch subscriber count:', error);
      toast.error('Failed to load subscriber count');
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchSubscriberCount();
  }, [fetchSubscriberCount]);

  const handleLogout = async () => {
    try {
      document.cookie = 'admin-session=; Max-Age=0; path=/;';
      toast.success('Logged out successfully');
      router.push('/admin/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const onSubmit = async (data: NewsletterFormData) => {
    if (subscriberCount === 0) {
      toast.error('No subscribers', {
        description: 'You need at least one active subscriber to send a newsletter.',
      });
      return;
    }

    // Confirm before sending
    const confirmed = confirm(
      `Send newsletter to ${subscriberCount} subscriber${subscriberCount !== 1 ? 's' : ''}?\n\nSubject: ${data.subject}`
    );

    if (!confirmed) {
      return;
    }

    setIsSending(true);

    try {
      const response = await fetch('/api/admin/newsletter/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.status === 401) {
        router.push('/admin/login');
        return;
      }

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send newsletter');
      }

      toast.success('Newsletter sent!', {
        description: `Successfully sent to ${result.sent} subscriber${result.sent !== 1 ? 's' : ''}.`,
        duration: 6000,
      });

      // Reset form
      form.reset();
    } catch (error) {
      console.error('Failed to send newsletter:', error);
      const message = error instanceof Error ? error.message : 'Failed to send newsletter';
      toast.error('Send failed', {
        description: message,
      });
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container max-w-4xl mx-auto p-6 space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
        </Card>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Mail className="h-6 w-6" />
                Newsletter Dashboard
              </CardTitle>
              <CardDescription>
                Compose and send newsletters to your subscribers
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-lg px-3 py-1">
                <Users className="h-4 w-4 mr-2" />
                {subscriberCount} active
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/comments">
                <MessageSquare className="h-4 w-4 mr-2" />
                Comments
              </Link>
            </Button>
            <Button onClick={handleLogout} variant="ghost" size="sm">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Newsletter Composer */}
      <Card>
        <CardHeader>
          <CardTitle>Compose Newsletter</CardTitle>
          <CardDescription>
            Write your newsletter content. It will be sent to all active subscribers.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="subject"
                rules={{ required: 'Subject is required' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject Line</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="New Recipes This Month!"
                        disabled={isSending}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      The email subject line subscribers will see
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="content"
                rules={{ required: 'Content is required' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Newsletter Content</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={`Hey there! 👋

Here are the new recipes this month:

• Recipe 1: https://cheapquickvegan.com/recipes/recipe-slug
• Recipe 2: https://cheapquickvegan.com/recipes/recipe-slug

Enjoy!`}
                        disabled={isSending}
                        rows={12}
                        className="font-mono text-sm"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Plain text content. Include links to your new recipes.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-900/50 rounded-lg p-4">
                <p className="text-sm text-yellow-900 dark:text-yellow-200">
                  <strong>Preview your email:</strong> The content will be formatted with your
                  branding, logo, and unsubscribe link automatically.
                </p>
              </div>

              <Button
                type="submit"
                disabled={isSending || subscriberCount === 0}
                className="w-full"
              >
                {isSending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending to {subscriberCount} subscriber{subscriberCount !== 1 ? 's' : ''}...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send Newsletter to {subscriberCount} Subscriber{subscriberCount !== 1 ? 's' : ''}
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
