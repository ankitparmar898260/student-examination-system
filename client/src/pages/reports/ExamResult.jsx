import React, { useState, useEffect } from "react";
import { getExams } from "../../api/exams";
import { getExamResult, exportExamResultCSV } from "../../api/reports";
import DataTable from "../../components/ui/DataTable";
import FilterDropdown from "../../components/ui/FilterDropdown";
import ExportButton from "../../components/ui/ExportButton";
import Badge from "../../components/ui/Badge";
import AlertMessage from "../../components/ui/AlertMessage";
import { Trophy, Medal, Award } from "lucide-react";

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
      setAlert({ type: "error", message: "Please select an examination first." });
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
      setAlert({ type: "success", message: "Official CSV roster exported successfully!" });
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
    { value: "", label: "-- Select Examination --" },
    ...exams.map((ex) => ({
      value: String(ex.examId || ex.id),
      label: `${ex.examName} (${ex.academicYear})`,
    })),
  ];

  const columns = [
    {
      key: "rank",
      label: "Merit Rank",
      align: "center",
      render: (row) => {
        if (row.rank === 1) {
          return (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
              <Trophy className="w-3 h-3 text-amber-600" />
              <span>Rank 1</span>
            </span>
          );
        } else if (row.rank === 2) {
          return (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-800 border border-slate-300">
              <Medal className="w-3 h-3 text-slate-500" />
              <span>Rank 2</span>
            </span>
          );
        } else if (row.rank === 3) {
          return (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-900 border border-orange-300">
              <Award className="w-3 h-3 text-orange-600" />
              <span>Rank 3</span>
            </span>
          );
        } else if (row.rank) {
          return (
            <span className="font-mono font-bold text-xs text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
              #{row.rank}
            </span>
          );
        } else {
          return <span className="text-slate-300 font-mono">-</span>;
        }
      },
    },
    {
      key: "rollNumber",
      label: "Roll No",
      render: (row) => (
        <span className="font-mono text-xs font-medium text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
          {row.rollNumber}
        </span>
      ),
    },
    {
      key: "fullName",
      label: "Full Name",
      render: (row) => <span className="font-semibold text-slate-900">{row.fullName}</span>,
    },
    {
      key: "department",
      label: "Department",
      render: (row) => <span className="text-xs text-slate-600 font-medium">{row.department}</span>,
    },
    {
      key: "totalObtained",
      label: "Obtained",
      align: "center",
      render: (row) => (
        <span className="font-mono font-bold text-slate-900 text-xs">
          {row.totalObtained !== null && row.totalObtained !== undefined
            ? row.totalObtained
            : "-"}
        </span>
      ),
    },
    {
      key: "totalMaxMarks",
      label: "Max",
      align: "center",
      render: (row) => (
        <span className="font-mono text-slate-500 text-xs">
          {row.totalMaxMarks !== null && row.totalMaxMarks !== undefined
            ? row.totalMaxMarks
            : "-"}
        </span>
      ),
    },
    {
      key: "percentage",
      label: "Percentage",
      align: "center",
      render: (row) =>
        row.percentage !== null && row.percentage !== undefined ? (
          <span className="font-mono font-bold text-slate-900 text-xs">
            {Number(row.percentage).toFixed(2)}%
          </span>
        ) : (
          <span className="font-mono text-slate-300">-</span>
        ),
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
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Examination Results Roster</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Merit ranks, aggregate scores, percentage calculations and server-side CSV streaming
          </p>
        </div>

        <ExportButton
          onClick={handleExportCSV}
          disabled={exporting || !selectedExamId || results.length === 0}
          label={exporting ? "Streaming CSV..." : "Export CSV Report"}
        />
      </div>

      {/* Filter Card */}
      <div className="mb-5 bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs flex items-center max-w-md">
        <FilterDropdown
          label="Examination"
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
            ? "No evaluation results available for this examination."
            : "Select an examination to display merit ranks and scoring transcript."
        }
        loading={loadingData || loadingExams}
      />
    </div>
  );
}
