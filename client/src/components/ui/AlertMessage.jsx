import React, { useEffect } from "react";
import { CheckCircle2, AlertCircle, X } from "lucide-react";

export default function AlertMessage({ type = "success", message, onClose }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      if (onClose) onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [message, onClose]);

  if (!message) return null;

  const isSuccess = type === "success";

  return (
    <div
      className={`mb-5 flex items-center justify-between p-3.5 rounded-xl border text-sm transition-all shadow-xs ${
        isSuccess
          ? "bg-emerald-50 text-emerald-900 border-emerald-200/90"
          : "bg-rose-50 text-rose-900 border-rose-200/90"
      }`}
      role="alert"
    >
      <div className="flex items-center gap-2.5">
        {isSuccess ? (
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
        ) : (
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
        )}
        <span className="font-medium text-xs leading-relaxed">{message}</span>
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-md hover:bg-black/5 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
