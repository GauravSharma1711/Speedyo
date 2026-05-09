import api from "@/lib/axios";

export type ConversationUser = {
  id: string;
  full_name?: string | null;
  profile_image?: string | null;
  role?: string | null;
};

export type ConversationVehicle = {
  id: string;
  title?: string | null;
  make?: string | null;
  model?: string | null;
  year?: number | null;
  primary_image_thumbnail?: string | null;
  created_by_id?: string | null;
};

export type ConversationManagedSaleRequest = {
  id: string;
  vehicle_details?: { title?: string } | null;
};

export type Conversation = {
  id: string;
  user1Id: string;
  user2Id: string;
  vehicleId?: string | null;
  managedSaleRequestId?: string | null;
  last_message?: string | null;
  last_message_at?: string | null;
  last_message_type?: string | null;
  user1_unread: number;
  user2_unread: number;
  unread_count: number;
  user1?: ConversationUser;
  user2?: ConversationUser;
  other_user?: ConversationUser;
  vehicle?: ConversationVehicle | null;
  managedSaleRequest?: ConversationManagedSaleRequest | null;
  messages?: Message[];
};

export type MessageSender = {
  id: string;
  full_name?: string | null;
  profile_image?: string | null;
};

export type Message = {
  id: string;
  senderId: string;
  recipientId: string;
  content?: string | null;
  message_type?: string | null;
  read: boolean;
  createdAt: string;
  conversationId: string;
  vehicleId?: string | null;
  managedSaleRequestId?: string | null;
  test_drive_details?: any;
  sender?: MessageSender;
};

export type SendMessageBody = {
  recipientId: string;
  content: string;
  vehicleId?: string | null;
  managedSaleRequestId?: string | null;
  message_type?: string;
  test_drive_details?: {
    preferred_date: string;
    preferred_time: string;
    location: string;
    notes?: string;
    vehicleTitle: string;
    status: string;
  };
};

export type GetConversationsResponse = {
  success: true;
  conversations: Conversation[];
};

export type GetMessagesResponse = {
  success: true;
  conversation: Conversation;
  messages: Message[];
  other_user: ConversationUser;
};

export type SendMessageResponse = {
  success: true;
  message: Message;
  conversationId: string;
};

export type MarkReadResponse = {
  success: true;
};


export const messagesService = {
  getConversations: async (): Promise<GetConversationsResponse> => {
    const res = await api.get<GetConversationsResponse>("/api/user/messages");
    return res.data;
  },

  getMessages: async (conversationId: string): Promise<GetMessagesResponse> => {
    const res = await api.get<GetMessagesResponse>(
      `/api/user/messages/${conversationId}`
    );
    return res.data;
  },

  sendMessage: async (body: SendMessageBody): Promise<SendMessageResponse> => {
    const res = await api.post<SendMessageResponse>("/api/user/messages", body);
    return res.data;
  },
  
  markAsRead: async (conversationId: string): Promise<MarkReadResponse> => {
    const res = await api.patch<MarkReadResponse>(
      `/api/user/messages/${conversationId}`
    );
    return res.data;
  },
};