import { NextRequest, NextResponse } from "next/server";
import prisma from "@/db/prisma";
import { requireAdmin } from "@/app/api/_utils/admin";

const VALID_STATUSES = ["open", "in_progress", "resolved", "closed"] as const;

async function handleUpdate(
  req: NextRequest,
  ticketId: string
) {
  try {
    const admin = await requireAdmin();
    if (!admin.ok) return admin.response;

    const body = (await req.json().catch(() => null)) as null | { status?: string };
    if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

    const status = body.status;
    if (!status || !VALID_STATUSES.includes(status as (typeof VALID_STATUSES)[number])) {
      return NextResponse.json(
        { error: `status must be one of: ${VALID_STATUSES.join(", ")}` },
        { status: 400 }
      );
    }

    const existing = await prisma.supportTicket.findUnique({
      where: { id: ticketId },
    });
    if (!existing) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    const ticket = await prisma.supportTicket.update({
      where: { id: ticketId },
      data: { status: status as never },
    });

    return NextResponse.json({ success: true, ticket }, { status: 200 });
  } catch (error) {
    console.error("PUT /api/admin/support-tickets/[id] failed:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  ctx: { params: Promise<{ ticketId: string }> }
) {
  const { ticketId } = await ctx.params;
  return handleUpdate(req, ticketId);
}

