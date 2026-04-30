// app/api/payments/guest-checkout/route.ts

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import prisma from "@/db/prisma";
import { sendPurchaseMail } from "@/helpers/purchaseMail";
import { sendAdminGuestPurchaseNotificationMail } from "@/helpers/sendAdminGuestPurchaseNotificationMail";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: NextRequest) {
  try {
    const { email, fullName, quantity, promoCode } = await request.json();

    if (!email || !fullName || !quantity) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const pricePerSlot = 1; // TEMPORARILY $1 for testing
    const hasPromo = promoCode && promoCode.toUpperCase() === "SELLER20";
    const discount = hasPromo ? 0.2 : 0;
    const subtotal = pricePerSlot * quantity * 100;
    const discountAmount = Math.round(subtotal * discount);
    const totalAmount = subtotal - discountAmount;

    const origin = request.headers.get("origin") ?? "https://speedio.app";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Private Seller Vehicle Slot",
              description: `${quantity} vehicle listing slot${quantity > 1 ? "s" : ""}`,
            },
            unit_amount: Math.round(totalAmount / quantity),
          },
          quantity,
        },
      ],
      mode: "payment",
      success_url: `${origin}/guest-order-confirmation?session_id={CHECKOUT_SESSION_ID}&email=${encodeURIComponent(email)}&slots=${quantity}`,
      cancel_url: `${origin}/guest-checkout?promoCode=${promoCode || ""}`,
      customer_email: email,
      metadata: {
        payment_type: "guest_private_seller_payment",
        guest_email: email,
        guest_name: fullName,
        quantity: quantity.toString(),
        promo_code: promoCode || "",
      },
    });

    // Non-blocking — don't fail checkout if DB/email fails
    try {
      await prisma.guestPurchase.create({
        data: {
          guest_email: email,
          guest_name: fullName,
          slots_purchased: quantity,
          amount_paid: totalAmount / 100,
          payment_id: session.id,
          payment_gateway: "stripe",
          promo_code_used: hasPromo ? promoCode : null,
          status: "pending_payment",
        },
      });

      // "Almost complete" email to guest
      await sendPurchaseMail(
        fullName,           // full_name
        email,              // email
        quantity,           // quantity
        totalAmount,        // total_amount (in cents — template divides by 100)
        hasPromo,           // has_promo
        promoCode || ""     // promo_code
      );

      // Notification to admin
      await sendAdminGuestPurchaseNotificationMail(
        process.env.ADMIN_EMAIL ?? "admin@speedio.app",  // admin_email
        fullName,                                         // guest_name
        email,                                            // guest_email
        quantity,                                         // quantity
        (totalAmount / 100).toFixed(2),                   // amount_paid
        session.id                                        // session_id
      );

    } catch (recordError) {
      console.error("Failed to create record or send emails:", recordError);
      // Continue — webhook handles fallback
    }

    return NextResponse.json({
      url: session.url,
      sessionId: session.id,
    });

  } catch (error: any) {
    console.error("Guest checkout error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create checkout session" },
      { status: 500 }
    );
  }
}