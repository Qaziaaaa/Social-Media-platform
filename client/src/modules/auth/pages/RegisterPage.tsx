import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/modules/auth/hooks/useAuth";

const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").max(30),
  fullName: z.string().min(1, "Full name is required").max(100),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type RegisterForm = z.infer<typeof registerSchema>;

export function RegisterPage() {
  const { register: registerUser, registerLoading, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, isLoading, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = (data: RegisterForm) => {
    registerUser(data);
  };

  return (
    <div className="flex min-h-screen items-center justify-center -mx-margin-mobile md:-mx-0 bg-bg">
      <div className="fixed inset-0 pointer-events-none bg-grid" />
      <div className="fixed inset-0 pointer-events-none bg-glow" />
      <div className="relative w-full max-w-[420px] px-margin-mobile md:px-0 animate-fade-in">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-2xl">
          <svg width="36" height="36" viewBox="0 0 64 64" fill="none" className="shrink-0">
            <rect width="64" height="64" rx="16" fill="currentColor" className="text-accent"/>
            <path d="M20 44V24l8-8 4 4 4-4 8 8v20H20z" stroke="currentColor" className="text-bg" strokeWidth="2.5" strokeLinejoin="round" fill="none"/>
            <path d="M28 28v12m8-12v12" stroke="currentColor" className="text-bg" strokeWidth="2" strokeLinecap="round" opacity="0.6"/>
            <path d="M32 16l-4 4m4-4l4 4" stroke="currentColor" className="text-bg" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
          <span className="font-headline-lg text-headline-lg font-bold text-text tracking-tight">Forge</span>
        </div>

        {/* Card */}
        <div className="glass-strong rounded-2xl p-8">
          <div className="mb-6">
            <h1 className="font-headline-xl text-headline-xl text-text font-semibold mb-1">Create an account</h1>
            <p className="font-body-md text-body-md text-text-secondary">Join the builder community.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="font-label-sm text-label-sm text-text-secondary" htmlFor="fullName">Full Name</label>
              <input
                id="fullName"
                placeholder="Jane Doe"
                {...register("fullName")}
              />
              {errors.fullName && <p className="text-sm text-danger">{errors.fullName.message}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-label-sm text-label-sm text-text-secondary" htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                placeholder="jane@example.com"
                {...register("email")}
              />
              {errors.email && <p className="text-sm text-danger">{errors.email.message}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-label-sm text-label-sm text-text-secondary" htmlFor="username">Username</label>
              <input
                id="username"
                placeholder="janedoe"
                {...register("username")}
              />
              {errors.username && <p className="text-sm text-danger">{errors.username.message}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-label-sm text-label-sm text-text-secondary" htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                {...register("password")}
              />
              {errors.password && <p className="text-sm text-danger">{errors.password.message}</p>}
            </div>

            <Button type="submit" loading={registerLoading} className="w-full">
              Sign Up
            </Button>
          </form>

          <div className="relative flex items-center py-5">
            <div className="flex-grow border-t border-border"></div>
            <span className="flex-shrink-0 px-3 font-label-sm text-label-sm text-text-tertiary">or</span>
            <div className="flex-grow border-t border-border"></div>
          </div>

          <button
            type="button"
            className="w-full py-2.5 bg-surface border border-border rounded-xl flex items-center justify-center gap-2 font-label-md text-label-md text-text hover:bg-surface-hover transition-all active:scale-[0.98]"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Google
          </button>

          <p className="mt-6 text-center font-body-sm text-body-sm text-text-secondary">
            Already have an account?{" "}
            <Link to="/login" className="font-label-md text-label-md text-accent hover:text-accent-hover transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
