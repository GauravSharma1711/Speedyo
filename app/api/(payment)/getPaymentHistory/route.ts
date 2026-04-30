// app/api/payments/history/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";
import { Client, Environment } from "square";
import prisma from "@/db/prisma";

const squareClient = new Client({
  accessToken: process.env.SQUARE_ACCESS_TOKEN,
  environment: Environment.Sandbox, // Change to Environment.Production for live
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const userEmail = session.user.email;

    // Fetch user with subscription from DB
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { seller_subscription: true },
    });

    let payments: any[] = [];
    let subscriptionDetails = null;

    // Fetch payments from Square filtered by email
    try {
      const searchPaymentsResponse = await squareClient.paymentsApi.listPayments();

      const userPayments =
        searchPaymentsResponse.result.payments?.filter(
          (payment) => payment.buyerEmailAddress === userEmail
        ) || [];

      payments = userPayments.map((payment) => ({
        id: payment.id,
        amount: Number(payment.amountMoney?.amount ?? 0) / 100,
        currency: payment.amountMoney?.currency,
        status: payment.status,
        description: payment.note || "Payment",
        created: payment.createdAt,
        receipt_url: payment.receiptUrl || null,
        reference_id: payment.referenceId || null,
      }));
    } catch (error) {
      console.error("Error fetching payments from Square:", error);
    }

    // Fetch subscription details if exists
    if (user?.seller_subscription?.square_subscription_id) {
      try {
        const subscriptionResponse =
          await squareClient.subscriptionsApi.retrieveSubscription(
            user.seller_subscription.square_subscription_id
          );

        const subscription = subscriptionResponse.result.subscription;

        subscriptionDetails = {
          id: subscription?.id,
          status: subscription?.status,
          current_period_start: subscription?.startDate,
          current_period_end: subscription?.chargedThroughDate,
          cancel_at_period_end: subscription?.canceledDate ? true : false,
          canceled_at: subscription?.canceledDate || null,
        };
      } catch (error) {
        console.error("Error fetching subscription from Square:", error);
      }
    }

    // Fetch activated guest purchases from Prisma
    try {
      const guestPurchases = await prisma.guestPurchase.findMany({
        where: {
          activated_for_user_id: userId,
          payment_gateway: "square",
        },
      });

      guestPurchases.forEach((purchase) => {
        payments.push({
          id: purchase.payment_id,
          amount: Number(purchase.amount_paid),
          currency: "USD",
          status: "completed",
          description: `Private Seller Slots - ${purchase.slots_purchased} slot${purchase.slots_purchased > 1 ? "s" : ""}`,
          created: purchase.createdAt,
          receipt_url: null,
          reference_id: null,
        });
      });
    } catch (error) {
      console.error("Error fetching guest purchases:", error);
    }

    // Sort by most recent first
    payments.sort(
      (a, b) => new Date(b.created).getTime() - new Date(a.created).getTime()
    );

    return NextResponse.json({
      payments,
      invoices: [],
      subscription: subscriptionDetails,
    });

  } catch (error: any) {
    console.error("Error in getPaymentHistory:", error);

    // Return empty data instead of 500 (same as original)
    return NextResponse.json({
      payments: [],
      invoices: [],
      subscription: null,
      error: "Unable to fetch payment history at this time",
      message: error.message,
    });
  }
}