import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";
import prisma from "@/db/prisma";
import { uploadFile } from "@/lib/storage/uploadFile";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();

    const dealership_selected_tier = formData.get("dealership_selected_tier") as string;
    const business_name = formData.get("business_name") as string;
    const business_address = formData.get("business_address") as string;
    const business_city = formData.get("business_city") as string;
    const business_state = formData.get("business_state") as string;
    const business_zip = formData.get("business_zip") as string;
    const dealer_License_Number = formData.get("dealer_License_Number") as string;

    // Handle multiple file uploads
    const files = formData.getAll("files") as File[];
    const uploadedUrls: string[] = [];

    for (const file of files) {
      if (file && file.size > 0) {
        const result = await uploadFile(file, "dealership-docs");
        uploadedUrls.push(result.url);
      }
    }

    // Also keep any existing URLs passed as strings
    const existingUrls = formData.getAll("existing_urls") as string[];
    const allUrls = [...existingUrls, ...uploadedUrls];

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        dealership_selected_tier: dealership_selected_tier as any,
        business_name,
        business_address,
        business_city,
        business_state,
        business_zip,
        dealer_License_Number,
        business_license_urls: allUrls,
        dealership_verification_status: "pending_payment",
        verification_fee_paid: false,
      },
      select: {
        id: true,
        dealership_selected_tier: true,
        business_name: true,
        dealership_verification_status: true,
        verification_fee_paid: true,
        business_license_urls: true,
      },
    });

    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    console.error("Dealership registration error:", error);
    return NextResponse.json(
      { error: error.message || "Registration failed" },
      { status: 500 }
    );
  }
}