import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import api from "@/services/api";
import type { ApiResponse, Report } from "@/types";

interface ReportButtonProps {
  targetType: "post" | "comment" | "user";
  targetId: string;
}

const reasons = [
  "Spam",
  "Harassment",
  "Hate speech",
  "Misinformation",
  "Violence",
  "Inappropriate content",
  "Other",
];

export function ReportButton({ targetType, targetId }: ReportButtonProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");

  const mutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.post<ApiResponse<Report>>("/reports", {
        targetType,
        targetId,
        reason,
      });
      return data.data;
    },
    onSuccess: () => {
      toast.success("Report submitted");
      setOpen(false);
      setReason("");
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg ?? "Failed to submit report");
    },
  });

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center gap-sm px-md py-sm text-label-md text-on-surface-variant hover:bg-surface-container-low transition-colors"
      >
        <span className="material-symbols-outlined text-[18px]">flag</span>
        Report
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 animate-fade-in"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-surface rounded-xl p-lg shadow-xl border border-surface-container-high w-full max-w-md mx-4 animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-headline-md text-headline-md font-bold text-on-surface mb-md">Report</h3>
            <div className="space-y-sm mb-lg">
              {reasons.map((r) => (
                <label
                  key={r}
                  className="flex items-center gap-sm p-sm rounded-lg cursor-pointer hover:bg-surface-container-low transition-colors"
                >
                  <input
                    type="radio"
                    name="reason"
                    value={r}
                    checked={reason === r}
                    onChange={(e) => setReason(e.target.value)}
                    className="accent-primary"
                  />
                  <span className="font-body-md text-body-md text-on-surface">{r}</span>
                </label>
              ))}
            </div>
            <div className="flex gap-sm justify-end">
              <button
                onClick={() => { setOpen(false); setReason(""); }}
                className="px-4 py-2 font-label-md text-label-md text-on-surface-variant hover:bg-surface-container-low rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => mutation.mutate()}
                disabled={!reason || mutation.isPending}
                className="px-4 py-2 font-label-md text-label-md bg-error text-on-error rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {mutation.isPending ? "Submitting..." : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
