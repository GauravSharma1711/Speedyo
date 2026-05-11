import axios from "@/lib/axios";

export type DashboardMessage = {
  id: string;
  recipient_id?: string | null;
  sender_id?: string | null;
  content?: string | null;
  message_type?: string | null;
  vehicle_id?: string | null;
  conversation_id?: string | null;
  test_drive_details?: Record<string, any> | null;
  createdAt?: string | Date | null;
  updatedAt?: string | Date | null;
};

export type Conversation = {
  id: string;
  user1Id: string;
  user2Id: string;
  vehicleId: string | null;
  last_message: string | null;
  last_message_at: string | Date | null;
  last_message_type: string | null;
  unread_count: number;
  other_user: {
    id: string;
    full_name: string | null;
    profile_image: string | null;
    role: string | null;
  };
  vehicle: {
    id: string;
    title: string;
    make: string;
    model: string;
    year: number;
    primary_image_thumbnail: string | null;
    authorId: string;
  } | null;
  messages: Array<{
    id: string;
    content: string;
    message_type: string;
    createdAt: string | Date;
  }>;
};

export const messageService = {
  async getConversations(): Promise<Conversation[]> {
    const res = await axios.get<{ success: true; conversations: Conversation[] }>(
      "/api/user/messages"
    );
    return res.data.conversations;
  },

  async create(data: {
    recipientId: string;
    content: string;
    vehicleId?: string;
    message_type?: string;
    test_drive_details?: Record<string, any>;
  }): Promise<DashboardMessage> {
    const res = await axios.post<{ success: true; message: DashboardMessage }>(
      "/api/user/messages",
      data
    );
    return res.data.message;
  },

  async update(id: string, data: Record<string, any>): Promise<DashboardMessage> {
    const res = await axios.patch<{ success: true; message: DashboardMessage }>(
      `/api/user/messages/${id}`,
      data
    );
    return res.data.message;
  },
};
