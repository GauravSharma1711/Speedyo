import { NextRequest, NextResponse } from "next/server";
import prisma from "@/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ vehicleId: string; dealershipAgreementId: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { vehicleId, dealershipAgreementId } = await context.params;

    const existing = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
    }

    const agreement = await prisma.dealershipVehicleAgreement.findUnique({
      where: { id: dealershipAgreementId },
    });

    if (!agreement) {
      return NextResponse.json({ error: "Dealership agreement not found" }, { status: 404 });
    }

    const vehicle = await prisma.vehicle.update({
      where: { id: vehicleId },
      data: { dealershipAgreementId: dealershipAgreementId },
      include: {
        dealershipAgreement: {
          select: { id: true, dealership_name: true, representative_name: true, status: true },
        },
      },
    });

    return NextResponse.json({ success: true, vehicle });
  } catch (error) {
    console.error("Failed to associate dealership", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}