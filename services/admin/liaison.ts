import api from "@/lib/axios";

export type CreateLiaisonAgreementData = {
agreement_title:string
position_title:string
fixed_fee_percentage:string
residual_pay_percentage:string
termination_notice_days:string|null,
agreement_start_date:string|null,
agreement_end_date:string|null,
status:string
agreement_url:string
admin_notes:string|null,
}


// export type AddApplicationToAgreementData = {
//   full_name: string;
//   email: string;
//   phone: string;
//   address: string;

//   language_proficiency: string;
//   previous_experience: string;
//   automotive_knowledge: string;
//   availability: string;
//   motivation: string;

//   resume_url: string;
// };

export type AddApplicationToAgreementData = FormData;


const lisisonAgreementService = {

getAll: async () => {
    const res = await api.get("/api/admin/liaison-agreements");
    return res.data;
  },

  downloadPdf: async (agreementId: string) => {
  const res = await api.get(
    `/api/admin/liaison-agreements/${agreementId}/download-pdf`,
    { responseType: "blob" }
  );
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


   addApplication: async (agreementId: string, data: FormData) => {
  const res = await api.post(
    `/api/admin/liaison-agreements/${agreementId}`,
    data,
    {
      headers: { "Content-Type": "multipart/form-data" }, 
    }
  );
  return res.data;
},

    sendSigningMail: async (agreementId: string) => {
      const res = await api.post(`/api/admin/liaison-agreements/${agreementId}/sendSigningMail`);
      return res.data;
    },

    
  sendMail:async(agreementId:string)=>{
     const res = await api.post(`/api/admin/liaison-agreements/${agreementId}/sendMail`);
      return res.data;
  },
  
  

    getAgreementById: async (id: string) => {
  const res = await fetch(`/api/admin/liaison-agreements/${id}`);
  if (!res.ok) throw new Error("Failed to fetch agreement");
  return res.json();
}


}


export default lisisonAgreementService