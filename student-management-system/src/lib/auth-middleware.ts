import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken, getTokenFromRequest } from './jwt';
import { prisma } from './prisma';


export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string;
    email: string;
    role: string;
    name: string;
  };
}


/**
 * Middleware to authenticate requests using JWT
 */
export async function authenticate(request: NextRequest) {
  try {
    // Get token from request
    const token = getTokenFromRequest(request);
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Verify token
    const payload = verifyAccessToken(token);

    // Get fresh user data from database
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      }
    });

    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 401 }
      );
    }

     // Add user to request (for TypeScript, we'll use headers)
    const response = NextResponse.next();
    response.headers.set('X-User-Id', user.id);
    response.headers.set('X-User-Email', user.email);
    response.headers.set('X-User-Role', user.role);
    response.headers.set('X-User-Name', user.name);


    
    return response;

  } catch (error) {
    console.error('Authentication error:', error);
    
    return NextResponse.json(
      { error: 'Invalid or expired token' },
      { status: 401 }
    );
  }
}

/**
 * Check if user has required role
 */
export function requireRole(allowedRoles: string[]) {
  return async function(request: NextRequest) {
    const authResult = await authenticate(request);
    
    if (authResult.status !== 200) {
      return authResult;
    }

    const userRole = authResult.headers.get('X-User-Role');
    
    if (!userRole || !allowedRoles.includes(userRole)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    return NextResponse.next();
  };
}

/**
 * Extract authenticated user from request headers (after middleware)
 */
export function getAuthenticatedUser(request: NextRequest) {
  const userId = request.headers.get('X-User-Id');
  const userEmail = request.headers.get('X-User-Email');
  const userRole = request.headers.get('X-User-Role');
  const userName = request.headers.get('X-User-Name');

  if (!userId || !userEmail || !userRole || !userName) {
    return null;
  }

  return {
    id: userId,
    email: userEmail,
    role: userRole,
    name: userName,
  };
}

