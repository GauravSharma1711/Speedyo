import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/app/api/_utils/admin";
import { workflowMarkSold } from "@/lib/managed-sales/workflows";
import { managedSaleWorkflowResponse } from "@/app/api/_utils/workflow-error";

export async function POST(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin();
    if (!admin.ok) return admin.response;

    const { id } = await ctx.params;
    const request = await workflowMarkSold(id, admin.userId);
    return NextResponse.json({ success: true, request }, { status: 200 });
  } catch (error) {
    return managedSaleWorkflowResponse(error);
  }
}
