

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";

import prisma from "@/db/prisma";
import { sendGuestPaymentConfirmationMail } from "@/helpers/sendGuestPaymentConfirmationMail";
import { sendSlotsAddedConfirmationMail } from "@/helpers/sendSlotsAddedConfirmationMail";
import { squareClient } from "@/lib/payment/square"; 


export async function POST(request: NextRequest) {
  try {
    const {
      paymentToken,
      email,
      fullName,
      quantity,
      promoCode,
      amount,
      paymentType, // 'guest_private_seller' | 'private_seller'
    } = await request.json();

    if (!paymentToken || !email || !fullName || !quantity || !amount) {
      return NextResponse.json(
        { success: false, error: "Missing required payment information" },
        { status: 400 }
      );
    }

    const idempotencyKey = crypto.randomUUID();
    const hasPromo = promoCode && promoCode.toUpperCase() === "SELLER20";
    const totalAmount = amount;

    // Process Square payment
    let payment;
    try {
      const paymentResponse = await squareClient.payments.create({
        sourceId: paymentToken,
        idempotencyKey,
        amountMoney: {
          amount: BigInt(totalAmount),
          currency: "JPY",
        },
        buyerEmailAddress: email,
        note: `Speedyo Private Seller - ${quantity} vehicle slot${quantity > 1 ? "s" : ""}${hasPromo ? " (20% discount applied)" : ""}`,
        referenceId: `${paymentType}_${Date.now()}`,
      });

     payment = paymentResponse.payment;
      console.log("Square payment successful:", payment?.id);
    } catch (paymentError: any) {
      console.error("Square payment failed:", paymentError);
      return NextResponse.json(
        { success: false, error: paymentError.message || "Payment processing failed" },
        { status: 400 }
      );
    }

    // ── Guest Purchase ──
    if (paymentType === "guest_private_seller") {
      try {
        await prisma.guestPurchase.create({
          data: {
            guest_email: email,
            guest_name: fullName,
            slots_purchased: quantity,
            amount_paid: totalAmount / 100,
            payment_id: payment!.id!,
            payment_gateway: "square",
            promo_code_used: hasPromo ? promoCode : null,
            status: "payment_completed",
          },
        });

        // Guest payment confirmation email
        try {
          await sendGuestPaymentConfirmationMail(
            email,                            // guest_email
            fullName,                         // guest_name
            (totalAmount / 100).toFixed(2),   // amount_paid
            quantity,                         // quantity
            payment!.id!                      // transaction_id
          );
        } catch (emailError) {
          console.error("Failed to send guest confirmation email:", emailError);
        }

        return NextResponse.json({
          success: true,
          message: "Payment processed successfully",
          paymentId: payment!.id,
          isGuest: true,
          slotsPurchased: quantity,
        });

      } catch (error: any) {
        console.error("Failed to create guest purchase record:", error);
        return NextResponse.json(
          { success: false, error: "Payment processed but failed to save purchase record. Please contact support." },
          { status: 500 }
        );
      }
    }

    // ── Logged-in User Purchase ──
    if (paymentType === "private_seller") {
      try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
          return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.id;

        // Fetch user with slots
        const user = await prisma.user.findUnique({
          where: { id: userId },
          include: { private_seller_slots: true },
        });

        if (!user) {
          return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
        }

        const currentPurchased = user.private_seller_slots?.purchased ?? 0;
        const currentUsed = user.private_seller_slots?.used ?? 0;
        const wasGuest = user.user_type === "guest";

        // Update slots + upgrade user_type if guest
        await prisma.$transaction([
          prisma.privateSellerSlots.upsert({
            where: { userId },
            update: { purchased: currentPurchased + quantity },
            create: { userId, purchased: quantity, used: 0 },
          }),
          ...(wasGuest
            ? [prisma.user.update({
                where: { id: userId },
                data: { user_type: "private_seller" },
              })]
            : []),
        ]);

        const newTotal = currentPurchased + quantity;
        const available = newTotal - currentUsed;

        // Slots added confirmation email
        try {
      await sendSlotsAddedConfirmationMail(
  email,                           // email
  fullName,                        // full_name
  quantity,                        // quantity
  totalAmount / 100,               // total_amount (number, not string)
  payment!.id!,                    // payment_id
  newTotal,                        // new_total
  currentUsed,                     // current_used
  available,                       // available
  hasPromo,                        // has_promo
  wasGuest                         // is_guest_upgraded
);
        } catch (emailError) {
          console.error("Failed to send slots confirmation email:", emailError);
        }

        return NextResponse.json({
          success: true,
          message: "Payment processed and slots added successfully",
          paymentId: payment!.id,
          slotsAdded: quantity,
          totalSlots: newTotal,
          availableSlots: available,
          wasUpgraded: wasGuest,
        });

      } catch (error: any) {
        console.error("Failed to update user slots:", error);
        return NextResponse.json(
          { success: false, error: "Payment processed but failed to update account. Please contact support." },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { success: false, error: "Invalid payment type" },
      { status: 400 }
    );

  } catch (error: any) {
    console.error("Payment processing error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Payment processing failed" },
      { status: 500 }
    );
  }
}