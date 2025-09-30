import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";


export async function GET() {
  try {
    // Get counts from database
    const [studentCount, courseCount, activeCoursesCount, coachCount] = await Promise.all([
      prisma.student.count(),
      prisma.course.count(),
      prisma.course.count({
        where: {
          status: 'ACTIVE'
        }
      }),
      prisma.user.count({
        where: {
          role: 'COACH'
        }
      })
    ]);

     // Get recent students (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentStudentsCount = await prisma.student.count({
      where: {
        enrollmentDate: {
          gte: thirtyDaysAgo
        }
      }
    });

    return NextResponse.json({
      totalStudents: studentCount,
      totalCourses: courseCount,
      activeCourses: activeCoursesCount,
      totalCoaches: coachCount,
      recentStudents: recentStudentsCount
    });

  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard statistics" },
      { status: 500 }
    );
  }
}
