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
    <div className="flex min-h-[70vh] items-center justify-center -mx-margin-mobile md:-mx-0">
      <div className="w-full max-w-[1024px] bg-background rounded-[24px] ambient-shadow flex flex-col md:flex-row overflow-hidden border border-outline-variant/30 animate-fade-in">
        <div className="hidden lg:flex lg:w-1/2 relative bg-surface-container overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent z-10 mix-blend-multiply"></div>
          <img
            alt="Workspace"
            className="absolute inset-0 w-full h-full object-cover z-0"
            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&q=80"
          />
          <div className="relative z-20 flex flex-col justify-end p-3xl h-full w-full">
            <div className="bg-surface/80 backdrop-blur-md p-lg rounded-xl max-w-md shadow-lg border border-surface-container-lowest/50">
              <p className="font-headline-md text-headline-md text-on-surface mb-sm">&ldquo;The most intuitive way to connect with my professional network without the noise.&rdquo;</p>
              <p className="font-body-md text-body-md text-on-surface-variant">&mdash; Alex R., Design Lead</p>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-center px-margin-mobile md:px-margin-desktop py-2xl lg:py-3xl overflow-y-auto">
          <div className="w-full max-w-md mx-auto">
            <div className="mb-2xl flex items-center gap-sm">
              <span className="material-symbols-outlined text-primary text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>graphic_eq</span>
              <span className="font-headline-md text-headline-md font-bold text-primary">Lumina Social</span>
            </div>

            <div className="mb-xl">
              <h1 className="font-headline-lg-mobile text-headline-lg-mobile md:font-headline-lg md:text-headline-lg text-on-surface mb-sm">Create an account</h1>
              <p className="font-body-md text-body-md text-on-surface-variant">Join our professional community today.</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-lg">
              <div className="flex flex-col gap-xs">
                <label className="font-label-md text-label-md text-on-surface" htmlFor="fullName">Full Name</label>
                <input
                  id="fullName"
                  placeholder="Jane Doe"
                  {...register("fullName")}
                  className="w-full px-md py-[10px] bg-surface-container-lowest border border-outline-variant rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-on-surface font-body-md text-body-md transition-all placeholder:text-outline"
                />
                {errors.fullName && <p className="text-sm text-error">{errors.fullName.message}</p>}
              </div>

              <div className="flex flex-col gap-xs">
                <label className="font-label-md text-label-md text-on-surface" htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  placeholder="jane@example.com"
                  {...register("email")}
                  className="w-full px-md py-[10px] bg-surface-container-lowest border border-outline-variant rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-on-surface font-body-md text-body-md transition-all placeholder:text-outline"
                />
                {errors.email && <p className="text-sm text-error">{errors.email.message}</p>}
              </div>

              <div className="flex flex-col gap-xs">
                <label className="font-label-md text-label-md text-on-surface" htmlFor="username">Username</label>
                <div className="relative">
                  <span className="absolute left-md top-1/2 -translate-y-1/2 text-outline font-body-md text-body-md">@</span>
                  <input
                    id="username"
                    placeholder="janedoe"
                    {...register("username")}
                    className="w-full pl-xl pr-md py-[10px] bg-surface-container-lowest border border-outline-variant rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-on-surface font-body-md text-body-md transition-all placeholder:text-outline"
                  />
                </div>
                {errors.username && <p className="text-sm text-error">{errors.username.message}</p>}
              </div>

              <div className="flex flex-col gap-xs">
                <label className="font-label-md text-label-md text-on-surface" htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  {...register("password")}
                  className="w-full px-md py-[10px] bg-surface-container-lowest border border-outline-variant rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-on-surface font-body-md text-body-md transition-all placeholder:text-outline"
                />
                {errors.password && <p className="text-sm text-error">{errors.password.message}</p>}
              </div>

              <Button type="submit" loading={registerLoading} className="w-full">
                Sign Up
              </Button>
            </form>

            <div className="flex items-center gap-md my-xl">
              <div className="flex-1 h-px bg-outline-variant/50"></div>
              <span className="font-label-sm text-label-sm text-on-surface-variant">or sign up with</span>
              <div className="flex-1 h-px bg-outline-variant/50"></div>
            </div>

            <button className="w-full flex items-center justify-center gap-sm py-[10px] bg-surface-container-lowest border border-outline-variant rounded-lg hover:bg-surface-container-low transition-colors text-on-surface font-label-md text-label-md">
              <span className="material-symbols-outlined text-on-surface text-[20px]">account_circle</span>
              Google
            </button>

            <div className="mt-2xl text-center">
              <p className="font-body-md text-body-md text-on-surface-variant">
                Already have an account?
                <Link to="/login" className="font-label-md text-label-md text-primary hover:underline ml-xs">
                  Log in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
