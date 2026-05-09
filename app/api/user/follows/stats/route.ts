import { NextRequest, NextResponse } from "next/server";
import prisma from "@/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const targetId = searchParams.get("targetId") ?? searchParams.get("id");
  if (!targetId) return NextResponse.json({ error: "targetId is required" }, { status: 400 });

  const followerCount = await prisma.follow.count({ where: { followedId: targetId } });
  const followingCount = await prisma.follow.count({ where: { followerId: targetId } });

  const existing = await prisma.follow.findFirst({
    where: { followerId: session.user.id as string, followedId: targetId },
    select: { id: true },
  });

  return NextResponse.json(
    {
      success: true,
      stats: {
        followerCount,
        followingCount,
        isFollowing: Boolean(existing),
        followRecordId: existing?.id ?? null,
      },
    },
    { status: 200 }
  );
}