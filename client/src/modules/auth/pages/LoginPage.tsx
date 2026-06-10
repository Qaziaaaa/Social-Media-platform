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
    <div className="flex min-h-[70vh] items-center justify-center -mx-margin-mobile md:-mx-0">
      <div className="w-full max-w-[1024px] bg-surface-container-lowest rounded-[24px] ambient-shadow flex flex-col md:flex-row overflow-hidden border border-outline-variant/30 animate-fade-in">
        <div className="hidden md:block w-1/2 relative bg-surface-container-high overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-primary/5 z-10 mix-blend-overlay"></div>
          <img
            alt="Abstract geometric shapes"
            className="w-full h-full object-cover object-center"
            src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&q=80"
          />
          <div className="absolute bottom-2xl left-2xl right-2xl z-20">
            <div className="inline-flex items-center gap-sm bg-surface-container-lowest/80 backdrop-blur-md px-md py-sm rounded-full mb-md border border-surface-container-lowest/50">
              <span className="material-symbols-outlined text-primary text-[20px]">verified</span>
              <span className="font-label-sm text-label-sm text-on-surface">Secure & Encrypted</span>
            </div>
            <h2 className="font-display-sm text-display-sm text-on-surface mb-sm">Connect with clarity.</h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-[80%]">
              Experience a premium social network designed for professional engagement and meaningful interactions.
            </p>
          </div>
        </div>

        <div className="w-full md:w-1/2 p-lg md:p-3xl flex flex-col justify-center bg-surface-container-lowest relative z-10">
          <div className="flex items-center gap-sm mb-2xl">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-on-primary shadow-sm">
              <span className="material-symbols-outlined text-[24px]">scatter_plot</span>
            </div>
            <span className="font-headline-md text-headline-md font-bold text-primary">Lumina Social</span>
          </div>

          <div className="mb-xl">
            <h1 className="font-headline-lg-mobile text-headline-lg-mobile md:font-headline-lg md:text-headline-lg text-on-surface mb-xs">Welcome back</h1>
            <p className="font-body-md text-body-md text-on-surface-variant">Please enter your details to sign in.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-md">
            <div className="flex flex-col gap-xs">
              <label className="font-label-sm text-label-sm text-on-surface-variant ml-xs" htmlFor="email">Email or Username</label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3 text-outline-variant text-[20px] pointer-events-none">mail</span>
                <input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  {...register("email")}
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg pl-[40px] pr-[12px] py-[10px] font-body-md text-body-md text-on-surface placeholder:text-outline-variant/60 focus:outline-none focus:border-primary focus:ring-[3px] focus:ring-primary/10 transition-all"
                />
              </div>
              {errors.email && <p className="text-sm text-error ml-xs">{errors.email.message}</p>}
            </div>

            <div className="flex flex-col gap-xs">
              <label className="font-label-sm text-label-sm text-on-surface-variant ml-xs" htmlFor="password">Password</label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3 text-outline-variant text-[20px] pointer-events-none">lock</span>
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  {...register("password")}
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg pl-[40px] pr-[44px] py-[10px] font-body-md text-body-md text-on-surface placeholder:text-outline-variant/60 focus:outline-none focus:border-primary focus:ring-[3px] focus:ring-primary/10 transition-all"
                />
              </div>
              {errors.password && <p className="text-sm text-error ml-xs">{errors.password.message}</p>}
            </div>

            <div className="flex items-center justify-between mt-xs mb-sm">
              <label className="flex items-center gap-xs cursor-pointer group">
                <div className="relative flex items-center justify-center w-4 h-4">
                  <input className="peer appearance-none w-4 h-4 border border-outline-variant rounded-[4px] bg-surface-container-lowest checked:bg-primary checked:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer" type="checkbox" />
                  <span className="material-symbols-outlined absolute text-on-primary text-[12px] opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity">check</span>
                </div>
                <span className="font-label-sm text-label-sm text-on-surface-variant group-hover:text-on-surface transition-colors">Remember me</span>
              </label>
              <Link to="/forgot-password" className="font-label-sm text-label-sm text-primary hover:text-on-primary-fixed-variant hover:underline underline-offset-4 transition-all">Forgot password?</Link>
            </div>

            <Button type="submit" loading={loginLoading} className="w-full">
              Sign In
            </Button>
          </form>

          <div className="relative flex items-center py-lg">
            <div className="flex-grow border-t border-outline-variant/50"></div>
            <span className="flex-shrink-0 px-md font-label-sm text-label-sm text-outline">Or continue with</span>
            <div className="flex-grow border-t border-outline-variant/50"></div>
          </div>

          <div className="flex flex-col gap-sm">
            <button className="w-full py-[10px] bg-surface-container-lowest border border-outline-variant rounded-lg flex items-center justify-center gap-sm font-label-md text-label-md text-on-surface hover:bg-surface-container-low focus:outline-none focus:ring-[3px] focus:ring-surface-variant transition-all active:scale-[0.98]" type="button">
              <span className="material-symbols-outlined text-[20px]">language</span>
              Google
            </button>
          </div>

          <p className="mt-xl text-center font-body-sm text-body-sm text-on-surface-variant">
            Don't have an account?
            <Link to="/register" className="font-label-md text-label-md text-primary hover:text-on-primary-fixed-variant hover:underline underline-offset-4 transition-all ml-xs">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
