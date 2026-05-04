import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@/lib/generated/prisma/client";
import prisma from "@/db/prisma";
import { Role, UserType } from "@/lib/generated/prisma/enums";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";
import { uploadFile } from "@/lib/storage/uploadFile";


const VALID_ROLES      = ["admin", "user"]                          as const;
const VALID_USER_TYPES = ["guest", "private_seller", "dealership"]  as const;

function validateFields(
  fields: Record<string, string | undefined>,
  isAdmin: boolean
): string | null {
  const { full_name, bio, location, role, user_type } = fields;

  const hasAnyField =
    full_name         !== undefined ||
    bio               !== undefined ||
    location          !== undefined ||
    fields.profile_image !== undefined ||
    role              !== undefined ||
    user_type         !== undefined;

  if (!hasAnyField)
    return "at least one field must be provided: full_name, bio, location, profile_image, role, user_type";

  if (role !== undefined && !isAdmin)
    return "you do not have permission to update role";

  if (role !== undefined && !VALID_ROLES.includes(role as typeof VALID_ROLES[number]))
    return `role must be one of: ${VALID_ROLES.join(", ")}`;

  if (user_type !== undefined && !isAdmin)
    return "you do not have permission to update user_type";

  // ✅ fixed: was checking `role` instead of `user_type`
  if (user_type !== undefined && !VALID_USER_TYPES.includes(user_type as typeof VALID_USER_TYPES[number]))
    return `user_type must be one of: ${VALID_USER_TYPES.join(", ")}`;

  if (full_name !== undefined) {
    if (full_name.trim().length === 0)
      return "full_name must be a non-empty string";
    if (full_name.trim().length > 100)
      return "full_name must be 100 characters or fewer";
  }

  if (bio !== undefined && bio.trim().length > 500)
    return "bio must be 500 characters or fewer";

  if (location !== undefined && location.trim().length > 200)
    return "location must be 200 characters or fewer";

  return null;
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sessionUser = await prisma.user.findUnique({
      where:  { id: session.user.id },
      select: { role: true },
    });
    const isAdmin = sessionUser?.role === "admin";

    const formData = await req.formData();

    // Extract — null means field was not sent
    const full_name   = formData.get("full_name")     as string | null;
    const bio         = formData.get("bio")           as string | null;
    const location    = formData.get("location")      as string | null;
    const role        = formData.get("role")          as string | null;
    const user_type   = formData.get("user_type")     as string | null; 
    const profileFile = formData.get("profile_image") as File   | null;

    const validationError = validateFields(
      {
        ...(full_name   !== null && { full_name }),
        ...(bio         !== null && { bio }),
        ...(location    !== null && { location }),
        ...(role        !== null && { role }),
        ...(user_type   !== null && { user_type }),
        ...(profileFile !== null && { profile_image: "pending" }),
      },
      isAdmin
    );
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const data: Prisma.UserUpdateInput = {};

    if (full_name !== null) data.full_name = full_name.trim();
    if (bio !== null) data.bio = bio.trim();
    if (location !== null) data.location = location.trim();
    if (role !== null) data.role = role as Role;
    if (user_type !== null) data.user_type = user_type as UserType;

    if (profileFile !== null) {
      if (!profileFile.type.startsWith("image/")) {
        return NextResponse.json(
          { error: "profile_image must be an image file" },
          { status: 400 }
        );
      }
      if (profileFile.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          { error: "profile_image must be smaller than 5MB" },
          { status: 400 }
        );
      }
      const { url } = await uploadFile(profileFile, "avatars");
      data.profile_image = url;
    }

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data,
      select: {
        id:            true,
        full_name:     true,
        bio:           true,
        location:      true,
        profile_image: true,
        email:         true,
        role:          true,
        user_type:     true, 
        updatedAt:     true,
      },
    });

    return NextResponse.json(
      { success: true, user, message: "User updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error while updating user", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}