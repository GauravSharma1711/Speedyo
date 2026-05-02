import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/app/api/_utils/admin";
import { workflowApproveAndList } from "@/lib/managed-sales/workflows";
import { managedSaleWorkflowResponse } from "@/app/api/_utils/workflow-error";

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin();
    if (!admin.ok) return admin.response;

    const { id } = await ctx.params;
    const body = (await req.json().catch(() => ({}))) as {
      adminNotes?: string | null;
      userFacingNotes?: string | null;
    };

    const result = await workflowApproveAndList(id, admin.userId, {
      adminNotes: body.adminNotes,
      userFacingNotes: body.userFacingNotes,
    });

    return NextResponse.json({ success: true, ...result }, { status: 200 });
  } catch (error) {
    return managedSaleWorkflowResponse(error);
  }
}
