import { NextRequest, NextResponse } from "next/server";
import prisma from "@/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";





export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }


const posts = await prisma.post.findMany({
  include: {
    author: {
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
        role: true,
        email: true,
        full_name: true,
        bio: true,
        profile_image: true,
        user_type: true,
        location: true,
        phone: true,
        dealership_verification_status: true,
        dealership_selected_tier: true,
        business_name: true,
        business_address: true,
        business_city: true,
        business_state: true,
        business_zip: true,
        business_license_urls: true,
        tax_id_number: true,
        verification_fee_paid: true,
        admin_verification_notes: true,
        welcome_email_sent: true,
        setup_completed: true,
        isVerified: true,
        verification_status: true,
      },
    },

    vehicle: true,

    comments: true,
  },
});

    return NextResponse.json({ success: true, posts }, { status: 201 });
  } catch (error) {
    console.error("Failed to fetch all posts", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
