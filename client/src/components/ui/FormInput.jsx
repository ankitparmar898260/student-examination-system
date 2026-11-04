import React from "react";

export default function FormInput({
  label,
  name,
  type = "text",
  value = "",
  onChange,
  error = null,
  placeholder = "",
  required = false,
  disabled = false,
  min,
  max,
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
      <input
        id={name}
        name={name}
        type={type}
        value={value ?? ""}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        min={min}
        max={max}
        className={`w-full px-3.5 py-2.5 text-sm rounded-lg border transition-all duration-150 focus:outline-none ${
          error
            ? "border-rose-400 bg-rose-50/30 text-rose-900 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
            : "border-slate-300 bg-white text-slate-900 hover:border-slate-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/15"
        } ${disabled ? "bg-slate-100 cursor-not-allowed text-slate-400 border-slate-200" : ""}`}
      />
      {error && <p className="mt-1.5 text-xs font-medium text-rose-600">{error}</p>}
    </div>
  );
}
