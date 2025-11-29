// src/types/global.d.ts
import 'react';

//
// Stripe Buy Button
//
declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'stripe-buy-button': {
        'buy-button-id': string;
        'publishable-key': string;
        [key: string]: any;
      };
    }
  }
}

//
// Klaro type definitions
//
declare global {
  interface Window {
    klaro?: {
      getManager?: () => {
        getConsent: (serviceName: string) => boolean;
      };
      on?: (
        event: "consentChanged" | string,
        callback: (consent: boolean, service: { name: string }) => void
      ) => void;
      show?: (serviceName?: string) => void;
      setup?: (config?: any) => void;
    };

    // Add this line:
    klaroConfig?: any;
  }
}



export {};
