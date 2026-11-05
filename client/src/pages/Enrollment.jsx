/**
 * Page: Exam Enrollment
 * Purpose: Allows enrolling students into selected exams and viewing currently enrolled students.
 */

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
import { UserCheck, UserPlus, Users } from "lucide-react";

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
      setAlert({ type: "error", message: "Please select an examination first." });
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
        message: `Successfully enrolled ${selectedStudentIds.length} candidate(s)!`,
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
    { value: "", label: "-- Select Examination --" },
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
          className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
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
            className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
          />
        );
      },
    },
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
      label: "Full Name",
      render: (row) => <span className="font-semibold text-slate-900">{row.fullName}</span>,
    },
    {
      key: "department",
      label: "Department",
      render: (row) => (
        <span className="text-xs text-slate-600 font-medium">
          {row.department}
        </span>
      ),
    },
  ];

  const enrolledColumns = [
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
      label: "Full Name",
      render: (row) => <span className="font-semibold text-slate-900">{row.fullName}</span>,
    },
    {
      key: "department",
      label: "Department",
      render: (row) => (
        <span className="text-xs text-slate-600 font-medium">
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
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Candidate Enrollment</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Select target examination to assign and enroll eligible student candidates
        </p>
      </div>

      {/* Select Exam Filter Card */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs mb-6 max-w-md">
        <SelectInput
          label="Target Examination Session"
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
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Eligible to Enroll ({availableStudents.length})
              </h3>
            </div>
            <button
              type="button"
              onClick={handleEnrollSelected}
              disabled={submitting || selectedStudentIds.length === 0}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl transition-colors shadow-xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>
                {submitting
                  ? "Enrolling..."
                  : `Enroll Selected (${selectedStudentIds.length})`}
              </span>
            </button>
          </div>

          <div className="flex-1">
            <DataTable
              columns={availableColumns}
              data={availableStudents}
              emptyMessage={
                selectedExamId
                  ? "All eligible candidates are currently enrolled in this exam."
                  : "Please choose an exam to inspect candidate availability."
              }
              loading={loadingData}
            />
          </div>
        </div>

        {/* Already Enrolled Box */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#16A34A]" />
              <h3 className="text-sm font-bold text-slate-900">
                Currently Enrolled ({enrolledStudents.length})
              </h3>
            </div>
            <span className="text-[11px] font-semibold text-[#16A34A] bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              Active Roster
            </span>
          </div>

          <div className="flex-1">
            <DataTable
              columns={enrolledColumns}
              data={enrolledStudents}
              emptyMessage={
                selectedExamId
                  ? "No candidate enrollments recorded yet for this session."
                  : "Select an exam above to view registered enrollments."
              }
              loading={loadingData}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
