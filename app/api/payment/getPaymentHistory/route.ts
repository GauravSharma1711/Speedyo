import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";
import { squareClient } from "@/lib/payment/square";
import prisma from "@/db/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { seller_subscription: true },
    });

    let payments: any[] = [];
    let subscriptionDetails = null;
    let dbTransactions: any[] = [];

    // 1. Fetch payments from DB
    try {
      dbTransactions = await prisma.paymentTransaction.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        include: { invoice: true },
      });

      payments = dbTransactions.map((tx) => ({
        id: tx.square_payment_id ?? tx.id,
         invoice_id: tx.invoice?.id ?? null, 
        amount: Number(tx.amount),
        currency: tx.currency,
        status: tx.status,
        description: tx.invoice?.description ?? tx.transaction_type.replace(/_/g, " "),
        created: tx.createdAt,
        receipt_url: tx.square_receipt_url ?? null,
        reference_id: null,
        transaction_type: tx.transaction_type,
        slots_purchased: tx.slots_purchased,
        invoice_number: tx.invoice?.invoice_number ?? null,
      }));
    } catch (error) {
      console.error("Error fetching transactions from DB:", error);
    }

    // 2. Fetch subscription details
    if (user?.seller_subscription) {
      const dbSub = user.seller_subscription;

      if (dbSub.square_subscription_id) {
        // Has Square subscription — fetch live data
        try {
          const subResponse = await squareClient.subscriptions.get({
            subscriptionId: dbSub.square_subscription_id,
          });
          const sq = subResponse.subscription;
          subscriptionDetails = {
            id: sq?.id,
            status: sq?.status?.toLowerCase() ?? "unknown",
            current_period_start: sq?.startDate ?? null,
            current_period_end: sq?.chargedThroughDate ?? null,
            cancel_at_period_end: sq?.canceledDate ? true : false,
            canceled_at: sq?.canceledDate ?? null,
            tier: dbSub.tier,
            vehicles_sold_this_year: dbSub.vehicles_sold_this_year,
          };
        } catch (error) {
          console.error("Error fetching subscription from Square:", error);
          // Fallback to DB
          subscriptionDetails = {
            id: dbSub.square_subscription_id,
            status: dbSub.cancellation_date
              ? "canceled"
              : dbSub.expires_at && dbSub.expires_at < new Date()
              ? "expired"
              : "active",
            current_period_start: dbSub.last_payment_at ?? null,
            current_period_end: dbSub.expires_at ?? null,
            cancel_at_period_end: !!dbSub.cancellation_date,
            canceled_at: dbSub.cancellation_date ?? null,
            tier: dbSub.tier,
            vehicles_sold_this_year: dbSub.vehicles_sold_this_year,
          };
        }
      } else {
        // Manual subscription — no Square sub ID, derive status from DB
        subscriptionDetails = {
          id: dbSub.id,
          status: dbSub.cancellation_date
            ? "canceled"
            : dbSub.expires_at && dbSub.expires_at < new Date()
            ? "expired"
            : "active",
          current_period_start: dbSub.last_payment_at ?? null,
          current_period_end: dbSub.expires_at ?? null,
          cancel_at_period_end: !!dbSub.cancellation_date,
          canceled_at: dbSub.cancellation_date ?? null,
          tier: dbSub.tier,
          vehicles_sold_this_year: dbSub.vehicles_sold_this_year,
        };
      }
    }

    // 3. Include activated guest purchases
    try {
      const guestPurchases = await prisma.guestPurchase.findMany({
        where: { activated_for_user_id: userId, payment_gateway: "square" },
        orderBy: { createdAt: "desc" },
      });

      guestPurchases.forEach((purchase) => {
        const alreadyExists = payments.some((p) => p.id === purchase.payment_id);
        if (!alreadyExists) {
          payments.push({
            id: purchase.payment_id,
            amount: Number(purchase.amount_paid),
            currency: "JPY",
            status: "completed",
            description: `Private Seller Slots - ${purchase.slots_purchased} slot${purchase.slots_purchased > 1 ? "s" : ""}`,
            created: purchase.createdAt,
            receipt_url: null,
            reference_id: null,
            transaction_type: "slot_purchase",
            slots_purchased: purchase.slots_purchased,
            invoice_number: null,
          });
        }
      });
    } catch (error) {
      console.error("Error fetching guest purchases:", error);
    }

    // Sort by most recent first
    payments.sort(
      (a, b) => new Date(b.created).getTime() - new Date(a.created).getTime()
    );

    // Build invoices — single map, all fields passed through
    const invoices = dbTransactions
      .filter((tx) => tx.invoice !== null)
      .map((tx) => ({
        id: tx.invoice!.id,
        invoice_number: tx.invoice!.invoice_number,
        amount: Number(tx.invoice!.amount),
        currency: tx.invoice!.currency,
        status: tx.invoice!.status,
        description: tx.invoice!.description,
        created: tx.invoice!.createdAt,
        paid_at: tx.invoice!.paid_at,
        invoice_url: tx.invoice!.invoice_url,
        period_start: tx.invoice!.period_start,
        period_end: tx.invoice!.period_end,
      }));

    return NextResponse.json({
      payments,
      invoices,        
      subscription: subscriptionDetails,
    });

  } catch (error: any) {
    console.error("Error in getPaymentHistory:", error);
    return NextResponse.json({
      payments: [],
      invoices: [],
      subscription: null,
      error: "Unable to fetch payment history at this time",
      message: error.message,
    });
  }
}