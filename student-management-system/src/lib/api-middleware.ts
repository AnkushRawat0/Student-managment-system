/**
 * 🔒 API Security Middleware
 * 
 * This middleware provides comprehensive security checks for API endpoints:
 * - Input sanitization
 * - Content-Type validation
 * - Request size limits
 * - XSS protection
 * - SQL injection prevention
 */

import { NextRequest } from 'next/server';
import { ZodSchema } from 'zod';
import { validateInputSafety, detectScriptInjection } from './sanitize';

// Security configuration
const SECURITY_CONFIG = {
  maxRequestSize: 1024 * 1024, // 1MB
  allowedContentTypes: ['application/json'],
  maxJsonDepth: 10,
};

export interface SecurityValidationResult {
  success: boolean;
  data?: any;
  error?: string;
  securityIssues?: string[];
}

/**
 * Validates request content type and size
 */
export function validateRequestSecurity(request: NextRequest): SecurityValidationResult {
  const contentType = request.headers.get('content-type') || '';
  const contentLength = parseInt(request.headers.get('content-length') || '0');

  // Check content type
  if (!SECURITY_CONFIG.allowedContentTypes.some(type => contentType.includes(type))) {
    return {
      success: false,
      error: 'Invalid content type',
      securityIssues: [`Unsupported content type: ${contentType}`]
    };
  }

  // Check request size
  if (contentLength > SECURITY_CONFIG.maxRequestSize) {
    return {
      success: false,
      error: 'Request too large',
      securityIssues: [`Request size ${contentLength} exceeds limit ${SECURITY_CONFIG.maxRequestSize}`]
    };
  }

  return { success: true };
}

/**
 * Validates JSON payload depth to prevent JSON bombs
 */
function validateJsonDepth(obj: any, depth = 0): boolean {
  if (depth > SECURITY_CONFIG.maxJsonDepth) {
    return false;
  }

  if (obj && typeof obj === 'object') {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (!validateJsonDepth(obj[key], depth + 1)) {
          return false;
        }
      }
    }
  }

  return true;
}

/**
 * Comprehensive security validation for request body
 */
export async function validateAndSanitizeRequest<T>(
  request: NextRequest,
  schema: ZodSchema<T>
): Promise<SecurityValidationResult> {
  try {
    // Step 1: Basic request security validation
    const securityCheck = validateRequestSecurity(request);
    if (!securityCheck.success) {
      return securityCheck;
    }

    // Step 2: Parse JSON safely
    let body: any;
    try {
      const text = await request.text();
      
      // Check for basic script injection in raw text
      if (detectScriptInjection(text)) {
        return {
          success: false,
          error: 'Malicious content detected',
          securityIssues: ['Script injection attempt detected in request body']
        };
      }

      body = JSON.parse(text);
    } catch (error) {
      return {
        success: false,
        error: 'Invalid JSON format',
        securityIssues: ['Malformed JSON in request body']
      };
    }

    // Step 3: Validate JSON depth
    if (!validateJsonDepth(body)) {
      return {
        success: false,
        error: 'Request structure too complex',
        securityIssues: ['JSON depth exceeds security limit']
      };
    }

    // Step 4: Comprehensive input safety validation
    const safetyResult = validateInputSafety(body);
    if (!safetyResult.isValid) {
      return {
        success: false,
        error: 'Security validation failed',
        securityIssues: safetyResult.reason ? [safetyResult.reason] : ['Input safety validation failed']
      };
    }

    // Step 5: Schema validation and sanitization
    const validationResult = schema.safeParse(body);
    if (!validationResult.success) {
      const errors = validationResult.error.issues.map((err: any) => 
        `${err.path.join('.')}: ${err.message}`
      );
      
      return {
        success: false,
        error: 'Validation failed',
        securityIssues: errors
      };
    }

    return {
      success: true,
      data: validationResult.data
    };

  } catch (error) {
    console.error('Security validation error:', error);
    return {
      success: false,
      error: 'Security validation failed',
      securityIssues: ['Unexpected error during security validation']
    };
  }
}

/**
 * Security headers for API responses
 */
export function getSecurityHeaders(): HeadersInit {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline';",
  };
}

/**
 * Creates a secure API response with proper headers
 */
export function createSecureResponse(
  data: any,
  status: number = 200,
  additionalHeaders?: HeadersInit
): Response {
  const headers = {
    'Content-Type': 'application/json',
    ...getSecurityHeaders(),
    ...additionalHeaders,
  };

  return new Response(JSON.stringify(data), {
    status,
    headers,
  });
}

/**
 * Creates a secure error response
 */
export function createSecureErrorResponse(
  message: string,
  status: number = 400,
  securityIssues?: string[]
): Response {
  const errorData = {
    error: message,
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV === 'development' && securityIssues && {
      securityIssues
    })
  };

  return createSecureResponse(errorData, status);
}

/**
 * Middleware wrapper for API routes with built-in security
 */
export function withSecurity<T>(
  handler: (data: T, request: NextRequest) => Promise<Response> | Response,
  schema: ZodSchema<T>
) {
  return async (request: NextRequest): Promise<Response> => {
    try {
      // Only validate body for non-GET requests
      if (request.method !== 'GET') {
        const validation = await validateAndSanitizeRequest(request, schema);
        
        if (!validation.success) {
          return createSecureErrorResponse(
            validation.error || 'Validation failed',
            400,
            validation.securityIssues
          );
        }

        return handler(validation.data!, request);
      } else {
        // For GET requests, just pass the request
        return handler({} as T, request);
      }
    } catch (error) {
      console.error('API Security Error:', error);
      return createSecureErrorResponse('Internal server error', 500);
    }
  };
}