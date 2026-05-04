// lib/entities/index.ts
// Drop-in entity layer — swap each TODO block with your real backend/DB calls.
// base44 has been fully removed.

// ─── Types ───────────────────────────────────────────────────────────────────

export interface UserData {
  id: string;
  email: string;
  full_name?: string;
  profile_image?: string;
  user_type?: "guest" | "private_seller" | "dealership";
  verified?: boolean;
  role?: "user" | "admin";
  bio?: string;
  location?: string;
  setup_completed?: boolean;
  welcome_email_sent?: boolean;
  created_date?: string;

  // Legacy fields used by older UI flows
  verification_fee_paid?: boolean;
  dealership_selected_tier?: string;
  dealership_verification_status?: "not_submitted" | "pending_review" | "approved" | "declined";
  admin_verification_notes?: string;
  seller_subscription?: { tier?: string; expires_at?: string; vehicles_sold_this_year?: number };
  private_seller_slots?: { purchased?: number; used?: number };
}

export interface PublicUserData {
  id: string;
  user_id: string;
  full_name?: string;
  email?: string;
  phone?: string | null;
  profile_image?: string;
  user_type?: string;
  verified?: boolean;
  role?: string;
  bio?: string;
  location?: string;
}

export interface NotificationData {
  id: string;
  recipient_id: string;
  sender_id?: string;
  type?: string;
  content: string;
  icon?: string;
  url?: string;
  related_entity_type?: string;
  related_entity_id?: string;
  read: boolean;
  created_date: string;
}

// ─── Functions (server actions via API) ───────────────────────────────────────
// Replaces base44.functions.invoke("name", payload)
export async function invokeFunction<TResponse = any>(
  name: string,
  payload: unknown
): Promise<TResponse> {
  const res = await fetch(`/api/functions/${encodeURIComponent(name)}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload ?? {}),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Function ${name} failed (${res.status}): ${text || res.statusText}`);
  }

  return (await res.json()) as TResponse;
}

// ─── File Upload ──────────────────────────────────────────────────────────────
// Replaces base44.integrations.Core.UploadFile
// TODO: swap the body with your real storage provider (S3, Supabase, Cloudinary…)

export async function UploadFile({ file }: { file: File }): Promise<{ file_url: string }> {
  console.log("[UploadFile] uploading:", file.name);

  // --- Real implementation example (uncomment & adapt) ---
  // const formData = new FormData();
  // formData.append("file", file);
  // const res = await fetch("/api/upload", { method: "POST", body: formData });
  // const json = await res.json();
  // return { file_url: json.url };

  // Temporary: local object URL so the UI shows a preview immediately
  const objectUrl = URL.createObjectURL(file);
  return { file_url: objectUrl };
}

// ─── UserEntity ──────────────────────────────────────────────────────────────
// Replaces base44.auth.me() / base44.auth.updateMe()

export const UserEntity = {
  async me(): Promise<UserData> {
    // TODO: replace with your session provider, e.g.:
    // const session = await getServerSession(authOptions);
    // return session.user as UserData;
    return {
      id: "mock-user-1",
      email: "dev@speedio.app",
      full_name: "Dev User",
      profile_image: "",
      user_type: "guest",
      verified: false,
      role: "user",
      setup_completed: true,
      welcome_email_sent: true,
      created_date: new Date().toISOString(),
    };
  },

  async list(_order?: string, _limit?: number): Promise<UserData[]> {
    // TODO: GET /api/users
    console.log("[UserEntity.list]");
    return [];
  },

  async filter(query: Record<string, any>): Promise<UserData[]> {
    // TODO: GET /api/users?...
    console.log("[UserEntity.filter]", query);
    return [];
  },

  async get(id: string): Promise<UserData | null> {
    // TODO: GET /api/users/:id
    console.log("[UserEntity.get]", id);
    return null;
  },

  async updateMe(data: Partial<UserData>): Promise<void> {
    // TODO: PATCH /api/user  or your DB update
    console.log("[UserEntity.updateMe]", data);
  },

  /**
   * Legacy alias used across older UI.
   * Prefer `updateMe` going forward.
   */
  async updateMyUserData(data: Partial<UserData>): Promise<void> {
    return await UserEntity.updateMe(data);
  },

  async logout(): Promise<void> {
    // TODO: e.g. signOut() from next-auth
    console.log("[UserEntity.logout]");
  },
};

// Keep a named export alias that matches the original base44 import shape
// so callers can do: import { User } from "@/lib/entities"  →  User.me()
export const User = UserEntity;

// ─── PublicUser ───────────────────────────────────────────────────────────────

export const PublicUser = {
  async list(): Promise<PublicUserData[]> {
    // TODO: GET /api/public-users
    console.log("[PublicUser.list]");
    return [];
  },

  async filter(query: Record<string, any>): Promise<PublicUserData[]> {
    // TODO: GET /api/public-users?user_id=xxx  (or DB query)
    console.log("[PublicUser.filter]", query);
    return [];
  },

  async create(data: Partial<PublicUserData>): Promise<PublicUserData> {
    // TODO: POST /api/public-users
    console.log("[PublicUser.create]", data);
    return { id: "mock-public-user-1", user_id: data.user_id ?? "", ...data };
  },

  async update(id: string, data: Partial<PublicUserData>): Promise<PublicUserData> {
    // TODO: PATCH /api/public-users/:id
    console.log("[PublicUser.update]", id, data);
    return { id, user_id: "mock-user-1", ...data };
  },
};

// ─── Notification ─────────────────────────────────────────────────────────────

export const Notification = {
  async filter(query: Record<string, any>): Promise<NotificationData[]> {
    // TODO: GET /api/notifications?recipient_id=xxx
    console.log("[Notification.filter]", query);
    return [];
  },

  async create(data: Partial<NotificationData>): Promise<NotificationData> {
    // TODO: POST /api/notifications
    console.log("[Notification.create]", data);
    return {
      id: "mock-notification-1",
      read: false,
      content: "",
      recipient_id: "",
      created_date: new Date().toISOString(),
      ...data,
    };
  },

  async markRead(id: string): Promise<void> {
    // TODO: PATCH /api/notifications/:id  { read: true }
    console.log("[Notification.markRead]", id);
  },
};

// ─── Post ─────────────────────────────────────────────────────────────────────

export const Post = {
  async list(_order?: string, _limit?: number, _offset?: number): Promise<any[]> {
    // TODO: GET /api/posts
    console.log("[Post.list]");
    return [];
  },

  async filter(query: Record<string, any>, _order?: string): Promise<any[]> {
    // TODO: GET /api/posts?author_id=xxx
    console.log("[Post.filter]", query);
    return [];
  },

  async create(data: Record<string, any>): Promise<any> {
    // TODO: POST /api/posts
    console.log("[Post.create]", data);
    return { id: "mock-post-1", created_date: new Date().toISOString(), ...data };
  },

  async update(id: string, data: Record<string, any>): Promise<any> {
    // TODO: PATCH /api/posts/:id
    console.log("[Post.update]", id, data);
    return { id, ...data };
  },

  async delete(id: string): Promise<void> {
    // TODO: DELETE /api/posts/:id
    console.log("[Post.delete]", id);
  },
};

// ─── Comment ──────────────────────────────────────────────────────────────────

export const Comment = {
  async filter(query: Record<string, any>, _order?: string): Promise<any[]> {
    // TODO: GET /api/comments?post_id=xxx
    console.log("[Comment.filter]", query);
    return [];
  },

  async create(data: Record<string, any>): Promise<any> {
    // TODO: POST /api/comments
    console.log("[Comment.create]", data);
    return { id: "mock-comment-1", created_date: new Date().toISOString(), ...data };
  },

  async update(id: string, data: Record<string, any>): Promise<any> {
    // TODO: PATCH /api/comments/:id
    console.log("[Comment.update]", id, data);
    return { id, ...data };
  },
};

// ─── Vehicle ──────────────────────────────────────────────────────────────────

export const Vehicle = {
  async list(_order?: string, _limit?: number): Promise<any[]> {
    // TODO: GET /api/vehicles
    console.log("[Vehicle.list]");
    return [];
  },

  async filter(query: Record<string, any>, _order?: string): Promise<any[]> {
    // TODO: GET /api/vehicles?original_owner_id=xxx
    console.log("[Vehicle.filter]", query);
    return [];
  },

  async get(id: string): Promise<any> {
    // TODO: GET /api/vehicles/:id
    console.log("[Vehicle.get]", id);
    return null;
  },

  async create(data: Record<string, any>): Promise<any> {
    // TODO: POST /api/vehicles
    console.log("[Vehicle.create]", data);
    return { id: "mock-vehicle-1", created_date: new Date().toISOString(), ...data };
  },

  async update(id: string, data: Record<string, any>): Promise<any> {
    // TODO: PATCH /api/vehicles/:id
    console.log("[Vehicle.update]", id, data);
    return { id, ...data };
  },

  async delete(id: string): Promise<void> {
    // TODO: DELETE /api/vehicles/:id
    console.log("[Vehicle.delete]", id);
  },
};

// ─── Follow ───────────────────────────────────────────────────────────────────

export const Follow = {
  async filter(query: Record<string, any>): Promise<any[]> {
    // TODO: GET /api/follows?followed_id=xxx  or  ?follower_id=xxx
    console.log("[Follow.filter]", query);
    return [];
  },

  async create(data: Record<string, any>): Promise<any> {
    // TODO: POST /api/follows
    console.log("[Follow.create]", data);
    return { id: "mock-follow-1", ...data };
  },

  async delete(id: string): Promise<void> {
    // TODO: DELETE /api/follows/:id
    console.log("[Follow.delete]", id);
  },
};

// ─── Message ──────────────────────────────────────────────────────────────────

export const Message = {
  async filter(query: Record<string, any>, _order?: string, _limit?: number): Promise<any[]> {
    // TODO: GET /api/messages?...
    console.log("[Message.filter]", query);
    return [];
  },

  async create(data: Record<string, any>): Promise<any> {
    // TODO: POST /api/messages
    console.log("[Message.create]", data);
    return { id: "mock-message-1", created_date: new Date().toISOString(), ...data };
  },

  async update(id: string, data: Record<string, any>): Promise<any> {
    // TODO: PATCH /api/messages/:id
    console.log("[Message.update]", id, data);
    return { id, ...data };
  },
};

// ─── ManagedSaleRequest ───────────────────────────────────────────────────────

export const ManagedSaleRequest = {
  async list(_order?: string, _limit?: number): Promise<any[]> {
    // TODO: GET /api/managed-sale-requests
    console.log("[ManagedSaleRequest.list]");
    return [];
  },

  async filter(query: Record<string, any>, _order?: string): Promise<any[]> {
    // TODO: GET /api/managed-sale-requests?...
    console.log("[ManagedSaleRequest.filter]", query);
    return [];
  },

  async create(data: Record<string, any>): Promise<any> {
    // TODO: POST /api/managed-sale-requests
    console.log("[ManagedSaleRequest.create]", data);
    return { id: "mock-request-1", created_date: new Date().toISOString(), ...data };
  },

  async update(id: string, data: Record<string, any>): Promise<any> {
    // TODO: PATCH /api/managed-sale-requests/:id
    console.log("[ManagedSaleRequest.update]", id, data);
    return { id, ...data };
  },

  async delete(id: string): Promise<void> {
    // TODO: DELETE /api/managed-sale-requests/:id
    console.log("[ManagedSaleRequest.delete]", id);
  },
};

// ─── VehicleInspectionChecklist ───────────────────────────────────────────────
export const VehicleInspectionChecklist = {
  async filter(query: Record<string, any>, _order?: string): Promise<any[]> {
    // TODO: GET /api/vehicle-inspection-checklists?...
    console.log("[VehicleInspectionChecklist.filter]", query);
    return [];
  },
};

// ─── OISTTradeInRequest ───────────────────────────────────────────────────────
export const OISTTradeInRequest = {
  async list(_order?: string, _limit?: number): Promise<any[]> {
    // TODO: GET /api/oist-trade-in-requests
    console.log("[OISTTradeInRequest.list]");
    return [];
  },

  async create(data: Record<string, any>): Promise<any> {
    // TODO: POST /api/oist-trade-in-requests
    console.log("[OISTTradeInRequest.create]", data);
    return { id: "mock-oist-trade-in-1", created_date: new Date().toISOString(), ...data };
  },

  async update(id: string, data: Record<string, any>): Promise<any> {
    // TODO: PATCH /api/oist-trade-in-requests/:id
    console.log("[OISTTradeInRequest.update]", id, data);
    return { id, ...data };
  },
};

// ─── VehicleTransfer ──────────────────────────────────────────────────────────

export const VehicleTransfer = {
  async filter(query: Record<string, any>, _order?: string): Promise<any[]> {
    // TODO: GET /api/vehicle-transfers?...
    console.log("[VehicleTransfer.filter]", query);
    return [];
  },
};



// ─── VehicleEditRequest ───────────────────────────────────────────────────────

export const VehicleEditRequest = {
  async filter(query: Record<string, any>, _order?: string): Promise<any[]> {
    // TODO: GET /api/vehicle-edit-requests?...
    console.log("[VehicleEditRequest.filter]", query);
    return [];
  },

  async create(data: Record<string, any>): Promise<any> {
    // TODO: POST /api/vehicle-edit-requests
    console.log("[VehicleEditRequest.create]", data);
    return { id: "mock-edit-request-1", created_date: new Date().toISOString(), status: "pending", ...data };
  },

  async update(id: string, data: Record<string, any>): Promise<any> {
    // TODO: PATCH /api/vehicle-edit-requests/:id
    console.log("[VehicleEditRequest.update]", id, data);
    return { id, ...data };
  },

  async delete(id: string): Promise<void> {
    // TODO: DELETE /api/vehicle-edit-requests/:id
    console.log("[VehicleEditRequest.delete]", id);
  },
};