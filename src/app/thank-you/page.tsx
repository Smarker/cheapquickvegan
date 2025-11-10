'use client';
import { useEffect, useState } from 'react';
import { CheckCircle } from 'lucide-react';

export default function ThankYouPage() {
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('session_id');
    if (id) setSessionId(id);
  }, []);

  return (
    <main className="min-h-screen flex flex-col justify-center items-center bg-[#FEFAE0] px-4 py-16">
      <div className="bg-white rounded-3xl shadow-lg p-8 max-w-lg text-center">
        <CheckCircle className="mx-auto text-[#606C38] w-16 h-16 mb-4" />
        <h1 className="text-4xl font-bold mb-4">Thank You! 🎉</h1>
        <p className="text-lg text-muted-foreground mb-6">
          Payment received — thank you for your order! Your <strong>15 Cheap Quick Vegan Recipes + Notion Bundle</strong> is ready.
        </p>

        {/* Buttons container */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-6">
          {/* Download button */}
          <a
            href="https://www.notion.so/28edfdc6ded5804aa9bcf4819823ece8?v=28edfdc6ded5818ba397000c963522b4&source=copy_link"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-6 py-3 bg-[#606C38] text-white rounded-lg font-medium transition transform hover:scale-105 hover:shadow-lg"
          >
            Get My Notion Bundle 💚
          </a>

          {/* Back to shop button */}
          <a
            href="/shop"
            className="inline-block px-6 py-3 border border-[#606C38] text-[#606C38] rounded-lg font-medium transition hover:bg-[#606C38] hover:text-white"
          >
            Back to Shop
          </a>
        </div>

        {sessionId && (
          <p className="text-sm text-muted-foreground">
            Session ID: <code>{sessionId}</code>
          </p>
        )}
      </div>
    </main>
  );
}
