import prisma from "@/db/prisma";
import { NextRequest, NextResponse } from "next/server";

/** Legacy name: checks verified account email availability (User has no `username` field in schema). */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const emailRaw = searchParams.get("email") ?? searchParams.get("username");

    if (!emailRaw) {
      return NextResponse.json(
        { success: false, message: "email is required (query: email or username as email)" },
        { status: 400 },
      );
    }

    const email = emailRaw.trim().toLowerCase();

    const existingVerifiedUser = await prisma.user.findFirst({
      where: {
        isVerified: true,
        email,
      },
    });

    if (existingVerifiedUser) {
      return NextResponse.json(
        { success: false, message: "An account with this email already exists" },
        { status: 400 },
      );
    }

    return NextResponse.json({ success: true, message: "Email is available" }, { status: 200 });
  } catch (error) {
    console.log("Error checking email availability", error);
    return NextResponse.json({ success: false, message: "Error checking email" }, { status: 500 });
  }
}
