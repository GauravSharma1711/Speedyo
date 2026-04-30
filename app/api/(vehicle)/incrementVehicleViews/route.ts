
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/db/prisma";

export async function POST(request: NextRequest) {
  try {
    const { vehicleId } = await request.json();

    if (!vehicleId) {
      return NextResponse.json({ error: "Missing vehicleId" }, { status: 400 });
    }

    const updatedVehicle = await prisma.vehicle.update({
      where: { id: vehicleId },
      data: { views: { increment: 1 } },
      select: { views: true },
    });

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