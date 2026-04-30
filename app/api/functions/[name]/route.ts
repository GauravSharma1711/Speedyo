import { NextResponse } from "next/server";

export async function POST(req: Request, context: { params: Promise<{ name: string }> }) {
  const { name } = await context.params;
  const payload = await req.json().catch(() => ({}));

  if (name === "sendEmail") {
    console.log("[api/functions/sendEmail]", payload);
    return NextResponse.json({ ok: true });
  }

  if (name === "generateAgreementPDF") {
    console.log("[api/functions/generateAgreementPDF]", payload);
    return NextResponse.json({ ok: true, url: null });
  }

  console.log(`[api/functions/${name}]`, payload);
  return NextResponse.json({ ok: true });
}

