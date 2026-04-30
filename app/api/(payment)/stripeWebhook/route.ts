// app/api/webhooks/stripe/route.ts

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import prisma from "@/db/prisma";
import { sendGuestPaymentConfirmationMail } from "@/helpers/sendGuestPaymentConfirmationMail";
import { sendAdminGuestPurchaseNotificationMail } from "@/helpers/sendAdminGuestPurchaseNotificationMail";
import { sendPaymentConfirmationMail } from "@/helpers/sendPaymentConfirmationMail";
import { sendDealershipVerificationPaymentMail } from "@/helpers/sendDealershipVerificationPaymentMail";
import { sendDealershipSubscriptionConfirmationMail } from "@/helpers/sendDealershipSubscriptionConfirmationMail";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
const APP_URL = process.env.APP_URL || "https://speedio.app";

// ⚠️ CRITICAL: Must disable body parsing for Stripe webhook signature verification
export const config = {
  api: { bodyParser: false },
};

export async function POST(request: NextRequest) {
  let body: string;
  try {
    body = await request.text();
  } catch (err) {
    console.error("Failed to read request body:", err);
    return NextResponse.json({ error: "Failed to read request body" }, { status: 400 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    console.error("No Stripe signature in headers");
    return NextResponse.json({ error: "No signature provided" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
    console.log("Webhook event verified:", event.type);
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  try {
    switch (event.type) {

      // ─────────────────────────────────────────────────────────────
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        const userId       = session.client_reference_id || session.metadata?.user_id;
        const paymentType  = session.metadata?.payment_type;
        const tierId       = session.metadata?.tier_id;
        const quantity     = parseInt(session.metadata?.quantity || "1", 10);
        const userEmail    = session.customer_email || session.metadata?.user_email;
        const guestEmail   = session.metadata?.guest_email;
        const guestName    = session.metadata?.guest_name || "Customer";
        const amountPaid   = ((session.amount_total ?? 0) / 100).toFixed(2);

        console.log("Processing checkout.session.completed:", {
          userId, paymentType, tierId, quantity, userEmail, guestEmail, mode: session.mode,
        });

        // ── Guest Private Seller Payment ──
        if (paymentType === "guest_private_seller_payment" && guestEmail) {
          try {
            // Update GuestPurchase status to payment_completed
            await prisma.guestPurchase.updateMany({
              where: { payment_id: session.id },
              data: { status: "payment_completed" },
            });

            // Guest confirmation email
            await sendGuestPaymentConfirmationMail(
              guestEmail,   // guest_email
              guestName,    // guest_name
              amountPaid,   // amount_paid
              quantity,     // quantity
              session.id    // transaction_id
            );

            // Admin notification
            const adminUser = await prisma.user.findFirst({
              where: { role: "admin" },
            });

            if (adminUser) {
              await sendAdminGuestPurchaseNotificationMail(
                adminUser.email,  // admin_email
                guestName,        // guest_name
                guestEmail,       // guest_email
                quantity,         // quantity
                amountPaid,       // amount_paid
                session.id        // session_id
              );
            }

            console.log(`Guest purchase confirmed: ${guestEmail} bought ${quantity} slots`);
          } catch (err) {
            console.error("Failed to process guest purchase:", err);
          }
          break;
        }

        // ── Authenticated User Flow ──
        if (!userId) {
          console.error("No user ID found for authenticated user flow");
          break;
        }

        const user = await prisma.user.findUnique({
          where: { id: userId },
          include: { private_seller_slots: true, seller_subscription: true },
        });

        if (!user) {
          console.error("User not found:", userId);
          break;
        }

        // ── One-time Payment ──
        if (session.mode === "payment") {

          // Private Seller Slots Purchase
          if (paymentType === "private_seller_payment") {
            const currentPurchased = user.private_seller_slots?.purchased ?? 0;
            const currentUsed      = user.private_seller_slots?.used ?? 0;

            await prisma.$transaction([
              prisma.privateSellerSlots.upsert({
                where: { userId },
                update: { purchased: currentPurchased + quantity },
                create: { userId, purchased: quantity, used: 0 },
              }),
              prisma.user.update({
                where: { id: userId },
                data: { user_type: "private_seller" },
              }),
            ]);

            if (userEmail) {
              try {
                await sendPaymentConfirmationMail(
                  userEmail,
                  user.full_name ?? "Customer",
                  quantity,
                  amountPaid,
                  session.id
                );
              } catch (err) {
                console.error("Failed to send private seller confirmation email:", err);
              }
            }

            console.log(`User ${userId} purchased ${quantity} private seller slots`);
          }

          // Dealership Verification Fee
          else if (paymentType === "dealership_verification") {
            await prisma.user.update({
              where: { id: userId },
              data: {
                verification_fee_paid: true,
                dealership_verification_status: "pending_review",
              },
            });

            if (userEmail) {
              try {
                await sendDealershipVerificationPaymentMail(
                  userEmail,
                  user.full_name ?? "Customer",
                  amountPaid,
                  session.id
                );
              } catch (err) {
                console.error("Failed to send dealership verification email:", err);
              }
            }

            console.log(`User ${userId} paid dealership verification fee`);
          }
        }

        // ── Subscription ──
        else if (session.mode === "subscription") {
          if (paymentType === "dealership_subscription") {
            const subscription = await stripe.subscriptions.retrieve(
              session.subscription as string
            );

            await prisma.$transaction([
              prisma.user.update({
                where: { id: userId },
                data: {
                  user_type: "dealership",
                  dealership_verification_status: "approved",
                },
              }),
              prisma.sellerSubscription.upsert({
                where: { userId },
                update: {
                  tier: tierId as any,
                  expires_at: new Date(subscription.current_period_end * 1000),
                  square_subscription_id: subscription.id,
                  square_customer_id: subscription.customer as string,
                  vehicles_sold_this_year: 0,
                },
                create: {
                  userId,
                  tier: tierId as any,
                  expires_at: new Date(subscription.current_period_end * 1000),
                  square_subscription_id: subscription.id,
                  square_customer_id: subscription.customer as string,
                  vehicles_sold_this_year: 0,
                },
              }),
            ]);

            if (userEmail) {
              try {
                const tierNames: Record<string, string> = {
                  tier1: "Standard",
                  tier2: "Professional",
                  tier3: "Enterprise",
                };
                await sendDealershipSubscriptionConfirmationMail(
                  userEmail,
                  user.full_name ?? "Customer",
                  tierNames[tierId ?? ""] ?? "Unknown",
                  amountPaid,
                  subscription.id
                );
              } catch (err) {
                console.error("Failed to send dealership subscription email:", err);
              }
            }

            console.log(`User ${userId} subscribed to dealership tier ${tierId}`);
          }
        }

        break;
      }

      // ─────────────────────────────────────────────────────────────
      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;

        if (invoice.billing_reason === "subscription_cycle") {
          const subscription = await stripe.subscriptions.retrieve(
            invoice.subscription as string
          );

          // Find user by stripe customer id stored in seller_subscription
          const sellerSub = await prisma.sellerSubscription.findFirst({
            where: { square_subscription_id: invoice.subscription as string },
            include: { user: true },
          });

          if (sellerSub && sellerSub.user.user_type === "dealership") {
            await prisma.sellerSubscription.update({
              where: { userId: sellerSub.userId },
              data: {
                expires_at: new Date(subscription.current_period_end * 1000),
              },
            });
            console.log(`Dealership subscription renewed for user ${sellerSub.userId}`);
          }
        }
        break;
      }

      // ─────────────────────────────────────────────────────────────
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;

        const sellerSub = await prisma.sellerSubscription.findFirst({
          where: { square_subscription_id: invoice.subscription as string },
          include: { user: true },
        });

        if (sellerSub) {
          const { user } = sellerSub;
          try {
            const { resend } = await import("@/lib/resend");
            await resend.emails.send({
              from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
              to: user.email,
              subject: "Payment Failed - Speedio Subscription",
              html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto;">
                  <h1 style="color: #dc2626;">Payment Failed</h1>
                  <p>Hi ${user.full_name},</p>
                  <p>We were unable to process your subscription payment. Please update your payment method to avoid service interruption.</p>
                  <div style="text-align: center; margin: 20px 0;">
                    <a href="${APP_URL}/Dashboard" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                      Update Payment Method
                    </a>
                  </div>
                  <p>If you have any questions, please contact our support team.</p>
                  <p>The Speedio Team</p>
                </div>
              `,
            });
          } catch (err) {
            console.error("Failed to send payment failed email:", err);
          }

          console.log(`Payment failed notification sent to user ${user.id}`);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error: any) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed", details: error.message },
      { status: 500 }
    );
  }
}