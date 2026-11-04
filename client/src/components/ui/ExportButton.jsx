import React from "react";
import { Download } from "lucide-react";

export default function ExportButton({
  onClick,
  label = "Export CSV",
  disabled = false,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 active:bg-blue-800 transition-colors shadow-xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
    >
      <Download className="w-3.5 h-3.5" />
      <span>{label}</span>
    </button>
  );
}
