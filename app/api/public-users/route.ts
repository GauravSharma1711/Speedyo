import { NextRequest, NextResponse } from "next/server";
import prisma from "@/db/prisma";

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      where: { role: { not: "admin" } },
      select: {
        id: true,
        full_name: true,
        email: true,
        profile_image: true,
        user_type: true,
        role: true,
        isVerified: true,
        bio: true,
        location: true,
      },
    });

    return NextResponse.json({
      success: true,
      users: users.map(u => ({
        id: u.id,
        user_id: u.id,
        full_name: u.full_name,
        email: u.email,
        profile_image: u.profile_image,
        user_type: u.user_type,
        role: u.role,
        verified: u.isVerified,
        bio: u.bio,
        location: u.location,
      })),
    });
  } catch (error) {
    console.error("[GET /api/public-users]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
