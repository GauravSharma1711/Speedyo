
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";

export async function POST(
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

    const body = await request.json();

    if (!Array.isArray(body)) {
      return NextResponse.json(
        { error: "Body must be an array of slots" },
        { status: 400 }
      );
    }

    for (const slot of body) {
      if (!slot.requested_date || !slot.requested_time) {
        return NextResponse.json(
          { error: "Each slot must have requested_date and requested_time" },
          { status: 400 }
        );
      }
    }

    const vehicle = await prisma.vehicle.update({
      where: { id: vehicleId },
      data: {
        recurring_availability: body.map((s) => ({
          id: crypto.randomUUID(),
          requested_date: s.requested_date,
          requested_time: s.requested_time,
          meetingAddress: s.meetingAddress ?? "",
          additional_notes: s.additional_notes ?? null,
        })),
      },
    });

    return NextResponse.json({ success: true, vehicle }, { status: 200 });
  } catch (error) {
    console.error("Failed to manage test drive availability", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

