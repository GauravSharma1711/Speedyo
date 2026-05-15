import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";
import prisma from "@/db/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const vehicles = await prisma.vehicle.findMany({
        where:{
            authorId:session.user.id,
            isDirectListing:true,
        }
    })
  

     
   

    return NextResponse.json({ success: true, vehicles }, { status: 201 });
  } catch (error) {
    console.error("POST /api/vehicles/create failed:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

