import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { courseSchema } from "@/lib/validation";

// GET - Fetch all courses
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const searchTerm = searchParams.get("searchTerm");
    const status = searchParams.get("status");
    const instructor = searchParams.get("instructor");

    // Build where clause for filtering
    const where: any = {};
    
    if (searchTerm) {
      where.OR = [
        { name: { contains: searchTerm, mode: "insensitive" } },
        { description: { contains: searchTerm, mode: "insensitive" } },
        { instructor: { contains: searchTerm, mode: "insensitive" } },
      ];
    }
    
    if (status) {
      where.status = status;
    }
    
    if (instructor) {
      where.instructor = { contains: instructor, mode: "insensitive" };
    }

    const courses = await prisma.course.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ courses });
  } catch (error) {
    console.error("Error fetching courses:", error);
    return NextResponse.json(
      { error: "Failed to fetch courses" },
      { status: 500 }
    );
  }
}

// POST - Create new course
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = courseSchema.parse(body);

    // Calculate end date based on start date and duration
    const startDate = new Date(validatedData.startDate);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + (validatedData.duration * 7)); // duration in weeks

    const course = await prisma.course.create({
      data: {
        ...validatedData,
        startDate,
        endDate,
      },
    });

    return NextResponse.json({ course }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating course:", error);
    
    if (error.name === "ZodError") {
      const fieldErrors: { [key: string]: string } = {};
      error.issues?.forEach((issue: any) => {
        if (issue.path && issue.path.length > 0) {
          fieldErrors[issue.path[0]] = issue.message;
        }
      });
      return NextResponse.json({ fieldErrors }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Failed to create course" },
      { status: 500 }
    );
  }
}