

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";


export async function POST(
  request: NextRequest,
  context: { params: Promise<{ listingId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.user_type !== "private_seller") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { listingId } = await context.params;

    const listing = await prisma.vehicle.findUnique({
      where: { id: listingId, authorId: session.user.id },
    });

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    if (listing.status === "sold") {
      return NextResponse.json({ error: "Listing is already marked as sold" }, { status: 409 });
    }

    if (!["available", "pending", "unavailable"].includes(listing.status)) {
      return NextResponse.json(
        { error: `Cannot mark a ${listing.status} listing as sold` },
        { status: 409 }
      );
    }

    await prisma.$transaction([
    
      prisma.vehicle.update({
        where: { id: listingId },
        data: { status: "sold" },
      }),
     
      prisma.testDriveRequest.updateMany({
        where: {
          vehicleId: listingId,
          status: { in: ["pending", "confirmed"] },
        },
        data: {
          status: "cancelled",
          cancellation_reason: "Vehicle has been sold",
        },
      }),
     
      prisma.sellerSubscription.updateMany({
        where: { userId: session.user.id },
        data: { vehicles_sold_this_year: { increment: 1 } },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to mark listing as sold", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}