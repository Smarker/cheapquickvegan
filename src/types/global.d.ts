// tell TypeScript about custom web components
declare namespace JSX {
  interface IntrinsicElements {
    'stripe-buy-button': {
      'buy-button-id': string;
      'publishable-key': string;
      [key: string]: any; // allow other props
    };
  }
}
