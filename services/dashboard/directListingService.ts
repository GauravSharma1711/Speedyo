import axios from "@/lib/axios";

export const directListingService = {
  async create(data: Record<string, unknown>) {
    const res = await axios.post("/api/direct-listings", data);
    return res.data.request;
  },
};
