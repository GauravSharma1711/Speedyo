import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";
import prisma from "@/db/prisma";
import { squareClient } from "@/lib/payment/square";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        vehicles: true,
        seller_subscription: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 1. Hide all direct listings (not managed sales)
    const directListingIds = user.vehicles
      .filter((v) => !v.website_managed)
      .map((v) => v.id);

    if (directListingIds.length > 0) {
      await prisma.vehicle.updateMany({
        where: { id: { in: directListingIds } },
        data: { status: "hidden" },
      });
    }

    // 2. Cancel Square subscription if exists
    const squareSubId = user.seller_subscription?.square_subscription_id;
    if (squareSubId) {
      try {
        await squareClient.subscriptions.cancel({ subscriptionId: squareSubId });
      } catch (e) {
        console.error("Failed to cancel Square subscription:", e);
        // Don't block downgrade if Square cancel fails
      }
    }

    // 3. Downgrade user + clear subscription in one transaction
    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: {
          user_type: "guest",
          dealership_verification_status: "not_submitted",
          verification_fee_paid: false,
        },
      }),
      prisma.sellerSubscription.deleteMany({
        where: { userId },
      }),
    ]);

    return NextResponse.json({
      success: true,
      vehiclesHidden: directListingIds.length,
    });
  } catch (error: any) {
    console.error("Downgrade error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to downgrade account" },
      { status: 500 }
    );
  }
}