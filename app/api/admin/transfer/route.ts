import { NextRequest, NextResponse } from "next/server";
import prisma from "@/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";
import { TransferType } from "@/lib/generated/prisma/enums";

const transferInclude = {
  vehicle: { select: { id: true, title: true } },
  buyer: { select: { id: true, full_name: true, email: true } },
  seller: { select: { id: true, full_name: true, email: true } },
  createdBy: { select: { id: true, full_name: true, email: true } },
};

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { vehicleId, buyerId, sellerId, transfer_type, admin_notes, user_facing_notes } = body;

    if (!vehicleId || !buyerId  || !transfer_type || !admin_notes || !user_facing_notes) {
      return NextResponse.json(
        { error: "vehicleId, buyerId, admin_notes, user_facing_notes, and transfer_type are required" },
        { status: 400 }
      );
    }

    const [vehicle, buyer] = await Promise.all([
  prisma.vehicle.findUnique({ where: { id: vehicleId } }),
  prisma.user.findUnique({ where: { id: buyerId } }),
]);

if (!vehicle) return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
if (!buyer) return NextResponse.json({ error: "Buyer not found" }, { status: 404 });

if (sellerId) {
  const seller = await prisma.user.findUnique({ where: { id: sellerId } });
  if (!seller) return NextResponse.json({ error: "Seller not found" }, { status: 404 });
}




    const transfer = await prisma.vehicleTransfer.create({
      data: {
        vehicleId,
        buyerId,
        sellerId: sellerId ?? null, 
        transfer_type: transfer_type as TransferType,
        initiated_date: new Date(),
        status: "in_progress",
        current_step: 1,
        steps_completed: [],
        admin_notes,
        user_facing_notes,
        createdById: session.user.id,
      },
      include: transferInclude,
    });

    return NextResponse.json({ success: true, transfer }, { status: 201 });
  } catch (error) {
    console.error("Failed to create transfer", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const transfers = await prisma.vehicleTransfer.findMany({
      include: transferInclude,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, transfers });
  } catch (error) {
    console.error("Failed to get transfers", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}