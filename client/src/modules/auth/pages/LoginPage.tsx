import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/modules/auth/hooks/useAuth";

const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginForm = z.infer<typeof loginSchema>;

export function LoginPage() {
  const { login, loginLoading, isAuthenticated, isLoading } = useAuth();
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
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginForm) => {
    login(data);
  };

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="w-full max-w-sm space-y-6 animate-fade-in">
        <div className="text-center">
          <h1 className="font-display text-3xl font-bold">Sign in</h1>
          <p className="mt-2 text-sm text-[#64748b]">
            Welcome back to Social
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            id="email"
            label="Email"
            type="email"
            {...register("email")}
            error={errors.email?.message}
          />
          <Input
            id="password"
            label="Password"
            type="password"
            {...register("password")}
            error={errors.password?.message}
          />
          <Button type="submit" loading={loginLoading} className="w-full">
            Sign in
          </Button>
        </form>

        <p className="text-center text-sm text-[#64748b]">
          Don't have an account?{" "}
          <Link to="/register" className="font-medium text-primary hover:text-primary-hover transition-colors">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
