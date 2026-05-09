import { NextRequest, NextResponse } from "next/server";
import prisma from "@/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";


export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ vehicleId: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { vehicleId } = await context.params;

    const existing = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
    }

    if (!existing.dealershipAgreementId) {
      return NextResponse.json({ error: "Vehicle has no dealership associated" }, { status: 400 });
    }

    const vehicle = await prisma.vehicle.update({
      where: { id: vehicleId },
      data: { dealershipAgreementId: null, dealership_name: null },
    });

    return NextResponse.json({ success: true, vehicle }, { status: 200 });
  } catch (error) {
    console.error("Failed to remove dealership association", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}