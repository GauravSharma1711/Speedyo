import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/app/api/_utils/admin";
import { workflowApproveEditRequest } from "@/lib/managed-sales/workflows";
import { managedSaleWorkflowResponse } from "@/app/api/_utils/workflow-error";

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string; index: string }> }
) {
  try {
    const admin = await requireAdmin();
    if (!admin.ok) return admin.response;

    const { id, index: indexRaw } = await ctx.params;
    const index = Number.parseInt(indexRaw, 10);
    if (!Number.isFinite(index) || index < 0) {
      return NextResponse.json({ error: "Invalid index" }, { status: 400 });
    }

    const body = (await req.json().catch(() => ({}))) as {
      adminNotes?: string | null;
    };

    const request = await workflowApproveEditRequest(id, admin.userId, index, {
      adminNotes: body.adminNotes,
    });

    return NextResponse.json({ success: true, request }, { status: 200 });
  } catch (error) {
    return managedSaleWorkflowResponse(error);
  }
}
