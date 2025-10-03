import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { updateCoachSchema } from "@/lib/validation";

// GET - Fetch single coach
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const coach = await prisma.coach.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true
          }
        }
      }
    });

    if (!coach) {
      return NextResponse.json(
        { error: "Coach not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ coach });
  } catch (error) {
    console.error("Error fetching coach:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

// PUT - Update coach
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validatedData = updateCoachSchema.parse(body);

    // Check if coach exists
    const existingCoach = await prisma.coach.findUnique({
      where: { id },
      include: { user: true }
    });

    if (!existingCoach) {
      return NextResponse.json(
        { error: "Coach not found" },
        { status: 404 }
      );
    }

    // Prepare update data for user and coach
    const updateUserData: any = {};
    const updateCoachData: any = {};

    // Update user information if provided
    if (validatedData.name) updateUserData.name = validatedData.name;
    if (validatedData.email) updateUserData.email = validatedData.email;

    // Update coach information if provided
    if (validatedData.subject) updateCoachData.subject = validatedData.subject;

    // Update in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update user if there's user data to update
      if (Object.keys(updateUserData).length > 0) {
        await tx.user.update({
          where: { id: existingCoach.userId },
          data: updateUserData
        });
      }

      // Update coach if there's coach data to update
      let updatedCoach;
      if (Object.keys(updateCoachData).length > 0) {
        updatedCoach = await tx.coach.update({
          where: { id },
          data: updateCoachData,
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true
              }
            }
          }
        });
      } else {
        // Refetch with updated user data
        updatedCoach = await tx.coach.findUnique({
          where: { id },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true
              }
            }
          }
        });
      }

      return updatedCoach;
    });

    return NextResponse.json({ coach: result });
  } catch (error: any) {
    console.error("Error updating coach:", error);
    
    if (error.name === "ZodError") {
      const fieldErrors: { [key: string]: string } = {};
      error.issues?.forEach((issue: any) => {
        if (issue.path && issue.path.length > 0) {
          fieldErrors[issue.path[0]] = issue.message;
        }
      });
      
      return NextResponse.json(
        { error: "Validation failed", fieldErrors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update coach" },
      { status: 500 }
    );
  }
}

// DELETE - Delete coach
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Find the coach first to get the user ID
    const coach = await prisma.coach.findUnique({
      where: { id },
      include: { user: true }
    });

    if (!coach) {
      return NextResponse.json(
        { error: "Coach not found" },
        { status: 404 }
      );
    }

    // Delete coach and associated user in transaction
    await prisma.$transaction(async (tx) => {
      // Delete coach (this will cascade delete due to our schema)
      await tx.coach.delete({
        where: { id }
      });

      // Delete the associated user
      await tx.user.delete({
        where: { id: coach.userId }
      });
    });

    return NextResponse.json({ 
      message: "Coach deleted successfully" 
    });
  } catch (error) {
    console.error("Error deleting coach:", error);
    return NextResponse.json(
      { error: "Failed to delete coach" },
      { status: 500 }
    );
  }
}