import axios from "@/lib/axios";

export type SellerTransfer = {
  id: string;
  status?: string | null;
  createdAt?: string | Date | null;
  vehicle?: { id: string; title: string; make: string; model: string; year: number; price: number; primary_image: string | null };
  buyer?: { id: string; full_name: string; email: string };
};

export const sellerTransferService = {
  async list(): Promise<SellerTransfer[]> {
    const res = await axios.get("/api/seller/transfer");
    return res.data.data?.transfers ?? [];
  },
};
