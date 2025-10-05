import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET users with COACH role who don't have coach assignments yet
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      where: {
        role: 'COACH',
        coach: null // Only users who don't have a coach assignment yet
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
      orderBy: {
        name: 'asc'
      }
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Error fetching coach users:", error);
    return NextResponse.json(
      { error: "Failed to fetch coach users" },
      { status: 500 }
    );
  }
}