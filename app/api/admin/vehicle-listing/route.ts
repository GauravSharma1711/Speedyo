import { NextRequest, NextResponse } from "next/server";
import prisma from "@/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
const vehicles = await prisma.vehicle.findMany({
  include: {
    testDriveRequests: {
      select: {
        id: true,
        requested_date: true,
        requested_time: true,
        additional_notes: true,
      },
    },

    dealershipAgreement: {
      select: {
        id: true,
        dealership_name: true,
      },
    },

    author: {
      select: {
        id: true,
        full_name: true,
        email: true,
      },
    },
  },
});
    return NextResponse.json({
      success: true,
      vehicles,
    });
  } catch (error) {
    console.error("Failed to get agreements", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
