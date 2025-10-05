import { loginSchema, LoginInput } from "@/lib/validation";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";
import { verifyPassword } from "@/lib/password";
import { generateTokens } from "@/lib/jwt";
import { withSecurity, createSecureResponse, createSecureErrorResponse } from "@/lib/api-middleware";
import { encodeOutput } from "@/lib/sanitize";
import { RATE_LIMIT_CONFIGS } from "@/lib/rate-limit";

// Secure login endpoint with rate limiting, validation, and sanitization
export const POST = withSecurity(async (data: LoginInput, request: NextRequest) => {
  try {
    const { email, password } = data;

    // Find user by email (email is already sanitized by validation schema)
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      // ⚠️ Security: Use generic error message to prevent user enumeration
      return createSecureErrorResponse("Invalid credentials", 401);
    }

    // ✅ SECURE: Verify password against hash
    const isValidPassword = await verifyPassword(password, user.password);

    if (!isValidPassword) {
      return createSecureErrorResponse("Invalid credentials", 401);
    }

    // ✅ Generate JWT tokens
    const tokens = generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role
    });

    // ✅ SECURE: Sanitize output data to prevent XSS
    const sanitizedUser = {
      id: user.id,
      name: encodeOutput(user.name),
      email: encodeOutput(user.email),
      role: user.role
    };

    // Create secure response with tokens
    const responseData = {
      message: "Login successful",
      user: sanitizedUser,
      tokens: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresIn: tokens.expiresIn
      }
    };

    // Create response with security headers
    const response = createSecureResponse(responseData, 200, {
      'Set-Cookie': [
        `accessToken=${tokens.accessToken}; HttpOnly; Secure=${process.env.NODE_ENV === 'production'}; SameSite=Strict; Max-Age=3600; Path=/`,
        `refreshToken=${tokens.refreshToken}; HttpOnly; Secure=${process.env.NODE_ENV === 'production'}; SameSite=Strict; Max-Age=604800; Path=/`
      ].join(', ')
    });

    return response;

  } catch (error) {
    console.error("Login Error:", error);
    return createSecureErrorResponse("Authentication failed", 500);
  }
}, loginSchema, {
  rateLimit: RATE_LIMIT_CONFIGS.AUTH // 5 attempts per 15 minutes
});