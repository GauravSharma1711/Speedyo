import { NextRequest, NextResponse } from "next/server";
import prisma from "@/db/prisma";
import { requireAdmin } from "@/app/api/_utils/admin";

const VALID_STATUSES = ["pending", "contacted", "quoted", "completed", "cancelled"] as const;

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const admin = await requireAdmin();
    if (!admin.ok) return admin.response;

    const body = (await req.json().catch(() => null)) as null | { status?: string };
    if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

    const status = (body.status ?? "").trim();
    if (!status || !VALID_STATUSES.includes(status as (typeof VALID_STATUSES)[number])) {
      return NextResponse.json(
        { error: `status must be one of: ${VALID_STATUSES.join(", ")}` },
        { status: 400 }
      );
    }

    const existing = await prisma.oISTTradeInRequest.findUnique({
      where: { id },
    });
    if (!existing) {
      return NextResponse.json({ error: "Trade-in request not found" }, { status: 404 });
    }

    const tradeIn = await prisma.oISTTradeInRequest.update({
      where: { id },
      data: { status: status as never },
    });

    return NextResponse.json({ success: true, tradeIn }, { status: 200 });
  } catch (error) {
    console.error("PUT /api/admin/trade-ins/[id]/status failed:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

