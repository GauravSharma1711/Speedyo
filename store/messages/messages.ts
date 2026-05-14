
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { enableMapSet } from "immer";
import {
  messagesService,
  type Conversation,
  type Message,
  type SendMessageBody,
} from "@/services/messages/messageServices";

enableMapSet();

type MessagesState = {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  currentMessages: Message[];
  selectedConversationId: string | null;
  sentMessageIds: Set<string>;
  isLoadingConversations: boolean;
  isLoadingMessages: boolean;
  isSending: boolean;
  error: string | null;
};

type MessagesActions = {
  fetchConversations: () => Promise<void>;
  selectConversation: (conversationId: string) => Promise<void>;
  sendMessage: (body: SendMessageBody) => Promise<Message | null>;
  markAsRead: (conversationId: string) => Promise<void>;
  onSocketNewMessage: (payload: {
    message: Message;
    conversationId: string;
    currentUserId: string;
  }) => void;
  clearUnread: (conversationId: string) => void;
  clearError: () => void;
  reset: () => void;
  createConversation: (
    recipientId: string,
    vehicleId?: string
  ) => Promise<Conversation | null>;
};

const extractError = (e: unknown, fallback: string): string => {
  if (typeof e === "object" && e !== null && "response" in e)
    return String((e as any).response?.data?.error ?? fallback);
  return e instanceof Error ? e.message : fallback;
};

const appendUnique = (list: Message[], msg: Message): Message[] =>
  list.some((m) => m.id === msg.id) ? list : [...list, msg];

const initialState: MessagesState = {
  conversations: [],
  currentConversation: null,
  currentMessages: [],
  selectedConversationId: null,
  sentMessageIds: new Set(),
  isLoadingConversations: false,
  isLoadingMessages: false,
  isSending: false,
  error: null,
};

export const useMessagesStore = create<MessagesState & MessagesActions>()(
  immer((set, get) => ({
    ...initialState,

    clearError: () => set((s) => { s.error = null; }),
    reset: () => set(() => ({ ...initialState })),

    fetchConversations: async () => {
      set((s) => { s.isLoadingConversations = true; s.error = null; });
      try {
        const { conversations } = await messagesService.getConversations();
        set((s) => { s.conversations = conversations; });
      } catch (e) {
        set((s) => { s.error = extractError(e, "Failed to load conversations"); });
        throw e;
      } finally {
        set((s) => { s.isLoadingConversations = false; });
      }
    },

    selectConversation: async (conversationId: string) => {
      set((s) => {
        s.selectedConversationId = conversationId;
        s.isLoadingMessages = true;
        s.error = null;
      });
      try {
        const { conversation, messages, other_user } = await messagesService.getMessages(conversationId);
        set((s) => {
          s.currentConversation = { ...conversation, other_user } as any;
          s.currentMessages = messages;
          const idx = s.conversations.findIndex((c) => c.id === conversationId);
          if (idx !== -1) {
            s.conversations[idx].unread_count = 0;
            if (!s.conversations[idx].other_user) {
              (s.conversations[idx] as any).other_user = other_user;
            }
          }
        });
      } catch (e) {
        set((s) => { s.error = extractError(e, "Failed to load messages"); });
        throw e;
      } finally {
        set((s) => { s.isLoadingMessages = false; });
      }
    },

    sendMessage: async (body: SendMessageBody) => {
      set((s) => { s.isSending = true; s.error = null; });
      try {
        const response = await messagesService.sendMessage(body);
        const { message, conversationId } = response;

        set((s) => {
          s.sentMessageIds.add(message.id);
          if (s.selectedConversationId === conversationId) {
            s.currentMessages = appendUnique(s.currentMessages as Message[], message);
          }
          const idx = s.conversations.findIndex((c) => c.id === conversationId);
          if (idx !== -1) {
            s.conversations[idx].last_message = message.content ?? null;
            s.conversations[idx].last_message_at = message.createdAt;
            if (!s.conversations[idx].messages) {
              s.conversations[idx].messages = [];
            }
            s.conversations[idx].messages = [message, ...s.conversations[idx].messages];
            const [conv] = s.conversations.splice(idx, 1);
            s.conversations.unshift(conv);
          }
        });
        if (!get().conversations.some((c) => c.id === conversationId)) {
          await get().fetchConversations();
        }

        return message;
      } catch (e) {
        const msg = extractError(e, "Failed to send message");
        set((s) => { s.error = msg; });
        throw new Error(msg);
      } finally {
        set((s) => { s.isSending = false; });
      }
    },

    markAsRead: async (conversationId: string) => {
      try {
        await messagesService.markAsRead(conversationId);
        set((s) => {
          const idx = s.conversations.findIndex((c) => c.id === conversationId);
          if (idx !== -1) s.conversations[idx].unread_count = 0;
        });
      } catch (e) {
        console.error("markAsRead failed", e);
      }
    },

    onSocketNewMessage: ({ message, conversationId, currentUserId }) => {
      if (get().sentMessageIds.has(message.id)) {
        set((s) => { s.sentMessageIds.delete(message.id); });
        return;
      }
      const isIncoming =
        message.senderId !== currentUserId &&
        message.recipientId === currentUserId;

      const { selectedConversationId } = get();

      set((s) => {
        if (s.selectedConversationId === conversationId) {
          s.currentMessages = appendUnique(s.currentMessages as Message[], message);
        }

        const idx = s.conversations.findIndex((c) => c.id === conversationId);
        if (idx !== -1) {
          s.conversations[idx].last_message = message.content ?? null;
          s.conversations[idx].last_message_at = message.createdAt;
          if (isIncoming && selectedConversationId !== conversationId) {
            s.conversations[idx].unread_count =
              (s.conversations[idx].unread_count ?? 0) + 1;
          }
          if (!s.conversations[idx].messages) {
            s.conversations[idx].messages = [];
          }
          s.conversations[idx].messages = [message, ...s.conversations[idx].messages];
          const [conv] = s.conversations.splice(idx, 1);
          s.conversations.unshift(conv);
        }
      });
    },

    clearUnread: (conversationId: string) => {
      set((s) => {
        const idx = s.conversations.findIndex((c) => c.id === conversationId);
        if (idx !== -1) s.conversations[idx].unread_count = 0;
      });
    },

    createConversation: async (recipientId: string, vehicleId?: string) => {
      try {
        const { conversation } = await messagesService.createConversation(recipientId, vehicleId);
        set((s) => {
          const exists = s.conversations.some((c) => c.id === conversation.id);
          if (!exists) {
            s.conversations.unshift(conversation as Conversation);
          }
        });
        return conversation as Conversation;
      } catch (e) {
        set((s) => { s.error = extractError(e, "Failed to create conversation"); });
        throw e;
      }
    },
  }))
);