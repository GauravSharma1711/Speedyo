import { NextRequest, NextResponse } from "next/server";
import prisma from "@/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.user_type !== "private_seller") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

   
    const vehicles = await prisma.vehicle.findMany({
      where: { authorId: userId },
      select: {
        id: true,
        status: true,
        price: true,
        views: true,
        createdAt: true,
      },
    });

    const vehicleIds = vehicles.map((v) => v.id);

  
    const activeListings = vehicles.filter((v) => v.status === "available");

    const totalViews = vehicles.reduce((sum, v) => sum + v.views, 0);

  
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const viewsThisWeek = await prisma.vehicleView.count({
      where: {
        vehicleId: { in: vehicleIds },
        createdAt: { gte: oneWeekAgo },
      },
    });

  
    const testDriveRequests = await prisma.testDriveRequest.count({
      where: { vehicleId: { in: vehicleIds } },
    });

  
    const avgListPrice =
      activeListings.length > 0
        ? activeListings.reduce((sum, v) => sum + Number(v.price), 0) /
          activeListings.length
        : 0;

    const analytics = {
      active_listings: {
        count: activeListings.length,
        total: vehicles.length,
      },
      total_views: {
        all_time: totalViews,
        this_week: viewsThisWeek,
      },
      test_drive_requests: {
        all_time: testDriveRequests,
      },
      avg_list_price: Math.round(avgListPrice * 100) / 100,
    };

    return NextResponse.json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    console.error("Failed to get dashboard analytics", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}