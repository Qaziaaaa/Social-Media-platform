import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import api from "@/services/api";

const forgotSchema = z.object({
  email: z.string().email("Invalid email"),
});

type ForgotForm = z.infer<typeof forgotSchema>;

export function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotForm>({
    resolver: zodResolver(forgotSchema),
  });

  const onSubmit = async (data: ForgotForm) => {
    setLoading(true);
    setError("");
    try {
      await api.post("/auth/forgot-password", { email: data.email });
      setSent(true);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Something went wrong";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center -mx-margin-mobile md:-mx-0">
        <div className="w-full max-w-md bg-surface-container-lowest rounded-[24px] ambient-shadow border border-outline-variant/30 animate-fade-in p-3xl text-center">
          <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-primary text-[32px]">mail</span>
          </div>
          <h1 className="font-headline-md text-headline-md text-on-surface mb-2">Check your email</h1>
          <p className="font-body-md text-body-md text-on-surface-variant mb-6">
            If an account exists with that email, we've sent a password reset link.
          </p>
          <Link
            to="/login"
            className="text-primary font-label-md text-label-md hover:underline"
          >
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center -mx-margin-mobile md:-mx-0">
      <div className="w-full max-w-md bg-surface-container-lowest rounded-[24px] ambient-shadow border border-outline-variant/30 animate-fade-in p-3xl">
        <div className="mb-xl">
          <h1 className="font-headline-lg-mobile text-headline-lg-mobile md:font-headline-lg md:text-headline-lg text-on-surface mb-xs">Forgot password?</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Enter your email and we'll send you a reset link.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-md">
          <div className="flex flex-col gap-xs">
            <label className="font-label-sm text-label-sm text-on-surface-variant ml-xs" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="name@example.com"
              {...register("email")}
              className="w-full bg-surface border border-border rounded-md px-3.5 py-2.5 text-body-md text-text placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all"
            />
            {errors.email && <p className="text-sm text-error ml-xs">{errors.email.message}</p>}
          </div>

          {error && <p className="text-sm text-error">{error}</p>}

          <Button type="submit" loading={loading} className="w-full">
            Send Reset Link
          </Button>
        </form>

        <p className="mt-xl text-center font-body-sm text-body-sm text-on-surface-variant">
          Remember your password?
          <Link to="/login" className="font-label-md text-label-md text-primary hover:underline ml-xs">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
