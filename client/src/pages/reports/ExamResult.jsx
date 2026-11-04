import React, { useState, useEffect } from "react";
import { getExams } from "../../api/exams";
import { getExamResult, exportExamResultCSV } from "../../api/reports";
import DataTable from "../../components/ui/DataTable";
import FilterDropdown from "../../components/ui/FilterDropdown";
import ExportButton from "../../components/ui/ExportButton";
import Badge from "../../components/ui/Badge";
import AlertMessage from "../../components/ui/AlertMessage";

export default function ExamResult() {
  const [exams, setExams] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState("");
  const [results, setResults] = useState([]);
  const [loadingExams, setLoadingExams] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    const fetchExams = async () => {
      setLoadingExams(true);
      try {
        const res = await getExams();
        const list = res.data || [];
        setExams(list);
        if (list.length > 0) {
          setSelectedExamId(String(list[0].examId || list[0].id));
        }
      } catch (err) {
        setAlert({
          type: "error",
          message:
            err.response?.data?.message ||
            "Failed to load exams. Ensure backend is running.",
        });
      } finally {
        setLoadingExams(false);
      }
    };
    fetchExams();
  }, []);

  useEffect(() => {
    const fetchResults = async () => {
      if (!selectedExamId) {
        setResults([]);
        return;
      }

      setLoadingData(true);
      try {
        const res = await getExamResult(selectedExamId);
        setResults(res.data || []);
      } catch (err) {
        setAlert({
          type: "error",
          message:
            err.response?.data?.message || "Failed to load exam results.",
        });
      } finally {
        setLoadingData(false);
      }
    };

    fetchResults();
  }, [selectedExamId]);

  const handleExportCSV = async () => {
    if (!selectedExamId) {
      setAlert({ type: "error", message: "Please select an exam first." });
      return;
    }

    setExporting(true);
    try {
      const response = await exportExamResultCSV(selectedExamId);
      const blob = new Blob([response.data], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `exam-result-${selectedExamId}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      setAlert({ type: "success", message: "CSV exported successfully!" });
    } catch (err) {
      setAlert({
        type: "error",
        message: err.response?.data?.message || "Failed to export CSV file.",
      });
    } finally {
      setExporting(false);
    }
  };

  const examOptions = [
    { value: "", label: "-- Select Exam --" },
    ...exams.map((ex) => ({
      value: String(ex.examId || ex.id),
      label: `${ex.examName} (${ex.academicYear})`,
    })),
  ];

  const columns = [
    {
      key: "rank",
      label: "Rank",
      align: "center",
      render: (row) =>
        row.rank !== null && row.rank !== undefined ? (
          <span className="font-bold text-gray-900">#{row.rank}</span>
        ) : (
          <span className="text-gray-400">-</span>
        ),
    },
    { key: "rollNumber", label: "Roll No" },
    { key: "fullName", label: "Full Name" },
    { key: "department", label: "Department" },
    {
      key: "totalObtained",
      label: "Obtained",
      align: "center",
      render: (row) =>
        row.totalObtained !== null && row.totalObtained !== undefined
          ? row.totalObtained
          : "-",
    },
    {
      key: "totalMaxMarks",
      label: "Max",
      align: "center",
      render: (row) =>
        row.totalMaxMarks !== null && row.totalMaxMarks !== undefined
          ? row.totalMaxMarks
          : "-",
    },
    {
      key: "percentage",
      label: "Percentage",
      align: "center",
      render: (row) =>
        row.percentage !== null && row.percentage !== undefined
          ? `${Number(row.percentage).toFixed(2)}%`
          : "-",
    },
    {
      key: "overallResult",
      label: "Overall Result",
      align: "center",
      render: (row) => <Badge status={row.overallResult} />,
    },
  ];

  return (
    <div>
      {/* Alert */}
      {alert && (
        <AlertMessage
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Exam Results</h2>
          <p className="text-xs text-gray-500">
            Merit ranks, percentage, pass/fail status and CSV export
          </p>
        </div>

        <ExportButton
          onClick={handleExportCSV}
          disabled={exporting || !selectedExamId || results.length === 0}
          label={exporting ? "Exporting..." : "Export CSV"}
        />
      </div>

      {/* Filter */}
      <div className="mb-5 bg-white p-4 rounded-lg border border-gray-200 flex items-center">
        <FilterDropdown
          label="Select Exam"
          value={selectedExamId}
          onChange={(val) => setSelectedExamId(val)}
          options={examOptions}
        />
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={results}
        emptyMessage={
          selectedExamId
            ? "No result records found for this exam."
            : "Please select an exam to view results."
        }
        loading={loadingData || loadingExams}
      />
    </div>
  );
}
