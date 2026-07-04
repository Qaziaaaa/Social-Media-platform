import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { Avatar } from "@/components/ui/Avatar";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import api from "@/services/api";
import { queryKeys } from "@/lib/query-keys";
import type { ApiResponse, User } from "@/types";

const editProfileSchema = z.object({
  username: z.string().min(3).max(30),
  fullName: z.string().min(1).max(100),
  bio: z.string().max(500).optional(),
  skills: z.string().optional(),
  website: z.string().url().max(200).or(z.literal("")).optional(),
  location: z.string().max(100).optional(),
});

type EditProfileForm = z.infer<typeof editProfileSchema>;

export function EditProfilePage() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/login");
    }
  }, [user, isLoading, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EditProfileForm>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      username: user?.username ?? "",
      fullName: user?.fullName ?? "",
      bio: user?.bio ?? "",
      skills: user?.skills?.join(", ") ?? "",
      website: user?.website ?? "",
      location: user?.location ?? "",
    },
  });

  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    const { data } = await api.post<ApiResponse<{ url: string }>>("/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data.data.url;
  };

  const mutation = useMutation({
    mutationFn: async (formData: EditProfileForm) => {
      const skills = formData.skills
        ? formData.skills.split(",").map((s) => s.trim()).filter(Boolean)
        : [];
      const payload: Record<string, unknown> = {
        username: formData.username,
        fullName: formData.fullName,
        bio: formData.bio || undefined,
        skills,
        website: formData.website || undefined,
        location: formData.location || undefined,
      };
      if (avatarFile) payload.avatar = await uploadImage(avatarFile);
      if (coverFile) payload.coverImage = await uploadImage(coverFile);
      const res = await api.patch<ApiResponse<User>>(`/users/${user?.id}`, payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(user!.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me });
      toast.success("Profile updated");
      navigate(`/profile/${user?.id}`);
    },
    onError: () => {
      toast.error("Failed to update profile");
    },
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-md space-y-6">
        <Skeleton className="h-8 w-32" />
        <div className="space-y-4">
          <Skeleton className="h-20 w-full rounded-lg" />
          <Skeleton className="h-20 w-full rounded-lg" />
          <Skeleton className="h-24 w-full rounded-lg" />
          <Skeleton className="h-10 w-24 rounded-lg" />
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="mx-auto max-w-md space-y-6 animate-fade-in">
      <div>
        <h1 className="font-headline-lg text-headline-lg text-text">Edit profile</h1>
      </div>

      <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
        <div className="space-y-4 mb-lg">
          <div>
            <label className="font-label-md text-label-md text-text ml-xs block mb-sm">Cover image</label>
            <div
              onClick={() => coverInputRef.current?.click()}
              className="relative h-32 bg-surface-hover rounded-lg overflow-hidden cursor-pointer group border border-border"
            >
              {(coverPreview || user?.coverImage) && (
                <img
                  src={coverPreview ?? user!.coverImage!}
                  alt="Cover"
                  className="w-full h-full object-cover"
                />
              )}
              <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-colors">
                <span className="material-symbols-outlined text-white opacity-0 group-hover:opacity-100 transition-opacity text-3xl">photo_camera</span>
              </div>
            </div>
            <input
              ref={coverInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) { setCoverFile(f); setCoverPreview(URL.createObjectURL(f)); }
              }}
              className="hidden"
            />
          </div>

          <div className="flex justify-center -mt-12 relative z-10">
            <div className="relative">
              <Avatar src={avatarPreview ?? user?.avatar ?? null} alt="Avatar" size="lg" />
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                className="absolute inset-0 flex items-center justify-center rounded-full bg-black/0 hover:bg-black/30 transition-colors"
              >
                <span className="material-symbols-outlined text-white opacity-0 hover:opacity-100 transition-opacity">photo_camera</span>
              </button>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) { setAvatarFile(f); setAvatarPreview(URL.createObjectURL(f)); }
                }}
                className="hidden"
              />
            </div>
          </div>
        </div>

        <Input
          id="username"
          label="Username"
          {...register("username")}
          error={errors.username?.message}
        />
        <Input
          id="fullName"
          label="Full name"
          {...register("fullName")}
          error={errors.fullName?.message}
        />
        <div className="space-y-1">
          <label htmlFor="bio" className="font-label-md text-label-md text-text ml-xs block">
            Bio
          </label>
          <textarea
            id="bio"
            rows={4}
            {...register("bio")}
            className="block w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-body-md font-body-md text-text placeholder:text-text-tertiary/60 shadow-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all"
          />
          {errors.bio && <p className="text-sm text-danger ml-xs">{errors.bio.message}</p>}
        </div>

        <Input
          id="location"
          label="Location"
          placeholder="e.g. San Francisco, CA"
          {...register("location")}
          error={errors.location?.message}
        />
        <Input
          id="website"
          label="Website"
          placeholder="https://example.com"
          {...register("website")}
          error={errors.website?.message}
        />
        <div className="space-y-1">
          <label htmlFor="skills" className="font-label-md text-label-md text-text ml-xs block">
            Skills
          </label>
          <input
            id="skills"
            placeholder="React, TypeScript, UI Design (comma-separated)"
            {...register("skills")}
            className="block w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-body-md font-body-md text-text placeholder:text-text-tertiary/60 shadow-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all"
          />
          {errors.skills && <p className="text-sm text-danger ml-xs">{errors.skills.message}</p>}
        </div>

        <div className="flex gap-3">
          <Button type="submit" loading={mutation.isPending}>
            Save
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate(`/profile/${user.id}`)}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
