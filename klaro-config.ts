// Configuration file for Klaro! CMP
// Note: This configuration is primarily for defining the UI text and the services.
// The conditional loading logic for <Analytics /> and <SpeedInsights /> must be
// implemented in a React wrapper component using Klaro's API.

const klaroConfig = {
    // The name of the cookie that stores the user's consent decisions.
    cookieName: 'klaro_consent',

    // Browsers treat cookies set for cheapquickvegan.com differently from www.cheapquickvegan.com unless you include the leading dot:
    cookieDomain: ".cheapquickvegan.com",

    cookieExpiresAfterDays: 365,

    storageMethod: 'cookie',

    // The default language for the consent dialog.
    defaultLang: 'en',

    privacyPolicy: 'https://www.cheapquickvegan.com/privacy-policy',

    // The element where the consent notice should be attached.
    elementID: 'klaro',

    default: true, // globally, all services opted-in by default

    mustConsent: true, // ✅ force the GDPR banner

    // Define the purposes (categories) your services fall into.
    // The user must consent to a purpose before services in that purpose can run.
    purposes: [
        {
            id: 'strictly-necessary',
            name: 'Strictly Necessary',
            description: 'These are cookies and storage required for the basic functionality of the website, such as managing your user session or shopping cart state. They cannot be disabled.',
            required: true,
        },
        {
            id: 'analytics',
            name: 'Performance & Analytics',
            description: 'These services help us understand how visitors interact with our website by collecting and reporting information anonymously, allowing us to improve speed and content.',
            default: true, // ✅ opt in by default
        },
        // Placeholder for future advertising services like AdSense/Google Ads
        {
            id: 'advertising',
            name: 'Advertising & Marketing',
            description: 'These services are used to deliver advertisements more relevant to you and your interests. If you deny this, you will still see ads, but they will be generic.',
            required: false,
            default: true, // ✅ opt in by default
        },
    ],

    // Define the services (apps) used on the website.
    services: [
        {
            name: 'stripe-payment',
            title: 'Stripe Payment Processing',
            description: 'Handles the payment process and uses essential cookies for security and fraud prevention.',
            purposes: ['strictly-necessary'],
            required: true,
        },
        {
            name: 'vercel-analytics',
            title: 'Vercel Web Analytics',
            description: 'Collects anonymized data about page views and traffic to help us see popular recipes.',
            purposes: ['analytics'],
            default: true,
        },
        {
            name: 'vercel-speed',
            title: 'Vercel Speed Insights',
            description: 'Monitors site performance (Core Web Vitals) to ensure a fast and stable user experience.',
            purposes: ['analytics'],
            default: true,
        },
        // Placeholder for future services
        {
            name: 'instagram-embed',
            title: 'Instagram/Social Embeds',
            description: 'Allows embedding external content, which may track interaction.',
            purposes: ['advertising'], // Often categorized under marketing/tracking
            required: false,
            default: true,      // ✅ ensures this is on by default
        },
    ],

    // Localization strings
    translations: {
        en: {
            consentModal: {
                description: 'We use cookies and similar technologies to run this website and analyze its usage. You can consent to all or select specific categories.',
            },
            purposes: {
                'strictly-necessary': 'Strictly Necessary',
                'analytics': 'Performance & Analytics',
                'advertising': 'Advertising & Marketing',
            },
            'stripe-payment': {
                description: 'Handles the payment process and uses essential cookies for security and fraud prevention.',
            },
            'vercel-analytics': {
                description: 'Collects anonymized data about page views and traffic to help us see popular recipes.',
            },
            'vercel-speed': {
                description: 'Monitors site performance (Core Web Vitals) to ensure a fast and stable user experience.',
            }
        },
        // French translation for Canadian users
        fr: {
            consentModal: {
                description: 'Nous utilisons des cookies et technologies similaires pour faire fonctionner ce site web et analyser son utilisation. Vous pouvez consentir à tout ou sélectionner des catégories spécifiques.',
            },
            purposes: {
                'strictly-necessary': 'Strictement Nécessaire',
                'analytics': 'Performance et Analyse',
                'advertising': 'Publicité et Marketing',
            },
            'stripe-payment': {
                description: 'Gère le processus de paiement et utilise des cookies essentiels pour la sécurité et la prévention de la fraude.',
            },
            'vercel-analytics': {
                description: 'Collecte des données anonymisées sur les pages vues et le trafic pour nous aider à identifier les recettes populaires.',
            },
            'vercel-speed': {
                description: 'Surveille la performance du site (Core Web Vitals) pour assurer une expérience utilisateur rapide et stable.',
            }
        },
        // German translation
        de: {
            consentModal: {
                description: 'Wir nutzen Cookies und ähnliche Technologien zur Bereitstellung und Analyse unserer Website. Sie können allen zustimmen oder spezifische Kategorien auswählen.',
            },
            purposes: {
                'strictly-necessary': 'Unbedingt Notwendig',
                'analytics': 'Leistung & Analyse',
                'advertising': 'Werbung & Marketing',
            },
            'stripe-payment': {
                description: 'Verarbeitet Zahlungen und verwendet essentielle Cookies zur Sicherheit und Betrugsprävention.',
            },
            'vercel-analytics': {
                description: 'Sammelt anonymisierte Daten über Seitenaufrufe und Traffic, um uns bei der Analyse beliebter Rezepte zu helfen.',
            },
            'vercel-speed': {
                description: 'Überwacht die Website-Leistung (Core Web Vitals), um ein schnelles und stabiles Nutzererlebnis zu gewährleisten.',
            }
        }
    }
};

export default klaroConfig;

// You must manually load Klaro in your RootLayout.
// Import the configuration and initialize it in a useEffect hook:
// import * as klaro from 'klaro';
// import klaroConfig from './klaro-config.js';
// ...
// useEffect(() => {
//     klaro.setup(klaroConfig);
// }, []);