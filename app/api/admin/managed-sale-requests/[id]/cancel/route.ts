import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";
import prisma from "@/db/prisma";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const { cancellation_reason } = await req.json();

    if (!cancellation_reason?.trim()) {
      return NextResponse.json({ error: "Cancellation reason is required" }, { status: 400 });
    }

    // Verify the request belongs to this user
    const existing = await prisma.managedSaleRequest.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    if (existing.submitted_by_user_id !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const cancelableStatuses = ["pending_review", "approved", "listed"];
    if (!cancelableStatuses.includes(existing.status)) {
      return NextResponse.json(
        { error: `Cannot cancel a request with status: ${existing.status}` },
        { status: 400 }
      );
    }

    const updated = await prisma.managedSaleRequest.update({
      where: { id },
      data: {
        status: "cancellation_requested",
        cancellation_reason: cancellation_reason.trim(),
      },
    });

    return NextResponse.json({ success: true, request: updated });
  } catch (error) {
    console.error("Failed to cancel managed sale request", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}