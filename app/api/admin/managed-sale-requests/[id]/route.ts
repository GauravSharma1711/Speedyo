import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/app/api/_utils/admin";
import prisma from "@/db/prisma";
import { workflowAdminPatchMsr, workflowDeleteMsr } from "@/lib/managed-sales/workflows";
import { managedSaleWorkflowResponse } from "@/app/api/_utils/workflow-error";
import { uploadFile } from "@/lib/storage/uploadFile";

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin();
    if (!admin.ok) return admin.response;

    const { id } = await ctx.params;

    const request = await prisma.managedSaleRequest.findUnique({
      where: { id },
      include: {
        submittedByUser: {
          select: {
            id: true,
            email: true,
            full_name: true,
            profile_image: true,
            phone: true,
            user_type: true,
          },
        },
        createdVehicle: {
          select: {
            id: true,
            title: true,
            status: true,
            price: true,
            recurring_availability: true,
            booked_slots: true,
            primary_image: true,
          },
        },
        inspectionChecklists: {
          select: {
            id: true,
            createdAt: true,
            date_of_inspection: true,
            inspector_name: true,
            dealership_name: true,
            managedSaleRequestId: true,
            vehicle_info: true,
            overall_condition: true,
            recommended_sale_price: true,
          },
        },
      },
    });

    if (!request) {
      return NextResponse.json({ error: "Managed sale request not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, request }, { status: 200 });
  } catch (error) {
    console.error("GET /api/admin/managed-sale-requests/[id] failed:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin();
    if (!admin.ok) return admin.response;

    const { id } = await ctx.params;

     const formData = await req.formData();
    const body: Record<string, unknown> = {};

        // Parse all non-file fields
    // for (const [key, value] of formData.entries()) {
    //   if (typeof value === "string") {
    //     try {
    //       body[key] = JSON.parse(value);
    //     } catch {
    //       body[key] = value;
    //     }
    //   }
    // }

    for (const [key, value] of formData.entries()) {
      if (typeof value === "string") {

        if (value.trim().startsWith('{') || value.trim().startsWith('[')) {
          try {
            body[key] = JSON.parse(value);
          } catch {
            body[key] = value;
          }
        } else {
          body[key] = value;
        }
      }
    } else {
      body[key] = value; 
    }
  }
}

const numericIntFields = ["vehicle_year", "vehicle_mileage", "doors", "seating_capacity"];
const numericDecimalFields = ["seller_asking_price", "service_fee_amount", "owner_receives_amount", "final_sale_price_for_buyer"];

for (const field of numericIntFields) {
  if (body[field] !== undefined && body[field] !== "") {
    body[field] = parseInt(String(body[field]), 10);
  }
}

for (const field of numericDecimalFields) {
  if (body[field] !== undefined && body[field] !== "") {
    body[field] = parseFloat(String(body[field]));
  }
}

  // Handle vehicle_images upload
    const imageFiles = formData.getAll("vehicle_images") as File[];
    const uploadedUrls: string[] = [];

    for (const file of imageFiles) {
      if (!(file instanceof File) || file.size === 0) continue;

      if (!file.type.startsWith("image/"))
        return NextResponse.json({ error: "All vehicle_images must be image files" }, { status: 400 });

      if (file.size > 10 * 1024 * 1024)
        return NextResponse.json({ error: "Each image must be smaller than 10MB" }, { status: 400 });

      const { url } = await uploadFile(file, "managed-sales");
      uploadedUrls.push(url);
    }

    const existingUrls: string[] = Array.isArray(body.vehicle_images)
      ? (body.vehicle_images as string[]).filter((v) => typeof v === "string")
      : [];

    if (uploadedUrls.length > 0 || existingUrls.length > 0) {
      body.vehicle_images = [...existingUrls, ...uploadedUrls];
    }


        if (!body.vehicle_images) delete body.vehicle_images;

    if (Object.keys(body).length === 0)
      return NextResponse.json({ error: "Empty body" }, { status: 400 });



    // const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
    // if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

    const updated = await workflowAdminPatchMsr(id, admin.userId, body);
    return NextResponse.json({ success: true, request: updated }, { status: 200 });
  } catch (error) {
    return managedSaleWorkflowResponse(error);
  }
}

export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin();
    if (!admin.ok) return admin.response;

    const { id } = await ctx.params;
    const deleteVehicle =
      new URL(req.url).searchParams.get("deleteVehicle") === "true";

    const result = await workflowDeleteMsr(id, admin.userId, { deleteVehicle });
    return NextResponse.json({ success: true, ...result }, { status: 200 });
  } catch (error) {
    return managedSaleWorkflowResponse(error);
  }
}
