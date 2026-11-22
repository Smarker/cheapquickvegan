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
interface KlaroManager {
  getConsent: (serviceName: string) => boolean;
}

interface Klaro {
  getManager?: () => KlaroManager;
  on?: (event: string, callback: (consent: boolean, service: { name: string }) => void) => void;
  show?: (serviceName?: string) => void;
  setup?: (config?: any) => void;
}

// Extend the Window interface globally
declare global {
  interface Window {
    klaro?: Klaro;
    klaroConfig?: typeof import('../../../klaro-config').default;
    __vercelAnalyticsLoaded?: boolean;
  }
}

export {};
