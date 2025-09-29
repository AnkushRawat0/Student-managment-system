import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { updateCourseSchema } from "@/lib/validation";

// GET - Fetch single course
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const course = await prisma.course.findUnique({
      where: { id: params.id },
    });

    if (!course) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ course });
  } catch (error) {
    console.error("Error fetching course:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

// PUT - Update course
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const validatedData = updateCourseSchema.parse(body);

    // Check if course exists
    const existingCourse = await prisma.course.findUnique({
      where: { id: params.id },
    });

    if (!existingCourse) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: any = { ...validatedData };

    // If start date or duration is updated, recalculate end date
    if (validatedData.startDate || validatedData.duration) {
      const startDate = validatedData.startDate ? new Date(validatedData.startDate) : existingCourse.startDate;
      const duration = validatedData.duration ?? existingCourse.duration;
      
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + (duration * 7));
      updateData.endDate = endDate;
    }

    const course = await prisma.course.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json({ course });
  } catch (error: any) {
    console.error("Error updating course:", error);
    
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
      { error: "Failed to update course" },
      { status: 500 }
    );
  }
}

// DELETE - Delete course
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id: params.id },
    });

    if (!course) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      );
    }

    // Delete the course
    await prisma.course.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ 
      message: "Course deleted successfully" 
    });
  } catch (error) {
    console.error("Error deleting course:", error);
    return NextResponse.json(
      { error: "Failed to delete course" },
      { status: 500 }
    );
  }
}