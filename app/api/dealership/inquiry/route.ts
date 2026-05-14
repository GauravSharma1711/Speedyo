import { NextRequest, NextResponse } from "next/server";
import { sendDealershipInquiryMails } from "@/helpers/sendDealershipInquiryMail";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
      
    const { dealershipName, contactName, email, phone, message } = body;

    // Basic validation
    if (!dealershipName || !contactName || !email || !phone || !message) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    const result = await sendDealershipInquiryMails({
      dealershipName,
      contactName,
      email,
      phone,
      message,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: result.message });
  } catch (error: any) {
    console.error("Dealership manage sale inquiry error:", error);
    return NextResponse.json(
      { error: error.message || "Dealership manage sale inquiry failed" },
      { status: 500 }
    );
  }
}