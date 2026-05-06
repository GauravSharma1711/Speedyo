// app/api/admin/photographer-agreements/[agreementId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";

import { sendPhotographerAgreementMail } from "@/helpers/sendPhotographerAgreementMail";

const photographerInclude = {
  createdByAdmin: { select: { id: true, full_name: true, email: true } },
  application: {
    select: {
      id: true,
      full_name: true,
      email: true,
      phone: true,
      photography_experience_years: true,
      motivation: true,
      address: true,
      automotive_photography_experience: true,
      portfolio_url: true,
      equipment: true,
      availability: true,
      location_preferences: true,
      sample_work_urls: true,
      status: true,
      admin_notes: true,
      reviewed_by_admin_id: true,
      reviewed_at: true,
    },
  },
};

// DELETE
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ aggrementId: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { aggrementId } = await context.params;

    const existing = await prisma.photographerAgreement.findUnique({
      where: { id: aggrementId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Agreement not found" }, { status: 404 });
    }

    await prisma.photographerAgreement.delete({ where: { id: aggrementId } });

    return NextResponse.json({ success: true, message: "Agreement deleted successfully" });
  } catch (error) {
    console.error("Failed to delete photographer agreement", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ADD APPLICATION
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

    const existing = await prisma.photographerAgreement.findUnique({
      where: { id: aggrementId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Agreement not found" }, { status: 404 });
    }

    const body = await request.json();
    const {
      full_name,
      email,
      phone,
      photography_experience_years,
      motivation,
      address,
      
      automotive_photography_experience,
      portfolio_url,
      equipment,
      availability,
      location_preferences,
      sample_work_urls,
    } = body;

    if (!full_name || !email || !phone || !photography_experience_years || !motivation) {
      return NextResponse.json(
        { error: "full_name, email, phone, photography_experience_years, and motivation are required" },
        { status: 400 },
      );
    }

    const application = await prisma.photographerApplication.create({
      data: {
        full_name,
        email,
        phone,
     photography_experience_years: Number(photography_experience_years),
        motivation,
        address: address ?? null,
        automotive_photography_experience: automotive_photography_experience ?? null,
        portfolio_url: portfolio_url ?? null,
        equipment: equipment ?? null,
        availability: availability ?? null,
        location_preferences: location_preferences ?? null,
        sample_work_urls: sample_work_urls ?? [],
        reviewed_by_admin_id: existing.created_by_admin_id,
      },
    });

    await prisma.photographerAgreement.update({
      where: { id: aggrementId },
      data: {
        application_id: application.id,
        status: "signed",
      },
    });

    await sendPhotographerAgreementMail(
      email,
      full_name,
      existing.position_title,
      Number(existing.fixed_percentage),
      existing.status,
      phone,
      photography_experience_years,
      aggrementId,
    );

    return NextResponse.json({ success: true, application }, { status: 201 });
  } catch (error) {
    console.error("Failed to add application to photographer agreement", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
