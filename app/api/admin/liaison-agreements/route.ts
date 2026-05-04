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



    const agreement = await prisma.liaisonAgreement.create({
      data: {
        ...(agreement_title && { agreement_title }),
        ...(position_title && { position_title }),
        ...(fixed_fee_percentage && { fixed_fee_percentage }),
        ...(residual_pay_percentage && { residual_pay_percentage }),
        ...(termination_notice_days && { termination_notice_days }),
                ...(agreement_start_date && { agreement_start_date: new Date(agreement_start_date) }),
        ...(agreement_end_date && { agreement_end_date: new Date(agreement_end_date) }),
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