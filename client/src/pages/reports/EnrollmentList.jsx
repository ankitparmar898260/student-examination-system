import React, { useState, useEffect } from "react";
import { getExams } from "../../api/exams";
import { getEnrollmentListReport } from "../../api/reports";
import DataTable from "../../components/ui/DataTable";
import FilterDropdown from "../../components/ui/FilterDropdown";
import AlertMessage from "../../components/ui/AlertMessage";

export default function EnrollmentList() {
  const [exams, setExams] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState("");
  const [enrollments, setEnrollments] = useState([]);
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
    const fetchEnrollments = async () => {
      if (!selectedExamId) {
        setEnrollments([]);
        return;
      }

      setLoadingData(true);
      try {
        const res = await getEnrollmentListReport(selectedExamId);
        setEnrollments(res.data || []);
      } catch (err) {
        setAlert({
          type: "error",
          message:
            err.response?.data?.message ||
            "Failed to load enrollment list report.",
        });
      } finally {
        setLoadingData(false);
      }
    };

    fetchEnrollments();
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
        <span className="font-mono text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-200">
          {row.rollNumber}
        </span>
      ),
    },
    {
      key: "fullName",
      label: "Candidate Name",
      render: (row) => <span className="font-semibold text-slate-900">{row.fullName}</span>,
    },
    {
      key: "email",
      label: "Email Address",
      render: (row) => <span className="text-xs text-slate-600">{row.email}</span>,
    },
    {
      key: "department",
      label: "Department",
      render: (row) => (
        <span className="text-xs font-medium text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200">
          {row.department}
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
          Exam-wise Enrollment Roster
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Complete candidate roster registered for the selected examination
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
        data={enrollments}
        emptyMessage={
          selectedExamId
            ? "No candidates enrolled in this examination."
            : "Please select an examination to view enrolled candidates."
        }
        loading={loadingData || loadingExams}
      />
    </div>
  );
}
