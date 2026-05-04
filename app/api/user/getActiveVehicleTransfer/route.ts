import { NextRequest, NextResponse } from "next/server";
import prisma from "@/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const transfers = await prisma.vehicleTransfer.findMany({
      where: {
        OR: [
          { buyerId: session.user.id },
          { sellerId: session.user.id },
        ],
        status: "in_progress", // only active transfers
      },
      include: {
        vehicle: {
          select: {
            id: true,
            title: true,
            make: true,
            model: true,
            year: true,
            price: true,
            primary_image_thumbnail: true,
          },
        },
        buyer: { select: { id: true, full_name: true, email: true, profile_image: true } },
        seller: { select: { id: true, full_name: true, email: true, profile_image: true } },
        createdBy: { select: { id: true, full_name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    // Attach role relative to logged-in user
    const transfersWithRole = transfers.map((transfer) => ({
      ...transfer,
      my_role: transfer.buyerId === session.user.id ? "buyer" : "seller",
    }));

    return NextResponse.json({ success: true, transfers: transfersWithRole });
  } catch (error) {
    console.error("Failed to get active transfers", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}