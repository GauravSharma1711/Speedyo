import axios from "@/lib/axios";

export type DealershipRegistrationInput = {
  dealership_selected_tier: string;
  business_name: string;
  business_address: string;
  business_city: string;
  business_state: string;
  business_zip: string;
  dealer_License_Number: string;
  business_license_files: File[];       
  existing_urls?: string[];             
};

export const dealershipRegistrationService = {
  async register(input: DealershipRegistrationInput) {
    const form = new FormData();

    form.append("dealership_selected_tier", input.dealership_selected_tier);
    form.append("business_name", input.business_name);
    form.append("business_address", input.business_address);
    form.append("business_city", input.business_city);
    form.append("business_state", input.business_state);
    form.append("business_zip", input.business_zip);
    form.append("dealer_License_Number", input.dealer_License_Number);

    // Append each file
    for (const file of input.business_license_files) {
      form.append("files", file);
    }

    // Append existing URLs
    for (const url of input.existing_urls ?? []) {
      form.append("existing_urls", url);
    }

    const res = await axios.post("/api/dealership/register", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return res.data;
  },
};