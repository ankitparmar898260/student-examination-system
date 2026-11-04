import React from "react";
import { Filter } from "lucide-react";

export default function FilterDropdown({
  label,
  value = "",
  onChange,
  options = [],
}) {
  return (
    <div className="flex items-center gap-2">
      {label && (
        <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span>{label}:</span>
        </label>
      )}
      <select
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="px-3 py-1.5 text-xs font-medium bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/15 focus:border-blue-600 text-[#0F172A] transition-all shadow-2xs cursor-pointer"
      >
        {options.map((opt, idx) => (
          <option key={opt.key ?? opt.value ?? idx} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
