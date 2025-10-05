import { loginSchmea } from "@/lib/validation";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { verifyPassword } from "@/lib/password";
import { generateTokens } from "@/lib/jwt";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsedData = loginSchmea.parse(body);

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: parsedData.email }
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // ✅ SECURE: Verify password against hash
    const isValidPassword = await verifyPassword(parsedData.password, user.password);

    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // ✅ NEW: Generate JWT tokens
    const tokens = generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role
    });

    // ✅ FIXED: Create response object first
    const response = NextResponse.json({
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      tokens: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresIn: tokens.expiresIn // ✅ FIXED: Added missing comma
      }
    }, { status: 200 });

    // ✅ FIXED: Set tokens in HTTP-only cookies for additional security
    response.cookies.set('accessToken', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3600 // 1 hour
    });

    response.cookies.set('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 604800 // 7 days
    });

    return response;

    }
    catch(error){
        console.error("Login Error:", error);
        
        if (error instanceof Error) {
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