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

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const weeklyViews = await prisma.vehicleView.findMany({
      where: {
        userId: session.user.id,
        createdAt: { gte: oneWeekAgo },
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
            status: true,
            views: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      total_this_week: weeklyViews.length,
      views: weeklyViews,
    });
  } catch (error) {
    console.error("Failed to get user vehicle views", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}