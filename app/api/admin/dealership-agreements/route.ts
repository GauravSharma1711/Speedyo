import { NextRequest, NextResponse } from "next/server";
import prisma from "@/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      dealership_name,
      representative_name,
      email,
      address,
      phone,
      service_fee_amount,
      license_number,
      admin_notes,
    } = body;

    if (!dealership_name || !representative_name || !email) {
      return NextResponse.json(
        { error: "dealership_name, representative_name and email are required" },
        { status: 400 },
      );
    }

    const agreement = await prisma.dealershipVehicleAgreement.create({
      data: {
        dealership_name,
        representative_name,
        email,
        address: address || null,
        phone: phone || null,
        service_fee_amount: service_fee_amount || null,
        license_number: license_number || null,
        admin_notes: admin_notes || null,
        created_by_admin_id: session.user.id,
        status: "draft",
      },
      include: {
        createdByAdmin: { select: { id: true, full_name: true, email: true } },
        //   vehicles: { select: { id: true, title: true, make: true, model: true, year: true } },
      },
    });

    return NextResponse.json({ success: true, agreement }, { status: 201 });
  } catch (error) {
    console.error("Failed to create dealership aggrement", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const agreements = await prisma.dealershipVehicleAgreement.findMany({
      where: { created_by_admin_id: session.user.id },
      include: {
        createdByAdmin: { select: { id: true, full_name: true, email: true } },
        //   vehicles: { select: { id: true, title: true, make: true, model: true, year: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, agreements });
  } catch (error) {
    console.error("Failed to get dealership agreements", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
