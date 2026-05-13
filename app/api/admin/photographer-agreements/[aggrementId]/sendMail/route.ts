
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";
import { sendPhotographerAgreementMail } from "@/helpers/sendPhotographerAgreementMail";

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
      include: { application: true },
    });

    if (!agreement) {
      return NextResponse.json({ error: "Agreement not found" }, { status: 404 });
    }

    if (!agreement.application) {
      return NextResponse.json({ error: "No application linked to this agreement" }, { status: 400 });
    }

    await sendPhotographerAgreementMail(
      agreement.application.email,
      agreement.application.full_name,
      agreement.position_title,
      Number(agreement.fixed_percentage),
      agreement.status,
      agreement.application.phone,
      agreement.application.photography_experience_years,
      aggrementId,
    );

    return NextResponse.json({ success: true, message: "Photographer agreement email sent successfully" });
  } catch (error) {
    console.error("Failed to send photographer agreement mail", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
