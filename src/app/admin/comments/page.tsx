'use client';

/**
 * Admin Comments Dashboard
 *
 * Displays all pending comments for moderation.
 */

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CommentWithRecipe } from '@/types/comment';
import { CommentModerationCard } from '@/components/comments/comment-moderation-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, LogOut, MessageSquare, Mail } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminCommentsPage() {
  const router = useRouter();
  const [comments, setComments] = useState<CommentWithRecipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchComments = useCallback(async () => {
    try {
      const response = await fetch('/api/comments/admin');

      if (response.status === 401) {
        // Not authenticated, redirect to login
        router.push('/admin/login');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch comments');
      }

      const data = await response.json();
      setComments(data.comments || []);
    } catch (error) {
      console.error('Failed to fetch comments:', error);
      toast.error('Failed to load comments', {
        description: 'Please try refreshing the page.',
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [router]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchComments();
  };

  const handleModerated = () => {
    // Refresh the list after a comment is moderated
    handleRefresh();
  };

  const handleLogout = async () => {
    try {
      // Clear the session cookie by setting it to expire
      document.cookie = 'admin-session=; Max-Age=0; path=/;';

      toast.success('Logged out successfully');
      router.push('/admin/login');
    } catch (error) {
      console.error('Logout failed:', error);
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
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
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
                <MessageSquare className="h-6 w-6" />
                Comment Moderation
              </CardTitle>
              <CardDescription>
                Review and moderate pending comments
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-lg px-3 py-1">
                {comments.length} pending
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button
              onClick={handleRefresh}
              disabled={isRefreshing}
              variant="outline"
              size="sm"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/newsletter">
                <Mail className="h-4 w-4 mr-2" />
                Newsletter
              </Link>
            </Button>
            <Button
              onClick={handleLogout}
              variant="ghost"
              size="sm"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Comments List */}
      {comments.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No pending comments</p>
            <p className="text-sm">All comments have been moderated.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <CommentModerationCard
              key={comment.id}
              comment={comment}
              onModerated={handleModerated}
            />
          ))}
        </div>
      )}
    </div>
  );
}
