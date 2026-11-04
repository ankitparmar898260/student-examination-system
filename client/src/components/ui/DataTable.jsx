import React from "react";
import Loader from "./Loader";
import { Inbox } from "lucide-react";

export default function DataTable({
  columns = [],
  data = [],
  emptyMessage = "No records found",
  loading = false,
  showSerial = true,
  serialLabel = "S.No.",
  showFooter = true,
}) {
  // Check if serial column is already explicitly provided in columns
  const hasSerial = columns.some(
    (c) =>
      c.key === "_serial" ||
      c.key === "serial" ||
      c.key === "sno" ||
      c.key === "srNo" ||
      c.key === "serialNo"
  );

  let tableColumns = columns;
  if (showSerial && !hasSerial) {
    const serialCol = {
      key: "_serial",
      label: serialLabel,
      align: "center",
      headerClassName: "w-16 min-w-[3.5rem] max-w-[4rem]",
      className: "w-16 min-w-[3.5rem] max-w-[4rem] text-center",
      render: (_, rowIdx) => (
        <span className="font-mono text-xs font-semibold text-slate-500">
          {rowIdx + 1}
        </span>
      ),
    };

    if (columns.length > 0 && columns[0].key === "checkbox") {
      tableColumns = [columns[0], serialCol, ...columns.slice(1)];
    } else {
      tableColumns = [serialCol, ...columns];
    }
  }

  return (
    <div className="w-full overflow-hidden bg-white rounded-xl border border-slate-200 shadow-xs">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
          <thead className="bg-[#F8FAFC] border-b border-slate-200">
            <tr>
              {tableColumns.map((col, idx) => (
                <th
                  key={col.key || idx}
                  className={`px-4 py-3.5 text-xs font-semibold text-slate-600 tracking-wider uppercase ${
                    col.align === "center"
                      ? "text-center"
                      : col.align === "right"
                      ? "text-right"
                      : "text-left"
                  } ${col.headerClassName || ""}`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {loading ? (
              <tr>
                <td
                  colSpan={tableColumns.length}
                  className="px-4 py-16 text-center text-slate-500"
                >
                  <Loader size="md" />
                </td>
              </tr>
            ) : data && data.length > 0 ? (
              data.map((row, rowIdx) => (
                <tr
                  key={row.id ?? row.studentId ?? row.subjectId ?? row.examId ?? row.enrollmentId ?? rowIdx}
                  className="hover:bg-blue-50/30 transition-colors even:bg-slate-50/30 group"
                >
                  {tableColumns.map((col, colIdx) => (
                    <td
                      key={col.key || colIdx}
                      className={`px-4 py-3.5 text-slate-800 whitespace-nowrap text-sm ${
                        col.align === "center"
                          ? "text-center"
                          : col.align === "right"
                          ? "text-right"
                          : "text-left"
                      } ${col.className || ""}`}
                    >
                      {col.render ? col.render(row, rowIdx) : row[col.key] ?? "-"}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={tableColumns.length}
                  className="px-4 py-16 text-center"
                >
                  <div className="flex flex-col items-center justify-center text-slate-400">
                    <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center mb-3 text-slate-400">
                      <Inbox className="w-6 h-6 stroke-[1.5]" />
                    </div>
                    <p className="text-sm font-semibold text-slate-700 mb-0.5">No Records Found</p>
                    <p className="text-xs text-slate-400 max-w-sm">{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {showFooter && !loading && data && data.length > 0 && (
        <div className="px-4 py-2.5 bg-[#F8FAFC] border-t border-slate-200 text-xs font-medium text-slate-500 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span>Total Records:</span>
            <span className="font-mono font-semibold text-slate-700 bg-white px-2 py-0.5 rounded-md border border-slate-200">
              {data.length}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
