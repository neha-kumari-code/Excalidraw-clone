import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/route";
export async function POST(req:NextRequest){
    try{
        const session=await getServerSession(authOptions);
        if(!session?.user){
             return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }
        const userId=session.user.id;
        const body=await req.json();
        if (!body.type || !body.data) {
        return NextResponse.json({ error: "Invalid input" }, { status: 400 });
        }
        console.log(body.type)
        console.log(body.data)
        const shape=await prisma.shape.create({
            data:{
                type:body.type,
                data:body.data,
                userId
            }
        })
        if(!shape){
             return NextResponse.json({
            success:false
        });
        }
        return NextResponse.json({
            success:true
        });
    }catch(error){
        console.log(`error while uploading shape ${error}`)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function GET(){
    try{
        const session=await getServerSession(authOptions)
        if(!session?.user){
             return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }
        const userId=session.user.id;
        const response=await prisma.shape.findMany({
            where:{
                userId
            },
            select:{
                id:true,
                type:true,
                data:true
            }
        })
        return NextResponse.json({
            success:true,
            shapes:response
        })
    }catch(error){
        console.log(`error while getting shape ${error}`)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}