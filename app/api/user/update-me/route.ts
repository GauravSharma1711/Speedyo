
// app/api/user/update-me/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";

const ALLOWED_FIELDS = [
  "full_name",
  "bio",
  "location",
  "setup_completed",
  "dealership_selected_tier",
  "dealership_verification_status",
  "verification_fee_paid",
];

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    if (!body || Object.keys(body).length === 0) {
      return NextResponse.json({ error: "No fields provided" }, { status: 400 });
    }

    // Pick only the allowed fields from the body
    const data: Record<string, any> = {};
    for (const key of ALLOWED_FIELDS) {
      if (key in body) data[key] = body[key];
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "No valid fields provided" }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data,
    });

    return NextResponse.json({ success: true, user }, { status: 200 });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}