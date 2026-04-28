
import prisma from "@/db/prisma";
import { NextRequest, NextResponse } from "next/server";


export async function POST(request: NextRequest) { 
    try {
        const { email, otp } = await request.json(); 

        if (!email || !otp) {
            return NextResponse.json({
                success: false,
                message: "Email and OTP are required"
            }, { status: 400 });
        }

        const user = await prisma.user.findFirst({
            where: {
                email,
                verificationCode: otp,
            }
        });

        if (!user) {
            return NextResponse.json({
                success: false,
                message: "User not found"
            }, { status: 404 });             
        }

        const isCodeValid = user.verificationCode === otp;
        const isCodeNotExpired = new Date(user.verificationCodeExpiry!) > new Date();

        if (isCodeValid && isCodeNotExpired) {
            await prisma.user.update({       
                where: { email },            
                data: {                      
                    isVerified: true,        
                    verificationCode: '',  
                    verificationCodeExpiry: '',
                }
            });

            return NextResponse.json({
                success: true,
                message: "Account verified successfully"
            }, { status: 200 });

        } else if (!isCodeNotExpired) {
            return NextResponse.json({
                success: false,
                message: "Verification code has expired"
            }, { status: 400 });

        } else {
            return NextResponse.json({
                success: false,
                message: "Verification code is incorrect"
            }, { status: 400 });
        }

    } catch (error) {
        console.log("Error verifying otp", error);
        return NextResponse.json({
            success: false,
            message: "Error verifying otp"
        }, { status: 500 });
    }
}
