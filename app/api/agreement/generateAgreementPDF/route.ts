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

    // Only admins can generate agreements
    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { agreementId } = await request.json();

    if (!agreementId) {
      return NextResponse.json({ error: "agreementId is required" }, { status: 400 });
    }

    // Fetch agreement + linked vehicles
    const agreement = await prisma.dealershipVehicleAgreement.findUnique({
      where: { id: agreementId },
      include: { vehicles: true },
    });

    if (!agreement) {
      return NextResponse.json({ error: "Agreement not found" }, { status: 404 });
    }

    // ── Generate PDF ──────────────────────────────────────────────
    const doc = new jsPDF();
    let y = 20; // current Y position tracker

    const nextLine = (gap = 7) => { y += gap; };

    // ── Header ────────────────────────────────────────────────────
    doc.setFontSize(20);
    doc.text("Speedyo Managed Sales Service", 20, y);
    nextLine(10);
    doc.setFontSize(16);
    doc.text("Vehicle Listing Agreement", 20, y);
    nextLine(15);

    // ── Dealership Info ───────────────────────────────────────────
    doc.setFontSize(12);
    doc.text("Dealership Information", 20, y);
    nextLine(10);
    doc.setFontSize(10);

    doc.text(`Dealership: ${agreement.dealership_name}`, 20, y);
    nextLine();
    doc.text(`Representative: ${agreement.representative_name}`, 20, y);
    nextLine();
    doc.text(`Email: ${agreement.email}`, 20, y);
    nextLine();

    if (agreement.phone) {
      doc.text(`Phone: ${agreement.phone}`, 20, y);
      nextLine();
    }
    if (agreement.address) {
      doc.text(`Address: ${agreement.address}`, 20, y);
      nextLine();
    }
    if (agreement.license_number) {
      doc.text(`License Number: ${agreement.license_number}`, 20, y);
      nextLine();
    }

    nextLine(5);

    // ── Vehicles ──────────────────────────────────────────────────
    if (agreement.vehicles.length > 0) {
      doc.setFontSize(12);
      doc.text("Listed Vehicles", 20, y);
      nextLine(10);
      doc.setFontSize(10);

      agreement.vehicles.forEach((vehicle, index) => {
        // Add new page if running out of space
        if (y > 260) {
          doc.addPage();
          y = 20;
        }

        doc.text(`${index + 1}. ${vehicle.year} ${vehicle.make} ${vehicle.model}`, 20, y);
        nextLine();
        doc.text(`   Price: $${Number(vehicle.price).toLocaleString()}`, 20, y);
        nextLine();

        if (vehicle.mileage) {
          doc.text(`   Mileage: ${vehicle.mileage.toLocaleString()} km`, 20, y);
          nextLine();
        }
        if (vehicle.condition) {
          doc.text(`   Condition: ${vehicle.condition}`, 20, y);
          nextLine();
        }
        if (vehicle.location) {
          doc.text(`   Location: ${vehicle.location}`, 20, y);
          nextLine();
        }

        nextLine(3);
      });
    }

    nextLine(5);

    // ── Terms ─────────────────────────────────────────────────────
    doc.setFontSize(12);
    doc.text("Terms", 20, y);
    nextLine(10);
    doc.setFontSize(10);

    if (agreement.service_fee_amount) {
      doc.text(
        `Service Fee: $${Number(agreement.service_fee_amount).toLocaleString()} per vehicle listing`,
        20,
        y
      );
      nextLine();
    } else {
      doc.text("Service Fee: To be determined per vehicle", 20, y);
      nextLine();
    }

    doc.text(`Agreement Status: ${agreement.status}`, 20, y);
    nextLine();

    if (agreement.agreement_url) {
      doc.text(`Agreement URL: ${agreement.agreement_url}`, 20, y);
      nextLine();
    }

    nextLine(5);

    // ── Signature ─────────────────────────────────────────────────
    if (agreement.signed_by_name && agreement.signed_at) {
      if (y > 250) {
        doc.addPage();
        y = 20;
      }

      doc.setFontSize(12);
      doc.text("Signature", 20, y);
      nextLine(10);
      doc.setFontSize(10);

      doc.text(`Signed by: ${agreement.signed_by_name}`, 20, y);
      nextLine();
      doc.text(`Date: ${new Date(agreement.signed_at).toLocaleString()}`, 20, y);
      nextLine();
      doc.text(`Agreement Accepted: ${agreement.agreement_accepted ? "Yes" : "No"}`, 20, y);
      nextLine();
    } else {
      doc.setFontSize(10);
      doc.text("Status: Awaiting signature", 20, y);
      nextLine();
    }

    // ── Admin Notes (only in PDF, admin already authenticated) ────
    if (agreement.admin_notes) {
      nextLine(5);
      doc.setFontSize(12);
      doc.text("Admin Notes", 20, y);
      nextLine(10);
      doc.setFontSize(10);
      doc.text(agreement.admin_notes, 20, y);
    }

    // ── Output ────────────────────────────────────────────────────
    const pdfBuffer = Buffer.from(doc.output("arraybuffer"));

    const filename = `Agreement_${agreement.dealership_name.replace(/\s+/g, "_")}.pdf`;

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