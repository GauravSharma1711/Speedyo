import { NextRequest, NextResponse } from "next/server";
import prisma from "@/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";
import { v4 as uuidv4 } from "uuid";


// add test drive availability
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

    const body = await request.json();
    const { date, start_time, end_time, location } = body;

    if (!date || !start_time || !end_time) {
      return NextResponse.json(
        { error: "date, start_time, and end_time are required" },
        { status: 400 }
      );
    }

    // @@unique([vehicleId, date, start_time]) will throw if duplicate
    const slot = await prisma.vehicleAvailabilitySlot.create({
      data: {
        vehicleId: listingId,
        date,
        start_time,
        end_time,
        location: location || null,
      },
    });

    return NextResponse.json({ success: true, data: slot }, { status: 201 });
  } catch (error: any) {
    // Prisma unique constraint violation code
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "A slot already exists for this date and time" },
        { status: 409 }
      );
    }
    console.error("Failed to add test drive availability", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}



// GET ALL TEST DRIVE ABVAILABILITY
export async function GET(
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

    const slots = await prisma.vehicleAvailabilitySlot.findMany({
      where: { vehicleId: listingId },
      include: {
        testDriveRequest: {
          select: {
            id: true,
            status: true,
            requester_name: true,
            requester_email: true,
            requester_phone: true,
          },
        },
      },
      orderBy: [{ date: "asc" }, { start_time: "asc" }],
    });

    return NextResponse.json({
      success: true,
      data: {
        slots,
        total: slots.length,
        available: slots.filter((s) => !s.is_booked).length,
        booked: slots.filter((s) => s.is_booked).length,
      },
    });
  } catch (error) {
    console.error("Failed to get test drive availability", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}