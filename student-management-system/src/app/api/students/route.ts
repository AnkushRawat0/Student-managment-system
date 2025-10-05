import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { studentSchema } from "@/lib/validation";
import { withSecurity, createSecureResponse, createSecureErrorResponse } from "@/lib/api-middleware";
import { encodeOutput } from "@/lib/sanitize";
import { hashPassword } from "@/lib/password";

export async function GET() {
  try {
    const students = await prisma.student.findMany({
     include: {
  user: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
  course: {
    select: {
      id: true,
      name: true,
      description: true,
    },
  },
},
      orderBy: {
        enrollmentDate: "desc",
      },
    });

    // Sanitize output data to prevent XSS
    const sanitizedStudents = students.map(student => ({
      ...student,
      user: {
        ...student.user,
        name: encodeOutput(student.user.name),
        email: encodeOutput(student.user.email),
      },
      course: student.course ? {
        ...student.course,
        name: encodeOutput(student.course.name),
        description: encodeOutput(student.course.description),
      } : null
    }));

    return createSecureResponse({ students: sanitizedStudents });
  } catch (error) {
    console.error("error fetching students", error);
    return createSecureErrorResponse("Failed to fetch students", 500);
  }
}

// Secure POST endpoint with input validation and sanitization
export const POST = withSecurity(async (data, request) => {
  try {
    const { name, email, age, courseId } = data;

    // Check if user with this email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return createSecureErrorResponse("User with this email already exists", 409);
    }

    // Generate a secure temporary password (in production, send via email)
    const tempPassword = `Temp${Math.random().toString(36).substring(2, 15)}!`;
    const hashedPassword = await hashPassword(tempPassword);

    // Create user first then create a student
    const user = await prisma.user.create({
      data: {
        name, // Already sanitized by validation schema
        email, // Already sanitized by validation schema
        password: hashedPassword,
        role: "STUDENT",
      },
    });

    const student = await prisma.student.create({
      data: {
        userId: user.id,
        age,
        courseId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        course: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
    });

    // Sanitize output data
    const sanitizedStudent = {
      ...student,
      user: {
        ...student.user,
        name: encodeOutput(student.user.name),
        email: encodeOutput(student.user.email),
      },
      course: student.course ? {
        ...student.course,
        name: encodeOutput(student.course.name),
        description: encodeOutput(student.course.description),
      } : null
    };

    // In development, return the temp password (in production, send via email)
    const responseData = {
      student: sanitizedStudent,
      ...(process.env.NODE_ENV === 'development' && {
        tempPassword,
        message: "Student created successfully. Temporary password provided for development."
      })
    };

    return createSecureResponse(responseData, 201);
  } catch (error) {
    console.error("Error creating student:", error);
    
    // Check for specific Prisma errors
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return createSecureErrorResponse("Email already exists", 409);
    }
    
    return createSecureErrorResponse("Failed to create student", 500);
  }
}, studentSchema, {
  rateLimit: { windowMs: 60 * 1000, maxRequests: 10 } // 10 student creations per minute
});
