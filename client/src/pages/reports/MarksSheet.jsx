import React, { useState, useEffect } from "react";
import { getExams } from "../../api/exams";
import { getEnrolledStudents } from "../../api/enrollment";
import { getMarksSheet } from "../../api/reports";
import SelectInput from "../../components/ui/SelectInput";
import PrintWrapper from "../../components/ui/PrintWrapper";
import Badge from "../../components/ui/Badge";
import AlertMessage from "../../components/ui/AlertMessage";
import Loader from "../../components/ui/Loader";

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

  // When Exam changes -> fetch enrolled students
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
            err.response?.data?.message || "Failed to load enrolled students.",
        });
      } finally {
        setLoadingStudents(false);
      }
    };

    fetchStudents();
  }, [selectedExamId]);

  // When Student changes -> fetch marks sheet
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
            err.response?.data?.message || "Failed to load marks sheet report.",
        });
        setMarksSheetData(null);
      } finally {
        setLoadingSheet(false);
      }
    };

    fetchSheet();
  }, [selectedExamId, selectedStudentId]);

  const examOptions = [
    { value: "", label: "-- Select Exam --" },
    ...exams.map((ex) => ({
      value: String(ex.examId || ex.id),
      label: `${ex.examName} (${ex.academicYear})`,
    })),
  ];

  const studentOptions = [
    { value: "", label: "-- Select Student --" },
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
        <h2 className="text-xl font-bold text-gray-900">Student Marks Sheet</h2>
        <p className="text-xs text-gray-500">
          Individual student marksheet / report card with pass/fail evaluation
        </p>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mb-6 no-print">
        <SelectInput
          label="Exam"
          name="examId"
          value={selectedExamId}
          onChange={(e) => setSelectedExamId(e.target.value)}
          options={examOptions}
          disabled={loadingExams}
        />
        <SelectInput
          label="Student"
          name="studentId"
          value={selectedStudentId}
          onChange={(e) => setSelectedStudentId(e.target.value)}
          options={studentOptions}
          disabled={loadingStudents || !selectedExamId}
        />
      </div>

      {loadingSheet ? (
        <div className="py-12 bg-white rounded-lg border border-gray-200">
          <Loader size="md" />
        </div>
      ) : marksSheetData ? (
        <PrintWrapper buttonLabel="🖨️ Print Marksheet">
          <div className="bg-white border border-gray-300 rounded-lg p-6 sm:p-8 shadow-xs max-w-3xl mx-auto">
            {/* Header in Marksheet */}
            <div className="border-b-2 border-gray-800 pb-4 mb-6 text-center">
              <h2 className="text-xl font-bold uppercase tracking-wider text-gray-900">
                Student Examination System
              </h2>
              <p className="text-sm font-semibold text-gray-700 mt-1">
                Official Statement of Marks
              </p>
            </div>

            {/* Student & Exam Info */}
            <div className="grid grid-cols-2 gap-4 text-sm mb-6 bg-gray-50 p-4 rounded border border-gray-200">
              <div>
                <p className="text-gray-500 text-xs uppercase">Student Name</p>
                <p className="font-bold text-gray-900">
                  {marksSheetData.studentName}
                </p>
              </div>
              <div>
                <p className="text-gray-500 text-xs uppercase">Roll Number</p>
                <p className="font-bold font-mono text-gray-900">
                  {marksSheetData.rollNumber}
                </p>
              </div>
              <div>
                <p className="text-gray-500 text-xs uppercase">Examination</p>
                <p className="font-semibold text-gray-800">
                  {marksSheetData.examName}
                </p>
              </div>
              {marksSheetData.department && (
                <div>
                  <p className="text-gray-500 text-xs uppercase">Department</p>
                  <p className="font-semibold text-gray-800">
                    {marksSheetData.department}
                  </p>
                </div>
              )}
            </div>

            {/* Marks Table */}
            <div className="border border-gray-200 rounded overflow-hidden mb-6">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-100 text-gray-700 font-semibold text-xs uppercase">
                  <tr>
                    <th className="px-4 py-3 text-left">Subject</th>
                    <th className="px-4 py-3 text-center">Max Marks</th>
                    <th className="px-4 py-3 text-center">Pass Marks</th>
                    <th className="px-4 py-3 text-center">Marks Obtained</th>
                    <th className="px-4 py-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
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
                        <tr key={idx} className="even:bg-gray-50">
                          <td className="px-4 py-3 font-medium text-gray-900">
                            {sub.subjectName}
                          </td>
                          <td className="px-4 py-3 text-center text-gray-700">
                            {sub.maxMarks}
                          </td>
                          <td className="px-4 py-3 text-center text-gray-700">
                            {sub.passMarks}
                          </td>
                          <td className="px-4 py-3 text-center font-semibold text-gray-900">
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
                      <td
                        colSpan={5}
                        className="px-4 py-4 text-center text-gray-500"
                      >
                        No subject marks recorded.
                      </td>
                    </tr>
                  )}
                  {/* Total Row */}
                  <tr className="bg-gray-100 font-bold border-t-2 border-gray-300">
                    <td className="px-4 py-3 text-gray-900">TOTAL</td>
                    <td className="px-4 py-3 text-center text-gray-900">
                      {marksSheetData.totalMaxMarks ?? "-"}
                    </td>
                    <td className="px-4 py-3 text-center text-gray-500">-</td>
                    <td className="px-4 py-3 text-center text-gray-900">
                      {marksSheetData.totalObtained ?? "-"}
                    </td>
                    <td className="px-4 py-3 text-center text-gray-500">-</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Results Summary Box */}
            <div className="bg-gray-50 p-5 rounded border border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="text-sm text-gray-600">
                  Percentage:{" "}
                  <strong className="text-base text-gray-900">
                    {marksSheetData.percentage !== null &&
                    marksSheetData.percentage !== undefined
                      ? `${Number(marksSheetData.percentage).toFixed(2)}%`
                      : "-"}
                  </strong>
                </p>
                {marksSheetData.overallResult === "Fail" && (
                  <p className="text-xs text-red-600 mt-0.5">
                    (Reason: Not all subjects passed)
                  </p>
                )}
                {marksSheetData.overallResult === "Incomplete" && (
                  <p className="text-xs text-amber-600 mt-0.5">
                    (Reason: Marks missing for one or more subjects)
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-gray-700">
                  Overall Result:
                </span>
                <Badge status={marksSheetData.overallResult} />
              </div>
            </div>
          </div>
        </PrintWrapper>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg p-10 text-center text-gray-500 text-sm">
          {!selectedExamId || !selectedStudentId
            ? "Please select both Exam and Student to view Marks Sheet."
            : "No marks record found for this student in the selected exam."}
        </div>
      )}
    </div>
  );
}
