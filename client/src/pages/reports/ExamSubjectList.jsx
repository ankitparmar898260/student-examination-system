import React, { useState, useEffect } from "react";
import { getExams } from "../../api/exams";
import { getExamSubjectsReport } from "../../api/reports";
import DataTable from "../../components/ui/DataTable";
import FilterDropdown from "../../components/ui/FilterDropdown";
import AlertMessage from "../../components/ui/AlertMessage";

export default function ExamSubjectList() {
  const [exams, setExams] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState("");
  const [subjects, setSubjects] = useState([]);
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
    const fetchSubjects = async () => {
      if (!selectedExamId) {
        setSubjects([]);
        return;
      }

      setLoadingData(true);
      try {
        const res = await getExamSubjectsReport(selectedExamId);
        setSubjects(res.data || []);
      } catch (err) {
        setAlert({
          type: "error",
          message:
            err.response?.data?.message || "Failed to load exam subjects report.",
        });
      } finally {
        setLoadingData(false);
      }
    };

    fetchSubjects();
  }, [selectedExamId]);

  const examOptions = [
    { value: "", label: "-- Select Exam --" },
    ...exams.map((ex) => ({
      value: String(ex.examId || ex.id),
      label: `${ex.examName} (${ex.academicYear})`,
    })),
  ];

  const columns = [
    { key: "subjectCode", label: "Subject Code" },
    { key: "subjectName", label: "Subject Name" },
    { key: "maxMarks", label: "Max Marks", align: "center" },
    { key: "passMarks", label: "Pass Marks", align: "center" },
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
        <h2 className="text-xl font-bold text-gray-900">Exam-wise Subject List</h2>
        <p className="text-xs text-gray-500">
          View subjects mapped to a specific examination
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
        data={subjects}
        emptyMessage={
          selectedExamId
            ? "No subjects mapped to this exam."
            : "Please select an exam to view subjects."
        }
        loading={loadingData || loadingExams}
      />
    </div>
  );
}
