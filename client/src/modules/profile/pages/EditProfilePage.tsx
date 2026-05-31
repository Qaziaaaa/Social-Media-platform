import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import api from "@/services/api";
import { queryKeys } from "@/lib/query-keys";
import type { ApiResponse, User } from "@/types";

const editProfileSchema = z.object({
  username: z.string().min(3).max(30),
  fullName: z.string().min(1).max(100),
  bio: z.string().max(500).optional(),
});

type EditProfileForm = z.infer<typeof editProfileSchema>;

export function EditProfilePage() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

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
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: EditProfileForm) => {
      const res = await api.patch<ApiResponse<User>>(`/users/${user?.id}`, data);
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
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Edit profile</h1>
      </div>

      <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
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
          <label htmlFor="bio" className="block text-sm font-medium text-[#cbd5e1]">
            Bio
          </label>
          <textarea
            id="bio"
            rows={4}
            {...register("bio")}
            className="block w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-[#e2e8f0] placeholder:text-[#475569] transition-colors focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
          />
          {errors.bio && <p className="text-sm text-red-400">{errors.bio.message}</p>}
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
