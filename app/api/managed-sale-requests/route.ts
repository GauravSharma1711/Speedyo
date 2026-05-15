import { NextRequest, NextResponse } from "next/server";
import prisma from "@/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const msr = await prisma.managedSaleRequest.create({
      data: {
        submitted_by_user_id: session.user.id,
        contact_full_name: body.contact_full_name || "",
        contact_email: body.contact_email || "",
        contact_phone: body.contact_phone || null,
        listing_type: body.listing_type || "managed_sales",
        status: body.status || "pending_initial_review",
        vehicle_title: body.vehicle_title || null,
        vehicle_make: body.vehicle_make || null,
        vehicle_model: body.vehicle_model || null,
        vehicle_year: body.vehicle_year ? parseInt(String(body.vehicle_year)) : null,
        vehicle_mileage: body.vehicle_mileage ? parseInt(String(body.vehicle_mileage)) : null,
        vehicle_condition: body.vehicle_condition || null,
        vehicle_description: body.vehicle_description || null,
        vehicle_fuel_type: body.vehicle_fuel_type || null,
        vehicle_transmission: body.vehicle_transmission || null,
        vehicle_location: body.vehicle_location || null,
        seller_asking_price: body.seller_asking_price ? parseFloat(String(body.seller_asking_price)) : null,
        service_fee_amount: body.service_fee_amount ? parseFloat(String(body.service_fee_amount)) : null,
        owner_receives_amount: body.owner_receives_amount ? parseFloat(String(body.owner_receives_amount)) : null,
        final_sale_price_for_buyer: body.final_sale_price_for_buyer ? parseFloat(String(body.final_sale_price_for_buyer)) : null,
        terms_agreed: body.terms_agreed || false,
      },
    });

    return NextResponse.json({
      success: true,
      request: {
        ...msr,
        created_date: msr.createdAt,
      },
    }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/managed-sale-requests]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}