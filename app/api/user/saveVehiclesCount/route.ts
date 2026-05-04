import { NextResponse } from "next/server";
import prisma from "@/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const count = await prisma.vehicleSave.count({
      where: { userId: session.user.id },
    });
    return NextResponse.json({ success: true, savesCount: count });
  } catch (error) {
    console.error("GET /api/user/saveVehiclesCount failed:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

