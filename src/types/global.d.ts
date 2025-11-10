// src/types/stripe-buy-button.d.ts
import 'react';

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'stripe-buy-button': {
        'buy-button-id': string;
        'publishable-key': string;
        [key: string]: any; // optional, allow other props like className
      };
    }
  }
}
