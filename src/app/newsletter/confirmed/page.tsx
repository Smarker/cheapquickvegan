/**
 * Newsletter Confirmation Success Page
 *
 * Displayed after user clicks the verification link in their email.
 */

import Link from 'next/link';
import { CheckCircle, ArrowRight, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Subscription Confirmed',
  description: 'Your newsletter subscription has been confirmed.',
};

export default function NewsletterConfirmedPage({
  searchParams,
}: {
  searchParams: { already?: string };
}) {
  const alreadyConfirmed = searchParams.already === 'true';

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
          <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
        </div>

        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          {alreadyConfirmed ? "You're Already Subscribed!" : 'Subscription Confirmed!'}
        </h1>

        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {alreadyConfirmed
            ? "You've already confirmed your subscription. Keep an eye on your inbox for delicious vegan recipes delivered monthly!"
            : "Welcome to the Cheap Quick Vegan community! You'll start receiving our monthly newsletter with delicious vegan recipes."}
        </p>

        <div className="bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/50 rounded-lg p-4 mb-6">
          <p className="text-sm text-purple-900 dark:text-purple-200 font-medium mb-2">
            What's next?
          </p>
          <ul className="text-sm text-purple-800 dark:text-purple-300 space-y-1 text-left">
            <li>✓ Check your inbox for a welcome email</li>
            <li>✓ Explore our recipe collection</li>
            <li>✓ Discover travel guides</li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button asChild className="flex-1">
            <Link href="/recipes">
              Browse Recipes
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
          <Button asChild variant="outline" className="flex-1">
            <Link href="/">
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Link>
          </Button>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-500 mt-6">
          Didn't mean to subscribe?{' '}
          <Link
            href="/api/newsletter/unsubscribe"
            className="text-[#735d78] hover:underline"
          >
            Unsubscribe here
          </Link>
        </p>
      </div>
    </div>
  );
}
