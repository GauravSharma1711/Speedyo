import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";
import prisma from "@/db/prisma";

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({
            error: "Unauthorized"
        }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id as string },
        select: {
            id: true,
            email: true,
            full_name: true,
            bio: true,
            location: true,
            profile_image: true,
            user_type: true,
            role: true,
            isVerified: true,
            setup_completed: true,
            welcome_email_sent: true,
            dealership_verification_status: true,
            admin_verification_notes: true,
            private_seller_slots: true,
            seller_subscription: true,
            createdAt: true,
    dealership_selected_tier: true,
    business_name: true,
    business_address: true,
    business_city: true,
    business_state: true,
    business_zip: true,
    business_license_urls: true,
    tax_id_number: true,
    verification_fee_paid: true,
        },
    });
    if (!user) {
        return NextResponse.json({
            error: "User not found"
        }, { status: 404 });
    }
    return NextResponse.json({
        success: true,
        user: {
            id: user.id,
            email: user.email,
            full_name: user.full_name,
            bio: user.bio,
            location: user.location,
            profile_image: user.profile_image,
            user_type: user.user_type,
            role: user.role,
            verified: user.isVerified,
            setup_completed: user.setup_completed,
            welcome_email_sent: user.welcome_email_sent,
            dealership_verification_status: user.dealership_verification_status,
            admin_verification_notes: user.admin_verification_notes,
            private_seller_slots: user.private_seller_slots,
            seller_subscription: user.seller_subscription,
            created_date: user.createdAt,
    dealership_selected_tier: user.dealership_selected_tier,
    business_name: user.business_name,
    business_address: user.business_address,
    business_city: user.business_city,
    business_state: user.business_state,
    business_zip: user.business_zip,
    business_license_urls: user.business_license_urls,
    tax_id_number: user.tax_id_number,
    verification_fee_paid: user.verification_fee_paid,
        },
    },
        { status: 200 }
    );
}
