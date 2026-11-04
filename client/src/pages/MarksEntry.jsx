import React, { useState, useEffect } from "react";
import { getExams, getExamSubjects } from "../api/exams";
import { getMarks, saveMarksBulk } from "../api/marks";
import SelectInput from "../components/ui/SelectInput";
import AlertMessage from "../components/ui/AlertMessage";
import Loader from "../components/ui/Loader";
import { Save, CheckCircle, AlertTriangle, BookOpen, Layers } from "lucide-react";

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

    const num = parseFloat(val);
    const newErrors = { ...rowErrors };

    if (val === "" || val === null || val === undefined) {
      newErrors[enrollmentId] = "Marks cannot be empty";
    } else if (isNaN(num)) {
      newErrors[enrollmentId] = "Must be a valid number";
    } else if (num < 0 || num > maxMarks) {
      newErrors[enrollmentId] = `Must be between 0 and ${maxMarks}`;
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
        newErrors[row.enrollmentId] = `Must be between 0 and ${maxMarks}`;
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
        message: "No candidates enrolled to record marks for.",
      });
      return;
    }

    if (!validateAllRows()) {
      setAlert({
        type: "error",
        message: "Please correct highlighted input errors before submitting.",
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
        message: "Marks batch successfully updated & saved!",
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
    { value: "", label: "-- Select Examination --" },
    ...exams.map((ex) => ({
      value: String(ex.examId || ex.id),
      label: `${ex.examName} (${ex.academicYear})`,
    })),
  ];

  const subjectOptions = [
    { value: "", label: "-- Select Course Subject --" },
    ...examSubjects.map((sub) => ({
      value: String(sub.subjectId || sub.id),
      label: `${sub.subjectName} (${sub.subjectCode})`,
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Marks Entry Evaluation</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Tabulate and record subject-wise scores with instant range check and bulk commit
          </p>
        </div>

        <button
          type="button"
          onClick={handleSaveAll}
          disabled={saving || marksData.length === 0 || hasAnyErrors}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl transition-colors shadow-xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer self-start sm:self-auto"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? "Saving..." : "Save All Marks"}</span>
        </button>
      </div>

      {/* Selectors Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SelectInput
            label="Examination Session"
            name="examId"
            value={selectedExamId}
            onChange={(e) => setSelectedExamId(e.target.value)}
            options={examOptions}
            disabled={loadingExams}
            required
          />
          <SelectInput
            label="Evaluation Subject"
            name="subjectId"
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            options={subjectOptions}
            disabled={loadingSubjects || !selectedExamId}
            required
          />
        </div>

        {/* Benchmarks Banner */}
        {currentSubject && (
          <div className="mt-4 pt-3.5 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-600 gap-3">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" />
              <span className="font-semibold text-slate-800">{currentSubject.subjectName}</span>
              <span className="font-mono text-slate-500">({currentSubject.subjectCode})</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-lg font-medium border border-slate-200">
                Max Marks: <strong className="text-slate-900 font-mono">{maxMarks}</strong>
              </span>
              <span className="bg-emerald-50 text-[#16A34A] border border-emerald-200 px-3 py-1 rounded-lg font-medium">
                Passing Cutoff: <strong className="font-mono">{currentSubject.passMarks}</strong>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Marks Grid Container */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
        {loadingMarks ? (
          <div className="py-16">
            <Loader size="md" />
          </div>
        ) : marksData.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm">
            {!selectedExamId || !selectedSubjectId
              ? "Select an examination and course subject above to load enrolled candidates."
              : "No candidates enrolled in this examination yet."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-[#F8FAFC]">
                <tr>
                  <th className="px-4 py-3 text-center font-semibold text-slate-600 text-xs uppercase tracking-wider w-16">
                    S.No.
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600 text-xs uppercase tracking-wider">
                    Roll No
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600 text-xs uppercase tracking-wider">
                    Candidate Full Name
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600 text-xs uppercase tracking-wider w-56">
                    Marks Obtained (0–{maxMarks})
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600 text-xs uppercase tracking-wider">
                    Validation Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {marksData.map((row, idx) => {
                  const errorMsg = rowErrors[row.enrollmentId];
                  const hasError = Boolean(errorMsg);

                  return (
                    <tr
                      key={row.enrollmentId}
                      className="hover:bg-blue-50/25 transition-colors"
                    >
                      <td className="px-4 py-3.5 text-center text-xs font-mono font-semibold text-slate-500 w-16">
                        {idx + 1}
                      </td>
                      <td className="px-4 py-3.5 text-slate-900 font-mono text-xs">
                        <span className="font-mono text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-200">
                          {row.rollNumber}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-900 font-semibold">
                        {row.fullName}
                      </td>
                      <td className="px-4 py-2.5">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          max={maxMarks}
                          value={row.marksObtained}
                          onChange={(e) =>
                            handleMarkChange(row.enrollmentId, e.target.value)
                          }
                          className={`w-32 px-3 py-1.5 text-sm font-mono rounded-xl border transition-all focus:outline-none ${
                            hasError
                              ? "border-rose-400 bg-rose-50/40 text-rose-900 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                              : "border-slate-200 bg-white text-slate-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15"
                          }`}
                          placeholder="0.00"
                        />
                      </td>
                      <td className="px-4 py-2.5">
                        {hasError ? (
                          <span className="inline-flex items-center gap-1 text-xs text-rose-600 font-medium">
                            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                            <span>{errorMsg}</span>
                          </span>
                        ) : row.marksObtained !== "" ? (
                          <span className="inline-flex items-center gap-1 text-xs text-[#16A34A] font-medium">
                            <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                            <span>Valid Entry</span>
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400 font-medium">Pending Entry</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {!loadingMarks && marksData.length > 0 && (
          <div className="mt-4 pt-3 border-t border-slate-200 text-xs font-medium text-slate-500 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span>Total Enrolled Students:</span>
              <span className="font-mono font-semibold text-slate-700 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                {marksData.length}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
