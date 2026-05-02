import { NextRequest, NextResponse } from "next/server";
import prisma from "@/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { vehicleId } = await request.json();

    if (!vehicleId) {
      return NextResponse.json({ error: "Missing vehicleId" }, { status: 400 });
    }

    // Debounce — skip if this user viewed in the last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    const recentView = session?.user?.id
      ? await prisma.vehicleView.findFirst({
          where: {
            vehicleId,
            userId: session.user.id,
            createdAt: { gte: oneHourAgo },
          },
        })
      : null;

    if (recentView) {
      // Already viewed recently — return current count without incrementing
      const vehicle = await prisma.vehicle.findUnique({
        where: { id: vehicleId },
        select: { views: true },
      });
      return NextResponse.json({ success: true, newViewCount: vehicle?.views ?? 0 });
    }

    // New view — increment counter and log it
    const [updatedVehicle] = await Promise.all([
      prisma.vehicle.update({
        where: { id: vehicleId },
        data: { views: { increment: 1 } },
        select: { views: true },
      }),
      prisma.vehicleView.create({
        data: {
          vehicleId,
          userId: session?.user?.id ?? null,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      newViewCount: updatedVehicle.views,
    });
  } catch (error: any) {
    if (error?.code === "P2025") {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
    }
    console.error("Error incrementing vehicle views:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}