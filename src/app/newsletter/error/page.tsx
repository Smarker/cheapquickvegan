/**
 * Newsletter Error Page
 *
 * Displayed when email verification fails or encounters an error.
 */

import Link from 'next/link';
import { XCircle, ArrowLeft, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Subscription Error',
  description: 'There was an error confirming your newsletter subscription.',
};

const errorMessages: Record<string, { title: string; message: string }> = {
  'missing-token': {
    title: 'Missing Verification Token',
    message: 'The verification link is incomplete. Please check your email and try clicking the link again.',
  },
  'invalid-token': {
    title: 'Invalid or Expired Token',
    message: 'This verification link is invalid or has expired. Verification links expire after 24 hours.',
  },
  'not-found': {
    title: 'Subscription Not Found',
    message: 'We couldn\'t find a subscription matching this verification link.',
  },
  'invalid-status': {
    title: 'Invalid Subscription Status',
    message: 'This subscription cannot be verified. It may have been unsubscribed.',
  },
  'server-error': {
    title: 'Server Error',
    message: 'An unexpected error occurred while processing your request. Please try again later.',
  },
};

export default function NewsletterErrorPage({
  searchParams,
}: {
  searchParams: { reason?: string };
}) {
  const reason = searchParams.reason || 'server-error';
  const error = errorMessages[reason] || errorMessages['server-error'];

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
          <XCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
        </div>

        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          {error.title}
        </h1>

        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {error.message}
        </p>

        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-900 dark:text-blue-200 font-medium mb-2">
            Need help?
          </p>
          <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1 text-left">
            {reason === 'invalid-token' && (
              <>
                <li>• Request a new verification email</li>
                <li>• Make sure you're clicking the latest link</li>
              </>
            )}
            {reason === 'not-found' && (
              <>
                <li>• Try subscribing again from the homepage</li>
                <li>• Check if you used a different email address</li>
              </>
            )}
            {reason === 'server-error' && (
              <>
                <li>• Wait a few minutes and try again</li>
                <li>• Contact us if the problem persists</li>
              </>
            )}
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button asChild className="flex-1">
            <Link href="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Home
            </Link>
          </Button>
          <Button asChild variant="outline" className="flex-1">
            <Link href="/contact">
              <Mail className="w-4 h-4 mr-2" />
              Contact Us
            </Link>
          </Button>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-500 mt-6">
          Want to try again?{' '}
          <Link
            href="/"
            className="text-[#735d78] hover:underline"
          >
            Return to homepage
          </Link>
        </p>
      </div>
    </div>
  );
}
