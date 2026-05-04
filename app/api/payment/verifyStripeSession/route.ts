


import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 });
    }

    // Retrieve session from Stripe
    const stripeSession = await stripe.checkout.sessions.retrieve(sessionId);

    // Verify session belongs to this user
    if (stripeSession.client_reference_id !== session.user.id) {
      return NextResponse.json(
        { error: "Session does not belong to this user" },
        { status: 403 }
      );
    }

    return NextResponse.json(stripeSession);

  } catch (error: any) {
    console.error("Error verifying Stripe session:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}