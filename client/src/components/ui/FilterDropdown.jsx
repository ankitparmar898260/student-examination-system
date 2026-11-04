import React from "react";

export default function FilterDropdown({
  label,
  value = "",
  onChange,
  options = [],
}) {
  return (
    <div className="flex items-center gap-2">
      {label && (
        <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
          {label}:
        </label>
      )}
      <select
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="px-3 py-2 text-sm bg-white border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
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
