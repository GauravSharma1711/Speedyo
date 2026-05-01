import { NextRequest, NextResponse } from "next/server";
import prisma from "@/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { requestId: string } },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { requestId } = params;

    const existing = await prisma.testDriveRequest.findUnique({
      where: { id: requestId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Test drive request not found" }, { status: 404 });
    }

    const body = await request.json();
    const {
      status,
      confirmed_date,
      confirmed_time,
      location,
  additional_notes   ,

    } = body;

    const testDriveRequest = await prisma.testDriveRequest.update({
      where: { id: requestId },
      data: {
        ...(status && { status }),
        ...(confirmed_date !== undefined && { confirmed_date }),
        ...(confirmed_time !== undefined && { confirmed_time }),
        ...(location !== undefined && { location }),
        ...(additional_notes !== undefined && { additional_notes }),
      },
      include: {
        vehicle: { select: { id: true, title: true, make: true, model: true, year: true, price: true, location: true } },
        user: { select: { id: true, full_name: true, email: true } },
      },
    });

    return NextResponse.json({ success: true, testDriveRequest });
  } catch (error) {
    console.error("Failed to update test drive request", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}







export async function POST(
  request: NextRequest,
  { params }: { params: { requestId: string } },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { requestId } = params;

    const existing = await prisma.testDriveRequest.findUnique({
      where: { id: requestId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Test drive request not found" }, { status: 404 });
    }


    



  } catch (error) {
    console.error("Failed to update test drive request", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}