import axios from "@/lib/axios";

export type UploadResult = {
  url: string;
  file_url?: string;
};

export const uploadService = {
  async uploadImage(file: File): Promise<UploadResult> {
    const formData = new FormData();
    formData.append("file", file);

    const res = await axios.post<{ success: true; url: string; file_url: string }>(
      "/api/upload/uploadImage",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return { url: res.data.url, file_url: res.data.file_url };
  },
};