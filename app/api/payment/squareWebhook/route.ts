import { NextRequest, NextResponse } from "next/server";
import { squareClient } from "@/lib/payment/square";
import prisma from "@/db/prisma";
import { sendGuestPaymentConfirmationMail } from "@/helpers/sendGuestPaymentConfirmationMail";
import { sendAdminGuestPurchaseNotificationMail } from "@/helpers/sendAdminGuestPurchaseNotificationMail";
import { sendPaymentConfirmationMail } from "@/helpers/sendPaymentConfirmationMail";
import { sendDealershipVerificationPaymentMail } from "@/helpers/sendDealershipVerificationPaymentMail";
import { sendDealershipSubscriptionConfirmationMail } from "@/helpers/sendDealershipSubscriptionConfirmationMail";
import crypto from "crypto";

const APP_URL = process.env.APP_URL || "https://speedio.app";

export async function POST(request: NextRequest) {
  let body: string;
  try {
    body = await request.text();
  } catch (err) {
    console.error("Failed to read request body:", err);
    return NextResponse.json({ error: "Failed to read request body" }, { status: 400 });
  }

  // ── Verify Square webhook signature ──
  const signature = request.headers.get("x-square-hmacsha256-signature") ?? "";
  const webhookUrl = process.env.SQUARE_WEBHOOK_URL!;
  const signatureKey = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY!;

  const hmac = crypto
    .createHmac("sha256", signatureKey)
    .update(webhookUrl + body)
    .digest("base64");

  if (hmac !== signature) {
    console.error("Invalid Square webhook signature");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let event: any;
  try {
    event = JSON.parse(body);
    console.log("Square webhook event received:", event.type);
  } catch (err) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  try {
    switch (event.type) {

      // ─────────────────────────────────────────────────────────────
      // Payment completed — same as Stripe's checkout.session.completed
      // ─────────────────────────────────────────────────────────────
      case "payment.completed": {
        const payment = event.data.object.payment;
        const referenceId: string = payment.reference_id ?? "";
        const amountPaid = (Number(payment.amount_money?.amount ?? 0) / 100).toFixed(2);
        const buyerEmail: string = payment.buyer_email_address ?? "";

        console.log("Payment completed:", payment.id, "ref:", referenceId);

        // Update PaymentTransaction status in DB
        await prisma.paymentTransaction.updateMany({
          where: { square_payment_id: payment.id },
          data: {
            status: "completed",
            square_receipt_url: payment.receipt_url ?? null,
          },
        }).catch(console.error);

        // ── Guest Private Seller ──
        if (referenceId.startsWith("guest_private_seller")) {
          const guestPurchase = await prisma.guestPurchase.findFirst({
            where: { payment_id: payment.id },
          });

          if (guestPurchase) {
            await prisma.guestPurchase.update({
              where: { id: guestPurchase.id },
              data: { status: "payment_completed" },
            });

            try {
              await sendGuestPaymentConfirmationMail(
                guestPurchase.guest_email,
                guestPurchase.guest_name,
                amountPaid,
                guestPurchase.slots_purchased,
                payment.id
              );
            } catch (e) {
              console.error("Failed to send guest confirmation email:", e);
            }

            // Notify admin
            try {
              const adminUser = await prisma.user.findFirst({ where: { role: "admin" } });
              if (adminUser) {
                await sendAdminGuestPurchaseNotificationMail(
                  adminUser.email,
                  guestPurchase.guest_name,
                  guestPurchase.guest_email,
                  guestPurchase.slots_purchased,
                  amountPaid,
                  payment.id
                );
              }
            } catch (e) {
              console.error("Failed to send admin notification:", e);
            }

            console.log(`Guest purchase confirmed: ${guestPurchase.guest_email}`);
          }
          break;
        }

        // ── Private Seller Slots (logged-in user) ──
        if (referenceId.startsWith("private_seller_")) {
          const transaction = await prisma.paymentTransaction.findFirst({
            where: { square_payment_id: payment.id },
            include: { user: { include: { private_seller_slots: true } } },
          });

          if (transaction?.user && buyerEmail) {
            try {
              await sendPaymentConfirmationMail(
                buyerEmail,
                transaction.user.full_name ?? "Customer",
                transaction.slots_purchased ?? 1,
                amountPaid,
                payment.id
              );
            } catch (e) {
              console.error("Failed to send payment confirmation email:", e);
            }
          }
          break;
        }

        // ── Dealership Verification ──
        if (referenceId.startsWith("dealership_verification_")) {
          const transaction = await prisma.paymentTransaction.findFirst({
            where: { square_payment_id: payment.id },
            include: { user: true },
          });

          if (transaction?.user && buyerEmail) {
            try {
              await sendDealershipVerificationPaymentMail(
                buyerEmail,
                transaction.user.full_name ?? "Customer",
                amountPaid,
                payment.id
              );
            } catch (e) {
              console.error("Failed to send dealership verification email:", e);
            }
          }
          break;
        }

        break;
      }

      // ─────────────────────────────────────────────────────────────
      // Payment failed
      // ─────────────────────────────────────────────────────────────
      case "payment.failed": {
        const payment = event.data.object.payment;

        await prisma.paymentTransaction.updateMany({
          where: { square_payment_id: payment.id },
          data: { status: "failed" },
        }).catch(console.error);

        console.log("Payment failed:", payment.id);
        break;
      }

      // ─────────────────────────────────────────────────────────────
      // Subscription created — same as Stripe checkout.session.completed (subscription mode)
      // ─────────────────────────────────────────────────────────────
      case "subscription.created": {
        const sub = event.data.object.subscription;

        const sellerSub = await prisma.sellerSubscription.findFirst({
          where: { square_subscription_id: sub.id },
          include: { user: true },
        });

        if (sellerSub) {
          await prisma.sellerSubscription.update({
            where: { userId: sellerSub.userId },
            data: {
              expires_at: sub.charged_through_date
                ? new Date(sub.charged_through_date)
                : null,
              next_billing_date: sub.charged_through_date
                ? new Date(sub.charged_through_date)
                : null,
            },
          });

          const tierNames: Record<string, string> = {
            tier1: "Standard",
            tier2: "Professional",
            tier3: "Enterprise",
          };

          try {
            await sendDealershipSubscriptionConfirmationMail(
              sellerSub.user.email,
              sellerSub.user.full_name ?? "Customer",
              tierNames[sellerSub.tier ?? ""] ?? "Unknown",
              "0.00", // first charge comes via invoice.payment_made
              sub.id
            );
          } catch (e) {
            console.error("Failed to send subscription confirmation email:", e);
          }

          console.log(`Subscription created for user ${sellerSub.userId}`);
        }
        break;
      }

      // ─────────────────────────────────────────────────────────────
      // Subscription renewed — same as Stripe invoice.payment_succeeded
      // ─────────────────────────────────────────────────────────────
      case "subscription.updated": {
        const sub = event.data.object.subscription;

        const sellerSub = await prisma.sellerSubscription.findFirst({
          where: { square_subscription_id: sub.id },
          include: { user: true },
        });

        if (sellerSub) {
          await prisma.sellerSubscription.update({
            where: { userId: sellerSub.userId },
            data: {
              next_billing_date: sub.charged_through_date
                ? new Date(sub.charged_through_date)
                : null,
              expires_at: sub.charged_through_date
                ? new Date(sub.charged_through_date)
                : null,
              last_payment_at: new Date(),
            },
          });

          console.log(`Subscription renewed for user ${sellerSub.userId}`);
        }
        break;
      }

      // ─────────────────────────────────────────────────────────────
      // Subscription cancelled — same as Stripe invoice.payment_failed
      // ─────────────────────────────────────────────────────────────
      case "subscription.deactivated": {
        const sub = event.data.object.subscription;

        const sellerSub = await prisma.sellerSubscription.findFirst({
          where: { square_subscription_id: sub.id },
          include: { user: true },
        });

        if (sellerSub) {
          await prisma.sellerSubscription.update({
            where: { userId: sellerSub.userId },
            data: {
              tier: "none",
              cancellation_date: new Date(),
            },
          });

          // Send payment failed / cancelled email
          try {
            const { resend } = await import("@/lib/resend");
            await resend.emails.send({
              from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
              to: sellerSub.user.email,
              subject: "Subscription Cancelled - Speedio",
              html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto;">
                  <h1 style="color: #dc2626;">Subscription Deactivated</h1>
                  <p>Hi ${sellerSub.user.full_name},</p>
                  <p>Your Speedio dealership subscription has been deactivated. If this was unexpected, please contact support or renew your subscription.</p>
                  <div style="text-align: center; margin: 20px 0;">
                    <a href="${APP_URL}/Subscription" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                      Renew Subscription
                    </a>
                  </div>
                  <p>The Speedio Team</p>
                </div>
              `,
            });
          } catch (e) {
            console.error("Failed to send deactivation email:", e);
          }

          console.log(`Subscription deactivated for user ${sellerSub.userId}`);
        }
        break;
      }

      // ─────────────────────────────────────────────────────────────
      // Invoice payment failed — same as Stripe invoice.payment_failed
      // ─────────────────────────────────────────────────────────────
      case "invoice.payment_failed": {
        const invoice = event.data.object.invoice;
        const subscriptionId = invoice.subscription_id;

        if (!subscriptionId) break;

        const sellerSub = await prisma.sellerSubscription.findFirst({
          where: { square_subscription_id: subscriptionId },
          include: { user: true },
        });

        if (sellerSub) {
          try {
            const { resend } = await import("@/lib/resend");
            await resend.emails.send({
              from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
              to: sellerSub.user.email,
              subject: "Payment Failed - Speedio Subscription",
              html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto;">
                  <h1 style="color: #dc2626;">Payment Failed</h1>
                  <p>Hi ${sellerSub.user.full_name},</p>
                  <p>We were unable to process your subscription payment. Please update your payment method to avoid service interruption.</p>
                  <div style="text-align: center; margin: 20px 0;">
                    <a href="${APP_URL}/Dashboard" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                      Update Payment Method
                    </a>
                  </div>
                  <p>The Speedio Team</p>
                </div>
              `,
            });
          } catch (e) {
            console.error("Failed to send payment failed email:", e);
          }

          console.log(`Payment failed notification sent to user ${sellerSub.userId}`);
        }
        break;
      }

      default:
        console.log(`Unhandled Square webhook event: ${event.type}`);
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