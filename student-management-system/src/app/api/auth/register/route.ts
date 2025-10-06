import { registerSchema, RegisterInput } from "@/lib/validation";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";
import { hashPassword } from "@/lib/password";
import { withSecurity, createSecureResponse, createSecureErrorResponse } from "@/lib/api-middleware";
import { encodeOutput } from "@/lib/sanitize";
import { RATE_LIMIT_CONFIGS } from "@/lib/rate-limit";

// Secure registration endpoint with rate limiting and enhanced security
export const POST = withSecurity(async (data: RegisterInput, request: NextRequest) => {
  try {
    const { name, email, password, role } = data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return createSecureErrorResponse("User already exists", 409);
    }

    // Hash password before storing
    const hashedPassword = await hashPassword(password);

    // Create user with hashed password (name and email already sanitized by validation)
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
      },
    });

    // If registering as a student, create student record too
    if (role === "STUDENT") {
      await prisma.student.create({
        data: {
          userId: newUser.id,
          age: 22, // Default age - we'll make this configurable later
          courseId: null,
        },
      });
    }

    // Sanitize output data to prevent XSS
    const sanitizedUser = {
      id: newUser.id,
      name: encodeOutput(newUser.name),
      email: encodeOutput(newUser.email),
      role: newUser.role,
    };

    return createSecureResponse({
      message: "User successfully registered",
      user: sanitizedUser,
    }, 201);

  } catch (error) {
    console.error("Registration error:", error);
    
    // Check for specific Prisma errors
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return createSecureErrorResponse("Email already exists", 409);
    }
    
    return createSecureErrorResponse("Registration failed", 500);
  }
}, registerSchema, {
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 3,            // Only 3 registrations per 15 minutes per IP
  },
  skipCSRF: true // Skip CSRF for now (can be enabled later)
});
