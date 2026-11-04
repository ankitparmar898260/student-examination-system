import React, { useState, useEffect } from "react";
import { getExams } from "../../api/exams";
import { getMissingMarksReport } from "../../api/reports";
import DataTable from "../../components/ui/DataTable";
import FilterDropdown from "../../components/ui/FilterDropdown";
import AlertMessage from "../../components/ui/AlertMessage";
import { AlertCircle, CheckCircle2 } from "lucide-react";

export default function MissingMarksReport() {
  const [exams, setExams] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState("");
  const [missingRecords, setMissingRecords] = useState([]);
  const [loadingExams, setLoadingExams] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
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
    const fetchMissing = async () => {
      if (!selectedExamId) {
        setMissingRecords([]);
        return;
      }

      setLoadingData(true);
      try {
        const res = await getMissingMarksReport(selectedExamId);
        setMissingRecords(res.data || []);
      } catch (err) {
        setAlert({
          type: "error",
          message:
            err.response?.data?.message ||
            "Failed to load missing marks audit report.",
        });
      } finally {
        setLoadingData(false);
      }
    };

    fetchMissing();
  }, [selectedExamId]);

  const examOptions = [
    { value: "", label: "-- Select Examination --" },
    ...exams.map((ex) => ({
      value: String(ex.examId || ex.id),
      label: `${ex.examName} (${ex.academicYear})`,
    })),
  ];

  const columns = [
    {
      key: "rollNumber",
      label: "Roll No",
      render: (row) => (
        <span className="font-mono text-xs font-medium text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
          {row.rollNumber}
        </span>
      ),
    },
    {
      key: "fullName",
      label: "Candidate Full Name",
      render: (row) => <span className="font-semibold text-slate-900">{row.fullName}</span>,
    },
    {
      key: "subjectName",
      label: "Pending Subject Evaluation",
      render: (row) => (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/90">
          <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span>{row.subjectName}</span>
        </span>
      ),
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
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Missing Marks Audit Report
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Audits enrolled candidates who lack recorded evaluation marks for assigned subjects
        </p>
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
        data={missingRecords}
        emptyMessage={
          selectedExamId
            ? "Audit Complete: All enrolled candidates have evaluation marks recorded for this examination."
            : "Select an examination to audit missing score entries."
        }
        loading={loadingData || loadingExams}
      />
    </div>
  );
}
