import { NextRequest, NextResponse } from "next/server";
import prisma from "@/db/prisma";
import { sendResetPasswordMail } from "@/helpers/sendResetPasswordMail";


export async function POST(req:NextRequest){
    try {
        
         const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({ message: "If this email exists, a reset link has been sent" });
    }

    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await prisma.user.update({
      where: { email },
      data: {
        verificationCode: resetCode,
        verificationCodeExpiry: expiry,
      },
    });

// sendMail
await sendResetPasswordMail(email, user.full_name ?? 'User', resetCode)

   
    return NextResponse.json({ message: "If this email exists, a reset link has been sent" });

    } catch (error) {
        console.error("Forgot password error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}