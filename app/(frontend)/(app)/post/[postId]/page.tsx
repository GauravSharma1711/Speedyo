import { redirect } from "next/navigation";

export default function PostPage({ params: _params }: { params: Promise<{ postId: string }> }) {
  redirect("/Feed");
}