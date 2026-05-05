import { NextRequest, NextResponse } from "next/server";
import prisma from "@/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";


export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json(); 

    const {
      full_name,
      email,
      facebook_profile,
      vehicle_make,
      vehicle_model,
      vehicle_year,
      vehicle_mileage,
      vehicle_condition,
      additional_details,
    } = body;

    // Validate required fields
    if (!full_name || !email || !vehicle_make || !vehicle_model || !vehicle_year || !vehicle_condition) {
      return NextResponse.json(
        {
          error: "full_name, email, vehicle_make, vehicle_model, vehicle_year, and vehicle_condition are required",
        },
        { status: 400 }
      );
    }


    const listRequest = await prisma.oISTTradeInRequest.create({
      data: {
        full_name,
        email,
        facebook_profile: facebook_profile ?? null,
        vehicle_make,
        vehicle_model,
        vehicle_year,
        vehicle_mileage,
        vehicle_condition,
        additional_details: additional_details ?? null,
      },
    });

    return NextResponse.json({ success: true, listRequest }, { status: 201 });
  } catch (error) {
    console.error("Error while creating list request", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}