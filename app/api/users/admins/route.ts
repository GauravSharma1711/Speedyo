import { NextResponse } from "next/server";
import prisma from "@/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const admins = await prisma.user.findMany({
      where: { role: "admin" },
      select: { id: true, email: true, full_name: true, profile_image: true },
    });

    return NextResponse.json({ success: true, admins });
  } catch (error) {
    console.error("[GET /api/users/admins]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
