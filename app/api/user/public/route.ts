import { NextRequest, NextResponse } from "next/server";
import prisma from "@/db/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId") ?? searchParams.get("id");
  if (!userId) return NextResponse.json({ error: "userId is required" }, { status: 400 });

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      full_name: true,
      bio: true,
      location: true,
      profile_image: true,
      user_type: true,
      role: true,
      isVerified: true,
    },
  });

  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  return NextResponse.json(
    {
      success: true,
      user: {
        id: user.id,
        user_id: user.id,
        full_name: user.full_name,
        bio: user.bio,
        location: user.location,
        profile_image: user.profile_image,
        verified: user.isVerified,
        user_type: user.user_type,
        role: user.role,
      },
    },
    { status: 200 }
  );
}