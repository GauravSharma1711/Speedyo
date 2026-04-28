
import prisma from "@/db/prisma";
import { NextRequest, NextResponse } from "next/server";


export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const username = searchParams.get('username');

        if (!username) {
            return NextResponse.json({
                success: false,
                message: "Username is required"
            }, { status: 400 });
        }

        const existingVerifiedUser = await prisma.user.findFirst({ 
            where: {
                isVerified: true,
                username                                             
            }
        });

        if (existingVerifiedUser) {
            return NextResponse.json({
                success: false,
                message: "Username is already taken"
            }, { status: 400 });
        }

        return NextResponse.json({
            success: true,
            message: "Username is available"
        }, { status: 200 });

    } catch (error) {
        console.log("Error checking username", error);
        return NextResponse.json({
            success: false,
            message: "Error checking username"
        }, { status: 500 });
    }
}