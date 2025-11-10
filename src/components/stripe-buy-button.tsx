'use client';
import { useEffect } from 'react';

interface StripeBuyButtonProps {
  buyButtonId: string;
}

export default function StripeBuyButton({ buyButtonId }: StripeBuyButtonProps) {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://js.stripe.com/v3/buy-button.js';
    script.async = true;
    document.body.appendChild(script);
  }, []);

  return (
    <div className="flex justify-center">
      <stripe-buy-button
        buy-button-id={buyButtonId}
        publishable-key={process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!}
      />
    </div>
  );
}
