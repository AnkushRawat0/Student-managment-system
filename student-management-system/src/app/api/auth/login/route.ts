import { loginSchmea } from "@/lib/validation";
import {prisma }from "@/lib/prisma";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { verifyPassword } from "@/lib/password";


export async function POST(request : NextRequest) {


    try{
        const body = await request.json() ;
        const parsedData = loginSchmea.parse(body) ; 
        

        //find user by email
        const user = await prisma.user.findUnique({
            where : {email :parsedData.email}
        });

        if(!user) {
            return NextResponse.json({error : "Invalid credentials  "},{status : 401})
        }

        
        // ✅ SECURE: Verify password against hash
        const isValidPassword = await verifyPassword(parsedData.password, user.password);

        if (!isValidPassword) {
            return NextResponse.json(
                { error: "Invalid credentials" },
                { status: 401 }
            );
        }
        
        //login  successful 
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
        console.error("Login Error:", error);
        
        if (error instanceof Error) {
            return NextResponse.json(
                { error: "Invalid input data", details: error.message },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: "Something went wrong" },
            { status: 500 }
        );
        
 }
}