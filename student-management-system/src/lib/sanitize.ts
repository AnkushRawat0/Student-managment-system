/**
 * Server-side Input sanitization utilities to prevent XSS attacks and ensure data integrity
 * Pure Node.js implementation - no DOM dependencies
 */

/**
 * Remove HTML tags and potential XSS vectors from input
 */
export function sanitizeHtml(input: string): string {
  try {
    if (!input || typeof input !== 'string') {
      return '';
    }

    // Remove HTML tags, scripts, and dangerous content
    let clean = input
      // Remove script tags and content
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      // Remove style tags and content
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      // Remove all HTML tags
      .replace(/<[^>]*>/g, '')
      // Remove HTML entities that could be dangerous
      .replace(/&(?:lt|gt|quot|apos|amp);/g, (match) => {
        const entities: Record<string, string> = {
          '&lt;': '<',
          '&gt;': '>',
          '&quot;': '"',
          '&apos;': "'",
          '&amp;': '&'
        };
        return entities[match] || match;
      })
      // Remove javascript: and data: protocols
      .replace(/javascript:/gi, '')
      .replace(/data:/gi, '')
      // Remove common XSS vectors
      .replace(/on\w+\s*=/gi, '')
      .replace(/expression\s*\(/gi, '')
      .replace(/vbscript:/gi, '')
      .replace(/livescript:/gi, '');

    return clean.trim();
  } catch (error) {
    console.error('HTML sanitization error:', error);
    // Fallback: basic tag removal
    return typeof input === 'string' ? input.replace(/<[^>]*>/g, '').trim() : '';
  }
}

/**
 * Sanitize user name input - only letters, spaces, hyphens, apostrophes, dots
 */
export function sanitizeName(input: string): string {
  try {
    if (!input || typeof input !== 'string') {
      return '';
    }

    // Remove any HTML first
    const htmlCleaned = sanitizeHtml(input);
    
    // Allow only safe characters for names (letters, spaces, hyphens, apostrophes, dots)
    const namePattern = /[^a-zA-Z\s\-'\.]/g;
    const sanitized = htmlCleaned.replace(namePattern, '');
    
    // Remove excessive whitespace and trim
    return sanitized.replace(/\s+/g, ' ').trim();
  } catch (error) {
    console.error('Name sanitization error:', error);
    // Fallback: return empty string if sanitization fails
    return '';
  }
}

/**
 * Sanitize email input - basic cleanup before validation
 */
export function sanitizeEmail(input: string): string {
  try {
    if (!input || typeof input !== 'string') {
      return '';
    }

    // Remove HTML and trim
    const htmlCleaned = sanitizeHtml(input);
    
    // Remove any characters that shouldn't be in an email
    const emailPattern = /[^a-zA-Z0-9@._\-+]/g;
    const sanitized = htmlCleaned.replace(emailPattern, '');
    
    return sanitized.toLowerCase().trim();
  } catch (error) {
    console.error('Email sanitization error:', error);
    // Fallback: return the original input (better than breaking)
    return typeof input === 'string' ? input.toLowerCase().trim() : '';
  }
}

/**
 * Sanitize general text input (descriptions, etc.)
 */
export function sanitizeText(input: string, maxLength: number = 1000): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  // Remove HTML tags but keep content
  const htmlCleaned = sanitizeHtml(input);
  
  // Remove potentially dangerous characters
  const dangerousPattern = /[<>\"'&`]/g;
  let sanitized = htmlCleaned.replace(dangerousPattern, '');
  
  // Limit length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }
  
  // Clean up whitespace
  return sanitized.replace(/\s+/g, ' ').trim();
}

/**
 * Detect potential script injection attempts
 */
export function detectScriptInjection(input: string): boolean {
  if (!input || typeof input !== 'string') {
    return false;
  }

  // Common script injection patterns
  const dangerousPatterns = [
    /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe[\s\S]*?>/gi,
    /<object[\s\S]*?>/gi,
    /<embed[\s\S]*?>/gi,
    /<link[\s\S]*?>/gi,
    /<meta[\s\S]*?>/gi,
    /eval\s*\(/gi,
    /expression\s*\(/gi,
    /vbscript:/gi,
    /data:text\/html/gi,
  ];

  return dangerousPatterns.some(pattern => pattern.test(input));
}

/**
 * Sanitize and validate course/subject names
 */
export function sanitizeCourseName(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  // Remove HTML
  const htmlCleaned = sanitizeHtml(input);
  
  // Allow letters, numbers, spaces, common punctuation for course names
  const coursePattern = /[^a-zA-Z0-9\s\-_().,&+]/g;
  const sanitized = htmlCleaned.replace(coursePattern, '');
  
  return sanitized.replace(/\s+/g, ' ').trim();
}

/**
 * Comprehensive input sanitizer with type-specific cleaning
 */
export function sanitizeInput(input: string, type: 'name' | 'email' | 'text' | 'course' = 'text'): string {
  switch (type) {
    case 'name':
      return sanitizeName(input);
    case 'email':
      return sanitizeEmail(input);
    case 'course':
      return sanitizeCourseName(input);
    case 'text':
    default:
      return sanitizeText(input);
  }
}

/**
 * Validate that input doesn't contain malicious content
 */
export function validateInputSafety(input: string): { 
  isValid: boolean; 
  reason?: string; 
} {
  if (!input || typeof input !== 'string') {
    return { isValid: true };
  }

  // Check for script injection
  if (detectScriptInjection(input)) {
    return { 
      isValid: false, 
      reason: 'Input contains potentially malicious content' 
    };
  }

  // Check for excessive length
  if (input.length > 10000) {
    return { 
      isValid: false, 
      reason: 'Input exceeds maximum allowed length' 
    };
  }

  // Check for binary or control characters
  const controlCharPattern = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g;
  if (controlCharPattern.test(input)) {
    return { 
      isValid: false, 
      reason: 'Input contains invalid control characters' 
    };
  }

  return { isValid: true };
}

/**
 * Safe string encoding for output
 */
export function encodeOutput(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}
