
import { prisma } from "@/app/lib/prisma";
import { SignUpSchema } from "@/app/zod";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req:NextRequest){
    try{
        const body=await req.json();
        const result=SignUpSchema.safeParse(body)
        if(!result.success){
            return NextResponse.json({
                success:false,
                message:"invalid  detail"
            })
        }
        const isExist=await prisma.user.findUnique({
            where:{
                email:result.data.email
            }
        })
        if(isExist){
            return NextResponse.json({
            success:false,
            message:'user already exist! Go to Login Page'
        })
        }
        const salt=await bcrypt.genSalt(10)
        const hashedPassword=await bcrypt.hash(result.data.password,salt)
        await prisma.user.create({
            data:{
                name:result.data.name,
                email:result.data.email,
                password:hashedPassword
            }
        })
        return NextResponse.json({
            success:true,
            message:'sign up successful!'
        })
    }catch(e){
        console.log(`sign up error ${e}`)
        return NextResponse.json({
            success:false,
            message:e instanceof Error? e.message:"Internal server error during sign up"
        })
    }
}