import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getStudents } from "../api/students";
import { getSubjects } from "../api/subjects";
import { getExams } from "../api/exams";
import {
  getExamResult,
  getSubjectWiseReport,
  getMissingMarksReport,
} from "../api/reports";
import {
  Users,
  BookOpen,
  FileText,
  UserCheck,
  Award,
  AlertCircle,
  CheckCircle2,
  Trophy,
  Medal,
  ChevronRight,
  Plus,
  ArrowRight,
  TrendingUp,
  BarChart3,
  Layers,
  GraduationCap,
} from "lucide-react";
import Loader from "../components/ui/Loader";
import AlertMessage from "../components/ui/AlertMessage";

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  // Core metrics
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [exams, setExams] = useState([]);

  // Selected Exam Analytics
  const [selectedExamId, setSelectedExamId] = useState("");
  const [examResults, setExamResults] = useState([]);
  const [subjectReports, setSubjectReports] = useState([]);
  const [missingMarks, setMissingMarks] = useState([]);
  const [loadingExamData, setLoadingExamData] = useState(false);

  // Fetch initial master lists
  useEffect(() => {
    const fetchDashboardMasters = async () => {
      setLoading(true);
      try {
        const [studentsRes, subjectsRes, examsRes] = await Promise.all([
          getStudents(),
          getSubjects(),
          getExams(),
        ]);

        const studentList = studentsRes.data || [];
        const subjectList = subjectsRes.data || [];
        const examList = examsRes.data || [];

        setStudents(studentList);
        setSubjects(subjectList);
        setExams(examList);

        if (examList.length > 0) {
          const firstId = examList[0].examId || examList[0].id;
          setSelectedExamId(String(firstId));
        }
      } catch (err) {
        setAlert({
          type: "error",
          message:
            err.response?.data?.message ||
            "Failed to load dashboard data. Ensure backend is running.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardMasters();
  }, []);

  // Fetch exam-specific data when selectedExamId changes
  useEffect(() => {
    if (!selectedExamId) {
      setExamResults([]);
      setSubjectReports([]);
      setMissingMarks([]);
      return;
    }

    const fetchExamAnalytics = async () => {
      setLoadingExamData(true);
      try {
        const [resultsRes, subjectsRes, missingRes] = await Promise.all([
          getExamResult(selectedExamId).catch(() => ({ data: [] })),
          getSubjectWiseReport(selectedExamId).catch(() => ({ data: [] })),
          getMissingMarksReport(selectedExamId).catch(() => ({ data: [] })),
        ]);

        setExamResults(resultsRes.data || []);
        setSubjectReports(subjectsRes.data || []);
        setMissingMarks(missingRes.data || []);
      } catch (err) {
        // Soft fail without breaking page
      } finally {
        setLoadingExamData(false);
      }
    };

    fetchExamAnalytics();
  }, [selectedExamId]);

  // Calculations
  const selectedExam = exams.find(
    (e) => String(e.examId || e.id) === String(selectedExamId)
  );

  // Department counts
  const departmentCounts = students.reduce((acc, curr) => {
    const dept = curr.department || "Other";
    acc[dept] = (acc[dept] || 0) + 1;
    return acc;
  }, {});

  // Pass rate calculation for selected exam
  const totalEvaluated = examResults.length;
  const passedCount = examResults.filter(
    (r) => r.overallResult === "Pass"
  ).length;
  const passRate =
    totalEvaluated > 0 ? ((passedCount / totalEvaluated) * 100).toFixed(1) : null;

  // Top 3 Merit Rankers
  const topRankers = examResults
    .filter((r) => r.rank && r.rank <= 3)
    .sort((a, b) => a.rank - b.rank);

  return (
    <div className="space-y-6">
      {/* Alert */}
      {alert && (
        <AlertMessage
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Academic Examination Dashboard
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Real-time enrollment health, performance benchmarks, and examination progress overview
          </p>
        </div>

        {/* Quick Top Actions */}
        <div className="flex items-center gap-2.5">
          <Link
            to="/students"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-all shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 text-slate-500" />
            <span>Add Student</span>
          </Link>
          <Link
            to="/exams"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl transition-all shadow-xs shadow-blue-600/10"
          >
            <Plus className="w-3.5 h-3.5 text-white" />
            <span>New Exam</span>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="py-24 bg-white rounded-2xl border border-slate-200">
          <Loader size="lg" />
        </div>
      ) : (
        <>
          {/* Top KPI Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Total Students */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Total Students
                </p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1 font-mono">
                  {students.length}
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Across {Object.keys(departmentCounts).length} departments
                </p>
              </div>
              <div className="h-11 w-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                <Users className="w-5 h-5" />
              </div>
            </div>

            {/* 2. Active Examinations */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Scheduled Exams
                </p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1 font-mono">
                  {exams.length}
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Academic Session 2025–26
                </p>
              </div>
              <div className="h-11 w-11 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 border border-teal-100">
                <FileText className="w-5 h-5" />
              </div>
            </div>

            {/* 3. Course Curricula / Subjects */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Curriculum Courses
                </p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1 font-mono">
                  {subjects.length}
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Registered subjects
                </p>
              </div>
              <div className="h-11 w-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
                <BookOpen className="w-5 h-5" />
              </div>
            </div>

            {/* 4. Missing Marks / Audit Indicator */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Evaluation Audit
                </p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1 font-mono">
                  {missingMarks.length}
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {missingMarks.length > 0
                    ? "Pending score entries"
                    : "All entries completed"}
                </p>
              </div>
              <div
                className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 border ${
                  missingMarks.length > 0
                    ? "bg-amber-50 text-amber-600 border-amber-100"
                    : "bg-emerald-50 text-emerald-600 border-emerald-100"
                }`}
              >
                {missingMarks.length > 0 ? (
                  <AlertCircle className="w-5 h-5" />
                ) : (
                  <CheckCircle2 className="w-5 h-5" />
                )}
              </div>
            </div>
          </div>

          {/* Active Examination Analytics Section */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-blue-600" />
                  <span>Examination Performance &amp; Evaluation Monitor</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Select an examination to inspect merit rankings, course passing rates, and evaluation progress
                </p>
              </div>

              {/* Exam Selector */}
              {exams.length > 0 && (
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <label
                    htmlFor="dashboard-exam-select"
                    className="text-xs font-semibold text-slate-600 shrink-0"
                  >
                    Select Exam:
                  </label>
                  <select
                    id="dashboard-exam-select"
                    value={selectedExamId}
                    onChange={(e) => setSelectedExamId(e.target.value)}
                    className="px-3 py-1.5 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 cursor-pointer"
                  >
                    {exams.map((ex) => (
                      <option
                        key={ex.examId || ex.id}
                        value={String(ex.examId || ex.id)}
                      >
                        {ex.examName} ({ex.academicYear})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {loadingExamData ? (
              <div className="py-16">
                <Loader size="md" />
              </div>
            ) : exams.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-xs">
                No examinations scheduled yet. Click &apos;+ New Exam&apos; above to schedule your first examination session.
              </div>
            ) : (
              <div className="p-5 space-y-6">
                {/* Exam Metadata Banner */}
                {selectedExam && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200/80 text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-0.5">
                        Examination Title
                      </span>
                      <strong className="text-slate-900 font-semibold text-sm">
                        {selectedExam.examName}
                      </strong>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-0.5">
                        Academic Year &amp; Subjects
                      </span>
                      <span className="text-slate-700 font-mono">
                        {selectedExam.academicYear} &bull;{" "}
                        {selectedExam.subjectCount ??
                          (selectedExam.subjectIds
                            ? selectedExam.subjectIds.length
                            : "-")}{" "}
                        Subjects Assigned
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-0.5">
                        Evaluated Pass Rate
                      </span>
                      <div className="flex items-center gap-2">
                        {passRate !== null ? (
                          <>
                            <span className="font-mono font-bold text-slate-900 text-sm">
                              {passRate}%
                            </span>
                            <span className="text-slate-500 text-[11px]">
                              ({passedCount}/{totalEvaluated} Passed)
                            </span>
                          </>
                        ) : (
                          <span className="text-slate-400 italic">Pending marks entry</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Merit Rankers Section (Top 3) */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <Trophy className="w-3.5 h-3.5 text-amber-500" />
                      <span>Merit Standings &bull; Top Performers</span>
                    </h4>
                    <Link
                      to="/reports/exam-result"
                      className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    >
                      <span>Full Merit Roster</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>

                  {topRankers.length === 0 ? (
                    <div className="p-6 text-center text-slate-400 text-xs bg-slate-50/50 rounded-xl border border-slate-100">
                      No merit rankings generated yet. Ensure candidate marks have been submitted in Marks Entry.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {topRankers.map((ranker) => {
                        const isRank1 = ranker.rank === 1;
                        const isRank2 = ranker.rank === 2;
                        const isRank3 = ranker.rank === 3;

                        return (
                          <div
                            key={ranker.rollNumber || ranker.fullName}
                            className={`p-4 rounded-xl border transition-all ${
                              isRank1
                                ? "bg-amber-50/40 border-amber-200"
                                : isRank2
                                ? "bg-slate-50/70 border-slate-200"
                                : "bg-orange-50/40 border-orange-200"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span
                                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-bold ${
                                  isRank1
                                    ? "bg-amber-100 text-amber-900 border border-amber-300"
                                    : isRank2
                                    ? "bg-slate-100 text-slate-800 border border-slate-300"
                                    : "bg-orange-100 text-orange-900 border border-orange-300"
                                }`}
                              >
                                {isRank1 && <Trophy className="w-3 h-3 text-amber-600" />}
                                {isRank2 && <Medal className="w-3 h-3 text-slate-500" />}
                                {isRank3 && <Award className="w-3 h-3 text-orange-600" />}
                                <span>Rank {ranker.rank}</span>
                              </span>
                              <span className="font-mono text-xs font-bold text-slate-900">
                                {ranker.percentage !== null
                                  ? `${Number(ranker.percentage).toFixed(2)}%`
                                  : "-"}
                              </span>
                            </div>

                            <h5 className="font-bold text-slate-900 text-sm truncate">
                              {ranker.fullName}
                            </h5>
                            <div className="flex items-center justify-between text-xs text-slate-500 mt-1">
                              <span className="font-mono text-[11px] text-blue-700 font-semibold">
                                {ranker.rollNumber}
                              </span>
                              <span>{ranker.department || "General"}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Subject Wise Performance Summary */}
                {subjectReports.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-blue-600" />
                        <span>Curriculum Course Benchmarks</span>
                      </h4>
                      <Link
                        to="/reports/subject-wise"
                        className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                      >
                        <span>Subject Analytics</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>

                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                      <table className="min-w-full divide-y divide-slate-200 text-xs">
                        <thead className="bg-[#F8FAFC] text-slate-600 font-semibold uppercase tracking-wider">
                          <tr>
                            <th className="px-4 py-2.5 text-left">Subject Course</th>
                            <th className="px-4 py-2.5 text-center">Top Score</th>
                            <th className="px-4 py-2.5 text-center">Class Mean</th>
                            <th className="px-4 py-2.5 text-center">Unsuccessful Count</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                          {subjectReports.map((sub, idx) => (
                            <tr key={idx} className="hover:bg-blue-50/20">
                              <td className="px-4 py-2.5 font-medium text-slate-900">
                                {sub.subjectName}
                              </td>
                              <td className="px-4 py-2.5 text-center font-mono font-bold text-blue-700">
                                {sub.highestMarks ?? "-"}
                              </td>
                              <td className="px-4 py-2.5 text-center font-mono text-slate-700">
                                {sub.averageMarks !== null
                                  ? Number(sub.averageMarks).toFixed(2)
                                  : "-"}
                              </td>
                              <td className="px-4 py-2.5 text-center">
                                <span
                                  className={`inline-block font-mono px-2 py-0.5 rounded text-[11px] font-semibold ${
                                    (sub.failedCount ?? 0) > 0
                                      ? "bg-rose-50 text-rose-700"
                                      : "bg-emerald-50 text-[#16A34A]"
                                  }`}
                                >
                                  {sub.failedCount ?? 0} Students
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Bottom Grid: Department Distribution + Operational Hub */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Department Student Distribution */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-blue-600" />
                    <span>Departmental Enrollment Spread</span>
                  </h3>
                  <Link
                    to="/reports/student-list"
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                  >
                    Directory
                  </Link>
                </div>

                <div className="space-y-3">
                  {Object.keys(departmentCounts).length === 0 ? (
                    <p className="text-xs text-slate-400 py-4 text-center">
                      No student records registered yet.
                    </p>
                  ) : (
                    Object.entries(departmentCounts).map(([dept, count]) => {
                      const percentage =
                        students.length > 0
                          ? ((count / students.length) * 100).toFixed(1)
                          : 0;

                      return (
                        <div key={dept} className="space-y-1">
                          <div className="flex justify-between text-xs font-medium">
                            <span className="text-slate-800">{dept}</span>
                            <span className="text-slate-500 font-mono">
                              {count} students ({percentage}%)
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Total Active Profiles: {students.length}</span>
                <span className="font-mono">Database Synced</span>
              </div>
            </div>

            {/* Quick Action Navigation Hub */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 pb-3 mb-4 border-b border-slate-100 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                <span>Operational Workflows</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Link
                  to="/enrollment"
                  className="p-3.5 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/30 transition-all flex items-start gap-3 group"
                >
                  <div className="p-2 rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      Candidate Enrollment
                    </h5>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Assign students to exam schedules
                    </p>
                  </div>
                </Link>

                <Link
                  to="/marks-entry"
                  className="p-3.5 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/30 transition-all flex items-start gap-3 group"
                >
                  <div className="p-2 rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      Marks Entry
                    </h5>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Record scores with auto range validation
                    </p>
                  </div>
                </Link>

                <Link
                  to="/reports/marks-sheet"
                  className="p-3.5 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/30 transition-all flex items-start gap-3 group"
                >
                  <div className="p-2 rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      Print Marksheet
                    </h5>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Official candidate academic transcripts
                    </p>
                  </div>
                </Link>

                <Link
                  to="/reports/exam-result"
                  className="p-3.5 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/30 transition-all flex items-start gap-3 group"
                >
                  <div className="p-2 rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <Trophy className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      Results &bull; CSV Export
                    </h5>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Download formal institutional CSV roster
                    </p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
