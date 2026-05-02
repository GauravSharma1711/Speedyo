
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";

export async function POST(
  request: NextRequest,
  { params }: { params: { vehicleId: string } },
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { vehicleId } = params;

    const existing = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
    }

    const body = await request.json();
    const { requested_date, requested_time, additional_notes } = body;

    if (!requested_date || !requested_time) {
      return NextResponse.json(
        { error: "requested_date and requested_time are required" },
        { status: 400 }
      );
    }

    const dbUser = await prisma.user.findUnique({
  where: { id: session.user.id },
  select: { phone: true },
});


    const testDriveRequest = await prisma.testDriveRequest.create({
      data: {
        vehicleId,
        requester_name: session.user.full_name ?? session.user.email,
        requester_email: session.user.email,
        requester_phone: dbUser?.phone ?? null,
        requested_date,
        requested_time,
        additional_notes: additional_notes ?? null,
        userId: session.user.id,
      },
      include: {
        vehicle: { select: { id: true, title: true, make: true, model: true } },
        user: { select: { id: true, full_name: true, email: true } },
      },
    });

    return NextResponse.json({ success: true, testDriveRequest }, { status: 201 });
  } catch (error) {
    console.error("Failed to request test drive", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

