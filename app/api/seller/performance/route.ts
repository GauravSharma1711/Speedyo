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

    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "week"; 

    // Calculate date range based on period
    const now = new Date();
    const periodStart = new Date();
    const previousPeriodStart = new Date();

    switch (period) {
      case "week":
        periodStart.setDate(now.getDate() - 7);
        previousPeriodStart.setDate(now.getDate() - 14);
        break;
      case "month":
        periodStart.setMonth(now.getMonth() - 1);
        previousPeriodStart.setMonth(now.getMonth() - 2);
        break;
      case "quarter":
        periodStart.setMonth(now.getMonth() - 3);
        previousPeriodStart.setMonth(now.getMonth() - 6);
        break;
      case "year":
        periodStart.setFullYear(now.getFullYear() - 1);
        previousPeriodStart.setFullYear(now.getFullYear() - 2);
        break;
    }

   
    const vehicles = await prisma.vehicle.findMany({
      where: { authorId: userId },
      select: {
        id: true,
        title: true,
        price: true,
        status: true,
        createdAt: true,
        views: true,
        vehicleViews: {
          select: { id: true, createdAt: true },
        },
        conversations: {
          select: {
            id: true,
            createdAt: true,
            messages: {
              where: { message_type: "inquiry" },
              select: { id: true, createdAt: true },
              orderBy: { createdAt: "desc" },
              take: 1,
            },
          },
        },
      },
    });

    if (vehicles.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          period,
          total_views: { current: 0, previous: 0, change_percent: 0 },
          inquiries: { current: 0, previous: 0, change_percent: 0 },
          avg_views_per_listing: { current: 0, change_percent: 0 },
          conversion_rate: { current: 0, change_percent: 0 },
          top_performing_listing: null,
          recent_inquiry_activity: [],
          individual_listings: [],
        },
      });
    }

    const vehicleIds = vehicles.map((v) => v.id);

    // ── Views ──────────────────────────────────────────────
    const [currentViews, previousViews] = await Promise.all([
      prisma.vehicleView.count({
        where: { vehicleId: { in: vehicleIds }, createdAt: { gte: periodStart } },
      }),
      prisma.vehicleView.count({
        where: {
          vehicleId: { in: vehicleIds },
          createdAt: { gte: previousPeriodStart, lt: periodStart },
        },
      }),
    ]);

    // ── Inquiries (conversations started in period) ────────
    const [currentInquiries, previousInquiries] = await Promise.all([
      prisma.conversation.count({
        where: { vehicleId: { in: vehicleIds }, createdAt: { gte: periodStart } },
      }),
      prisma.conversation.count({
        where: {
          vehicleId: { in: vehicleIds },
          createdAt: { gte: previousPeriodStart, lt: periodStart },
        },
      }),
    ]);

    // ── Recent inquiry activity ────────────────────────────
    const recentConversations = await prisma.conversation.findMany({
      where: { vehicleId: { in: vehicleIds } },
      include: {
        user2: {
          select: { id: true, full_name: true, email: true, profile_image: true },
        },
        vehicle: { select: { id: true, title: true, price: true } },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { content: true, createdAt: true, message_type: true },
        },
      },
      orderBy: { last_message_at: "desc" },
      take: 5,
    });

    // ── Per-listing stats ──────────────────────────────────
    const individualListings = await Promise.all(
      vehicles.map(async (vehicle) => {
        const viewsInPeriod = vehicle.vehicleViews.filter(
          (v) => new Date(v.createdAt) >= periodStart
        ).length;

        const inquiriesInPeriod = await prisma.conversation.count({
          where: {
            vehicleId: vehicle.id,
            createdAt: { gte: periodStart },
          },
        });

        return {
          id: vehicle.id,
          title: vehicle.title,
          price: vehicle.price,
          status: vehicle.status,
          listed_at: vehicle.createdAt,
          views_total: vehicle.views,
          views_in_period: viewsInPeriod,
          inquiries_in_period: inquiriesInPeriod,
          conversion_rate:
            viewsInPeriod > 0
              ? Math.round((inquiriesInPeriod / viewsInPeriod) * 100 * 10) / 10
              : 0,
        };
      })
    );

    // ── Top performing listing (most views in period) ──────
    const topListing = [...individualListings].sort(
      (a, b) => b.views_in_period - a.views_in_period
    )[0];

    // ── Helper: % change ───────────────────────────────────
    const percentChange = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    const avgViewsCurrent =
      vehicles.length > 0
        ? Math.round((currentViews / vehicles.length) * 10) / 10
        : 0;

    const avgViewsPrevious =
      vehicles.length > 0
        ? Math.round((previousViews / vehicles.length) * 10) / 10
        : 0;

    const conversionCurrent =
      currentViews > 0
        ? Math.round((currentInquiries / currentViews) * 100 * 10) / 10
        : 0;

    const conversionPrevious =
      previousViews > 0
        ? Math.round((previousInquiries / previousViews) * 100 * 10) / 10
        : 0;

   return NextResponse.json({
  success: true,
  data: {
    period,
    total_views: {
      value: currentViews,
      change_percent: percentChange(currentViews, previousViews),
    },
    inquiries: {
      value: currentInquiries,
      change_percent: percentChange(currentInquiries, previousInquiries),
    },
    avg_views_per_listing: {
      value: avgViewsCurrent,
      change_percent: percentChange(avgViewsCurrent, avgViewsPrevious),
    },
    conversion_rate: {
      value: conversionCurrent,
      change_percent: percentChange(conversionCurrent, conversionPrevious),
    },
    top_performing_listing: topListing ?? null,
    recent_inquiry_activity: recentConversations.map((c) => ({
      conversation_id: c.id,
      vehicle: c.vehicle,
      buyer: c.user2,
      last_message: c.messages[0] ?? null,
      last_message_at: c.last_message_at,
    })),
    individual_listings: individualListings.sort(
      (a, b) => b.views_in_period - a.views_in_period
    ),
  },
});


  } catch (error) {
    console.error("Failed to get performance analytics", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}