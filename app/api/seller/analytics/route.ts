import { NextRequest, NextResponse } from "next/server";
import prisma from "@/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.user_type !== "private_seller" && session.user.user_type !== "dealership")) {
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


        const now = new Date();

    const thisWeekStart = new Date(now);
    thisWeekStart.setDate(now.getDate() - 7);

    const lastWeekStart = new Date(now);
    lastWeekStart.setDate(now.getDate() - 14);

    const lastWeekEnd = thisWeekStart; 

  const [viewsThisWeek, viewsLastWeek] = await Promise.all([
      prisma.vehicleView.count({
        where: { vehicleId: { in: vehicleIds }, createdAt: { gte: thisWeekStart } },
      }),
      prisma.vehicleView.count({
        where: { vehicleId: { in: vehicleIds }, createdAt: { gte: lastWeekStart, lt: lastWeekEnd } },
      }),
    ]);
 const [testDrivesThisWeek, testDrivesLastWeek] = await Promise.all([
      prisma.testDriveRequest.count({
        where: { vehicleId: { in: vehicleIds }, createdAt: { gte: thisWeekStart } },
      }),
      prisma.testDriveRequest.count({
        where: { vehicleId: { in: vehicleIds }, createdAt: { gte: lastWeekStart, lt: lastWeekEnd } },
      }),
    ]);
        const activeListings = vehicles.filter((v) => v.status === "available");
    const activeListingsLastWeek = vehicles.filter(
      (v) => v.createdAt >= lastWeekStart && v.createdAt < lastWeekEnd
    ).length;


       const totalViews = vehicles.reduce((sum, v) => sum + v.views, 0);
    const avgListPrice =
      activeListings.length > 0
        ? activeListings.reduce((sum, v) => sum + Number(v.price), 0) / activeListings.length
        : 0;

  
  
  
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const calcTrend = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

  
    const testDriveRequests = await prisma.testDriveRequest.count({
      where: { vehicleId: { in: vehicleIds } },
    });


    const analytics = {
      active_listings: {
           count: activeListings.length,
        total: vehicles.length,
        trend: calcTrend(activeListings.length, activeListingsLastWeek),
      },
      total_views: {
         all_time: totalViews,
        this_week: viewsThisWeek,
        trend: calcTrend(viewsThisWeek, viewsLastWeek),
      },
      test_drive_requests: {
        all_time: testDriveRequests,
           trend: calcTrend(testDrivesThisWeek, testDrivesLastWeek),
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