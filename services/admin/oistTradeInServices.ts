import api from "@/lib/axios";

export type TradeInStatus = "pending" | "contacted" | "quoted" | "completed" | "cancelled";
export type TradeInCondition = "excellent" | "good" | "fair" | "poor";

export type TradeInRequestApi = {
    id: string;
    createdAt: string;
    status: TradeInStatus;
    full_name: string;
    email: string;
    facebook_profile?: string | null;
    vehicle_year: string;
    vehicle_make: string;
    vehicle_model: string;
    vehicle_mileage: string;
    vehicle_condition: TradeInCondition;
    additional_details?: string | null;
}

export type GetTradeInResponse = {
    success: boolean;
    page: number;
    limit: number;
    total: number;
    items: TradeInRequestApi[];
}

const oistTradeInService = {
    async list(params?: {
        status?: TradeInStatus;
        search?: string;
        page?: number;
        limit?: number;
    }): Promise<GetTradeInResponse> {
        const res = await api.get<GetTradeInResponse>("/api/admin/trade-ins", { params });
        return res.data;
    },


    async updateStatus(id: string, status: TradeInStatus): Promise<TradeInRequestApi> {
        const res = await api.patch<{ success: boolean; tradeIn: TradeInRequestApi }>(
          `/api/admin/trade-ins/${id}/status`,
          { status }
        );
        return res.data.tradeIn;
      },
}

export default oistTradeInService;