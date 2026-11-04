import React from "react";
import { Printer } from "lucide-react";

export default function PrintWrapper({
  children,
  buttonLabel = "Print Marksheet",
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
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-xs cursor-pointer hover:border-slate-400"
        >
          <Printer className="w-4 h-4 text-slate-500" />
          <span>{buttonLabel}</span>
        </button>
      </div>

      <div className="print-area">{children}</div>
    </div>
  );
}
