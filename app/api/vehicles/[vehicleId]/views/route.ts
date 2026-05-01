import { NextRequest, NextResponse } from "next/server";
import prisma from "@/db/prisma";

export async function POST(_req: NextRequest, { params }: { params: { vehicleId: string } }) {
  try {
    const { vehicleId } = params;
    const updated = await prisma.vehicle.update({
      where: { id: vehicleId },
      data: { views: { increment: 1 } },
      select: { id: true, views: true },
    });

    return NextResponse.json({ success: true, vehicleId: updated.id, views: updated.views });
  } catch (error: any) {
    if (error?.code === "P2025") {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
    }
    console.error("POST /api/vehicles/[id]/views failed:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

