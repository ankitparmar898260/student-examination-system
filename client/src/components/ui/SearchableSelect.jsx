import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Search, X, Check } from "lucide-react";

export default function SearchableSelect({
  id,
  name,
  value = "",
  onChange,
  options = [],
  placeholder = "Select...",
  searchPlaceholder = "Type to search...",
  disabled = false,
  error = null,
  required = false,
  size = "md", // "md" or "sm"
  className = "",
  allowClear = true,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [menuAlign, setMenuAlign] = useState("left");

  const containerRef = useRef(null);
  const searchInputRef = useRef(null);
  const listRef = useRef(null);
  const triggerRef = useRef(null);

  // Normalize current selected option
  const selectedOption = options.find(
    (opt) => String(opt.value ?? "") === String(value ?? "")
  );

  // Filter options based on search query
  const filteredOptions = options.filter((opt) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const labelMatch = String(opt.label ?? "").toLowerCase().includes(q);
    const valueMatch = String(opt.value ?? "").toLowerCase().includes(q);
    return labelMatch || valueMatch;
  });

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        setSearch("");
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Adjust menu alignment and focus search input when opened
  useEffect(() => {
    if (isOpen) {
      // Calculate alignment to avoid right overflow
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const spaceOnRight = window.innerWidth - rect.left;
        if (spaceOnRight < 360 && rect.right > 360) {
          setMenuAlign("right");
        } else {
          setMenuAlign("left");
        }
      }

      // Find initial highlighted index
      const initialIdx = filteredOptions.findIndex(
        (opt) => String(opt.value ?? "") === String(value ?? "")
      );
      setHighlightedIndex(initialIdx >= 0 ? initialIdx : 0);

      // Auto focus search field
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearch("");
    }
  }, [isOpen]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (isOpen && listRef.current) {
      const items = listRef.current.querySelectorAll("[data-option-item]");
      if (items[highlightedIndex]) {
        items[highlightedIndex].scrollIntoView({
          block: "nearest",
          behavior: "smooth",
        });
      }
    }
  }, [highlightedIndex, isOpen]);

  const handleSelect = (option) => {
    if (onChange) {
      onChange(option.value, option);
    }
    setIsOpen(false);
    setSearch("");
    triggerRef.current?.focus();
  };

  const handleClear = (e) => {
    e.stopPropagation();
    if (onChange) {
      onChange("", null);
    }
  };

  const handleKeyDown = (e) => {
    if (disabled) return;

    if (!isOpen) {
      if (e.key === "Enter" || e.key === "ArrowDown" || e.key === " ") {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < filteredOptions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev > 0 ? prev - 1 : filteredOptions.length - 1
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredOptions[highlightedIndex]) {
        handleSelect(filteredOptions[highlightedIndex]);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setIsOpen(false);
      setSearch("");
      triggerRef.current?.focus();
    } else if (e.key === "Tab") {
      setIsOpen(false);
      setSearch("");
    }
  };

  // Determine displayed text
  const isSelectedEmptyOrPlaceholder =
    !selectedOption ||
    selectedOption.value === "" ||
    selectedOption.label?.startsWith("--");

  const displayText = selectedOption ? selectedOption.label : placeholder;

  const isSmall = size === "sm";

  return (
    <div
      ref={containerRef}
      className={`relative select-none text-left ${className}`}
      onKeyDown={handleKeyDown}
    >
      {/* Trigger Button */}
      <button
        ref={triggerRef}
        id={id}
        name={name}
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        title={displayText}
        className={`w-full flex items-center justify-between gap-2.5 border transition-all duration-150 focus:outline-none text-left cursor-pointer ${
          isSmall
            ? "px-3 py-1.5 text-xs rounded-xl shadow-2xs"
            : "px-3.5 py-2.5 text-sm rounded-xl"
        } ${
          error
            ? "border-rose-400 bg-rose-50/30 text-rose-900 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
            : isOpen
            ? "border-blue-600 ring-2 ring-blue-600/15 bg-white text-[#0F172A]"
            : "border-slate-200 bg-white text-[#0F172A] hover:border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15"
        } ${
          disabled
            ? "bg-slate-100 cursor-not-allowed text-slate-400 border-slate-200"
            : ""
        }`}
      >
        <span
          className={`truncate block flex-1 ${
            isSelectedEmptyOrPlaceholder
              ? "text-slate-400 font-normal"
              : "text-[#0F172A] font-medium"
          }`}
        >
          {displayText}
        </span>

        <div className="flex items-center gap-1.5 shrink-0 text-slate-400">
          {allowClear && !disabled && selectedOption && selectedOption.value !== "" && (
            <span
              role="button"
              tabIndex={-1}
              onClick={handleClear}
              title="Clear selection"
              className="p-0.5 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
            >
              <X className={isSmall ? "w-3 h-3" : "w-3.5 h-3.5"} />
            </span>
          )}
          <ChevronDown
            className={`transition-transform duration-200 text-slate-400 ${
              isSmall ? "w-3.5 h-3.5" : "w-4 h-4"
            } ${isOpen ? "rotate-180 text-blue-600" : ""}`}
          />
        </div>
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <div
          className={`absolute ${
            menuAlign === "right" ? "right-0" : "left-0"
          } mt-1.5 min-w-full w-max max-w-[min(calc(100vw-2rem),36rem)] z-50 bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100`}
        >
          {/* Search Box Header (Select2 Style) */}
          <div className="p-2 border-b border-slate-100 bg-slate-50/70">
            <div className="relative flex items-center">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setHighlightedIndex(0);
                }}
                placeholder={searchPlaceholder}
                className="w-full pl-8 pr-7 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    searchInputRef.current?.focus();
                  }}
                  className="absolute right-2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Options List - No truncate so all words show completely */}
          <div
            ref={listRef}
            role="listbox"
            className="max-h-60 overflow-y-auto p-1 text-xs sm:text-sm divide-y divide-slate-50"
          >
            {filteredOptions.length === 0 ? (
              <div className="py-6 px-4 text-center text-xs text-slate-400">
                No matching options found
              </div>
            ) : (
              filteredOptions.map((opt, idx) => {
                const isSelected =
                  String(opt.value ?? "") === String(value ?? "");
                const isHighlighted = idx === highlightedIndex;

                return (
                  <div
                    key={opt.key ?? opt.value ?? idx}
                    data-option-item
                    role="option"
                    aria-selected={isSelected}
                    title={opt.label}
                    onClick={() => handleSelect(opt)}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors gap-3 ${
                      isSelected
                        ? "bg-blue-50 text-blue-700 font-semibold"
                        : isHighlighted
                        ? "bg-slate-100 text-slate-900"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <span className="whitespace-normal break-words leading-relaxed text-left">
                      {opt.label}
                    </span>
                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-blue-600 shrink-0 ml-1" />
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Option count footer if searching */}
          {search && (
            <div className="px-3 py-1.5 text-[10px] text-slate-400 bg-slate-50 border-t border-slate-100 text-right">
              Found {filteredOptions.length} of {options.length} options
            </div>
          )}
        </div>
      )}
    </div>
  );
}
