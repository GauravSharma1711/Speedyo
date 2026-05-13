// app/api/admin/photographer-agreements/[agreementId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";

import { sendPhotographerAgreementMail } from "@/helpers/sendPhotographerAgreementMail";
import { uploadFile } from "@/lib/storage/uploadFile";

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
    if (!session ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
 
    const { aggrementId } = await context.params;
 
    const existing = await prisma.photographerAgreement.findUnique({
      where: { id: aggrementId },
    });
 
    if (!existing) {
      return NextResponse.json({ error: "Agreement not found" }, { status: 404 });
    }
 
    // ── Parse FormData ────────────────────────────────────────────────────────
    const formData = await request.formData();
 
    const full_name    = formData.get("full_name") as string | null;
    const email        = formData.get("email") as string | null;
    const phone        = formData.get("phone") as string | null;
    const motivation   = formData.get("motivation") as string | null;
    const photography_experience_years = formData.get("photography_experience_years");
 
    if (!full_name || !email || !phone || !photography_experience_years || !motivation) {
      return NextResponse.json(
        { error: "full_name, email, phone, photography_experience_years, and motivation are required" },
        { status: 400 },
      );
    }
 
    const address                        = formData.get("address") as string | null;
    const automotive_photography_experience = formData.get("automotive_photography_experience") as string | null;
    const equipment                      = formData.get("equipment") as string | null;
    const availability                   = formData.get("availability") as string | null;
    const location_preferences           = formData.get("location_preferences") as string | null;
 
    // ── Upload portfolio (single file, optional) ──────────────────────────────
    let portfolio_url: string | null = null;
    const portfolioEntry = formData.get("portfolio");
    if (portfolioEntry instanceof File && portfolioEntry.size > 0) {
      const result = await uploadFile(portfolioEntry, "portfolios");
      portfolio_url = result.url;
    }
 
    // ── Upload sample work (multiple files, optional) ─────────────────────────
    const sample_work_urls: string[] = [];
    const sampleEntries = formData.getAll("sample_work"); // getAll → File[]
    for (const entry of sampleEntries) {
      if (entry instanceof File && entry.size > 0) {
        const result = await uploadFile(entry, "samples");
        sample_work_urls.push(result.url);
      }
    }
 
    // ── Create application & update agreement ─────────────────────────────────
    const application = await prisma.photographerApplication.create({
      data: {
        full_name,
        email,
        phone,
        photography_experience_years: Number(photography_experience_years),
        motivation,
        address:                           address ?? null,
        automotive_photography_experience: automotive_photography_experience ?? null,
        portfolio_url,
        equipment:                         equipment ?? null,
        availability:                      availability ?? null,
        location_preferences:              location_preferences ?? null,
        sample_work_urls,
        reviewed_by_admin_id:              existing.created_by_admin_id,
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
      Number(photography_experience_years),
      aggrementId,
    );
 
  const updatedAgreement = await prisma.photographerAgreement.findUnique({
  where: { id: aggrementId },
  include: {
    application: true,
  },
});

return NextResponse.json({ success: true, agreement: updatedAgreement }, { status: 201 });
  } catch (error) {
    console.error("Failed to add application to photographer agreement", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}



// get by id 
export async function GET(
  request: NextRequest,
  { params }: { params: { aggrementId: string } }
) {
  const { aggrementId } = params;

  try {
    const agreement = await prisma.photographerAgreement.findUnique({
      where: { id: aggrementId },
      include: {
        application: true,
      },
    });

    if (!agreement) {
      return NextResponse.json({ error: "Agreement not found" }, { status: 404 });
    }

    return NextResponse.json({ agreement }, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch photographer agreement", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}