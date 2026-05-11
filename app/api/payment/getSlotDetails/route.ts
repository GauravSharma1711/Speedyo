
import { NextResponse } from "next/server";
import prisma from "@/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const slots = await prisma.privateSellerSlots.findUnique({
      where: { userId },
    });

    const purchased  = slots?.purchased ?? 0;
    const used       = slots?.used      ?? 0;
    const remaining  = purchased - used;

    return NextResponse.json({
      success: true,
      slots: {
       purchased,   
        used,                   
        remaining,              
      },
    });

  } catch (error: any) {
    console.error("Get slot details error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch slot details" },
      { status: 500 }
    );
  }
}