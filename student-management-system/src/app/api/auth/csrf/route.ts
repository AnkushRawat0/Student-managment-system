/**
 * 🛡️ CSRF Token Generation API
 * 
 * GET /api/auth/csrf - Generate CSRF token for forms
 * 
 * This endpoint provides CSRF tokens that must be included
 * in all state-changing requests (POST, PUT, DELETE, PATCH)
 */

import { NextRequest } from 'next/server';
import { generateCSRFTokenResponse } from '@/lib/csrf';

export async function GET(request: NextRequest) {
  return generateCSRFTokenResponse();
}