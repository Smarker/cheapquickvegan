/**
 * Input Sanitization Utilities
 *
 * Functions to sanitize and clean user input to prevent XSS and other
 * security vulnerabilities.
 */

/**
 * Sanitizes comment text by removing HTML tags and normalizing whitespace
 * @param text - The raw comment text from user input
 * @returns Sanitized text safe for storage and display
 */
export function sanitizeCommentText(text: string): string {
  // Remove any HTML tags
  let sanitized = text.replace(/<[^>]*>/g, '');

  // Remove any script-like content (extra safety)
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // Normalize whitespace (replace multiple spaces/newlines with single space/newline)
  sanitized = sanitized.replace(/[ \t]+/g, ' ');
  sanitized = sanitized.replace(/\n{3,}/g, '\n\n');

  // Trim leading/trailing whitespace
  sanitized = sanitized.trim();

  return sanitized;
}

/**
 * Sanitizes a name field
 * @param name - The raw name from user input
 * @returns Sanitized name or null if empty
 */
export function sanitizeName(name: string | null | undefined): string | null {
  if (!name || name.trim() === '') {
    return null;
  }

  // Remove HTML tags
  let sanitized = name.replace(/<[^>]*>/g, '');

  // Normalize whitespace
  sanitized = sanitized.replace(/\s+/g, ' ');

  // Trim
  sanitized = sanitized.trim();

  return sanitized || null;
}

/**
 * Sanitizes an email address
 * @param email - The raw email from user input
 * @returns Sanitized and normalized email
 */
export function sanitizeEmail(email: string): string {
  // Trim and lowercase
  return email.trim().toLowerCase();
}

/**
 * Checks if text contains suspicious patterns that might indicate spam or abuse
 * @param text - The text to check
 * @returns true if suspicious content detected
 */
export function containsSuspiciousContent(text: string): boolean {
  const suspiciousPatterns = [
    // Multiple URLs (likely spam)
    /(https?:\/\/[^\s]+.*https?:\/\/[^\s]+)/i,

    // Excessive capitalization
    /[A-Z]{20,}/,

    // Excessive repetition of characters
    /(.)\1{10,}/,

    // Common spam keywords (adjust as needed)
    /\b(viagra|cialis|casino|lottery|winner|congratulations|claim.*prize)\b/i,
  ];

  return suspiciousPatterns.some(pattern => pattern.test(text));
}
