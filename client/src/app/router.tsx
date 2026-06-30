import { Routes, Route, Link } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { FeedPage } from "@/modules/feed/pages/FeedPage";
import { LoginPage } from "@/modules/auth/pages/LoginPage";
import { RegisterPage } from "@/modules/auth/pages/RegisterPage";
import { VerifyEmailPage } from "@/modules/auth/pages/VerifyEmailPage";
import { ForgotPasswordPage } from "@/modules/auth/pages/ForgotPasswordPage";
import { ResetPasswordPage } from "@/modules/auth/pages/ResetPasswordPage";
import { ProfilePage } from "@/modules/profile/pages/ProfilePage";
import { EditProfilePage } from "@/modules/profile/pages/EditProfilePage";
import { PostDetailPage } from "@/modules/posts/pages/PostDetailPage";
import { ExplorePage } from "@/modules/search/pages/ExplorePage";
import { BookmarksPage } from "@/modules/bookmarks/pages/BookmarksPage";
import { NotificationsPage } from "@/modules/notifications/pages/NotificationsPage";
import { MessagesPage } from "@/modules/messages/pages/MessagesPage";
import { ConversationPage } from "@/modules/messages/pages/ConversationPage";
import { AdminReportsPage } from "@/modules/admin/pages/AdminReportsPage";
import { ProjectsPage } from "@/modules/projects/pages/ProjectsPage";

function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 animate-fade-in">
      <h1 className="font-display text-7xl font-extrabold text-surface-container-high">404</h1>
      <p className="text-lg text-on-surface-variant">Page not found</p>
      <Link
        to="/"
        className="bg-primary text-on-primary font-label-md text-label-md px-4 py-2 rounded-full hover:bg-on-primary-fixed-variant transition-colors shadow-sm"
      >
        Go home
      </Link>
    </div>
  );
}

export function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route element={<MainLayout />}>
        <Route path="/" element={<FeedPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/profile/:id" element={<ProfilePage />} />
        <Route path="/profile/:id/edit" element={<EditProfilePage />} />
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/bookmarks" element={<BookmarksPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/messages" element={<MessagesPage />} />
        <Route path="/messages/:id" element={<ConversationPage />} />
        <Route path="/posts/:id" element={<PostDetailPage />} />
        <Route path="/admin/reports" element={<AdminReportsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
