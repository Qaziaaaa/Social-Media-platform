import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import api from "@/services/api";

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("No verification token provided");
      return;
    }
    api.post("/auth/verify-email", { token })
      .then(() => {
        setStatus("success");
        setMessage("Email verified successfully! You can now log in.");
      })
      .catch((err: unknown) => {
        setStatus("error");
        const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Verification failed";
        setMessage(msg);
      });
  }, [token]);

  return (
    <div className="flex min-h-[70vh] items-center justify-center -mx-margin-mobile md:-mx-0">
      <div className="w-full max-w-md bg-surface-container-lowest rounded-[24px] ambient-shadow border border-outline-variant/30 animate-fade-in p-3xl text-center">
        {status === "loading" && (
          <div className="flex flex-col items-center gap-4">
            <span className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="font-body-md text-body-md text-on-surface-variant">Verifying your email...</p>
          </div>
        )}
        {status === "success" && (
          <div className="flex flex-col items-center gap-4">
            <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-[32px]">check_circle</span>
            </div>
            <h1 className="font-headline-md text-headline-md text-on-surface">Email Verified</h1>
            <p className="font-body-md text-body-md text-on-surface-variant">{message}</p>
            <Link
              to="/login"
              className="bg-primary text-on-primary font-label-md text-label-md px-6 py-2.5 rounded-full hover:bg-on-primary-fixed-variant transition-colors shadow-sm"
            >
              Go to Login
            </Link>
          </div>
        )}
        {status === "error" && (
          <div className="flex flex-col items-center gap-4">
            <div className="h-14 w-14 rounded-full bg-error/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-error text-[32px]">error</span>
            </div>
            <h1 className="font-headline-md text-headline-md text-on-surface">Verification Failed</h1>
            <p className="font-body-md text-body-md text-on-surface-variant">{message}</p>
            <Link
              to="/login"
              className="bg-primary text-on-primary font-label-md text-label-md px-6 py-2.5 rounded-full hover:bg-on-primary-fixed-variant transition-colors shadow-sm"
            >
              Back to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
