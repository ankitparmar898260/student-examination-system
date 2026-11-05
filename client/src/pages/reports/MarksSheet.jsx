/**
 * Report: Student Marksheet
 * Purpose: Generates and prints an official individual student marksheet showing subject-wise marks and final grade/status.
 */

import React, { useState, useEffect } from "react";
import { getExams } from "../../api/exams";
import { getEnrolledStudents } from "../../api/enrollment";
import { getMarksSheet } from "../../api/reports";
import SelectInput from "../../components/ui/SelectInput";
import PrintWrapper from "../../components/ui/PrintWrapper";
import Badge from "../../components/ui/Badge";
import AlertMessage from "../../components/ui/AlertMessage";
import Loader from "../../components/ui/Loader";
import { GraduationCap, Award, CheckCircle2, XCircle, AlertCircle } from "lucide-react";

export default function MarksSheet() {
  const [exams, setExams] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState("");
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [marksSheetData, setMarksSheetData] = useState(null);

  const [loadingExams, setLoadingExams] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [loadingSheet, setLoadingSheet] = useState(false);
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
    const fetchStudents = async () => {
      if (!selectedExamId) {
        setEnrolledStudents([]);
        setSelectedStudentId("");
        setMarksSheetData(null);
        return;
      }

      setLoadingStudents(true);
      try {
        const res = await getEnrolledStudents(selectedExamId);
        const list = res.data || [];
        setEnrolledStudents(list);
        if (list.length > 0) {
          const firstStud = list[0];
          setSelectedStudentId(String(firstStud.studentId || firstStud.id));
        } else {
          setSelectedStudentId("");
          setMarksSheetData(null);
        }
      } catch (err) {
        setAlert({
          type: "error",
          message:
            err.response?.data?.message || "Failed to load enrolled candidates.",
        });
      } finally {
        setLoadingStudents(false);
      }
    };

    fetchStudents();
  }, [selectedExamId]);

  useEffect(() => {
    const fetchSheet = async () => {
      if (!selectedExamId || !selectedStudentId) {
        setMarksSheetData(null);
        return;
      }

      setLoadingSheet(true);
      try {
        const res = await getMarksSheet(selectedExamId, selectedStudentId);
        setMarksSheetData(res.data);
      } catch (err) {
        setAlert({
          type: "error",
          message:
            err.response?.data?.message || "Failed to load candidate marksheet.",
        });
        setMarksSheetData(null);
      } finally {
        setLoadingSheet(false);
      }
    };

    fetchSheet();
  }, [selectedExamId, selectedStudentId]);

  const examOptions = [
    { value: "", label: "-- Select Examination --" },
    ...exams.map((ex) => ({
      value: String(ex.examId || ex.id),
      label: `${ex.examName} (${ex.academicYear})`,
    })),
  ];

  const studentOptions = [
    { value: "", label: "-- Select Candidate --" },
    ...enrolledStudents.map((st) => ({
      value: String(st.studentId || st.id),
      label: `${st.fullName} (${st.rollNumber})`,
    })),
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
      <div className="mb-6 no-print">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Student Marks Sheet</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Generate, verify and print formal performance transcript and marksheet
        </p>
      </div>

      {/* Selectors Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs mb-6 max-w-xl no-print">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SelectInput
            label="Examination Session"
            name="examId"
            value={selectedExamId}
            onChange={(e) => setSelectedExamId(e.target.value)}
            options={examOptions}
            disabled={loadingExams}
          />
          <SelectInput
            label="Target Candidate"
            name="studentId"
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            options={studentOptions}
            disabled={loadingStudents || !selectedExamId}
          />
        </div>
      </div>

      {loadingSheet ? (
        <div className="py-20 bg-white rounded-2xl border border-slate-200">
          <Loader size="md" />
        </div>
      ) : marksSheetData ? (
        <PrintWrapper buttonLabel="Print Official Marksheet">
          <div className="bg-white border border-slate-200 rounded-2xl p-8 sm:p-10 shadow-xs max-w-3xl mx-auto print:border-none print:shadow-none print:p-0">
            {/* Institution Letterhead Header */}
            <div className="border-b-2 border-slate-900 pb-5 mb-6 text-center">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-blue-600 text-white mb-2 shadow-xs">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold uppercase tracking-wider text-slate-900">
                Department of Academic Examinations
              </h2>
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-widest mt-0.5">
                Official Statement of Marks &amp; Academic Transcript
              </p>
            </div>

            {/* Candidate Metadata Banner */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 mb-6 text-xs">
              <div>
                <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] block mb-0.5">
                  Candidate Name
                </span>
                <span className="font-bold text-slate-900 text-sm">
                  {marksSheetData.studentName}
                </span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] block mb-0.5">
                  Roll Number
                </span>
                <span className="font-mono font-bold text-blue-700 text-sm">
                  {marksSheetData.rollNumber}
                </span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] block mb-0.5">
                  Examination
                </span>
                <span className="font-semibold text-slate-800">
                  {marksSheetData.examName}
                </span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] block mb-0.5">
                  Department
                </span>
                <span className="font-semibold text-slate-800">
                  {marksSheetData.department || "General"}
                </span>
              </div>
            </div>

            {/* Subject Marks Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden mb-6">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-[#F8FAFC] text-slate-700 font-semibold text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3 text-center w-16">S.No.</th>
                    <th className="px-4 py-3 text-left">Subject Syllabus</th>
                    <th className="px-4 py-3 text-center">Max Marks</th>
                    <th className="px-4 py-3 text-center">Pass Marks</th>
                    <th className="px-4 py-3 text-center">Obtained</th>
                    <th className="px-4 py-3 text-center">Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {marksSheetData.subjects && marksSheetData.subjects.length > 0 ? (
                    marksSheetData.subjects.map((sub, idx) => {
                      const isNull =
                        sub.marksObtained === null ||
                        sub.marksObtained === undefined;
                      const isPass =
                        !isNull &&
                        Number(sub.marksObtained) >= Number(sub.passMarks);
                      const status = isNull
                        ? "Incomplete"
                        : isPass
                        ? "Pass"
                        : "Fail";

                      return (
                        <tr key={idx} className="hover:bg-blue-50/25">
                          <td className="px-4 py-3 text-center font-mono text-xs font-semibold text-slate-500 w-16">
                            {idx + 1}
                          </td>
                          <td className="px-4 py-3 font-medium text-slate-900">
                            {sub.subjectName}
                          </td>
                          <td className="px-4 py-3 text-center font-mono text-slate-600">
                            {sub.maxMarks}
                          </td>
                          <td className="px-4 py-3 text-center font-mono text-slate-600">
                            {sub.passMarks}
                          </td>
                          <td className="px-4 py-3 text-center font-mono font-bold text-slate-900">
                            {isNull ? "-" : sub.marksObtained}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <Badge status={sub.status || status} />
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-4 py-6 text-center text-slate-400 text-xs">
                        No subject evaluation records on file.
                      </td>
                    </tr>
                  )}
                  {/* Aggregated Totals Row */}
                  <tr className="bg-slate-50 font-bold border-t-2 border-slate-200 text-slate-900">
                    <td colSpan={2} className="px-4 py-3.5 uppercase tracking-wider text-xs">Total Aggregate</td>
                    <td className="px-4 py-3.5 text-center font-mono">
                      {marksSheetData.totalMaxMarks ?? "-"}
                    </td>
                    <td className="px-4 py-3.5 text-center text-slate-400 font-mono">-</td>
                    <td className="px-4 py-3.5 text-center font-mono text-base text-blue-600">
                      {marksSheetData.totalObtained ?? "-"}
                    </td>
                    <td className="px-4 py-3.5 text-center text-slate-400 font-mono">-</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Performance Summary Footnote */}
            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Cumulative Percentage:
                  </span>
                  <span className="text-lg font-bold font-mono text-slate-900">
                    {marksSheetData.percentage !== null &&
                    marksSheetData.percentage !== undefined
                      ? `${Number(marksSheetData.percentage).toFixed(2)}%`
                      : "-"}
                  </span>
                </div>
                {marksSheetData.overallResult === "Fail" && (
                  <p className="text-xs text-rose-600 font-medium mt-1 flex items-center gap-1">
                    <XCircle className="w-3.5 h-3.5" />
                    Fail Condition: One or more subjects below required passing cutoff
                  </p>
                )}
                {marksSheetData.overallResult === "Incomplete" && (
                  <p className="text-xs text-amber-700 font-medium mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Incomplete: Evaluation marks unrecorded for enrolled subjects
                  </p>
                )}
                {marksSheetData.overallResult === "Pass" && (
                  <p className="text-xs text-emerald-700 font-medium mt-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Pass Condition: All assigned curriculum subjects successfully cleared
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2.5">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Final Status:
                </span>
                <Badge status={marksSheetData.overallResult} />
              </div>
            </div>

            {/* Verification Signature line for print */}
            <div className="hidden print:flex justify-between items-end mt-12 pt-8 text-xs text-slate-500 border-t border-slate-300">
              <div>Date of Issue: {new Date().toLocaleDateString()}</div>
              <div className="text-center">
                <div className="w-48 border-b border-slate-400 mb-1"></div>
                Controller of Examinations
              </div>
            </div>
          </div>
        </PrintWrapper>
      ) : (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-12 text-center text-slate-400 text-sm shadow-xs">
          {!selectedExamId || !selectedStudentId
            ? "Please select both an examination session and candidate above to view marksheet."
            : "No marksheet record on file for this candidate."}
        </div>
      )}
    </div>
  );
}
