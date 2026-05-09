import { NextRequest, NextResponse } from "next/server";
import prisma from "@/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";

// delete test drive availability
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ listingId: string; slotId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.user_type !== "private_seller") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { listingId, slotId } = await context.params;

    const slot = await prisma.vehicleAvailabilitySlot.findUnique({
      where: { id: slotId },
    });

    if (!slot || slot.vehicleId !== listingId) {
      return NextResponse.json({ error: "Slot not found" }, { status: 404 });
    }

    // Verify the listing belongs to this seller
    const listing = await prisma.vehicle.findUnique({
      where: { id: listingId, authorId: session.user.id },
    });

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    if (slot.is_booked) {
      return NextResponse.json(
        { error: "Cannot delete a booked slot. Cancel the test drive request first." },
        { status: 409 }
      );
    }

    await prisma.vehicleAvailabilitySlot.delete({
      where: { id: slotId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete availability slot", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}