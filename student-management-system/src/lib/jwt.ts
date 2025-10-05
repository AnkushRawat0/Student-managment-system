import jwt, { SignOptions, VerifyOptions } from 'jsonwebtoken';
import { NextRequest } from 'next/server';

// JWT payload interface
export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

// Token response interface
export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

/**
 * Generate JWT access and refresh tokens
 */
export function generateTokens(payload: Omit<JWTPayload, 'iat' | 'exp'>): TokenResponse {
  const accessSecret = process.env.JWT_SECRET;
  const refreshSecret = process.env.JWT_REFRESH_SECRET;

  if (!accessSecret || !refreshSecret) {
    throw new Error('JWT secrets not configured in environment variables');
  }

  // Generate access token (short-lived)
  const accessToken = jwt.sign(
    payload,
    accessSecret,
    { 
      expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '1h'
    } as SignOptions
  );

  // Generate refresh token (long-lived)  
  const refreshToken = jwt.sign(
    { userId: payload.userId },
    refreshSecret,
    { 
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
    } as SignOptions
  );

  return {
    accessToken,
    refreshToken,
    expiresIn: 3600 // 1 hour in seconds
  };
}

/**
 * Verify JWT access token
 */
export function verifyAccessToken(token: string): JWTPayload {
  const secret = process.env.JWT_SECRET;
  
  if (!secret) {
    throw new Error('JWT_SECRET not configured');
  }

  try {
    const decoded = jwt.verify(token, secret) as JWTPayload;
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token expired');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid token');
    }
    throw new Error('Token verification failed');
  }
}

/**
 * Verify JWT refresh token
 */
export function verifyRefreshToken(token: string): { userId: string } {
  const secret = process.env.JWT_REFRESH_SECRET;
  
  if (!secret) {
    throw new Error('JWT_REFRESH_SECRET not configured');
  }

  try {
    const decoded = jwt.verify(token, secret) as { userId: string };
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Refresh token expired');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid refresh token');
    }
    throw new Error('Refresh token verification failed');
  }
}

/**
 * Extract token from Authorization header
 */
export function getTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  return authHeader.substring(7); // Remove 'Bearer ' prefix
}

/**
 * Extract token from cookies (alternative method)
 */
export function getTokenFromCookies(request: NextRequest): string | null {
  return request.cookies.get('accessToken')?.value || null;
}

/**
 * Get token from request (tries both header and cookies)
 */
export function getTokenFromRequestAny(request: NextRequest): string | null {
  // First try Authorization header
  const headerToken = getTokenFromRequest(request);
  if (headerToken) {
    return headerToken;
  }
  
  // Fallback to cookies
  return getTokenFromCookies(request);
}

/**
 * Validate JWT payload structure
 */
export function validateJWTPayload(payload: any): payload is JWTPayload {
  return (
    payload &&
    typeof payload.userId === 'string' &&
    typeof payload.email === 'string' &&
    typeof payload.role === 'string'
  );
}