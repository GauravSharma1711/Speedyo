import { NextRequest, NextResponse } from "next/server";
import { squareClient } from "@/lib/payment/square";
import prisma from "@/db/prisma";
import { sendPurchaseMail } from "@/helpers/purchaseMail";
import { sendAdminGuestPurchaseNotificationMail } from "@/helpers/sendAdminGuestPurchaseNotificationMail";
import { randomUUID } from "crypto";



export async function POST(request: NextRequest) {
  try {
    const { email, fullName, quantity, promoCode, paymentToken } = await request.json();

    if (!email || !fullName || !quantity || !paymentToken) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const pricePerSlot = 100; // $1.00 in cents (testing)
    const hasPromo = promoCode && promoCode.toUpperCase() === "SELLER20";
    const subtotal = pricePerSlot * quantity;
    const discountAmount = hasPromo ? Math.round(subtotal * 0.2) : 0;
    const totalAmount = subtotal - discountAmount; // in cents

    // 1. Charge via Square
    const response = await squareClient.payments.create({
      sourceId: paymentToken,
      idempotencyKey: randomUUID(),
      amountMoney: {
        amount: BigInt(totalAmount),
        currency: "USD",
      },
      buyerEmailAddress: email,
      note: `Speedio Guest - ${quantity} vehicle slot${quantity > 1 ? "s" : ""}${hasPromo ? " (20% off)" : ""}`,
      referenceId: `guest_${Date.now()}`,
    });

    const payment = response.payment;

    if (!payment || payment.status !== "COMPLETED") {
      throw new Error("Payment not completed");
    }

    // 2. Save GuestPurchase record
    try {
      await prisma.guestPurchase.create({
        data: {
          guest_email: email,
          guest_name: fullName,
          slots_purchased: quantity,
          amount_paid: totalAmount / 100,
          payment_id: payment.id!,
          payment_gateway: "square",
          promo_code_used: hasPromo ? promoCode : null,
          status: "payment_completed",
        },
      });

      // Email to guest
      await sendPurchaseMail(
        fullName,
        email,
        quantity,
        totalAmount,
        hasPromo,
        promoCode || ""
      );

      // Notify admin
      await sendAdminGuestPurchaseNotificationMail(
        process.env.ADMIN_EMAIL ?? "admin@speedio.app",
        fullName,
        email,
        quantity,
        (totalAmount / 100).toFixed(2),
        payment.id!
      );
    } catch (recordError) {
      console.error("Failed to save record or send emails:", recordError);
      // Payment already succeeded — don't fail response
    }

    return NextResponse.json({
      success: true,
      paymentId: payment.id,
      receiptUrl: payment.receiptUrl,
      slotsPurchased: quantity,
      amountPaid: totalAmount / 100,
    });

  } catch (error: any) {
    console.error("Guest checkout error:", error);
    return NextResponse.json(
      { error: error.message || "Payment processing failed" },
      { status: 500 }
    );
  }
}