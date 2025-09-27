import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
      },
      orderBy: {
        enrollmentDate: "desc",
      },
    });

    return NextResponse.json({ students });
  } catch (error) {
    console.error("error fetching students", error);

    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, email, age, course } = await request.json();

    //create user first then create a student
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: "defaultpassword123 ",
        role: "STUDENT",
      },
    });

    const student = await prisma.student.create({
      data: {
        userId: user.id,
        age: parseInt(age),
        course,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
    return NextResponse.json({ student });
  } catch (error) {
    console.error("Error creating student:", error);
    return NextResponse.json(
      { error: "Failed to create student" },
      { status: 500 }
    );
  }
}
