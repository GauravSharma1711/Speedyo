import api from "@/lib/axios";

export type CreatePhotographerAgreementData = {
  agreement_title?: string;
  position_title?: string;
  photographer_email: string;
  fixed_percentage: string;
  termination_notice_days: string;
  agreement_start_date: string;
  agreement_end_date: string;
  admin_notes?: string;
};

export type AddApplicationToAgreementData = {
  full_name: string;
  email: string;
  phone: string;
  photography_experience_years: number;
  motivation: string;
  address?: string;
  automotive_photography_experience?: string;
  portfolio_url?: string;
  equipment?: string;
  availability?: string;
  location_preferences?: string;
  sample_work_urls?: string[];
};

const photographerAgreementService = {
  getAll: async () => {
    const res = await api.get("/api/admin/photographer-agreements");
    return res.data;
  },

  create: async (data: CreatePhotographerAgreementData) => {
    const res = await api.post("/api/admin/photographer-agreements", data);
    return res.data;
  },

  delete: async (agreementId: string) => {
    const res = await api.delete(
      `/api/admin/photographer-agreements/${agreementId}`
    );
    return res.data;
  },

  addApplication: async (
    agreementId: string,
    data: FormData  
  ) => {
    const res = await api.post(
      `/api/admin/photographer-agreements/${agreementId}`,
      data, {
      headers: { "Content-Type": "multipart/form-data" }, 
    }
    );
    return res.data;
  },

  sendSigningMail: async (agreementId: string) => {
    const res = await api.post(`/api/admin/photographer-agreements/${agreementId}/sendSigningMail`);
    return res.data;
  },

  sendMail:async(agreementId:string)=>{
     const res = await api.post(`/api/admin/photographer-agreements/${agreementId}/sendMail`);
    return res.data;
  },

  getAgreementById: async(id:string)=>{
     const res = await api.get(`/api/admin/photographer-agreements/${id}`);
    return res.data;
  }

};

export default photographerAgreementService;