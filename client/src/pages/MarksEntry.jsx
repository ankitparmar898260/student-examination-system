import React, { useState, useEffect } from "react";
import { getExams, getExamSubjects } from "../api/exams";
import { getMarks, saveMarksBulk } from "../api/marks";
import SelectInput from "../components/ui/SelectInput";
import AlertMessage from "../components/ui/AlertMessage";
import Loader from "../components/ui/Loader";

export default function MarksEntry() {
  const [exams, setExams] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState("");
  const [examSubjects, setExamSubjects] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [currentSubject, setCurrentSubject] = useState(null);

  const [marksData, setMarksData] = useState([]);
  const [rowErrors, setRowErrors] = useState({});
  const [loadingExams, setLoadingExams] = useState(false);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [loadingMarks, setLoadingMarks] = useState(false);
  const [saving, setSaving] = useState(false);
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

  // When Exam changes -> fetch subjects for this exam
  useEffect(() => {
    const fetchSubjects = async () => {
      if (!selectedExamId) {
        setExamSubjects([]);
        setSelectedSubjectId("");
        setCurrentSubject(null);
        setMarksData([]);
        return;
      }

      setLoadingSubjects(true);
      try {
        const res = await getExamSubjects(selectedExamId);
        const subjects = res.data || [];
        setExamSubjects(subjects);
        if (subjects.length > 0) {
          const firstSub = subjects[0];
          const firstSubId = String(firstSub.subjectId || firstSub.id);
          setSelectedSubjectId(firstSubId);
          setCurrentSubject(firstSub);
        } else {
          setSelectedSubjectId("");
          setCurrentSubject(null);
          setMarksData([]);
        }
      } catch (err) {
        setAlert({
          type: "error",
          message:
            err.response?.data?.message || "Failed to load exam subjects.",
        });
      } finally {
        setLoadingSubjects(false);
      }
    };

    fetchSubjects();
  }, [selectedExamId]);

  // When Subject changes -> fetch marks grid
  useEffect(() => {
    const fetchMarksGrid = async () => {
      if (!selectedExamId || !selectedSubjectId) {
        setMarksData([]);
        setRowErrors({});
        return;
      }

      const foundSubject = examSubjects.find(
        (s) => String(s.subjectId || s.id) === String(selectedSubjectId)
      );
      setCurrentSubject(foundSubject || null);

      setLoadingMarks(true);
      setRowErrors({});
      try {
        const res = await getMarks(selectedExamId, selectedSubjectId);
        const raw = res.data || [];
        // Raw: [{ enrollmentId, studentId, rollNumber, fullName, marksObtained }]
        setMarksData(
          raw.map((item) => ({
            enrollmentId: item.enrollmentId,
            studentId: item.studentId,
            rollNumber: item.rollNumber,
            fullName: item.fullName,
            marksObtained:
              item.marksObtained !== null && item.marksObtained !== undefined
                ? String(item.marksObtained)
                : "",
          }))
        );
      } catch (err) {
        setAlert({
          type: "error",
          message:
            err.response?.data?.message ||
            "Failed to load marks for the selected subject.",
        });
      } finally {
        setLoadingMarks(false);
      }
    };

    fetchMarksGrid();
  }, [selectedExamId, selectedSubjectId, examSubjects]);

  const maxMarks = currentSubject ? Number(currentSubject.maxMarks) : 100;

  const handleMarkChange = (enrollmentId, val) => {
    setMarksData((prev) =>
      prev.map((row) =>
        row.enrollmentId === enrollmentId
          ? { ...row, marksObtained: val }
          : row
      )
    );

    // Validate this row
    const num = parseFloat(val);
    const newErrors = { ...rowErrors };

    if (val === "" || val === null || val === undefined) {
      newErrors[enrollmentId] = "Marks cannot be empty";
    } else if (isNaN(num)) {
      newErrors[enrollmentId] = "Must be a valid number";
    } else if (num < 0 || num > maxMarks) {
      newErrors[enrollmentId] = `Marks must be between 0 and ${maxMarks}`;
    } else {
      delete newErrors[enrollmentId];
    }

    setRowErrors(newErrors);
  };

  const validateAllRows = () => {
    const newErrors = {};
    if (marksData.length === 0) return true;

    marksData.forEach((row) => {
      const val = row.marksObtained;
      const num = parseFloat(val);
      if (val === "" || val === null || val === undefined) {
        newErrors[row.enrollmentId] = "Marks cannot be empty";
      } else if (isNaN(num)) {
        newErrors[row.enrollmentId] = "Must be a valid number";
      } else if (num < 0 || num > maxMarks) {
        newErrors[row.enrollmentId] = `Marks must be between 0 and ${maxMarks}`;
      }
    });

    setRowErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveAll = async () => {
    if (!selectedExamId || !selectedSubjectId) {
      setAlert({
        type: "error",
        message: "Please select both Exam and Subject.",
      });
      return;
    }

    if (marksData.length === 0) {
      setAlert({
        type: "error",
        message: "No students enrolled to save marks for.",
      });
      return;
    }

    if (!validateAllRows()) {
      setAlert({
        type: "error",
        message: "Please correct the highlighted errors before saving.",
      });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        examId: Number(selectedExamId),
        subjectId: Number(selectedSubjectId),
        marks: marksData.map((row) => ({
          enrollmentId: row.enrollmentId,
          marksObtained: parseFloat(row.marksObtained),
        })),
      };

      await saveMarksBulk(payload);
      setAlert({
        type: "success",
        message: "All marks saved successfully!",
      });
    } catch (err) {
      setAlert({
        type: "error",
        message: err.response?.data?.message || "Failed to save marks.",
      });
    } finally {
      setSaving(false);
    }
  };

  const examOptions = [
    { value: "", label: "-- Select Exam --" },
    ...exams.map((ex) => ({
      value: String(ex.examId || ex.id),
      label: `${ex.examName} (${ex.academicYear})`,
    })),
  ];

  const subjectOptions = [
    { value: "", label: "-- Select Subject --" },
    ...examSubjects.map((sub) => ({
      value: String(sub.subjectId || sub.id),
      label: `${sub.subjectName} (Max: ${sub.maxMarks})`,
    })),
  ];

  const hasAnyErrors = Object.keys(rowErrors).length > 0;

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
        <h2 className="text-xl font-bold text-gray-900">Marks Entry</h2>
        <p className="text-xs text-gray-500">
          Enter and update marks for enrolled students subject-wise
        </p>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mb-6">
        <SelectInput
          label="Select Exam"
          name="examId"
          value={selectedExamId}
          onChange={(e) => setSelectedExamId(e.target.value)}
          options={examOptions}
          disabled={loadingExams}
          required
        />
        <SelectInput
          label="Select Subject"
          name="subjectId"
          value={selectedSubjectId}
          onChange={(e) => setSelectedSubjectId(e.target.value)}
          options={subjectOptions}
          disabled={loadingSubjects || !selectedExamId}
          required
        />
      </div>

      {/* Marks Grid Container */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold text-gray-900">
              Marks Grid
            </h3>
            {currentSubject && (
              <span className="text-xs text-gray-500">
                Max Marks: <strong className="text-gray-800">{maxMarks}</strong> | Pass Marks:{" "}
                <strong className="text-gray-800">{currentSubject.passMarks}</strong>
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleSaveAll}
            disabled={saving || marksData.length === 0 || hasAnyErrors}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
          >
            <span>💾</span>
            <span>{saving ? "Saving..." : "Save All Marks"}</span>
          </button>
        </div>

        {loadingMarks ? (
          <div className="py-12">
            <Loader size="md" />
          </div>
        ) : marksData.length === 0 ? (
          <div className="text-center py-10 text-gray-500 text-sm">
            {!selectedExamId || !selectedSubjectId
              ? "Please select both Exam and Subject to load students."
              : "No enrolled students found for this exam."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 text-xs uppercase">
                    Roll No
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 text-xs uppercase">
                    Full Name
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 text-xs uppercase w-48">
                    Marks (0-{maxMarks})
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 text-xs uppercase">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {marksData.map((row) => {
                  const errorMsg = rowErrors[row.enrollmentId];
                  const hasError = Boolean(errorMsg);

                  return (
                    <tr
                      key={row.enrollmentId}
                      className="even:bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <td className="px-4 py-3 text-gray-900 font-mono text-xs">
                        {row.rollNumber}
                      </td>
                      <td className="px-4 py-3 text-gray-900 font-medium">
                        {row.fullName}
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          max={maxMarks}
                          value={row.marksObtained}
                          onChange={(e) =>
                            handleMarkChange(row.enrollmentId, e.target.value)
                          }
                          className={`w-28 px-3 py-1.5 text-sm rounded border focus:outline-none focus:ring-1 ${
                            hasError
                              ? "border-red-500 bg-red-50 text-red-900 focus:ring-red-500"
                              : "border-gray-300 bg-white text-gray-900 focus:ring-blue-500 focus:border-blue-500"
                          }`}
                          placeholder="0.00"
                        />
                      </td>
                      <td className="px-4 py-2">
                        {hasError ? (
                          <span className="text-xs text-red-600 font-medium flex items-center gap-1">
                            ⚠️ {errorMsg}
                          </span>
                        ) : row.marksObtained !== "" ? (
                          <span className="text-xs text-green-600 font-medium">
                            ✓ Valid
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">Pending</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
