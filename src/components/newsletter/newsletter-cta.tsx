'use client';

/**
 * Newsletter CTA Component
 *
 * Newsletter signup form with honeypot, rate limiting, and email verification.
 * Displays after recipe content to encourage subscriptions.
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { subscribeSchema, type SubscribeInput } from '@/lib/validators/newsletter-schemas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Loader2, Mail, Send } from 'lucide-react';

export function NewsletterCTA() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SubscribeInput>({
    resolver: zodResolver(subscribeSchema),
    defaultValues: {
      email: '',
      name: '',
      website: '', // Honeypot field
    },
  });

  const onSubmit = async (data: SubscribeInput) => {
    setIsSubmitting(true);
    setIsSuccess(false);

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        setIsSuccess(true);
        reset();
        toast.success('Check your email!', {
          description: 'We sent you a confirmation link to verify your subscription.',
          duration: 6000,
        });
      } else if (response.status === 429) {
        // Rate limit exceeded
        toast.error('Too many attempts', {
          description: result.message || 'Please try again later.',
          duration: 8000,
        });
      } else {
        toast.error('Something went wrong', {
          description: result.error || 'Please try again.',
        });
      }
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      toast.error('Network error', {
        description: 'Please check your connection and try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-2xl shadow-sm border border-purple-100 dark:border-purple-900/30 p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
        {/* Icon and text */}
        <div className="flex-shrink-0">
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-[#735d78] flex items-center justify-center shadow-lg">
            <Mail className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
          </div>
        </div>

        <div className="flex-grow">
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Stay Updated with New Recipes
          </h3>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4">
            Get vegan recipes delivered to your inbox monthly.
          </p>

          {isSuccess ? (
            <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900/50 rounded-lg p-4">
              <p className="text-green-800 dark:text-green-200 font-medium">
                ✓ Almost there! Check your email to confirm your subscription.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
              {/* Honeypot field - hidden from users */}
              <div
                style={{
                  position: 'absolute',
                  left: '-9999px',
                  height: 0,
                  overflow: 'hidden',
                }}
                aria-hidden="true"
              >
                <label htmlFor="website_field">Leave this field empty</label>
                <input
                  type="text"
                  id="website_field"
                  {...register('website')}
                  tabIndex={-1}
                  autoComplete="new-password"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-grow">
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    {...register('email')}
                    disabled={isSubmitting}
                    className="w-full"
                    autoComplete="email"
                  />
                  {errors.email && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div className="flex-grow sm:flex-grow-0">
                  <Input
                    type="text"
                    placeholder="Name (optional)"
                    {...register('name')}
                    disabled={isSubmitting}
                    className="w-full sm:w-40"
                    autoComplete="name"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#735d78] hover:bg-[#5d4a61] text-white font-semibold w-full sm:w-auto"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Subscribing...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Subscribe
                    </>
                  )}
                </Button>
              </div>

              <p className="text-xs text-gray-500 dark:text-gray-500">
                We respect your privacy. Unsubscribe anytime. No spam, ever.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
