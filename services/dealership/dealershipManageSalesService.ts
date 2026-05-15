import axios from "@/lib/axios";

export type DealershipManageSalesInput = {   
    dealershipName: string,
    contactName: string,
    email: string,
    phone: string,
    message: string,       
};

export const dealershipManageSaleService = {
  async inquiry(data: DealershipManageSalesInput) {
 

    const res = await axios.post("/api/dealership/inquiry", data);

    return res.data;
  },
};