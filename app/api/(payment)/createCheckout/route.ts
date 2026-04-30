

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const validPromoCodes: Record<string, string> = {
  SELLER20: "promo_1SIMrO0Sf8oiOE3POKqZNQm0",
};

const tierPrices = {
  tier1: { price: 9900, name: "Standard Dealership Plan" },
  tier2: { price: 19900, name: "Professional Dealership Plan" },
  tier3: { price: 34900, name: "Enterprise Dealership Plan" },
} as const;

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { type, tierId, purpose, quantity = 1, promoCode } = await request.json();

    const origin = request.headers.get("origin") ?? "";

    // Determine URL payment type
    let urlPaymentType = purpose || type;
    if (type === "dealership" && tierId && !purpose) urlPaymentType = "dealership_subscription";
    if (type === "private_seller" && !purpose) urlPaymentType = "private_seller_payment";

    const successUrl = `${origin}/OrderConfirmation?session_id={CHECKOUT_SESSION_ID}&payment_type=${urlPaymentType}&tier_id=${tierId || ""}&quantity=${quantity}&user_email=${encodeURIComponent(session.user.email)}`;
    const cancelUrl = `${origin}/Subscription`;

    const sharedMetadata = {
      user_id: session.user.id,
      user_email: session.user.email,
    };

    // Validate promo code
    let promoCodeId: string | null = null;
    if (promoCode) {
      const upper = promoCode.toUpperCase().trim();
      if (validPromoCodes[upper]) {
        promoCodeId = validPromoCodes[upper];
      } else {
        return NextResponse.json({ error: "Invalid promo code" }, { status: 400 });
      }
    }

    let checkoutSession;

    // ── Private Seller — one-time slot purchase ──
    if (type === "private_seller") {
      const sessionConfig: Stripe.Checkout.SessionCreateParams = {
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: "Private Seller Vehicle Slots",
                description: `Purchase ${quantity} vehicle slot${quantity > 1 ? "s" : ""} to sell your vehicles`,
              },
              unit_amount: 100, // $1.00 per slot (testing)
            },
            quantity,
          },
        ],
        mode: "payment",
        success_url: successUrl,
        cancel_url: cancelUrl,
        client_reference_id: session.user.id,
        metadata: {
          ...sharedMetadata,
          payment_type: "private_seller_payment",
          quantity: quantity.toString(),
        },
        custom_text: {
          submit: { message: "Complete your Speedio Private Seller purchase" },
        },
      };

      if (promoCodeId) {
        sessionConfig.discounts = [{ promotion_code: promoCodeId }];
      }

      checkoutSession = await stripe.checkout.sessions.create(sessionConfig);

    // ── Dealership Verification — one-time payment ──
    } else if (purpose === "dealership_verification") {
      checkoutSession = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: "Dealership Verification Fee",
                description: "One-time business verification and first month free",
              },
              unit_amount: 14900, // $149.00
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: successUrl,
        cancel_url: cancelUrl,
        client_reference_id: session.user.id,
        metadata: {
          ...sharedMetadata,
          payment_type: "dealership_verification",
        },
        custom_text: {
          submit: { message: "Complete your Speedio dealership verification" },
        },
      });

    // ── Dealership Subscription — recurring monthly ──
    } else if (type === "dealership") {
      const tierData = tierPrices[tierId as keyof typeof tierPrices];

      if (!tierData) {
        return NextResponse.json({ error: "Invalid tier selected" }, { status: 400 });
      }

      checkoutSession = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: tierData.name,
                description: `Monthly subscription for ${tierData.name}`,
              },
              unit_amount: tierData.price,
              recurring: { interval: "month" },
            },
            quantity: 1,
          },
        ],
        mode: "subscription",
        success_url: successUrl,
        cancel_url: cancelUrl,
        client_reference_id: session.user.id,
        metadata: {
          ...sharedMetadata,
          payment_type: "dealership_subscription",
          tier_id: tierId,
        },
        custom_text: {
          submit: { message: "Start your Speedio dealership subscription" },
        },
      });

    } else {
      return NextResponse.json({ error: "Invalid payment type" }, { status: 400 });
    }

    return NextResponse.json({
      url: checkoutSession.url,
      sessionId: checkoutSession.id,
    });

  } catch (error: any) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session", details: error.message },
      { status: 500 }
    );
  }
}