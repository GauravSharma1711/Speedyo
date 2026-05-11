
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

    const dealershipSubscription = await prisma.sellerSubscription.findUnique({
      where: { userId },
    });

  
    return NextResponse.json({
      success: true,
      dealershipSubscription,
    });

  } catch (error: any) {
    console.error("Get dealership subscription error details error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch subscription details" },
      { status: 500 }
    );
  }
}