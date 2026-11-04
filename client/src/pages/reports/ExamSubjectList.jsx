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
    { value: "", label: "-- Select Examination --" },
    ...exams.map((ex) => ({
      value: String(ex.examId || ex.id),
      label: `${ex.examName} (${ex.academicYear})`,
    })),
  ];

  const columns = [
    {
      key: "subjectCode",
      label: "Subject Code",
      render: (row) => (
        <span className="font-mono text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
          {row.subjectCode}
        </span>
      ),
    },
    {
      key: "subjectName",
      label: "Subject Title",
      render: (row) => <span className="font-semibold text-slate-900">{row.subjectName}</span>,
    },
    {
      key: "maxMarks",
      label: "Max Marks",
      align: "center",
      render: (row) => <span className="font-mono font-medium text-slate-800">{row.maxMarks}</span>,
    },
    {
      key: "passMarks",
      label: "Pass Marks",
      align: "center",
      render: (row) => (
        <span className="font-mono font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
          {row.passMarks}
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
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Exam-wise Subject List</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Curriculum breakdown and marks allocation for assigned examination subjects
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
        data={subjects}
        emptyMessage={
          selectedExamId
            ? "No subjects mapped to this examination schedule."
            : "Please select an examination above to view mapped subjects."
        }
        loading={loadingData || loadingExams}
      />
    </div>
  );
}
