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
    <div className="w-full mb-3 text-left">
      {label && (
        <label
          htmlFor={name}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <select
        id={name}
        name={name}
        value={value ?? ""}
        onChange={onChange}
        disabled={disabled}
        className={`w-full px-3 py-2 text-sm rounded border transition-colors focus:outline-none focus:ring-1 ${
          error
            ? "border-red-500 focus:border-red-500 focus:ring-red-500 text-red-900"
            : "border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-gray-900"
        } ${disabled ? "bg-gray-100 cursor-not-allowed text-gray-500" : "bg-white"}`}
      >
        {options.map((opt, index) => (
          <option key={opt.key ?? opt.value ?? index} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
