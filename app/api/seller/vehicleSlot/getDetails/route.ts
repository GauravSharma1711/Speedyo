import { NextRequest, NextResponse } from "next/server";
import prisma from "@/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";



export async function GET(
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.user_type !== 'private_seller') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

      const slots = await prisma.privateSellerSlots.findUnique({
      where: { userId: session.user.id },
    });




      return NextResponse.json({
      success: true,
      data: {
        purchased: slots?.purchased ?? 0,
        used: slots?.used ?? 0,
        remaining: (slots?.purchased ?? 0) - (slots?.used ?? 0),
      },
    });

  
  } catch (error) {
    console.error("Failed to get vehicle slot details", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}