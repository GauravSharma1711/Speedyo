import api from "@/lib/axios";
import { CreateTransferData, UpdateTransferData } from "@/store/admin/transfer";

const transferService = {

  create: async (data: CreateTransferData) => {
    const res = await api.post("/api/admin/transfer", data);
    return res.data;
  },


  update: async (transferId: string, data: UpdateTransferData) => {
    const res = await api.patch(`/api/admin/transfer/${transferId}`, data);
    return res.data;
  },


  getAll: async () => {
    const res = await api.get("/api/admin/transfer");
    return res.data;
  },
};

export default transferService;