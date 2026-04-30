
import prisma from "@/db/prisma";
import { NextRequest, NextResponse } from "next/server";

import { sendVerificationMail } from "@/helpers/sendVerificationMail"; 

export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json({
                success: false,
                message: "Email is required"
            }, { status: 400 });
        }

        // Check user exists and is not already verified
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            return NextResponse.json({
                success: false,
                message: "User not found"
            }, { status: 404 });
        }

        if (user.isVerified) {
            return NextResponse.json({
                success: false,
                message: "User is already verified"
            }, { status: 400 });
        }

        // Generate new OTP and expiry
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiryDate = new Date();
        expiryDate.setMinutes(expiryDate.getMinutes() + 10);

        // Update user with new OTP
        await prisma.user.update({
            where: { email },
            data: {
                verificationCode: otp,
                verificationCodeExpiry: expiryDate,
            }
        });

        // Send new OTP email
        const emailResponse = await sendVerificationMail( user.full_name ?? email.split("@")[0], email,otp);

        if (!emailResponse.success) {
            return NextResponse.json({
                success: false,
                message: emailResponse.message
            }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: "OTP resent successfully. Please check your email."
        }, { status: 200 });

    } catch (error) {
        console.error("Error resending OTP", error);
        return NextResponse.json({
            success: false,
            message: "Error resending OTP"
        }, { status: 500 });
    }
}