import React, { useState, useEffect } from "react";

export default function SearchInput({
  value = "",
  onChange,
  placeholder = "Search...",
}) {
  const [localValue, setLocalValue] = useState(value);

  // Keep in sync with incoming value
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Debounce 300ms
  useEffect(() => {
    const handler = setTimeout(() => {
      if (localValue !== value) {
        onChange(localValue);
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [localValue, onChange, value]);

  return (
    <div className="relative w-full max-w-xs">
      <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400 text-sm">
        🔍
      </span>
      <input
        type="text"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
      />
      {localValue && (
        <button
          type="button"
          onClick={() => {
            setLocalValue("");
            onChange("");
          }}
          className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-gray-400 hover:text-gray-600 text-xs"
          aria-label="Clear search"
        >
          ✕
        </button>
      )}
    </div>
  );
}
