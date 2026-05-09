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
    const {
      user_type,
      verification_status,
      dealership_verification_status,
      admin_verification_notes,
    } = body;

        if (Object.keys(body).length === 0) {
      return NextResponse.json(
        { error: "At least one field is required" },
        { status: 400 },
      );
    }


    // If declining, admin note is required
    if (dealership_verification_status === "declined" && !admin_verification_notes?.trim()) {
      return NextResponse.json(
        { error: "Admin note is required when declining a dealership application" },
        { status: 400 },
      );
    }


  
       const updateData: Record<string, any> = {};

    if (user_type !== undefined) updateData.user_type = user_type;
    if (verification_status !== undefined) updateData.verification_status = verification_status;
    if (dealership_verification_status !== undefined) updateData.dealership_verification_status = dealership_verification_status;
    if (admin_verification_notes !== undefined) updateData.admin_verification_notes = admin_verification_notes;

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
