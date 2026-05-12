import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    applicationId: process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID,
    locationId: process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID,
  });
}