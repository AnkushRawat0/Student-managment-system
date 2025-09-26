import { loginSchmea } from "@/lib/validation";
import { Prisma } from "@prisma/client";
import {prisma }from "@/lib/prisma";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";


export async function POST(request : NextRequest) {


    try{
        const body = await request.json() ;
        const parsedData = loginSchmea.parse(body) ; 

        const user = await prisma.user.findUnique({
            where : {email :parsedData.email}
        });

        if(!user) {
            return NextResponse.json({error : "User not found "},{status : 401})
        }

        if(user.password !== parsedData.password){
            return NextResponse.json({error : "Invalid password"},{status : 401})
        }

        return NextResponse.json({message : "login successful" , 
            user:{
                id:user.id, 
                name: user.name, 
                email: user.email , 
                role :user.role
            }
        },{status : 200})

    }
    catch(error){
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
 }
}