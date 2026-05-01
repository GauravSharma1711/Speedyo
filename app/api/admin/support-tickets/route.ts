import { NextRequest, NextResponse } from "next/server";
import prisma from "@/db/prisma";
import { requireAdmin } from "@/app/api/_utils/admin";
import { getPagination } from "@/app/api/_utils/pagination";

const VALID_STATUSES = ["open", "in_progress", "resolved", "closed"] as const;
const VALID_TICKET_TYPES = ["general", "billing", "technical", "listing_issue"] as const;
const VALID_PRIORITIES = ["low", "medium", "high", "urgent"] as const;

export async function GET(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin.ok) return admin.response;

    const { page, limit, skip, searchParams } = getPagination(req, { defaultLimit: 100, maxLimit: 100 });
    const status = (searchParams.get("status") ?? "").trim(); 
    const ticket_type = (searchParams.get("ticket_type") ?? "").trim();
    const priority = (searchParams.get("priority") ?? "").trim();

    if (status && !VALID_STATUSES.includes(status as (typeof VALID_STATUSES)[number])) {
      return NextResponse.json(
        { error: `status must be one of: ${VALID_STATUSES.join(", ")}` },
        { status: 400 }
      );
    }
    if (
      ticket_type &&
      !VALID_TICKET_TYPES.includes(ticket_type as (typeof VALID_TICKET_TYPES)[number])
    ) {
      return NextResponse.json(
        { error: `ticket_type must be one of: ${VALID_TICKET_TYPES.join(", ")}` },
        { status: 400 }
      );
    }
    if (
      priority &&
      !VALID_PRIORITIES.includes(priority as (typeof VALID_PRIORITIES)[number])
    ) {
      return NextResponse.json(
        { error: `priority must be one of: ${VALID_PRIORITIES.join(", ")}` },
        { status: 400 }
      );
    }

    const where: any = {
      ...(status && { status: status as never }),
      ...(ticket_type && { ticket_type: ticket_type as never }),
      ...(priority && { priority: priority as never }),
    };

    const [total, tickets] = await Promise.all([
      prisma.supportTicket.count({ where }),
      prisma.supportTicket.findMany({
        where,
        orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
        skip,
        take: limit,
      }),
    ]);

    return NextResponse.json({ success: true, page, limit, total, tickets }, { status: 200 });
  } catch (error) {
    console.error("GET /api/admin/support-tickets failed:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

