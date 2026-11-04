import React, { useState, useEffect } from "react";
import { getExams } from "../api/exams";
import {
  getEnrolledStudents,
  getAvailableStudents,
  enrollStudents,
} from "../api/enrollment";
import SelectInput from "../components/ui/SelectInput";
import DataTable from "../components/ui/DataTable";
import AlertMessage from "../components/ui/AlertMessage";

export default function Enrollment() {
  const [exams, setExams] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState("");
  const [availableStudents, setAvailableStudents] = useState([]);
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [loadingExams, setLoadingExams] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState(null);

  // Load Exams on mount
  useEffect(() => {
    const fetchExams = async () => {
      setLoadingExams(true);
      try {
        const res = await getExams();
        const list = res.data || [];
        setExams(list);
        if (list.length > 0) {
          const firstId = list[0].examId || list[0].id;
          setSelectedExamId(String(firstId));
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

  // Fetch Available & Enrolled when selectedExamId changes
  const fetchEnrollmentData = async (examId) => {
    if (!examId) {
      setAvailableStudents([]);
      setEnrolledStudents([]);
      setSelectedStudentIds([]);
      return;
    }

    setLoadingData(true);
    setSelectedStudentIds([]);
    try {
      const [availRes, enrolledRes] = await Promise.all([
        getAvailableStudents(examId),
        getEnrolledStudents(examId),
      ]);
      setAvailableStudents(availRes.data || []);
      setEnrolledStudents(enrolledRes.data || []);
    } catch (err) {
      setAlert({
        type: "error",
        message:
          err.response?.data?.message || "Failed to load enrollment lists.",
      });
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (selectedExamId) {
      fetchEnrollmentData(selectedExamId);
    }
  }, [selectedExamId]);

  const handleExamChange = (e) => {
    setSelectedExamId(e.target.value);
  };

  const handleToggleStudent = (studentId) => {
    setSelectedStudentIds((prev) => {
      if (prev.includes(studentId)) {
        return prev.filter((id) => id !== studentId);
      } else {
        return [...prev, studentId];
      }
    });
  };

  const handleSelectAllAvailable = (e) => {
    if (e.target.checked) {
      const allIds = availableStudents.map((s) => s.studentId || s.id);
      setSelectedStudentIds(allIds);
    } else {
      setSelectedStudentIds([]);
    }
  };

  const handleEnrollSelected = async () => {
    if (!selectedExamId) {
      setAlert({ type: "error", message: "Please select an exam first." });
      return;
    }
    if (selectedStudentIds.length === 0) {
      setAlert({
        type: "error",
        message: "Please select at least 1 student to enroll.",
      });
      return;
    }

    setSubmitting(true);
    try {
      await enrollStudents({
        examId: Number(selectedExamId),
        studentIds: selectedStudentIds,
      });
      setAlert({
        type: "success",
        message: `Successfully enrolled ${selectedStudentIds.length} student(s)!`,
      });
      fetchEnrollmentData(selectedExamId);
    } catch (err) {
      setAlert({
        type: "error",
        message: err.response?.data?.message || "Enrollment failed.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const examOptions = [
    { value: "", label: "-- Select Exam --" },
    ...exams.map((ex) => ({
      value: String(ex.examId || ex.id),
      label: `${ex.examName} (${ex.academicYear})`,
    })),
  ];

  const allAvailableChecked =
    availableStudents.length > 0 &&
    selectedStudentIds.length === availableStudents.length;

  const availableColumns = [
    {
      key: "checkbox",
      label: (
        <input
          type="checkbox"
          checked={allAvailableChecked}
          onChange={handleSelectAllAvailable}
          disabled={availableStudents.length === 0}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
      ),
      align: "center",
      render: (row) => {
        const id = row.studentId || row.id;
        return (
          <input
            type="checkbox"
            checked={selectedStudentIds.includes(id)}
            onChange={() => handleToggleStudent(id)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
        );
      },
    },
    { key: "rollNumber", label: "Roll No" },
    { key: "fullName", label: "Full Name" },
    { key: "department", label: "Department" },
  ];

  const enrolledColumns = [
    { key: "rollNumber", label: "Roll No" },
    { key: "fullName", label: "Full Name" },
    { key: "department", label: "Department" },
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
        <h2 className="text-xl font-bold text-gray-900">Enrollment</h2>
        <p className="text-xs text-gray-500">
          Enroll eligible students into examination sessions
        </p>
      </div>

      {/* Select Exam Filter */}
      <div className="max-w-xs mb-6">
        <SelectInput
          label="Select Exam"
          name="examId"
          value={selectedExamId}
          onChange={handleExamChange}
          options={examOptions}
          disabled={loadingExams}
          required
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Available Students Box */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-gray-900">
              Available Students ({availableStudents.length})
            </h3>
            <button
              type="button"
              onClick={handleEnrollSelected}
              disabled={submitting || selectedStudentIds.length === 0}
              className="px-3.5 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting
                ? "Enrolling..."
                : `Enroll Selected (${selectedStudentIds.length})`}
            </button>
          </div>

          <DataTable
            columns={availableColumns}
            data={availableStudents}
            emptyMessage={
              selectedExamId
                ? "No available students to enroll (all enrolled or no students)."
                : "Please select an exam first."
            }
            loading={loadingData}
          />
        </div>

        {/* Already Enrolled Box */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-gray-900">
              Already Enrolled ({enrolledStudents.length})
            </h3>
          </div>

          <DataTable
            columns={enrolledColumns}
            data={enrolledStudents}
            emptyMessage={
              selectedExamId
                ? "No students have been enrolled in this exam yet."
                : "Please select an exam first."
            }
            loading={loadingData}
          />
        </div>
      </div>
    </div>
  );
}
