import React, { useState, useEffect } from "react";
import { getExams } from "../../api/exams";
import { getMissingMarksReport } from "../../api/reports";
import DataTable from "../../components/ui/DataTable";
import FilterDropdown from "../../components/ui/FilterDropdown";
import AlertMessage from "../../components/ui/AlertMessage";

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
            "Failed to load missing marks report.",
        });
      } finally {
        setLoadingData(false);
      }
    };

    fetchMissing();
  }, [selectedExamId]);

  const examOptions = [
    { value: "", label: "-- Select Exam --" },
    ...exams.map((ex) => ({
      value: String(ex.examId || ex.id),
      label: `${ex.examName} (${ex.academicYear})`,
    })),
  ];

  const columns = [
    { key: "rollNumber", label: "Roll No" },
    { key: "fullName", label: "Full Name" },
    {
      key: "subjectName",
      label: "Missing Subject Name",
      render: (row) => (
        <span className="text-amber-700 font-medium bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
          {row.subjectName}
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
          Missing Marks Report
        </h2>
        <p className="text-xs text-gray-500">
          Identifies enrolled students who have no marks recorded for an exam subject
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
        data={missingRecords}
        emptyMessage={
          selectedExamId
            ? "No missing marks found! All enrolled students have marks recorded for this exam."
            : "Please select an exam to check for missing marks."
        }
        loading={loadingData || loadingExams}
      />
    </div>
  );
}
