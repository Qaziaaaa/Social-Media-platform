import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
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
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="w-full max-w-sm space-y-6 animate-fade-in">
        <div className="text-center">
          <h1 className="font-display text-3xl font-bold">Create account</h1>
          <p className="mt-2 text-sm text-[#64748b]">
            Join Social today
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
          <Button type="submit" loading={registerLoading} className="w-full">
            Create account
          </Button>
        </form>

        <p className="text-center text-sm text-[#64748b]">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-primary hover:text-primary-hover transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
