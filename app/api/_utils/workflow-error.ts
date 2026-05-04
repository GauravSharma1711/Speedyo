import { NextResponse } from "next/server";

export function managedSaleWorkflowResponse(e: unknown) {
  const msg = typeof e === "object" && e !== null && "message" in e ? String((e as Error).message) : "";

  switch (msg) {
    case "NOT_FOUND":
      return NextResponse.json({ error: "Managed sale request not found" }, { status: 404 });
    case "ALREADY_LISTED":
      return NextResponse.json({ error: "Request already linked to a vehicle listing" }, { status: 409 });
    case "NO_VEHICLE":
      return NextResponse.json({ error: "No linked vehicle listing" }, { status: 400 });
    case "NO_SUBMITTER":
      return NextResponse.json({ error: "Missing submitter on this request" }, { status: 400 });
    case "PRICING":
      return NextResponse.json(
        { error: "Cannot derive pricing — set seller_asking_price or fee fields." },
        { status: 400 }
      );
    case "BAD_STATUS":
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    case "BAD_INDEX":
      return NextResponse.json({ error: "Invalid edit-requests index" }, { status: 400 });
    case "INCOMPLETE_VEHICLE":
      return NextResponse.json(
        { error: "Incomplete vehicle data — title, make, and model are required to create a listing." },
        { status: 400 }
      );
    case "EMPTY_PATCH":
      return NextResponse.json({ error: "No updatable fields in request body" }, { status: 400 });
    default:
      console.error("Managed sale workflow:", e);
      return NextResponse.json({ error: msg || "Request failed" }, { status: 500 });
  }
}
