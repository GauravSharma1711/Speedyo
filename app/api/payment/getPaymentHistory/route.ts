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

    const userId    = session.user.id;
    const userEmail = session.user.email;

    // Fetch user with subscription from DB
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { seller_subscription: true },
    });

    let payments: any[] = [];
    let subscriptionDetails = null;

    // 1. Fetch payments from our DB (most reliable source)
    try {
      const dbTransactions = await prisma.paymentTransaction.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        include: { invoice: true },
      });

      payments = dbTransactions.map((tx) => ({
        id: tx.square_payment_id ?? tx.id,
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

    // 2. Fetch subscription details from Square if exists
    if (user?.seller_subscription?.square_subscription_id) {
      try {

        
const subResponse = await squareClient.subscriptions.get({
  subscriptionId: user.seller_subscription.square_subscription_id,
});

        const subscription = subResponse.subscription;

        subscriptionDetails = {
          id: subscription?.id,
          status: subscription?.status,
          current_period_start: subscription?.startDate,
          current_period_end: subscription?.chargedThroughDate,
          cancel_at_period_end: subscription?.canceledDate ? true : false,
          canceled_at: subscription?.canceledDate ?? null,
          tier: user.seller_subscription.tier,
        };
      } catch (error) {
        console.error("Error fetching subscription from Square:", error);

        // Fallback to DB data if Square call fails
        subscriptionDetails = {
          id: user.seller_subscription.square_subscription_id,
          status: "unknown",
          current_period_start: null,
          current_period_end: user.seller_subscription.expires_at,
          cancel_at_period_end: !!user.seller_subscription.cancellation_date,
          canceled_at: user.seller_subscription.cancellation_date ?? null,
          tier: user.seller_subscription.tier,
        };
      }
    }

    // 3. Also include activated guest purchases
    try {
      const guestPurchases = await prisma.guestPurchase.findMany({
        where: {
          activated_for_user_id: userId,
          payment_gateway: "square",
        },
        orderBy: { createdAt: "desc" },
      });

      guestPurchases.forEach((purchase) => {
        // Only add if not already in payments list
        const alreadyExists = payments.some((p) => p.id === purchase.payment_id);
        if (!alreadyExists) {
          payments.push({
            id: purchase.payment_id,
            amount: Number(purchase.amount_paid),
            currency: "USD",
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

    // Fetch invoices from DB
    const invoices = await prisma.invoice.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    }).catch(() => []);

    return NextResponse.json({
      payments,
      invoices: invoices.map((inv) => ({
        id: inv.id,
        invoice_number: inv.invoice_number,
        amount: Number(inv.amount),
        currency: inv.currency,
        status: inv.status,
        description: inv.description,
        created: inv.createdAt,
        paid_at: inv.paid_at,
        invoice_url: inv.invoice_url,
      })),
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