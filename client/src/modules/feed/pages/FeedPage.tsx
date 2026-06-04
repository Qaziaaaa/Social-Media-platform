import { useAuth } from "@/modules/auth/hooks/useAuth";
import { PostForm } from "@/modules/posts/components/PostForm";
import { PostList } from "@/modules/feed/components/PostList";
import { StoryRing } from "@/modules/stories/components/StoryRing";

export function FeedPage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="flex flex-col gap-lg animate-fade-in">
      {isAuthenticated && <StoryRing />}
      {isAuthenticated && <PostForm />}
      <PostList />
    </div>
  );
}
