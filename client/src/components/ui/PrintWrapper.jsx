import React from "react";

export default function PrintWrapper({
  children,
  buttonLabel = "🖨️ Print",
}) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full">
      <div className="flex justify-end mb-4 no-print">
        <button
          type="button"
          onClick={handlePrint}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors shadow-sm cursor-pointer"
        >
          {buttonLabel}
        </button>
      </div>

      <div className="print-area">{children}</div>
    </div>
  );
}
