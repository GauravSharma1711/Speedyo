import axios from "@/lib/axios";

export type OISTTradeInRequestData = {
  id: string;
  full_name: string;
  email: string;
  facebook_profile: string | null;
  vehicle_make: string;
  vehicle_model: string;
  vehicle_year: string;
  vehicle_mileage: string;
  vehicle_condition: string;
  additional_details: string | null;
  status: string;
  createdAt: string | Date;
};

export const oistTradeInService = {
  async list(): Promise<OISTTradeInRequestData[]> {
    const res = await axios.get<{ success: true; requests: OISTTradeInRequestData[] }>("/api/oist-trade-in-requests");
    return res.data.requests ?? [];
  },

  async create(data: {
    full_name: string;
    email: string;
    facebook_profile?: string;
    vehicle_make: string;
    vehicle_model: string;
    vehicle_year: string;
    vehicle_mileage: string;
    vehicle_condition: string;
    additional_details?: string;
    status?: string;
  }): Promise<OISTTradeInRequestData> {
    const res = await axios.post<{ success: true; request: OISTTradeInRequestData }>(
      "/api/oist-trade-in-requests",
      data
    );
    return res.data.request;
  },

  async update(id: string, data: Partial<OISTTradeInRequestData>): Promise<OISTTradeInRequestData> {
    const res = await axios.patch<{ success: true; request: OISTTradeInRequestData }>(
      `/api/oist-trade-in-requests/${id}`,
      data
    );
    return res.data.request;
  },
};