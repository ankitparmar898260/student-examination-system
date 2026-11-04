import React from "react";

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
      className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer`}
    >
      <span>📥</span>
      <span>{label}</span>
    </button>
  );
}
