import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/app/api/_utils/admin";
import prisma from "@/db/prisma";

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin();
    if (!admin.ok) return admin.response;

    const { id } = await ctx.params;

    const msr = await prisma.managedSaleRequest.findUnique({
      where: { id },
      include: {
        inspectionChecklists: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!msr) {
      return NextResponse.json({ error: "Managed sale request not found" }, { status: 404 });
    }

    return NextResponse.json(
      { success: true, checklists: msr.inspectionChecklists },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to fetch checklists attached to msr", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}