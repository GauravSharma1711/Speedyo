import { NextRequest, NextResponse } from "next/server";
import prisma from "@/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";


export async function POST(

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

    if (listing.status === "sold" || listing.status === "cancelled") {
      return NextResponse.json(
        { error: `Cannot change availability of a ${listing.status} listing` },
        { status: 409 }
      );
    }

   const newStatus = listing.status === "available" ? "unavailable" : "available";

    if (listing.status === newStatus) {
      return NextResponse.json(
        { error: `Listing is already ${newStatus}` },
        { status: 409 }
      );
    }

    const updated = await prisma.vehicle.update({
      where: { id: listingId },
      data: { status: newStatus },
    });

    return NextResponse.json({ success: true, data: { status: updated.status } });
  } catch (error) {
    console.error("Failed to update listing availability", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}