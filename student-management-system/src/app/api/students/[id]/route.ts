import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { updateStudentSchema } from "@/lib/validation";


export async function GET (
    request : NextRequest ,
    {params} : {params : { id: string}}

){
    try {
        const student = await prisma.student.findUnique({
            where: {id :params.id},
            include: {
                user : {
                    select : {
                        id: true , 
                        name : true , 
                        email : true
                    }
                }
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