import { NextRequest, NextResponse } from "next/server";
import prisma from "@/db/prisma";
import { sendResetPasswordMail } from "@/helpers/sendResetPasswordMail";
import crypto from "crypto";


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

    const token = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.user.update({
      where: { email },
      data: {
        passwordResetTokenHash: tokenHash,
        passwordResetTokenExpiry: expiry,
      },
    });

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      "http://localhost:3000";

    const resetLink = `${baseUrl.replace(/\/$/, "")}/reset-password?token=${token}`;
    await sendResetPasswordMail(email, user.full_name ?? "User", resetLink);

   
    return NextResponse.json({ message: "If this email exists, a reset link has been sent" });

    } catch (error) {
        console.error("Forgot password error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}