import { NextRequest, NextResponse } from "next/server";
import { squareClient } from "@/lib/payment/square";
import prisma from "@/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";
import { sendPaymentConfirmationMail } from "@/helpers/sendPaymentConfirmationMail";
import { sendDealershipVerificationPaymentMail } from "@/helpers/sendDealershipVerificationPaymentMail";
import { sendDealershipSubscriptionConfirmationMail } from "@/helpers/sendDealershipSubscriptionConfirmationMail";
import { randomUUID } from "crypto";
import { CURRENCY, formatCurrency } from "@/lib/payment/square";

type TierId = "tier1" | "tier2" | "tier3";

const TIER_PRICES = {
  tier1: { amount: 40000, name: "Standard Dealership Plan" }, 
  tier2: { amount: 60000, name: "Professional Dealership Plan" }, 
  tier3: { amount: 90000, name: "Enterprise Dealership Plan" }, 
};



export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

        const body = await request.text();
    console.log("Raw request body:", body);
    console.log("Content-Type:", request.headers.get("content-type"));
    
    if (!body || body.trim() === "") {
      return NextResponse.json({ error: "Empty request body" }, { status: 400 });
    }

    const parsed = JSON.parse(body);
    console.log("Parsed body:", parsed);
    
    const { type, tierId, purpose, quantity = 1, promoCode, paymentToken, cardId } = parsed;

    const tier = tierId as TierId;

    // const { type, tierId, purpose, quantity = 1, promoCode, paymentToken, cardId } =
    //   await request.json();

    const userId    = session.user.id;
    const userEmail = session.user.email;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { private_seller_slots: true, seller_subscription: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // ── Private Seller — one-time slot purchase ──
    if (type === "private_seller") {
      const pricePerSlot = 8000; 
      const hasPromo = promoCode && promoCode.toUpperCase() === "SELLER20";
      const subtotal = pricePerSlot * quantity;
      const discountAmount = hasPromo ? Math.round(subtotal * 0.2) : 0;
      const totalAmount = subtotal - discountAmount;

      const response = await squareClient.payments.create({
        sourceId: paymentToken,
        idempotencyKey: randomUUID(),
        amountMoney: { amount: BigInt(totalAmount), currency: CURRENCY },
        buyerEmailAddress: userEmail,
        note: `Speedyo Private Seller - ${quantity} slot${quantity > 1 ? "s" : ""}${hasPromo ? " (20% off)" : ""}`,
        referenceId: `private_seller_${Date.now()}`,
      });


      console.log("Square payment response:", response);

      const payment = response.payment;
      if (!payment || payment.status !== "COMPLETED") {
        throw new Error("Payment not completed");
      }

      // Update slots + upgrade user_type if guest
      const currentPurchased = user.private_seller_slots?.purchased ?? 0;
      const currentUsed      = user.private_seller_slots?.used ?? 0;
      const wasGuest         = user.user_type === "guest";

  const tx = await prisma.$transaction(async (prisma) => {
  const tx = await prisma.paymentTransaction.create({
    data: {
      userId,
      transaction_type: "slot_purchase",
      amount: totalAmount,
      currency: CURRENCY,
      status: "completed",
      square_payment_id: payment.id!,
      square_receipt_url: payment.receiptUrl ?? null,
      slots_purchased: quantity,
      promo_code_used: hasPromo ? promoCode : null,
      invoice: {
        create: {
          userId,
          invoice_number: `INV-${new Date().getFullYear()}-${Date.now()}-${randomUUID().slice(0,6).toUpperCase()}`,
          amount: totalAmount,
          currency: CURRENCY,
          status: "paid",
          description: `Private Seller Slots — ${quantity} slot(s)${hasPromo ? " (20% off)" : ""}`,
          paid_at: new Date(),
              period_start: new Date(),                                    
    period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      },
    },
  });

  await prisma.privateSellerSlots.upsert({
    where: { userId },
    update: { purchased: currentPurchased + quantity },
    create: { userId, purchased: quantity, used: 0 },
  });

  if (wasGuest) {
    await prisma.user.update({
      where: { id: userId },
      data: { user_type: "private_seller" },
    });
  }

  return tx;
});




      try {
        await sendPaymentConfirmationMail(
          userEmail,
          user.full_name ?? "Customer",
          quantity,
          formatCurrency(totalAmount), 
          payment.id!
        );
      } catch (e) {
        console.error("Failed to send confirmation email:", e);
      }

      return NextResponse.json({
        success: true,
        paymentId: payment.id,
        receiptUrl: payment.receiptUrl,
        slotsAdded: quantity,
        totalSlots: currentPurchased + quantity,
        availableSlots: currentPurchased + quantity - currentUsed,
        wasUpgraded: wasGuest,
      });
    }

    // ── Dealership Verification — one-time fee ──
   if (purpose === "dealership_verification") {
  const totalAmount = 25000;

  const response = await squareClient.payments.create({
    sourceId: paymentToken,
    idempotencyKey: randomUUID(),
    amountMoney: { amount: BigInt(totalAmount), currency: CURRENCY },
    buyerEmailAddress: userEmail,
    note: "Speedyo Dealership Verification Fee",
    referenceId: `dealership_verification_${Date.now()}`,
  });

  const payment = response.payment;
  if (!payment || payment.status !== "COMPLETED") {
    throw new Error("Payment not completed");
  }

  
  await prisma.$transaction(async (prisma) => {
  await prisma.paymentTransaction.create({
    data: {
      userId,
      transaction_type: "one_time_service",
      amount: totalAmount,
      currency: CURRENCY,
      status: "completed",
      square_payment_id: payment.id!,
      square_receipt_url: payment.receiptUrl ?? null,
      invoice: {
        create: {
          userId,
          invoice_number: `INV-${new Date().getFullYear()}-${Date.now()}-${randomUUID().slice(0,6).toUpperCase()}`,
          amount: totalAmount,
          currency: CURRENCY,
          status: "paid",
          description: "Dealership Verification Fee — One-time payment",
          paid_at: new Date(),
              period_start: new Date(),                                    
    period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      },
    },
  });

  await prisma.user.update({
    where: { id: userId },
    data: {
      verification_fee_paid: true,
      dealership_verification_status: "pending_review",
    },
  });
});

  
  
  
 

      try {
        await sendDealershipVerificationPaymentMail(
          userEmail,
          user.full_name ?? "Customer",
          formatCurrency(totalAmount),
          payment.id!
        );
      } catch (e) {
        console.error("Failed to send verification email:", e);
      }

      return NextResponse.json({
        success: true,
        paymentId: payment.id,
        receiptUrl: payment.receiptUrl,
      });
    }

    // ── Dealership Subscription — recurring via Square Subscriptions ──
    if (type === "dealership") {


      if (!tierId || !TIER_PRICES[tier]) {
        return NextResponse.json({ error: "Invalid tier selected" }, { status: 400 });
      }

  let squareCustomerId = user.seller_subscription?.square_customer_id;
  if (!squareCustomerId) {
    const customerResponse = await squareClient.customers.create({
      emailAddress: userEmail,
      givenName: user.full_name ?? undefined,
    });

    squareCustomerId = customerResponse.customer?.id;

  if (!squareCustomerId) {
    return NextResponse.json(
      { error: "Failed to create Square customer" },
      { status: 500 }
    );
  }
}


  const paymentResponse = await squareClient.payments.create({
    idempotencyKey: randomUUID(),
    sourceId: paymentToken,            
    customerId: squareCustomerId,
    locationId: process.env.SQUARE_LOCATION_ID!,
    amountMoney: {
      amount: BigInt(TIER_PRICES[tier].amount),
      currency: CURRENCY,
    },
    note: TIER_PRICES[tier].name,
  });

     const payment = paymentResponse.payment;

     console.log("Square dealership_subscription payment response:", paymentResponse);

  if (!payment || payment.status !== "COMPLETED") {
    return NextResponse.json(
      { error: "Payment failed" },
      { status: 400 }
    );
  }

    const now = new Date();
  const expiresAt = new Date(now);
  expiresAt.setDate(expiresAt.getDate() + 30);

  await prisma.$transaction(async (prisma) => {
  await prisma.paymentTransaction.create({
    data: {
      userId,
      transaction_type: "subscription_purchase",
      amount: TIER_PRICES[tier].amount,
      currency: CURRENCY,
      status: "completed",
      square_payment_id: payment.id,
      square_customer_id: squareCustomerId,
      subscription_tier: tierId as any,
      invoice: {
        create: {
          userId,
          invoice_number: `INV-${new Date().getFullYear()}-${Date.now()}-${randomUUID().slice(0,6).toUpperCase()}`,
          amount: TIER_PRICES[tier].amount,
          currency: CURRENCY,
          status: "paid",
          description: `${TIER_PRICES[tier].name} — Monthly Subscription`,
          paid_at: new Date(),
              period_start: new Date(),                                    
    period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      },
    },
  });

  await prisma.user.update({
    where: { id: userId },
    data: {
      user_type: "dealership",
      dealership_verification_status: "approved",
    },
  });

  await prisma.sellerSubscription.upsert({
    where: { userId },
    update: {
      tier: tierId as any,
      square_customer_id: squareCustomerId,
      expires_at: expiresAt,
      next_billing_date: expiresAt,
      last_payment_at: now,
      last_payment_amount: TIER_PRICES[tier].amount,
    },
    create: {
      userId,
      tier: tierId as any,
      square_customer_id: squareCustomerId,
      expires_at: expiresAt,
      next_billing_date: expiresAt,
      last_payment_at: now,
      last_payment_amount: TIER_PRICES[tier].amount,
    },
  });
});



 

      const tierNames: Record<string, string> = {
        tier1: "Standard",
        tier2: "Professional",
        tier3: "Enterprise",
      };

      try {
        await sendDealershipSubscriptionConfirmationMail(
          userEmail,
          user.full_name ?? "Customer",
          tierNames[tierId] ?? "Unknown",
          formatCurrency(TIER_PRICES[tier].amount),
           payment.id ?? ""
        );
      } catch (e) {
        console.error("Failed to send subscription email:", e);
      }

      return NextResponse.json({
        success: true,
         paymentId: payment.id,
        tier: tierId,
      });
    }

    return NextResponse.json({ error: "Invalid payment type" }, { status: 400 });

  } catch (error: any) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: error.message || "Payment processing failed" },
      { status: 500 }
    );
  }
}


