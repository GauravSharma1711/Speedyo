import { NextRequest, NextResponse } from "next/server";
import prisma from "@/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";
import { sendLiaisonSendAgreementMail } from "@/helpers/sendLiaisonSigningMail";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ aggrementId: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { aggrementId } = await context.params;

    
    const agreement = await prisma.liaisonAgreement.findUnique({
      where: { id: aggrementId },
      include: { application: true },
    });

    if (!agreement) {
      return NextResponse.json({ error: "Agreement not found" }, { status: 404 });
    }

    
    if (!agreement.application_id || !agreement.application) {
      return NextResponse.json({ error: "No application linked to this agreement" }, { status: 400 });
    }

    if (!agreement.application.email) {
      return NextResponse.json({ error: "No email linked to this agreement" }, { status: 400 });
    }

    if (!agreement.agreement_url) {
      return NextResponse.json({ error: "No agreement URL found" }, { status: 400 });
    }

    await sendLiaisonSendAgreementMail(
      agreement.application.email,         
      agreement.application.full_name,     
      agreement.position_title,
      Number(agreement.fixed_fee_percentage),
      Number(agreement.residual_pay_percentage),
      agreement.agreement_url,
      agreement.id,
    );

    await prisma.liaisonAgreement.update({
      where: { id: aggrementId },
      data: { status: "pending_signature" },
    });

    return NextResponse.json({
      success: true,
      message: "Agreement sent successfully",
    });
  } catch (error) {
    console.error("Failed to send liaison send-agreement mail", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}