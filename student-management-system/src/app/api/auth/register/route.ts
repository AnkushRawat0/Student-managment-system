import { registerSchema } from "@/lib/validation";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";


export async function POST(request: NextRequest) {

    try{
        const body = await request.json() ;
        const parsedData = registerSchema.parse(body) ;


        const existingUser = await prisma.user.findUnique({
            where : {email : parsedData.email}
        })
        if(existingUser){
            return NextResponse.json({error : "User already exists"},{status : 409})
        }

        const newUser = await prisma.user.create({
            data : {
                name :parsedData.name , 
                email : parsedData.email , 
                password : parsedData.password , 
                role : parsedData.role
            }

        })

        return NextResponse.json({message : "user successfully registered" ,
            user : {
                id: newUser.id , 
                name :newUser.name , 
                email : newUser.email , 
                role : newUser.role
            }
         }, {status : 201})
    }catch(error){

        return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
        
    }
}