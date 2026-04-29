import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";
import prisma from "@/db/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const email = session.user.email;
    const userId = session.user.id;

    console.log(`Checking for pending purchases for user: ${email}`);

    // Check for pending guest purchases
    const pendingPurchases = await prisma.guestPurchase.findMany({
      where: {
        guest_email: email,
        status: "payment_completed",
      },
    });

    if (pendingPurchases.length === 0) {
      return NextResponse.json({
        success: true,
        activated: false,
        message: "No pending purchases found",
      });
    }

    console.log(`Found ${pendingPurchases.length} pending purchase(s)`);

    // Calculate total slots
    const totalSlotsToActivate = pendingPurchases.reduce(
      (sum, purchase) => sum + purchase.slots_purchased,
      0
    );
    const purchaseIds = pendingPurchases.map((p) => p.id);

    // Get current slot counts from DB (not session)
    const currentSlots = await prisma.privateSellerSlots.findUnique({
      where: { userId },
    });

    const currentPurchased = currentSlots?.purchased ?? 0;
    const currentUsed = currentSlots?.used ?? 0;

    // Run everything in a transaction for safety
    await prisma.$transaction([
      // Update user type to private_seller
      prisma.user.update({
        where: { id: userId },
        data: { user_type: "private_seller" },
      }),

      // Upsert private seller slots
      prisma.privateSellerSlots.upsert({
        where: { userId },
        create: {
          userId,
          purchased: totalSlotsToActivate,
          used: 0,
        },
        update: {
          purchased: currentPurchased + totalSlotsToActivate,
          used: currentUsed,
        },
      }),

      // Mark all purchases as activated
      prisma.guestPurchase.updateMany({
        where: { id: { in: purchaseIds } },
        data: {
          status: "activated",
          activated_at: new Date(),
          activated_for_user_id: userId,
        },
      }),
    ]);

    console.log(`Successfully activated ${totalSlotsToActivate} slot(s) for ${email}`);

    return NextResponse.json({
      success: true,
      activated: true,
      slotsActivated: totalSlotsToActivate,
      message: `Successfully activated ${totalSlotsToActivate} vehicle slot${totalSlotsToActivate > 1 ? "s" : ""}`,
    });

  } catch (error) {
    console.error("Activation error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to activate purchases" },
      { status: 500 }
    );
  }
}