import { NextRequest, NextResponse } from "next/server";
import prisma from "@/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";

export async function GET(_req: NextRequest, context: { params: Promise<{ vehicleId: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { vehicleId } = await context.params;
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
      select: { authorId: true },
    });
    if (!vehicle) return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
    if (!vehicle.authorId) return NextResponse.json({ error: "Vehicle has no seller" }, { status: 400 });

    const seller = await prisma.user.findUnique({
      where: { id: vehicle.authorId },
      select: {
        id: true,
        full_name: true,
        profile_image: true,
        bio: true,
        location: true,
        isVerified: true,
        role: true,
        user_type: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ success: true, seller });
  } catch (error) {
    console.error("GET /api/vehicles/[id]/seller-profile failed:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

