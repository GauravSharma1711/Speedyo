import { NextRequest, NextResponse } from "next/server";
import prisma from "@/db/prisma";
import { requireAdmin } from "@/app/api/_utils/admin";

const VALID_STATUSES = ["new", "reviewed", "in_progress", "resolved"] as const;

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin();
    if (!admin.ok) return admin.response;

    const { id } = await context.params;

    const existing = await prisma.feedback.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Feedback not found" }, { status: 404 });
    }

    const body = (await req.json().catch(() => null)) as
      | null
      | { status?: string; admin_notes?: string | null };
    if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

    const { status, admin_notes } = body;

    if (status !== undefined && !VALID_STATUSES.includes(status as (typeof VALID_STATUSES)[number])) {
      return NextResponse.json(
        { error: `status must be one of: ${VALID_STATUSES.join(", ")}` },
        { status: 400 }
      );
    }
    if (admin_notes !== undefined && admin_notes !== null && typeof admin_notes !== "string") {
      return NextResponse.json({ error: "admin_notes must be a string" }, { status: 400 });
    }
    if (typeof admin_notes === "string" && admin_notes.length > 2000) {
      return NextResponse.json({ error: "admin_notes must be 2000 characters or fewer" }, { status: 400 });
    }

    if (status === undefined && admin_notes === undefined) {
      return NextResponse.json(
        { error: "at least one of status or admin_notes must be provided" },
        { status: 400 }
      );
    }

    const feedback = await prisma.feedback.update({
      where: { id },
      data: {
        ...(status !== undefined && { status: status as never }),
        ...(admin_notes !== undefined && { admin_notes }),
      },
    });

    return NextResponse.json({ success: true, feedback }, { status: 200 });
  } catch (error) {
    console.error("PUT /api/admin/feedback/[id] failed:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

