import React from "react";
import Loader from "./Loader";
import { Inbox } from "lucide-react";

export default function DataTable({
  columns = [],
  data = [],
  emptyMessage = "No records found",
  loading = false,
}) {
  return (
    <div className="w-full overflow-hidden bg-white rounded-xl border border-slate-200 shadow-xs">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
          <thead className="bg-[#F8FAFC] border-b border-slate-200">
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={col.key || idx}
                  className={`px-4 py-3.5 text-xs font-semibold text-slate-600 tracking-wider uppercase ${
                    col.align === "center"
                      ? "text-center"
                      : col.align === "right"
                      ? "text-right"
                      : "text-left"
                  }`}
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
                  colSpan={columns.length}
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
                  {columns.map((col, colIdx) => (
                    <td
                      key={col.key || colIdx}
                      className={`px-4 py-3.5 text-slate-800 whitespace-nowrap text-sm ${
                        col.align === "center"
                          ? "text-center"
                          : col.align === "right"
                          ? "text-right"
                          : "text-left"
                      }`}
                    >
                      {col.render ? col.render(row, rowIdx) : row[col.key] ?? "-"}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
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
    </div>
  );
}
