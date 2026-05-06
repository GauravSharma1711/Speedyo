import api from "@/lib/axios";

export type CreateLiaisonAgreementData = {
agreement_title:string
position_title:string
fixed_fee_percentage:string
residual_pay_percentage:string
termination_notice_days:string
agreement_start_date:string
agreement_end_date:string
status:string
agreement_url:string
admin_notes:string
}


export type AddApplicationToAgreementData = {
  full_name: string;
  email: string;
  phone: string;
  address: string;

  language_proficiency: string;
  previous_experience: string;
  automotive_knowledge: string;
  availability: string;
  motivation: string;

  resume_url: string;
};




const lisisonAgreementService = {

getAll: async () => {
    const res = await api.get("/api/admin/liaison-agreements");
    return res.data;
  },


  
  create: async (data: CreateLiaisonAgreementData) => {
    const res = await api.post("/api/admin/liaison-agreements", data);
    return res.data;
  },


    delete: async (agreementId: string) => {
    const res = await api.delete(
      `/api/admin/liaison-agreements/${agreementId}`
    );
    return res.data;
  },


    addApplication: async (
    agreementId: string,
    data: AddApplicationToAgreementData
  ) => {
    const res = await api.post(
      `/api/admin/liaison-agreements/${agreementId}/`,
      data
    );
    return res.data;
  },


}


export default lisisonAgreementService