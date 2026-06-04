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

    const dealerFee = body.dealer_fee ? parseFloat(String(body.dealer_fee)) : 0;
    const vehiclePrice = body.seller_asking_price ? parseFloat(String(body.seller_asking_price)) : 0;
    const totalPrice = vehiclePrice + dealerFee;

    const validUrls = (arr: string[]) =>
      Array.isArray(arr) ? arr.filter((u: string) => u && !u.startsWith("blob:")) : [];

    const msr = await prisma.managedSaleRequest.create({
      data: {
        submitted_by_user_id: session.user.id,
        contact_full_name: body.contact_full_name || "",
        contact_email: body.contact_email || "",
        contact_phone: body.contact_phone || null,
        listing_type: "direct",
        status: "pending_approval",
        terms_agreed: body.terms_agreed || false,
        vehicle_title: body.vehicle_title || null,
        vehicle_make: body.vehicle_make || null,
        vehicle_model: body.vehicle_model || null,
        vehicle_year: body.vehicle_year ? parseInt(String(body.vehicle_year)) : null,
        vehicle_mileage: body.vehicle_mileage ? parseInt(String(body.vehicle_mileage)) : null,
        vehicle_vin: body.vehicle_vin || null,
        vehicle_condition: body.vehicle_condition || null,
        vehicle_description: body.vehicle_description || null,
        vehicle_fuel_type: body.vehicle_fuel_type || null,
        vehicle_transmission: body.vehicle_transmission || null,
        vehicle_location: body.vehicle_location || null,
        seller_asking_price: vehiclePrice || null,
        dealer_fee: dealerFee || null,
        service_fee_amount: 0,
        owner_receives_amount: vehiclePrice || null,
        final_sale_price_for_buyer: totalPrice || null,
        vehicle_images: validUrls(body.vehicle_images),
        vehicle_images_thumbnails: validUrls(body.vehicle_images_thumbnails),
        vehicle_images_small: validUrls(body.vehicle_images_small),
        vehicle_images_medium: validUrls(body.vehicle_images_medium),
      },
    });

    return NextResponse.json(
      { success: true, request: { ...msr, created_date: msr.createdAt } },
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST /api/direct-listings]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
