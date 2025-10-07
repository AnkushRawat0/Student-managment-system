/**
 * 🛡️ CSRF Protection System
 * 
 * Cross-Site Request Forgery (CSRF) protection implementation for Next.js
 * 
 * Features:
 * - CSRF token generation and validation
 * - Double-submit cookie pattern
 * - Synchronizer token pattern
 * - SameSite cookie protection
 * - Origin validation
 */

import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

// CSRF Configuration
const CSRF_CONFIG = {
  tokenLength: 32,
  cookieName: 'csrf-token',
  headerName: 'x-csrf-token',
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    maxAge: 60 * 60 * 24, // 24 hours
    path: '/',
  },
  // Exempt methods that should be read-only
  exemptMethods: ['GET', 'HEAD', 'OPTIONS'],
};
  
/**
 * Generate a cryptographically secure CSRF token
 */
export function generateCSRFToken(): string {
  return crypto.randomBytes(CSRF_CONFIG.tokenLength).toString('hex');
}

/**
 * Create CSRF token pair (for double-submit pattern)
 */
export function generateCSRFTokenPair(): {
  token: string;
  hashedToken: string;
} {
  const token = generateCSRFToken();
  const hashedToken = crypto
    .createHash('sha256')
    .update(token + (process.env.CSRF_SECRET || 'default-secret'))
    .digest('hex');
  
  return { token, hashedToken };
}

/**
 * Validate CSRF token against the stored hash
 */
export function validateCSRFToken(token: string, hashedToken: string): boolean {
  if (!token || !hashedToken) {
    return false;
  }

  const expectedHash = crypto
    .createHash('sha256')
    .update(token + (process.env.CSRF_SECRET || 'default-secret'))
    .digest('hex');

  // Use timing-safe comparison to prevent timing attacks
  return crypto.timingSafeEqual(
    Buffer.from(expectedHash, 'hex'),
    Buffer.from(hashedToken, 'hex')
  );
}

/**
 * Extract CSRF token from request headers or body
 */
export function extractCSRFToken(request: NextRequest): string | null {
  // Try header first
  const headerToken = request.headers.get(CSRF_CONFIG.headerName);
  if (headerToken) {
    return headerToken;
  }

  // Try form data for form submissions
  const contentType = request.headers.get('content-type') || '';
  if (contentType.includes('application/x-www-form-urlencoded')) {
    // For form submissions, token would be in body
    // This requires parsing the body, which is handled in the middleware
    return null;
  }

  return null;
}

/**
 * Validate request origin against allowed origins
 */
export function validateOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');
  
  // Get allowed origins from environment or use defaults
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
    'http://localhost:3000',
    'https://localhost:3000',
  ];

  // Check origin header
  if (origin && !allowedOrigins.includes(origin)) {
    return false;
  }

  // Check referer header as fallback
  if (!origin && referer) {
    const refererUrl = new URL(referer);
    const refererOrigin = `${refererUrl.protocol}//${refererUrl.host}`;
    return allowedOrigins.includes(refererOrigin);
  }

  return true;
}

/**
 * Set CSRF cookie in response
 */
export function setCSRFCookie(response: NextResponse, hashedToken: string): void {
  const cookieValue = hashedToken;
  
  response.cookies.set(CSRF_CONFIG.cookieName, cookieValue, CSRF_CONFIG.cookieOptions);
}

/**
 * Get CSRF token from cookies
 */
export function getCSRFTokenFromCookies(request: NextRequest): string | null {
  return request.cookies.get(CSRF_CONFIG.cookieName)?.value || null;
}

/**
 * Generate CSRF token for forms
 */
export function generateCSRFForForm(): {
  token: string;
  cookieToken: string;
} {
  const { token, hashedToken } = generateCSRFTokenPair();
  return {
    token, // Send this to the form as hidden field
    cookieToken: hashedToken // Set this in cookie
  };
}

/**
 * CSRF validation result interface
 */
export interface CSRFValidationResult {
  valid: boolean;
  error?: string;
  newToken?: string;
}

/**
 * Comprehensive CSRF validation
 */
export async function validateCSRFRequest(request: NextRequest): Promise<CSRFValidationResult> {
  // Skip validation for exempt methods
  if (CSRF_CONFIG.exemptMethods.includes(request.method)) {
    return { valid: true };
  }

  // 1. Validate origin
  if (!validateOrigin(request)) {
    return {
      valid: false,
      error: 'Invalid request origin'
    };
  }

  // 2. Get tokens
  const submittedToken = extractCSRFToken(request);
  const cookieToken = getCSRFTokenFromCookies(request);

  if (!submittedToken) {
    return {
      valid: false,
      error: 'CSRF token missing from request'
    };
  }

  if (!cookieToken) {
    return {
      valid: false,
      error: 'CSRF token missing from cookie'
    };
  }

  // 3. Validate token
  if (!validateCSRFToken(submittedToken, cookieToken)) {
    return {
      valid: false,
      error: 'Invalid CSRF token'
    };
  }

  // 4. Generate new token for next request (token rotation)
  const { token: newToken } = generateCSRFTokenPair();

  return {
    valid: true,
    newToken
  };
}

/**
 * CSRF middleware wrapper for API routes
 */
export function withCSRFProtection<T>(
  handler: (data: T, request: NextRequest) => Promise<Response> | Response,
  options: {
    validateToken?: boolean;
    rotateToken?: boolean;
  } = {}
) {
  return async (data: T, request: NextRequest): Promise<Response> => {
    const { validateToken = true, rotateToken = true } = options;

    try {
      // Skip CSRF validation for GET requests (they should be safe)
      if (request.method === 'GET') {
        return handler(data, request);
      }

      if (validateToken) {
        const validation = await validateCSRFRequest(request);
        
        if (!validation.valid) {
          return new Response(
            JSON.stringify({
              error: 'CSRF validation failed',
              message: validation.error,
              timestamp: new Date().toISOString(),
            }),
            {
              status: 403,
              headers: {
                'Content-Type': 'application/json',
                'X-Content-Type-Options': 'nosniff',
              },
            }
          );
        }
      }

      // Execute the handler
      const response = await handler(data, request);

      // Rotate CSRF token if requested
      if (rotateToken) {
        const { hashedToken } = generateCSRFTokenPair();
        
        // Add new token to response headers for client to update
        response.headers.set('X-New-CSRF-Token', hashedToken);
      }

      return response;

    } catch (error) {
      console.error('CSRF Protection Error:', error);
      
      return new Response(
        JSON.stringify({
          error: 'Security validation failed',
          timestamp: new Date().toISOString(),
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }
  };
}

/**
 * Generate CSRF token for API endpoint
 */
export async function generateCSRFTokenResponse(): Promise<Response> {
  const { token, hashedToken } = generateCSRFTokenPair();
  
  const response = new Response(
    JSON.stringify({
      csrfToken: token,
      message: 'CSRF token generated successfully',
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  // Set the hashed token in cookie
  response.headers.set(
    'Set-Cookie',
    `${CSRF_CONFIG.cookieName}=${hashedToken}; HttpOnly; Secure=${process.env.NODE_ENV === 'production'}; SameSite=Strict; Path=/; Max-Age=${CSRF_CONFIG.cookieOptions.maxAge}`
  );

  return response;
}

/**
 * Utility to check if request needs CSRF protection
 */
export function requiresCSRFProtection(request: NextRequest): boolean {
  return !CSRF_CONFIG.exemptMethods.includes(request.method);
}

/**
 * Environment variable validation for CSRF
 */
export function validateCSRFEnvironment(): {
  valid: boolean;
  missing: string[];
} {
  const required = ['CSRF_SECRET'];
  const missing: string[] = [];

  for (const key of required) {
    if (!process.env[key]) {
      missing.push(key);
    }
  }

  return {
    valid: missing.length === 0,
    missing,
  };
}