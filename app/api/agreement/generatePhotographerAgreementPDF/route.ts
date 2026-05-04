import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";
import prisma from "@/db/prisma";
import jsPDF from "jspdf";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { agreementId } = await request.json();

    if (!agreementId) {
      return NextResponse.json({ error: "agreementId is required" }, { status: 400 });
    }

    // Fetch agreement + linked application in one query
    const agreement = await prisma.photographerAgreement.findUnique({
      where: { id: agreementId },
      include: { application: true }, // has full_name, email, phone, experience
    });

    if (!agreement) {
      return NextResponse.json({ error: "Agreement not found" }, { status: 404 });
    }

    const app = agreement.application; // null if no application linked

    // ── Generate PDF ──────────────────────────────────────────────
    const doc = new jsPDF();
    let y = 20;

    const nextLine = (gap = 7) => { y += gap; };
    const checkPage = () => {
      if (y > 250) { doc.addPage(); y = 20; }
    };

    // ── Title ─────────────────────────────────────────────────────
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text(agreement.agreement_title, 20, y);
    nextLine(15);

    // ── 1. Position Title ─────────────────────────────────────────
    checkPage();
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("1. Position Title", 20, y);
    nextLine(8);
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(agreement.position_title, 25, y);
    nextLine(12);

    // ── 2. Responsibilities ───────────────────────────────────────
    checkPage();
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("2. Responsibilities", 20, y);
    nextLine(8);
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");

    const responsibilities = [
      "Photograph vehicles listed on the Speedio platform",
      "Deliver high-quality, edited images within agreed timeframes",
      "Maintain professional conduct during all shoots",
      "Follow Speedio photography guidelines and standards",
      "Maintain confidentiality of seller and buyer information",
      "Represent Speedio professionally at all times",
    ];

    responsibilities.forEach((resp) => {
      checkPage();
      doc.text(`• ${resp}`, 25, y);
      nextLine();
    });
    nextLine(5);

    // ── 3. Compensation ───────────────────────────────────────────
    checkPage();
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("3. Compensation", 20, y);
    nextLine(8);
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(
      `Fixed Percentage: ${Number(agreement.fixed_percentage)}% of service fee`,
      25, y
    );
    nextLine();
    doc.text("Payment upon vehicle sale", 25, y);
    nextLine(12);

    // ── 4. Confidentiality ────────────────────────────────────────
    checkPage();
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("4. Confidentiality", 20, y);
    nextLine(8);
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text("Photographer shall not disclose proprietary information.", 25, y);
    nextLine(12);

    // ── 5. Term and Termination ───────────────────────────────────
    checkPage();
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("5. Term and Termination", 20, y);
    nextLine(8);
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");

    const startDate = agreement.agreement_start_date
      ? new Date(agreement.agreement_start_date).toLocaleDateString()
      : "[Start Date]";
    const endDate = agreement.agreement_end_date
      ? new Date(agreement.agreement_end_date).toLocaleDateString()
      : "indefinite";

    doc.text(`Effective from ${startDate} to ${endDate}`, 25, y);
    nextLine();
    doc.text(
      `${agreement.termination_notice_days} days notice required for termination`,
      25, y
    );
    nextLine(12);

    // ── 6. Application Information (if linked) ────────────────────
    if (app) {
      checkPage();
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("6. Photographer Information", 20, y);
      nextLine(8);
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");

      doc.text(`Name: ${app.full_name}`, 25, y); nextLine();
      doc.text(`Email: ${app.email}`, 25, y); nextLine();
      doc.text(`Phone: ${app.phone}`, 25, y); nextLine();
      doc.text(`Experience: ${app.photography_experience_years} years`, 25, y); nextLine();

      if (app.address) {
        doc.text(`Address: ${app.address}`, 25, y); nextLine();
      }
      if (app.portfolio_url) {
        doc.text(`Portfolio: ${app.portfolio_url}`, 25, y); nextLine();
      }
      if (app.location_preferences) {
        doc.text(`Location Preferences: ${app.location_preferences}`, 25, y); nextLine();
      }

      nextLine(5);
    }

    // ── 7. Signatures ─────────────────────────────────────────────
    checkPage();
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("7. Signatures", 20, y);
    nextLine(10);
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");

    doc.text(`Agreement Status: ${agreement.status}`, 25, y);
    nextLine();

    if (agreement.status === "signed") {
      doc.text(`Signed by: ${app?.full_name ?? "N/A"}`, 25, y); nextLine();
    } else {
      doc.text("Photographer Signature: ______________________", 25, y); nextLine();
      doc.text("Date: ______________________", 25, y); nextLine();
    }

    // ── Admin Notes ───────────────────────────────────────────────
    if (agreement.admin_notes) {
      nextLine(5);
      checkPage();
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Admin Notes", 20, y);
      nextLine(8);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(agreement.admin_notes, 25, y);
    }

    // ── Output ────────────────────────────────────────────────────
    const pdfBuffer = Buffer.from(doc.output("arraybuffer"));

    const filename = app
      ? `Photographer_Agreement_${app.full_name.replace(/\s+/g, "_")}.pdf`
      : `Photographer_Agreement_${agreementId}.pdf`;

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });

  } catch (error) {
    console.error("Error generating PDF:", error);
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 });
  }
}