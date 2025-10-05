import { registerSchema } from "@/lib/validation";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { hashPassword } from "@/lib/password";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsedData = registerSchema.parse(body);

    //hashed password before storing
    const hashedPassword = await hashPassword(parsedData.password);

    const existingUser = await prisma.user.findUnique({
      where: { email: parsedData.email },
    });
    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 409 }
      );
    }

    //create user with hashed password
    const newUser = await prisma.user.create({
      data: {
        name: parsedData.name,
        email: parsedData.email,
        password: hashedPassword,
        role: parsedData.role,
      },
    });

    // If registering as a student, create student record too
    if (parsedData.role === "STUDENT") {
      await prisma.student.create({
        data: {
          userId: newUser.id,
          age: 22, // Default age - we'll make this configurable later
          courseId: null,
        },
      });
    }

    return NextResponse.json(
      {
        message: "user successfully registered",
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);

    // Better error handling
    if (error instanceof Error) {
      // Zod validation errors
      return NextResponse.json(
        { error: "Invalid input data", details: error.message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
