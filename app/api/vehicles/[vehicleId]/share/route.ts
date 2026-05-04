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
    const updated = await prisma.vehicle.update({
      where: { id: vehicleId },
      data: { shares: { increment: 1 } },
      select: { id: true, shares: true },
    });

    return NextResponse.json({
      success: true,
      vehicleId: updated.id,
      shares: updated.shares,
      shares_count: updated.shares,
    });
  } catch (error: unknown) {
    const code = error && typeof error === "object" && "code" in error ? (error as { code?: string }).code : undefined;
    if (code === "P2025") {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
    }
    console.error("POST /api/vehicles/[id]/share failed:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
