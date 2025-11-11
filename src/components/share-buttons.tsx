'use client';
import { useState } from 'react';
import { Mail, Copy } from 'lucide-react';

interface ShareButtonsProps {
  postUrl: string;
  title: string;
}

export default function ShareButtons({ postUrl, title }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(postUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => window.print();

  return (
    <div className="flex gap-4 mt-4 flex-wrap">
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="hover:text-[#1877F2] transition"
        >
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="currentColor"
        >
            <path d="M22 12c0-5.522-4.478-10-10-10S2 6.478 2 12c0 5 3.657 9.128 8.438 9.878v-6.987H7.898v-2.891h2.54V9.845c0-2.507 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.772-1.63 1.562v1.875h2.773l-.443 2.891h-2.33v6.987C18.343 21.128 22 17 22 12z" />
        </svg>
        </a>
      <a
        href={`mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(postUrl)}`}
        className="hover:text-[#34A853] transition"
      >
        <Mail size={24} />
      </a>
      <button
    onClick={handleCopy}
    className={`flex items-center justify-center w-10 h-10 rounded-full border border-muted-foreground hover:bg-[#606C38] hover:text-white transition`}
    title={copied ? 'Copied!' : 'Copy Link'}
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 18H8V7h11v16z" />
    </svg>
  </button>

  {/* Print */}
  <button
    onClick={handlePrint}
    className="flex items-center justify-center w-10 h-10 rounded-full border border-muted-foreground hover:bg-[#BC6C25] hover:text-white transition"
    title="Print Recipe"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M19 8H5c-1.1 0-2 .9-2 2v6h4v4h10v-4h4v-6c0-1.1-.9-2-2-2zM17 18H7v-5h10v5zM19 4H5v2h14V4z" />
    </svg>
  </button>
    </div>
  );
}
