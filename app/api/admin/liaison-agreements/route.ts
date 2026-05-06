import { NextRequest, NextResponse } from "next/server";
import prisma from "@/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";

const liaisonInclude = {
  createdByAdmin: { select: { id: true, full_name: true, email: true } },
  application: {
    select: {
      id: true,
      full_name: true,
      email: true,
      phone: true,
      language_proficiency: true,
      motivation: true,
      address: true,
      previous_experience: true,
      automotive_knowledge: true,
      availability: true,
      resume_url: true,
      status: true,
      admin_notes: true,
      reviewed_by_admin_id: true,
      reviewed_at: true,
    },
  },
};

const parseDate = (dateStr: string | undefined | null): Date | null => {
  if (!dateStr) return null;

  // Handle DD-MM-YY or DD-MM-YYYY format
  if (dateStr.includes("-")) {
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      const day = parseInt(parts[0]);
      const month = parseInt(parts[1]) - 1; // months are 0-indexed
      const year = parts[2].length === 2 ? 2000 + parseInt(parts[2]) : parseInt(parts[2]);
      const date = new Date(year, month, day);
      return isNaN(date.getTime()) ? null : date;
    }
  }

  // Fallback for ISO format like "2026-05-10"
  const parsed = new Date(dateStr);
  return isNaN(parsed.getTime()) ? null : parsed;
};

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      agreement_title,
      position_title,
        fixed_fee_percentage   ,
  residual_pay_percentage ,
  termination_notice_days   ,
      agreement_start_date,
      agreement_end_date,
   admin_notes,
    } = body;

console.log("Received body:", JSON.stringify(body));

    // Helper to safely parse dates


const agreement = await prisma.liaisonAgreement.create({
  data: {
    ...(agreement_title && { agreement_title }),
    ...(position_title && { position_title }),
    ...(fixed_fee_percentage && { fixed_fee_percentage: parseFloat(fixed_fee_percentage) }),
    ...(residual_pay_percentage && { residual_pay_percentage: parseFloat(residual_pay_percentage) }),
    ...(termination_notice_days && { termination_notice_days: parseInt(termination_notice_days) }),
    ...(parseDate(agreement_start_date) && { agreement_start_date: parseDate(agreement_start_date) }),
    ...(parseDate(agreement_end_date) && { agreement_end_date: parseDate(agreement_end_date) }),
    created_by_admin_id: session.user.id,
    admin_notes: admin_notes ?? null,
  },
});


    return NextResponse.json({ success: true, agreement }, { status: 201 });
  } catch (error) {
    console.error("Failed to create liaison agreement", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const liaisonAgreements = await prisma.liaisonAgreement.findMany({
      where: { created_by_admin_id: session.user.id },
      include: liaisonInclude,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, liaisonAgreements });
  } catch (error) {
    console.error("Failed to get liaison agreements", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}