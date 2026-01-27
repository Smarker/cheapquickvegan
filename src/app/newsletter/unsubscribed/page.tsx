/**
 * Newsletter Unsubscribed Success Page
 *
 * Displayed after user successfully unsubscribes from the newsletter.
 */

import Link from 'next/link';
import { CheckCircle, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Unsubscribed',
  description: 'You have been unsubscribed from our newsletter.',
};

export default function NewsletterUnsubscribedPage({
  searchParams,
}: {
  searchParams: { already?: string };
}) {
  const alreadyUnsubscribed = searchParams.already === 'true';

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
          <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
        </div>

        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          {alreadyUnsubscribed ? 'Already Unsubscribed' : 'Successfully Unsubscribed'}
        </h1>

        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {alreadyUnsubscribed
            ? "You've already been removed from our newsletter."
            : "You've been removed from our newsletter. We're sorry to see you go!"}
        </p>

        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          You won't receive any more emails from us. If this was a mistake, you can always
          subscribe again from our website.
        </p>

        <Button asChild className="w-full">
          <Link href="/">
            <Home className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </Button>
      </div>
    </div>
  );
}
