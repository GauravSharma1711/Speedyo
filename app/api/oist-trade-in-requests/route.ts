import { NextRequest, NextResponse } from "next/server";
import prisma from "@/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const isAdmin = session?.user?.role === "admin";

    const requests = await prisma.oISTTradeInRequest.findMany({
      orderBy: { createdAt: "desc" },
    });

    // Non-admins only see their own requests
    if (!isAdmin && session?.user?.id) {
      return NextResponse.json({
        success: true,
        requests: requests.filter(r => r.email === session.user?.email),
      });
    }

    return NextResponse.json({ success: true, requests });
  } catch (error) {
    console.error("[GET /api/oist-trade-in-requests]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { full_name, email, facebook_profile, vehicle_make, vehicle_model, vehicle_year, vehicle_mileage, vehicle_condition, additional_details } = body;

    if (!full_name || !email || !vehicle_make || !vehicle_model || !vehicle_year || !vehicle_mileage || !vehicle_condition) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const request = await prisma.oISTTradeInRequest.create({
      data: {
        full_name,
        email,
        facebook_profile: facebook_profile || null,
        vehicle_make,
        vehicle_model,
        vehicle_year,
        vehicle_mileage,
        vehicle_condition,
        additional_details: additional_details || null,
        status: "pending",
      },
    });

    return NextResponse.json({ success: true, request }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/oist-trade-in-requests]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}