import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/app/api/_utils/admin";
import { workflowUpdateAvailability } from "@/lib/managed-sales/workflows";

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin();
    if (!admin.ok) return admin.response;

    const { id } = await ctx.params;
    const body = (await req.json().catch(() => null)) as null | {
      recurringAvailability?: unknown;
      recurring_availability?: unknown;
    };

    const slotsRaw = body?.recurringAvailability ?? body?.recurring_availability;
    const slots = Array.isArray(slotsRaw) ? slotsRaw : [];

    try {
      const request = await workflowUpdateAvailability(id, slots);
      return NextResponse.json({ success: true, request }, { status: 200 });
    } catch (error) {
      const msg =
        typeof error === "object" && error !== null && "message" in error
          ? String((error as Error).message)
          : "";
      if (msg === "NOT_FOUND") {
        return NextResponse.json({ error: "Managed sale request not found" }, { status: 404 });
      }
      throw error;
    }
  } catch (error) {
    console.error("PATCH availability failed:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
