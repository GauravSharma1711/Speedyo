import { NextRequest, NextResponse } from "next/server";
import prisma from "@/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";

export async function POST(_req: NextRequest, { params }: { params: { vehicleId: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { vehicleId } = params;
    const userId = session.user.id;

    const existing = await prisma.vehicleSave.findUnique({
      where: { userId_vehicleId: { userId, vehicleId } },
      select: { id: true },
    });

    const result = await prisma.$transaction(async (tx) => {
      if (existing) {
        await tx.vehicleSave.delete({ where: { userId_vehicleId: { userId, vehicleId } } });
        const v = await tx.vehicle.update({
          where: { id: vehicleId },
          data: { saves_count: { decrement: 1 } },
          select: { saves_count: true },
        });
        return { saved: false, saves: v.saves_count };
      }

      await tx.vehicleSave.create({ data: { userId, vehicleId } });
      const v = await tx.vehicle.update({
        where: { id: vehicleId },
        data: { saves_count: { increment: 1 } },
        select: { saves_count: true },
      });
      return { saved: true, saves: v.saves_count };
    });

    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    if (error?.code === "P2025") {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
    }
    console.error("POST /api/vehicles/[id]/saves failed:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

