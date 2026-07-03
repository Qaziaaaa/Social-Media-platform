import { useAuth } from "@/modules/auth/hooks/useAuth";
import { UpdateForm } from "@/modules/updates/components/UpdateForm";
import { UpdateList } from "@/modules/feed/components/UpdateList";

export function FeedPage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="flex flex-col gap-lg animate-fade-in">
      {isAuthenticated && <UpdateForm />}
      <UpdateList />
    </div>
  );
}
