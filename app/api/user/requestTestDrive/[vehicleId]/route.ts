// app/api/test-drive/[vehicleId]/route.ts

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";

export async function POST(req: NextRequest, context: { params: Promise<{ vehicleId: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    const { vehicleId } = await context.params;
    const { requested_date, requested_time, additional_notes } = await req.json();

    if (!requested_date || !requested_time) {
      return NextResponse.json({ error: "Date and time are required" }, { status: 400 });
    }

    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
      select: { id: true, status: true },
    });

    if (!vehicle) {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
    }

    if (vehicle.status !== "available") {
      return NextResponse.json({ error: "Vehicle is not available for test drives" }, { status: 400 });
    }

    const testDrive = await prisma.testDriveRequest.create({
      data: {
        vehicleId,
        requester_name:  session?.user?.full_name  ?? "Guest",
        requester_email: session?.user?.email ?? "",
        requested_date,
        requested_time,
        additional_notes: additional_notes || null,
        userId: session?.user?.id ?? null,
      },
    });

    return NextResponse.json(
      { message: "Test drive request submitted successfully", data: testDrive },
      { status: 201 }
    );

  } catch (error) {
    console.error("Failed to submit test drive request", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}