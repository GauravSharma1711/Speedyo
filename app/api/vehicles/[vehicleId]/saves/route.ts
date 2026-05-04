import { NextRequest, NextResponse } from "next/server";
import prisma from "@/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";

export async function POST(
  _req: NextRequest,
  context: { params: Promise<{ vehicleId: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { vehicleId } = await context.params;
    const userId = session.user.id;

    const existing = await prisma.vehicleSave.findUnique({
      where: { userId_vehicleId: { userId, vehicleId } },
      select: { userId: true },
    });

    const result = await prisma.$transaction(async (tx) => {
      if (existing) {
        await tx.vehicleSave.delete({
          where: { userId_vehicleId: { userId, vehicleId } },
        });
      } else {
        await tx.vehicleSave.create({ data: { userId, vehicleId } });
      }
      const saves = await tx.vehicleSave.count({ where: { vehicleId } });
      return { saved: !existing, saves };
    });

    return NextResponse.json({ success: true, ...result });
  } catch (error: unknown) {
    const code = error && typeof error === "object" && "code" in error ? (error as { code?: string }).code : undefined;
    if (code === "P2025") {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
    }
    console.error("POST /api/vehicles/[id]/saves failed:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
