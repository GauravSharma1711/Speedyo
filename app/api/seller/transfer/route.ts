import { NextRequest, NextResponse } from "next/server";
import prisma from "@/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";



export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const transfers = await prisma.vehicleTransfer.findMany({
      where: { sellerId: session.user.id },
      include: {
        vehicle: {
          select: {
            id: true,
            title: true,
            make: true,
            model: true,
            year: true,
            price: true,
            primary_image: true,
            status: true,
          },
        },
        seller: {
          select: {
            id: true,
            full_name: true,
            email: true,
            phone: true,
            profile_image: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: {
        transfers,
        total: transfers.length,
        in_progress: transfers.filter((t) => t.status === "in_progress").length,
        completed: transfers.filter((t) => t.status === "completed").length,
        on_hold: transfers.filter((t) => t.status === "on_hold").length,
      },
    });
  } catch (error) {
    console.error("Failed to get transfers for current user", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}