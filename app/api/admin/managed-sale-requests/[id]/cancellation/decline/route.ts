import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/app/api/_utils/admin";
import { workflowDeclineCancellation } from "@/lib/managed-sales/workflows";
import { managedSaleWorkflowResponse } from "@/app/api/_utils/workflow-error";

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin();
    if (!admin.ok) return admin.response;

    const { id } = await ctx.params;
    const body = (await req.json().catch(() => null)) as null | { reason?: string };
    const reason = (body?.reason ?? "").trim();
    if (!reason) {
      return NextResponse.json({ error: "reason is required" }, { status: 400 });
    }

    const request = await workflowDeclineCancellation(id, admin.userId, reason);
    return NextResponse.json({ success: true, request }, { status: 200 });
  } catch (error) {
    return managedSaleWorkflowResponse(error);
  }
}
