import { NextRequest, NextResponse } from "next/server";
import prisma from "@/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.user_type !== "private_seller") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role"); // "seller" | "buyer" | null (both)

    const vehicleSelect = {
      id: true,
      title: true,
      make: true,
      model: true,
      year: true,
      price: true,
      primary_image: true,
      status: true,
    };

    const userSelect = {
      id: true,
      full_name: true,
      email: true,
      phone: true,
      profile_image: true,
    };

    // Requests coming IN for my vehicles (I am the seller)
    let incomingRequests: any[] = [];
    if (!role || role === "seller") {
      incomingRequests = await prisma.testDriveRequest.findMany({
        where: {
          vehicle: { authorId: session.user.id },
        },
        include: {
          vehicle: { select: vehicleSelect },
          user: { select: userSelect },   // the buyer who requested
          availabilitySlot: true,
          report: true,
        },
        orderBy: { createdAt: "desc" },
      });
    }

    // Requests I made for other vehicles (I am the buyer)
    let outgoingRequests: any[] = [];
    if (!role || role === "buyer") {
      outgoingRequests = await prisma.testDriveRequest.findMany({
        where: { userId: session.user.id },
        include: {
          vehicle: {
            select: {
              ...vehicleSelect,
              author: { select: userSelect }, // the seller
            },
          },
          availabilitySlot: true,
          report: true,
        },
        orderBy: { createdAt: "desc" },
      });
    }

    // If role is specified return flat array, otherwise return separated
    if (role === "seller") {
      return NextResponse.json({
        success: true,
        data: {
          requests: incomingRequests,
          total: incomingRequests.length,
          pending: incomingRequests.filter((r) => r.status === "pending").length,
          confirmed: incomingRequests.filter((r) => r.status === "confirmed").length,
          completed: incomingRequests.filter((r) => r.status === "completed").length,
          cancelled: incomingRequests.filter((r) => r.status === "cancelled").length,
        },
      });
    }

    if (role === "buyer") {
      return NextResponse.json({
        success: true,
        data: {
          requests: outgoingRequests,
          total: outgoingRequests.length,
          pending: outgoingRequests.filter((r) => r.status === "pending").length,
          confirmed: outgoingRequests.filter((r) => r.status === "confirmed").length,
          completed: outgoingRequests.filter((r) => r.status === "completed").length,
          cancelled: outgoingRequests.filter((r) => r.status === "cancelled").length,
        },
      });
    }

    // No role param — return both separated
    return NextResponse.json({
      success: true,
      data: {
        incoming: {
          requests: incomingRequests,
          total: incomingRequests.length,
        },
        outgoing: {
          requests: outgoingRequests,
          total: outgoingRequests.length,
        },
      },
    });
  } catch (error) {
    console.error("Failed to get test drive requests", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}