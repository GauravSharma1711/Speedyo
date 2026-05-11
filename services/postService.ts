import axios from "@/lib/axios";

export type PostData = {
  id: string;
  content?: string | null;
  images?: string[];
  post_type?: string;
  article_title?: string | null;
  createdAt?: string | Date;
  authorId?: string;
};

export const postService = {
  async update(id: string, data: { content?: string; images?: string[]; article_title?: string }): Promise<PostData> {
    const res = await axios.patch<{ success: true; post: PostData }>(`/api/post/${id}`, data);
    return res.data.post;
  },

  async get(id: string): Promise<PostData> {
    const res = await axios.get<{ success: true; post: PostData }>(`/api/post/${id}`);
    return res.data.post;
  },

  async delete(id: string): Promise<void> {
    await axios.delete(`/api/post/${id}`);
  },
};