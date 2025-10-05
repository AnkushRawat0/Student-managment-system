import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { coachSchema, coachAssignmentSchema } from "@/lib/validation";

// GET all coaches with their assigned courses
export async function GET() {
  try {
    const coaches = await prisma.coach.findMany({
      include: {
        user: true,
        courses: {
          include: {
            students: true
          }
        }
      }
    });

    // Calculate total students for each coach
    const coachesWithStats = coaches.map((coach: any) => {
      // Calculate total students across all courses assigned to this coach
      const totalStudents = coach.courses?.reduce((total: number, course: any) => {
        return total + (course.students?.length || 0);
      }, 0) || 0;

      return {
        ...coach,
        totalStudents
      };
    });

    return NextResponse.json({ coaches: coachesWithStats });
  } catch (error) {
    console.error("Error fetching coaches:", error);
    return NextResponse.json(
      { error: "Failed to fetch coaches" },
      { status: 500 }
    );
  }
}

// POST - Assign coach specialization to existing user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = coachAssignmentSchema.parse(body);
    const { userId, subject } = validatedData;

    // Check if user exists and has COACH role
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    if (existingUser.role !== 'COACH') {
      return NextResponse.json(
        { error: "User must have COACH role" },
        { status: 400 }
      );
    }

    // Check if user already has a coach profile
    const existingCoach = await prisma.coach.findUnique({
      where: { userId }
    });

    if (existingCoach) {
      return NextResponse.json(
        { error: "User already has a coach specialization assigned" },
        { status: 409 }
      );
    }

    // Create coach profile for the existing user
    const coach = await prisma.coach.create({
      data: {
        userId,
        subject
      },
      include: {
        user: true
      }
    });

    return NextResponse.json({ coach });
  } catch (error) {
    console.error("Error assigning coach specialization:", error);
    return NextResponse.json(
      { error: "Failed to assign coach specialization" },
      { status: 500 }
    );
  }
}