import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { updateStudentSchema } from "@/lib/validation";


export async function GET (
    request : NextRequest ,
    {params} : {params : Promise<{ id: string}>}

){
    try {
        const { id } = await params;
        const student = await prisma.student.findUnique({
            where: {id},
            include: {
                user : {
                    select : {
                        id: true , 
                        name : true , 
                        email : true
                    } 
                },
                course: {
                    select: {
                        id: true,
                        name: true,
                        description: true,
                    },
                },
            }
        });
        if (!student){
            return NextResponse.json(
                {error : "Student not found"} ,
                {status :404}
            )
        }

        return NextResponse.json({student})
    }catch(error){
        console.error("error fetching student", error);
        return NextResponse.json(
            { error: "Something went wrong" },
            {status : 500}
        )
        
    }
}

//UPDATE STUDENT
export async function PUT(
    request : NextRequest ,
    {params}  : {params : Promise<{id: string}>}
){
    try{
        const { id } = await params;
        const body  = await request.json() ;
        const validatedData = updateStudentSchema.parse(body);

        // Prepare update data for user and student
        const updateUserData: any = {};
        const updateStudentData: any = {}; 
        
        // Update user information if provided
        if (validatedData.name) updateUserData.name = validatedData.name;
        if (validatedData.email) updateUserData.email = validatedData.email;
        
        // Update student information if provided
        if (validatedData.age) updateStudentData.age = validatedData.age;
        if (validatedData.courseId) updateStudentData.courseId = validatedData.courseId;

          // First, get the student to find the user ID
    const student = await prisma.student.findUnique({
      where: { id },
      include: { user: true }
    });

     if (!student) {
      return NextResponse.json(
        { error: "Student not found" },
        { status: 404 }
      );
    }


        // Update user if there's user data to update
    if (Object.keys(updateUserData).length > 0) {
      await prisma.user.update({
        where: { id: student.userId },
        data: updateUserData,
      });
    }
    // Update student if there's student data to update
    let updatedStudent;
    if (Object.keys(updateStudentData).length > 0) {
      updatedStudent = await prisma.student.update({
        where: { id },
        data: updateStudentData,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          },
          course: {
            select: {
              id: true,
              name: true,
              description: true,
            },
          },
        }
      });
    } else {
         // Refetch with updated user data
      updatedStudent = await prisma.student.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          },
          course: {
            select: {
              id: true,
              name: true,
              description: true,
            },
          },
        }
      });
    }

    return NextResponse.json({ student: updatedStudent });











    }catch(error){
        console.error("Error updating student:", error);
    return NextResponse.json(
      { error: "Failed to update student" },
      { status: 500 }
    );

    }
}

// DELETE student
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Find the student first to get the user ID
    const student = await prisma.student.findUnique({
      where: { id },
      include: { user: true }
    });

    if (!student) {
      return NextResponse.json(
        { error: "Student not found" },
        { status: 404 }
      );
    }

     // Delete student (this will cascade delete due to our schema)
    await prisma.student.delete({
      where: { id }
    });

    // Delete the associated user
    await prisma.user.delete({
      where: { id: student.userId }
    });

    return NextResponse.json({ 
      message: "Student deleted successfully" 
    });
  } catch (error) {
    console.error("Error deleting student:", error);
    return NextResponse.json(
      { error: "Failed to delete student" },
      { status: 500 }
    );
  }
}
