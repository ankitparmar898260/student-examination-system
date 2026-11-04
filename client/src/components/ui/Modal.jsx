import React, { useEffect } from "react";
import { X } from "lucide-react";

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-2xl",
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Frosted Dark Overlay */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="flex min-h-full items-center justify-center p-4 text-center">
        <div
          className={`relative w-full ${
            sizeClasses[size] || sizeClasses.md
          } transform overflow-hidden rounded-2xl bg-white p-6 text-left shadow-xl transition-all border border-slate-200`}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-5">
            <h3 className="text-base font-bold text-[#0F172A] tracking-tight">{title}</h3>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors p-1.5 rounded-lg cursor-pointer"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div>{children}</div>
        </div>
      </div>
    </div>
  );
}
