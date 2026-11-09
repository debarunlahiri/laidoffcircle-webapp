"use client";
import { usePlatform } from "@/providers/platform-provider";
import { Check, CircleAlert, TriangleAlert, X } from "lucide-react";

const icons = { success: Check, warning: TriangleAlert, error: CircleAlert };
const titles = {
  success: "Done",
  warning: "Heads up",
  error: "Something went wrong",
};

// Colour-coded message: green for success, amber for warnings, red for errors.
export default function Toast() {
  const { toast, toastKind, dismissToast } = usePlatform();

  if (!toast) return null;
  const Icon = icons[toastKind];

  return (
    <div
      role={toastKind === "success" ? "status" : "alert"}
      className={`toast toast-${toastKind}`}
    >
      <Icon size={20} className="toast-icon" />
      <span className="toast-body">
        <strong>{titles[toastKind]}</strong>
        {toast}
      </span>
      <button
        type="button"
        className="toast-close"
        aria-label="Dismiss message"
        onClick={dismissToast}
      >
        <X size={16} />
      </button>
    </div>
  );
}
