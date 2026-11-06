import React from "react";
import SearchableSelect from "./SearchableSelect";

export default function SelectInput({
  label,
  name,
  value = "",
  onChange,
  error = null,
  options = [],
  required = false,
  disabled = false,
  placeholder = "Select an option...",
}) {
  const handleChange = (selectedVal) => {
    if (onChange) {
      onChange({
        target: {
          name: name || "",
          value: selectedVal,
        },
      });
    }
  };

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
      <SearchableSelect
        id={name}
        name={name}
        value={value}
        onChange={handleChange}
        options={options}
        placeholder={placeholder}
        disabled={disabled}
        error={error}
        required={required}
      />
      {error && <p className="mt-1.5 text-xs font-medium text-rose-600">{error}</p>}
    </div>
  );
}
