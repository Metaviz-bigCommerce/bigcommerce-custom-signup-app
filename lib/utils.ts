/**
 * Shared utility functions used across the application
 */

/**
 * Extract name from form data object
 * Tries common field names and fuzzy matching
 */
export function extractName(data: Record<string, unknown>): string {
  if (!data || typeof data !== 'object') return '';
  
  const entries = Object.entries(data);
  const candidates = ['name', 'full_name', 'full name', 'first_name', 'first name'];
  
  for (const key of candidates) {
    const found = entries.find(([k]) => k.toLowerCase() === key);
    if (found && found[1] != null) {
      return String(found[1]);
    }
  }
  
  // Fuzzy: field containing 'name'
  const fuzzy = entries.find(([k]) => /name/i.test(k));
  if (fuzzy && fuzzy[1] != null) {
    return String(fuzzy[1]);
  }
  
  return '';
}

/**
 * Extract email from form data object
 * Tries common field names and fuzzy matching
 */
export function extractEmail(data: Record<string, unknown>): string {
  if (!data || typeof data !== 'object') return '';
  
  const entries = Object.entries(data);
  const candidates = ['email', 'e-mail', 'email_address', 'email address'];
  
  for (const key of candidates) {
    const found = entries.find(([k]) => k.toLowerCase() === key);
    if (found && found[1] != null) {
      const email = String(found[1]).trim().toLowerCase();
      if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return email;
      }
    }
  }
  
  // Fuzzy: field containing 'email'
  const fuzzy = entries.find(([k]) => /email/i.test(k));
  if (fuzzy && fuzzy[1] != null) {
    const email = String(fuzzy[1]).trim().toLowerCase();
    if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return email;
    }
  }
  
  return '';
}

/**
 * Format date from various formats (Firestore timestamp, ISO string, etc.)
 */
export function formatDate(timestamp: unknown): string {
  if (!timestamp) return '';
  
  if (typeof timestamp === 'string') {
    try {
      return new Date(timestamp).toLocaleString();
    } catch {
      return '';
    }
  }
  
  if (typeof timestamp === 'object' && timestamp !== null) {
    const ts = timestamp as { seconds?: number; nanoseconds?: number };
    if (typeof ts.seconds === 'number') {
      return new Date(ts.seconds * 1000).toLocaleString();
    }
  }
  
  if (timestamp instanceof Date) {
    return timestamp.toLocaleString();
  }
  
  return '';
}

/**
 * Get basename from a path or URL
 */
export function basename(value: unknown): string {
  const s = String(value ?? '');
  if (!s) return s;
  
  // If looks like URL or path, reduce to filename
  if (s.includes('/') || s.includes('\\')) {
    const parts = s.split(/[/\\]/);
    return parts[parts.length - 1] || s;
  }
  
  return s;
}

/**
 * Generate a unique request ID for tracking
 */
export function generateRequestId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Sanitize string input to prevent XSS
 */
export function sanitizeString(input: unknown, maxLength = 10000): string {
  if (typeof input !== 'string') return '';
  
  // Truncate if too long
  const truncated = input.length > maxLength ? input.substring(0, maxLength) : input;
  
  // Remove potentially dangerous characters but keep most unicode
  return truncated
    .replace(/[<>]/g, '') // Remove angle brackets
    .trim();
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim().toLowerCase());
}

