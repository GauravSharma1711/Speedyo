import { NextRequest, NextResponse } from "next/server";
import prisma from "@/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const limit = Math.min(50, parseInt(searchParams.get("limit") ?? "20"));

    const views = await prisma.vehicleView.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: limit,
      distinct: ["vehicleId"],
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
            primary_image_thumbnail: true,
            location: true,
            status: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      recentlyViewed: views.map((v) => v.vehicle),
    });
  } catch (error) {
    console.error("[GET /api/user/recently-viewed]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
