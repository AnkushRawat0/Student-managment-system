import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { coachSchema } from "@/lib/validation";

// GET all coaches with their course assignments
export async function GET() {
  try {
    const coaches = await prisma.coach.findMany({
      include: {
        user: true,
        courseAssignments: {
          include: {
            course: true
          }
        }
      }
    });

    // Calculate total students for each coach
    const coachesWithStats = coaches.map((coach: any) => {
      // For now, set totalStudents to the number of course assignments
      // This can be improved later when the course-student relationship is refined
      const totalStudents = coach.courseAssignments?.length || 0;

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

// POST - Create new coach
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = coachSchema.parse(body);
    const { name, email, password, subject } = validatedData;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      );
    }

    // Create user and coach in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          name,
          email,
          password, // In production, hash this password
          role: 'COACH'
        }
      });

      // Create coach profile
      const coach = await tx.coach.create({
        data: {
          userId: user.id,
          subject
        },
        include: {
          user: true
        }
      });

      return coach;
    });

    return NextResponse.json({ coach: result });
  } catch (error) {
    console.error("Error creating coach:", error);
    return NextResponse.json(
      { error: "Failed to create coach" },
      { status: 500 }
    );
  }
}