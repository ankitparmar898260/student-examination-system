import React from "react";

export default function SelectInput({
  label,
  name,
  value = "",
  onChange,
  error = null,
  options = [],
  required = false,
  disabled = false,
}) {
  return (
    <div className="w-full mb-3.5 text-left">
      {label && (
        <label
          htmlFor={name}
          className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
        >
          {label}
          {required && <span className="text-rose-500 ml-1 font-bold">*</span>}
        </label>
      )}
      <select
        id={name}
        name={name}
        value={value ?? ""}
        onChange={onChange}
        disabled={disabled}
        className={`w-full px-3.5 py-2.5 text-sm rounded-xl border transition-all duration-150 focus:outline-none ${
          error
            ? "border-rose-400 bg-rose-50/30 text-rose-900 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
            : "border-slate-200 bg-white text-[#0F172A] hover:border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15"
        } ${disabled ? "bg-slate-100 cursor-not-allowed text-slate-400 border-slate-200" : ""}`}
      >
        {options.map((opt, index) => (
          <option key={opt.key ?? opt.value ?? index} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1.5 text-xs font-medium text-rose-600">{error}</p>}
    </div>
  );
}
