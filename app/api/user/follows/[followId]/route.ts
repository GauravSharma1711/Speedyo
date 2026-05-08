import { NextRequest, NextResponse } from "next/server";
import prisma from "@/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";

export async function DELETE(req: NextRequest, context: { params: Promise<{ followId: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { followId } = await context.params;
  if (!followId) return NextResponse.json({ error: "followId missing" }, { status: 400 });

  const follow = await prisma.follow.findUnique({
    where: { id: followId },
    select: { id: true, followerId: true },
  });

  if (!follow) return NextResponse.json({ error: "Follow not found" }, { status: 404 });
  if (follow.followerId !== (session.user.id as string)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.follow.delete({ where: { id: followId } });

  return NextResponse.json({ success: true }, { status: 200 });
}