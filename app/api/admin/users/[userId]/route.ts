import { NextRequest, NextResponse } from "next/server";
import prisma from "@/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ userId: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId } = await context.params;

    const body = await request.json();
    const { user_type, verification_status } = body;

    if (!user_type && !verification_status) {
      return NextResponse.json(
        {
          error:
            "At least one field (user_type or verification_status) is required",
        },
        { status: 400 },
      );
    }

   
    const updateData: Record<string, any> = {};

    if (user_type !== undefined) updateData.user_type = user_type;
    if (verification_status !== undefined)
      updateData.verification_status = verification_status;

    // Update user in DB (adjust to your ORM/DB)
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    return NextResponse.json(
      { message: "User updated successfully", user: updatedUser },
      { status: 200 },
    );
  } catch (error) {
    console.error("Failed to update user", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
