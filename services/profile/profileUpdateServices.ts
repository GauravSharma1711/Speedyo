import axios from "@/lib/axios";

export type UpdateUserInput = {
  full_name?: string;
  bio?: string;
  location?: string;
  user_type?: "guest" | "private_seller" | "dealership";
  role?: "user" | "admin";
  profile_image?: File | null;
  setup_completed?: boolean;
};

export async function updateMe(input: UpdateUserInput) {
  const form = new FormData();

  if (input.full_name !== undefined) form.append("full_name", input.full_name);
  if (input.bio !== undefined) form.append("bio", input.bio);
  if (input.location !== undefined) form.append("location", input.location);
  if (input.role !== undefined) form.append("role", input.role);
  if (input.user_type !== undefined) form.append("user_type", input.user_type);

  if (input.setup_completed !== undefined) {
    form.append("setup_completed", input.setup_completed ? "true" : "false");
  }

  if (input.profile_image !== undefined && input.profile_image !== null) {
    form.append("profile_image", input.profile_image);
  }

  const res = await axios.patch("/api/user/updateUser", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data;
}

export async function downgradeToGuest() {
  const res = await axios.post("/api/user/downgrade");
  return res.data;
}