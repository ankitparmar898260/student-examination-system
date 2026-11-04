import React, { useEffect } from "react";

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
      className={`mb-4 flex items-center justify-between p-3.5 rounded border text-sm transition-all ${
        isSuccess
          ? "bg-green-100 text-green-800 border-green-300"
          : "bg-red-100 text-red-800 border-red-300"
      }`}
      role="alert"
    >
      <div className="flex items-center gap-2">
        <span className="font-bold text-base leading-none">
          {isSuccess ? "✓" : "✕"}
        </span>
        <span className="font-medium">{message}</span>
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="text-xs font-semibold px-2 py-0.5 rounded hover:bg-black/10 transition-colors"
          aria-label="Dismiss"
        >
          ✕
        </button>
      )}
    </div>
  );
}
