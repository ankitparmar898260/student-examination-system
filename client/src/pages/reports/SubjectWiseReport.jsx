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
    { value: "", label: "-- Select Exam --" },
    ...exams.map((ex) => ({
      value: String(ex.examId || ex.id),
      label: `${ex.examName} (${ex.academicYear})`,
    })),
  ];

  const columns = [
    { key: "subjectName", label: "Subject Name" },
    {
      key: "highestMarks",
      label: "Highest Marks",
      align: "center",
      render: (row) =>
        row.highestMarks !== null && row.highestMarks !== undefined
          ? row.highestMarks
          : "-",
    },
    {
      key: "averageMarks",
      label: "Average Marks",
      align: "center",
      render: (row) =>
        row.averageMarks !== null && row.averageMarks !== undefined
          ? Number(row.averageMarks).toFixed(2)
          : "-",
    },
    {
      key: "failedCount",
      label: "No. of Failed Students",
      align: "center",
      render: (row) => (
        <span
          className={`font-semibold ${
            (row.failedCount || 0) > 0 ? "text-red-600" : "text-green-600"
          }`}
        >
          {row.failedCount ?? 0}
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
        <h2 className="text-xl font-bold text-gray-900">
          Subject-wise Analysis Report
        </h2>
        <p className="text-xs text-gray-500">
          Analytics showing highest marks, average score, and failure count per subject
        </p>
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
        data={reports}
        emptyMessage={
          selectedExamId
            ? "No subject analytics available for this exam."
            : "Please select an exam to view subject analysis."
        }
        loading={loadingData || loadingExams}
      />
    </div>
  );
}
