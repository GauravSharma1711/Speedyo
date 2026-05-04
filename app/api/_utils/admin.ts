import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/db/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";

export type AdminGate =
  | { ok: true; userId: string }
  | { ok: false; response: NextResponse<{ error: string }> };

export async function requireAdmin(): Promise<AdminGate> {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) {
    return { ok: false, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  if (user?.role !== "admin") {
    return { ok: false, response: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  return { ok: true, userId };
}

