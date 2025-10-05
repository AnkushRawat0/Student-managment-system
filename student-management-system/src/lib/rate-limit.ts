/**
 * 🚦 Advanced Rate Limiting System
 * 
 * This module provides comprehensive rate limiting for different types of endpoints:
 * - Authentication endpoints (stricter limits)
 * - General API endpoints (moderate limits)
 * - Public endpoints (generous limits)
 * 
 * Features:
 * - IP-based rate limiting
 * - User-based rate limiting (for authenticated routes)
 * - Different limits for different endpoint types
 * - Sliding window algorithm
 * - Configurable limits and windows
 */

import { NextRequest } from 'next/server';

// Rate limiting configuration
export interface RateLimitConfig {
  windowMs: number;     // Time window in milliseconds
  maxRequests: number;  // Maximum requests per window
  keyGenerator?: (request: NextRequest) => string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

// Predefined rate limit configurations
export const RATE_LIMIT_CONFIGS = {
  // Authentication endpoints (stricter)
  AUTH: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,            // 5 attempts per 15 minutes
    skipSuccessfulRequests: true, // Don't count successful logins
  },
  
  // Sensitive operations (moderate)
  SENSITIVE: {
    windowMs: 60 * 1000,      // 1 minute
    maxRequests: 10,          // 10 requests per minute
  },
  
  // General API endpoints
  API: {
    windowMs: 60 * 1000,      // 1 minute  
    maxRequests: 100,         // 100 requests per minute
  },
  
  // Public endpoints (generous)
  PUBLIC: {
    windowMs: 60 * 1000,      // 1 minute
    maxRequests: 1000,        // 1000 requests per minute
  }
} as const;

// In-memory store for rate limiting (in production, use Redis)
class RateLimitStore {
  private store = new Map<string, { count: number; resetTime: number; requests: number[] }>();
  
  // Clean expired entries periodically
  private cleanupInterval: NodeJS.Timeout;
  
  constructor() {
    // Clean up expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }
  
  private cleanup() {
    const now = Date.now();
    for (const [key, data] of this.store.entries()) {
      if (data.resetTime < now) {
        this.store.delete(key);
      }
    }
  }
  
  get(key: string): { count: number; resetTime: number } | null {
    const data = this.store.get(key);
    if (!data) return null;
    
    const now = Date.now();
    if (data.resetTime < now) {
      this.store.delete(key);
      return null;
    }
    
    return { count: data.count, resetTime: data.resetTime };
  }
  
  // Sliding window implementation
  increment(key: string, windowMs: number): { count: number; resetTime: number } {
    const now = Date.now();
    const windowStart = now - windowMs;
    
    let data = this.store.get(key);
    
    if (!data) {
      data = { count: 0, resetTime: now + windowMs, requests: [] };
      this.store.set(key, data);
    }
    
    // Remove requests outside the window
    data.requests = data.requests.filter(time => time > windowStart);
    
    // Add current request
    data.requests.push(now);
    data.count = data.requests.length;
    
    // Update reset time if needed
    if (data.resetTime < now) {
      data.resetTime = now + windowMs;
    }
    
    return { count: data.count, resetTime: data.resetTime };
  }
  
  destroy() {
    clearInterval(this.cleanupInterval);
    this.store.clear();
  }
}

// Global rate limit store
const rateLimitStore = new RateLimitStore();

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}

/**
 * Default key generator - uses IP address
 */
function defaultKeyGenerator(request: NextRequest): string {
  // Try to get real IP from headers (for production behind proxies)
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const cfConnectingIp = request.headers.get('cf-connecting-ip');
  
  let ip = forwarded?.split(',')[0]?.trim() || 
           cfConnectingIp || 
           realIp || 
           'unknown';
  
  // Remove port if present
  ip = ip.replace(/:\d+$/, '');
  
  return `ip:${ip}`;
}

/**
 * User-based key generator (for authenticated routes)
 */
export function createUserKeyGenerator(prefix: string = 'user') {
  return (request: NextRequest, userId?: string): string => {
    if (userId) {
      return `${prefix}:${userId}`;
    }
    
    // Fallback to IP-based if no user ID
    return defaultKeyGenerator(request);
  };
}

/**
 * Combined key generator (IP + User)
 */
export function createCombinedKeyGenerator(prefix: string = 'combined') {
  return (request: NextRequest, userId?: string): string => {
    const ipKey = defaultKeyGenerator(request);
    if (userId) {
      return `${prefix}:${userId}:${ipKey}`;
    }
    return ipKey;
  };
}

/**
 * Check rate limit for a request
 */
export function checkRateLimit(
  request: NextRequest,
  config: RateLimitConfig,
  additionalKey?: string
): RateLimitResult {
  // Generate key
  const keyGenerator = config.keyGenerator || defaultKeyGenerator;
  let key: string;
  
  if (keyGenerator.length > 1) {
    // Key generator expects additional parameter (like userId)
    key = (keyGenerator as any)(request, additionalKey);
  } else {
    key = keyGenerator(request);
  }
  
  // Add endpoint-specific prefix to prevent collisions
  const endpoint = new URL(request.url).pathname;
  const fullKey = `${endpoint}:${key}`;
  
  // Check current count
  const current = rateLimitStore.get(fullKey);
  const now = Date.now();
  
  if (!current) {
    // First request
    const result = rateLimitStore.increment(fullKey, config.windowMs);
    return {
      allowed: true,
      limit: config.maxRequests,
      remaining: config.maxRequests - result.count,
      resetTime: result.resetTime,
    };
  }
  
  // Check if limit exceeded
  if (current.count >= config.maxRequests) {
    const retryAfter = Math.ceil((current.resetTime - now) / 1000);
    return {
      allowed: false,
      limit: config.maxRequests,
      remaining: 0,
      resetTime: current.resetTime,
      retryAfter: retryAfter > 0 ? retryAfter : 1,
    };
  }
  
  // Increment counter
  const result = rateLimitStore.increment(fullKey, config.windowMs);
  
  return {
    allowed: true,
    limit: config.maxRequests,
    remaining: config.maxRequests - result.count,
    resetTime: result.resetTime,
  };
}

/**
 * Create rate limit headers for response
 */
export function createRateLimitHeaders(result: RateLimitResult): HeadersInit {
  const headers: HeadersInit = {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': Math.ceil(result.resetTime / 1000).toString(),
  };
  
  if (result.retryAfter) {
    headers['Retry-After'] = result.retryAfter.toString();
  }
  
  return headers;
}

/**
 * Rate limiting middleware wrapper
 */
export function withRateLimit<T>(
  handler: (data: T, request: NextRequest) => Promise<Response> | Response,
  config: RateLimitConfig,
  options: {
    getUserId?: (request: NextRequest) => Promise<string | null> | string | null;
    onLimitExceeded?: (result: RateLimitResult, request: NextRequest) => Response;
  } = {}
) {
  return async (data: T, request: NextRequest): Promise<Response> => {
    try {
      // Get user ID if available
      let userId: string | null = null;
      if (options.getUserId) {
        userId = await options.getUserId(request);
      }
      
      // Check rate limit
      const rateLimitResult = checkRateLimit(request, config, userId || undefined);
      
      if (!rateLimitResult.allowed) {
        // Rate limit exceeded
        if (options.onLimitExceeded) {
          return options.onLimitExceeded(rateLimitResult, request);
        }
        
        const headers = {
          'Content-Type': 'application/json',
          ...createRateLimitHeaders(rateLimitResult),
        };
        
        return new Response(
          JSON.stringify({
            error: 'Rate limit exceeded',
            message: `Too many requests. Try again in ${rateLimitResult.retryAfter} seconds.`,
            retryAfter: rateLimitResult.retryAfter,
          }),
          { status: 429, headers }
        );
      }
      
      // Execute handler
      const response = await handler(data, request);
      
      // Add rate limit headers to successful responses
      const rateLimitHeaders = createRateLimitHeaders(rateLimitResult);
      Object.entries(rateLimitHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
      });
      
      return response;
    } catch (error) {
      console.error('Rate limiting error:', error);
      // Continue without rate limiting if there's an error
      return handler(data, request);
    }
  };
}

/**
 * Simple rate limit check for use in API routes
 */
export async function enforceRateLimit(
  request: NextRequest,
  config: RateLimitConfig,
  userId?: string
): Promise<Response | null> {
  const result = checkRateLimit(request, config, userId);
  
  if (!result.allowed) {
    const headers = {
      'Content-Type': 'application/json',
      ...createRateLimitHeaders(result),
    };
    
    return new Response(
      JSON.stringify({
        error: 'Rate limit exceeded',
        message: `Too many requests. Try again in ${result.retryAfter} seconds.`,
        retryAfter: result.retryAfter,
      }),
      { status: 429, headers }
    );
  }
  
  return null; // No rate limit violation
}

// Cleanup function for graceful shutdown
export function cleanupRateLimit() {
  rateLimitStore.destroy();
}