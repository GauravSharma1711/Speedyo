import axios from "@/lib/axios";

// Updated type to match API response
export type TestDriveRequestData = {
  id: string;
  vehicleId?: string | null;
  userId?: string | null;
  status?: string | null;
  requested_date?: string | null;
  requested_time?: string | null;
  confirmed_date?: string | null;
  confirmed_time?: string | null;
  additional_notes?: string | null;
  cancellation_reason?: string | null;
  createdAt?: string | Date | null;
  updatedAt?: string | null;
  vehicle?: { id: string; title: string; make: string; model: string; year: number; primary_image: string | null; price?: string | number };
  user?: { id: string; full_name: string; email: string; phone?: string | null; profile_image: string | null };
  // Message-like properties for seller dashboard
  recipient_id?: string | null;
  sender_id?: string | null;
  test_drive_details?: {
    status?: string;
    preferred_date?: string | null;
    preferred_time?: string | null;
    vehicle_title?: string;
    requested_date?: string;
    requested_time?: string;
    location?: string;
    additional_notes?: string;
  };
  conversation_id?: string | null;
  content?: string;
  message_type?: string;
  // Backward compatibility aliases
  preferred_date?: string | null;
  preferred_time?: string | null;
  notes?: string | null;
  vehicle_id?: string | null;
  created_date?: string | null;
};

export const testDriveRequestService = {
  async listByRole(role: "seller" | "buyer" | null = null): Promise<TestDriveRequestData[]> {
    const res = await axios.get("/api/seller/testDriveRequests", { params: { role } });

    if (role === "seller") {
      return res.data.data?.requests ?? [];
    }
    if (role === "buyer") {
      return res.data.data?.requests ?? [];
    }
    // no role — both incoming + outgoing
    const incoming = res.data.data?.incoming?.requests ?? [];
    const outgoing = res.data.data?.outgoing?.requests ?? [];
    return [...incoming, ...outgoing];
  },
};
