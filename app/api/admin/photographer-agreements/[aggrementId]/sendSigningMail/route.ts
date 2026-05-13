import { NextRequest, NextResponse } from "next/server";
import prisma from "@/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";
import { sendPhotographerSendAgreementMail } from "@/helpers/sendPhotographerSigningMail";

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

    const agreement = await prisma.photographerAgreement.findUnique({
      where: { id: aggrementId },
    });

    if (!agreement) {
      return NextResponse.json({ error: "Agreement not found" }, { status: 404 });
    }

    if (!agreement.photographer_email) {
      return NextResponse.json({ error: "No email linked to this agreement" }, { status: 400 });
    }

    if (!agreement.agreement_url) {
      return NextResponse.json({ error: "No agreement URL found" }, { status: 400 });
    }

    await sendPhotographerSendAgreementMail(
      agreement.photographer_email,
      agreement.position_title,
      Number(agreement.fixed_percentage),
      agreement.agreement_url,
      agreement.id,
    );

    await prisma.photographerAgreement.update({
      where: { id: aggrementId },
      data: { status: "pending_signature" },
    });

    return NextResponse.json({
      success: true,
      message: "Agreement sent successfully",
    });
  } catch (error) {
    console.error("Failed to send photographer send-agreement mail", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}