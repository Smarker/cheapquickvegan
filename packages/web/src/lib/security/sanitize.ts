/**
 * Input Sanitization Utilities
 * Sanitizes user input to prevent XSS, email header injection, and other attacks
 *
 * Re-exports and extends the core sanitization functions from @/lib/sanitize
 */

import {
  sanitizeCommentText,
  sanitizeName,
  sanitizeEmail as sanitizeEmailCore,
  containsSuspiciousContent,
} from '@/lib/sanitize';

// Re-export core functions for consistency
export { sanitizeCommentText, sanitizeName, containsSuspiciousContent };

/**
 * Sanitizes a string by removing HTML tags and scripts
 * @param input - The string to sanitize
 * @param maxLength - Optional maximum length (defaults to no limit)
 * @returns Sanitized string
 */
export function sanitizeText(input: string, maxLength?: number): string {
  if (typeof input !== 'string') {
    return '';
  }

  let sanitized = input
    // Remove HTML tags
    .replace(/<[^>]*>/g, '')
    // Remove script content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Remove null bytes
    .replace(/\0/g, '')
    // Normalize whitespace
    .replace(/\s+/g, ' ')
    // Trim whitespace
    .trim();

  // Apply max length if specified
  if (maxLength && sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }

  return sanitized;
}

/**
 * Sanitizes an email address with validation
 * @param email - The email to sanitize
 * @returns Sanitized email or empty string if invalid
 */
export function sanitizeEmail(email: string): string {
  if (typeof email !== 'string') {
    return '';
  }

  const sanitized = sanitizeEmailCore(email)
    // Remove any characters that could be used for email header injection
    .replace(/[\r\n]/g, '')
    .replace(/[<>]/g, '');

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(sanitized)) {
    return '';
  }

  return sanitized;
}

/**
 * Sanitizes form data with specific rules for each field
 * @param data - Object containing form fields
 * @returns Sanitized data object
 */
export function sanitizeFormData(data: {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
  commentText?: string;
  [key: string]: any;
}): typeof data {
  const sanitized: any = {};

  if (data.name) {
    sanitized.name = sanitizeText(data.name, 100);
  }

  if (data.email) {
    sanitized.email = sanitizeEmail(data.email);
  }

  if (data.subject) {
    sanitized.subject = sanitizeText(data.subject, 200);
  }

  if (data.message) {
    sanitized.message = sanitizeText(data.message, 5000);
  }

  if (data.commentText) {
    sanitized.commentText = sanitizeText(data.commentText, 2000);
  }

  // Copy any other fields as-is (but sanitize strings)
  for (const key in data) {
    if (!(key in sanitized) && data[key] !== undefined) {
      if (typeof data[key] === 'string') {
        sanitized[key] = sanitizeText(data[key]);
      } else {
        sanitized[key] = data[key];
      }
    }
  }

  return sanitized;
}
