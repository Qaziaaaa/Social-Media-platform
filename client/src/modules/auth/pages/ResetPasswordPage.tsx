import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import api from "@/services/api";

const resetSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ResetForm = z.infer<typeof resetSchema>;

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetForm>({
    resolver: zodResolver(resetSchema),
  });

  const onSubmit = async (data: ResetForm) => {
    if (!token) {
      setError("No reset token provided");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await api.post("/auth/reset-password", { token, password: data.password });
      setDone(true);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Reset failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center -mx-margin-mobile md:-mx-0">
        <div className="w-full max-w-md bg-surface-container-lowest rounded-[24px] ambient-shadow border border-outline-variant/30 animate-fade-in p-3xl text-center">
          <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-primary text-[32px]">check_circle</span>
          </div>
          <h1 className="font-headline-md text-headline-md text-on-surface mb-2">Password reset</h1>
          <p className="font-body-md text-body-md text-on-surface-variant mb-6">
            Your password has been reset successfully.
          </p>
          <Link
            to="/login"
            className="bg-primary text-on-primary font-label-md text-label-md px-6 py-2.5 rounded-full hover:bg-on-primary-fixed-variant transition-colors shadow-sm"
          >
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center -mx-margin-mobile md:-mx-0">
        <div className="w-full max-w-md bg-surface-container-lowest rounded-[24px] ambient-shadow border border-outline-variant/30 animate-fade-in p-3xl text-center">
          <div className="h-14 w-14 rounded-full bg-error/10 flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-error text-[32px]">error</span>
          </div>
          <h1 className="font-headline-md text-headline-md text-on-surface mb-2">Invalid link</h1>
          <p className="font-body-md text-body-md text-on-surface-variant mb-6">
            No reset token provided. Request a new password reset.
          </p>
          <Link
            to="/forgot-password"
            className="text-primary font-label-md text-label-md hover:underline"
          >
            Request reset
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center -mx-margin-mobile md:-mx-0">
      <div className="w-full max-w-md bg-surface-container-lowest rounded-[24px] ambient-shadow border border-outline-variant/30 animate-fade-in p-3xl">
        <div className="mb-xl">
          <h1 className="font-headline-lg-mobile text-headline-lg-mobile md:font-headline-lg md:text-headline-lg text-on-surface mb-xs">Set new password</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Must be at least 6 characters.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-md">
          <div className="flex flex-col gap-xs">
            <label className="font-label-sm text-label-sm text-on-surface-variant ml-xs" htmlFor="password">New Password</label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              {...register("password")}
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-md py-[10px] font-body-md text-body-md text-on-surface placeholder:text-outline-variant/60 focus:outline-none focus:border-primary focus:ring-[3px] focus:ring-primary/10 transition-all"
            />
            {errors.password && <p className="text-sm text-error ml-xs">{errors.password.message}</p>}
          </div>

          <div className="flex flex-col gap-xs">
            <label className="font-label-sm text-label-sm text-on-surface-variant ml-xs" htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              {...register("confirmPassword")}
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-md py-[10px] font-body-md text-body-md text-on-surface placeholder:text-outline-variant/60 focus:outline-none focus:border-primary focus:ring-[3px] focus:ring-primary/10 transition-all"
            />
            {errors.confirmPassword && <p className="text-sm text-error ml-xs">{errors.confirmPassword.message}</p>}
          </div>

          {error && <p className="text-sm text-error">{error}</p>}

          <Button type="submit" loading={loading} className="w-full">
            Reset Password
          </Button>
        </form>
      </div>
    </div>
  );
}
