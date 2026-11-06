import React from "react";
import { Filter } from "lucide-react";
import SearchableSelect from "./SearchableSelect";

export default function FilterDropdown({
  label,
  value = "",
  onChange,
  options = [],
  placeholder = "Select...",
  className = "",
}) {
  return (
    <div className={`flex items-center gap-2.5 w-full sm:w-auto ${className}`}>
      {label && (
        <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap flex items-center gap-1.5 shrink-0">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span>{label}:</span>
        </label>
      )}
      <div className="flex-1 min-w-[240px] sm:min-w-[320px]">
        <SearchableSelect
          value={value}
          onChange={(val) => onChange && onChange(val)}
          options={options}
          placeholder={placeholder}
          size="sm"
          allowClear={false}
        />
      </div>
    </div>
  );
}
