// lib/entities/index.ts  (or lib/api/entities.ts)

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
}

export interface PublicUserData {
  id: string;
  user_id: string;
  full_name?: string;
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
  content: string;
  icon?: string;
  url?: string;
  read: boolean;
  created_date: string;
}

// ─── UserEntity ──────────────────────────────────────────────────────────────

export const UserEntity = {
  async me(): Promise<UserData> {
    // TODO: Replace with real session fetch e.g. getServerSession() or your auth API
    // For now returns a hardcoded mock so UI renders without crashing
    return {
      id: "mock-user-1",
      email: "dev@speedyo.app",
      full_name: "Dev User",
      profile_image: "",
      user_type: "guest",
      verified: false,
      role: "user",
      setup_completed: true,   // set false to test SetupAccountDialog
      welcome_email_sent: true,
      created_date: new Date().toISOString(),
    };
  },

  async updateMyUserData(data: Partial<UserData>): Promise<void> {
    // TODO: PATCH /api/user or call your DB here
    console.log("[UserEntity.updateMyUserData] called with:", data);
  },

  async logout(): Promise<void> {
    // TODO: call your auth signOut e.g. signOut() from next-auth
    console.log("[UserEntity.logout] called");
    // window.location.href = "/login";
  },
};

// ─── PublicUser ──────────────────────────────────────────────────────────────

export const PublicUser = {
  async filter(query: Partial<PublicUserData>): Promise<PublicUserData[]> {
    // TODO: GET /api/public-users?user_id=xxx
    console.log("[PublicUser.filter] called with:", query);
    return [];   // return [] so layout falls back gracefully, no crash
  },

  async create(data: Omit<PublicUserData, "id">): Promise<PublicUserData> {
    // TODO: POST /api/public-users
    console.log("[PublicUser.create] called with:", data);
    return { id: "mock-pub-1", ...data };
  },

  async update(id: string, data: Partial<PublicUserData>): Promise<PublicUserData> {
    // TODO: PATCH /api/public-users/:id
    console.log("[PublicUser.update] called with:", id, data);
    return { id, user_id: "mock-user-1", ...data };
  },
};

// ─── Notification ─────────────────────────────────────────────────────────────

export const Notification = {
  async filter(query: Record<string, any>): Promise<any[]> {
    console.log("[Notification.filter]", query);
    return [];
  },

  async create(data: Record<string, any>): Promise<any> {
    console.log("[Notification.create]", data);
    return { id: "mock-notification-1", created_date: new Date().toISOString(), ...data };
  }
};

// ─── UploadFile ───────────────────────────────────────────────────────────────

export async function UploadFile({ file }: { file: File }): Promise<{ file_url: string }> {
  // TODO: Replace with your real upload — S3, Supabase Storage, Cloudinary, etc.
  // Quick local preview using object URL so the UI shows the image immediately
  console.log("[UploadFile] called with:", file.name);
  const objectUrl = URL.createObjectURL(file);
  return { file_url: objectUrl };
}

// add to lib/entities/index.ts

export const Comment = {
  async filter(query: Record<string, any>, _orderBy?: string): Promise<any[]> {
    console.log("[Comment.filter]", query);
    return [];
  },
  async create(data: Record<string, any>): Promise<any> {
    console.log("[Comment.create]", data);
    return { id: "mock-comment-1", created_date: new Date().toISOString(), ...data };
  },
  async update(id: string, data: Record<string, any>): Promise<any> {
    console.log("[Comment.update]", id, data);
    return { id, ...data };
  },
};

// ─── Post ─────────────────────────────────────────────────────────────

export const Post = {
  async list(_order?: string, _limit?: number, _offset?: number): Promise<any[]> {
    console.log("[Post.list]");
    return [];
  },

  async create(data: Record<string, any>): Promise<any> {
    console.log("[Post.create]", data);
    return { id: "mock-post-1", ...data };
  },

  async update(id: string, data: Record<string, any>): Promise<any> {
    console.log("[Post.update]", id, data);
    return { id, ...data };
  },

  async delete(id: string): Promise<void> {
    console.log("[Post.delete]", id);
  },
};

// ─── Vehicle ───────────────────────────────────────────────────────────

export const Vehicle = {
  async list(_order?: string, _limit?: number): Promise<any[]> {
    console.log("[Vehicle.list]");
    return [];
  },

  async get(id: string): Promise<any> {
    console.log("[Vehicle.get]", id);
    return null;
  },

  async update(id: string, data: Record<string, any>): Promise<any> {
    console.log("[Vehicle.update]", id, data);
    return { id, ...data };
  }
};

// ─── Follow ───────────────────────────────────────────────────────────

export const Follow = {
  async filter(query: Record<string, any>): Promise<any[]> {
    console.log("[Follow.filter]", query);

    // mock data for testing
    return [
      {
        id: "follow-1",
        follower_id: "mock-user-1",
        followed_id: "user-2",
      },
      {
        id: "follow-2",
        follower_id: "mock-user-1",
        followed_id: "user-3",
      },
    ];
  },

  async create(data: Record<string, any>): Promise<any> {
    console.log("[Follow.create]", data);
    return { id: "mock-follow-1", ...data };
  },

  async delete(id: string): Promise<void> {
    console.log("[Follow.delete]", id);
  },
};


export const Message = {
  async filter(query: Record<string, any>, _order?: string, _limit?: number): Promise<any[]> {
    console.log("[Message.filter]", query);
    return [];
  },

  async create(data: Record<string, any>): Promise<any> {
    console.log("[Message.create]", data);
    return { id: "mock-message-1", created_date: new Date().toISOString(), ...data };
  },

  async update(id: string, data: Record<string, any>): Promise<any> {
    console.log("[Message.update]", id, data);
    return { id, ...data };
  }
};



export const ManagedSaleRequest = {
  async filter(query: Record<string, any>, _order?: string): Promise<any[]> {
    console.log("[ManagedSaleRequest.filter]", query);
    return [];
  },

  async create(data: Record<string, any>): Promise<any> {
    console.log("[ManagedSaleRequest.create]", data);
    return { id: "mock-request-1", created_date: new Date().toISOString(), ...data };
  },

  async update(id: string, data: Record<string, any>): Promise<any> {
    console.log("[ManagedSaleRequest.update]", id, data);
    return { id, ...data };
  }
};



export const VehicleTransfer = {
  async filter(query: Record<string, any>, _order?: string): Promise<any[]> {
    console.log("[VehicleTransfer.filter]", query);
    return [];
  }
};


export const PublicUser = {
  async list(): Promise<any[]> {
    console.log("[PublicUser.list]");
    return [];
  },

  async filter(query: Record<string, any>): Promise<any[]> {
    console.log("[PublicUser.filter]", query);
    return [];
  },

  async create(data: Record<string, any>): Promise<any> {
    console.log("[PublicUser.create]", data);
    return { id: "mock-public-user", ...data };
  }
};


