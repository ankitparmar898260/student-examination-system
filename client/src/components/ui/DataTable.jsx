import React from "react";
import Loader from "./Loader";

export default function DataTable({
  columns = [],
  data = [],
  emptyMessage = "No records found",
  loading = false,
}) {
  return (
    <div className="w-full overflow-x-auto bg-white rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((col, idx) => (
              <th
                key={col.key || idx}
                className={`px-4 py-3 font-semibold text-gray-700 tracking-wider text-xs uppercase ${
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
        <tbody className="divide-y divide-gray-200">
          {loading ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-8 text-center text-gray-500"
              >
                <Loader size="md" />
              </td>
            </tr>
          ) : data && data.length > 0 ? (
            data.map((row, rowIdx) => (
              <tr
                key={row.id ?? row.studentId ?? row.subjectId ?? row.examId ?? row.enrollmentId ?? rowIdx}
                className="even:bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                {columns.map((col, colIdx) => (
                  <td
                    key={col.key || colIdx}
                    className={`px-4 py-3 text-gray-900 whitespace-nowrap ${
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
                className="px-4 py-8 text-center text-sm text-gray-500"
              >
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
