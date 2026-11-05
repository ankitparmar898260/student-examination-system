/**
 * Report: Subject-Wise Performance Report
 * Purpose: Displays student marks, highest/average scores, and pass/fail statistics for a specific exam subject.
 */

import React, { useState, useEffect } from "react";
import { getExams } from "../../api/exams";
import { getSubjectWiseReport } from "../../api/reports";
import DataTable from "../../components/ui/DataTable";
import FilterDropdown from "../../components/ui/FilterDropdown";
import AlertMessage from "../../components/ui/AlertMessage";

export default function SubjectWiseReport() {
  const [exams, setExams] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState("");
  const [reports, setReports] = useState([]);
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
    const fetchReports = async () => {
      if (!selectedExamId) {
        setReports([]);
        return;
      }

      setLoadingData(true);
      try {
        const res = await getSubjectWiseReport(selectedExamId);
        setReports(res.data || []);
      } catch (err) {
        setAlert({
          type: "error",
          message:
            err.response?.data?.message ||
            "Failed to load subject-wise analytics.",
        });
      } finally {
        setLoadingData(false);
      }
    };

    fetchReports();
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
      key: "subjectName",
      label: "Subject Title",
      render: (row) => <span className="font-semibold text-slate-900">{row.subjectName}</span>,
    },
    {
      key: "highestMarks",
      label: "Highest Score",
      align: "center",
      render: (row) =>
        row.highestMarks !== null && row.highestMarks !== undefined ? (
          <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-200">
            {row.highestMarks}
          </span>
        ) : (
          <span className="font-mono text-slate-300">-</span>
        ),
    },
    {
      key: "averageMarks",
      label: "Class Average",
      align: "center",
      render: (row) =>
        row.averageMarks !== null && row.averageMarks !== undefined ? (
          <span className="font-mono font-semibold text-slate-800">
            {Number(row.averageMarks).toFixed(2)}
          </span>
        ) : (
          <span className="font-mono text-slate-300">-</span>
        ),
    },
    {
      key: "failedCount",
      label: "Unsuccessful Count",
      align: "center",
      render: (row) => {
        const count = row.failedCount ?? row.failedStudentsCount ?? 0;
        return (
          <span
            className={`inline-flex items-center gap-1 font-mono text-xs font-semibold px-2.5 py-0.5 rounded-lg border ${
              count > 0
                ? "bg-rose-50 text-rose-700 border-rose-200"
                : "bg-emerald-50 text-[#16A34A] border-emerald-200"
            }`}
          >
            {count} {count === 1 ? "Student" : "Students"}
          </span>
        );
      },
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
          Subject-wise Performance Analytics
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Benchmark evaluation showing highest marks, class mean and candidate failure counts
        </p>
      </div>

      {/* Filter Card */}
      <div className="mb-5 bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center max-w-md">
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
        data={reports}
        emptyMessage={
          selectedExamId
            ? "No subject analytics on file for this examination session."
            : "Select an examination to display subject benchmark analytics."
        }
        loading={loadingData || loadingExams}
      />
    </div>
  );
}
