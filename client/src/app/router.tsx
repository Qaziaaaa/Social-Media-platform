import { Routes, Route, Link } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { FeedPage } from "@/modules/feed/pages/FeedPage";
import { LoginPage } from "@/modules/auth/pages/LoginPage";
import { RegisterPage } from "@/modules/auth/pages/RegisterPage";
import { ProfilePage } from "@/modules/profile/pages/ProfilePage";
import { EditProfilePage } from "@/modules/profile/pages/EditProfilePage";
import { PostDetailPage } from "@/modules/posts/pages/PostDetailPage";

function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 animate-fade-in">
      <h1 className="font-display text-7xl font-extrabold text-[#2a2a44]">404</h1>
      <p className="text-lg text-[#64748b]">Page not found</p>
      <Link
        to="/"
        className="rounded-lg bg-gradient-to-r from-primary-dark to-primary px-4 py-2 text-sm font-medium text-white shadow-lg shadow-primary-dark/25 transition-all hover:shadow-primary/20"
      >
        Go home
      </Link>
    </div>
  );
}

export function AppRouter() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<FeedPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/profile/:id" element={<ProfilePage />} />
        <Route path="/profile/:id/edit" element={<EditProfilePage />} />
        <Route path="/posts/:id" element={<PostDetailPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
