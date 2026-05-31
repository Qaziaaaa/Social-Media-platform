import { useAuth } from "@/modules/auth/hooks/useAuth";
import { PostForm } from "@/modules/posts/components/PostForm";
import { PostList } from "@/modules/feed/components/PostList";

export function FeedPage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="space-y-4 animate-fade-in">
      {isAuthenticated && <PostForm />}
      <PostList />
    </div>
  );
}
