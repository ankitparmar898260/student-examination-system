/**
 * Page: Candidate Enrollment
 * Purpose: Allows enrolling eligible students into examinations and viewing current enrollments.
 * Features: Exam-bound persistent drafts, sticky scroll containers, jump navigation, compact fixed tables, and minimal UI.
 */

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { getExams } from "../api/exams";
import {
  getEnrolledStudents,
  getAvailableStudents,
  enrollStudents,
} from "../api/enrollment";
import { useEnrollmentDraft } from "../context/EnrollmentDraftContext";
import SelectInput from "../components/ui/SelectInput";
import AlertMessage from "../components/ui/AlertMessage";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import Loader from "../components/ui/Loader";
import { UserCheck, Search, X, Inbox } from "lucide-react";

export default function Enrollment() {
  const {
    draftExamId,
    selectedIds,
    toggle,
    addMany,
    removeMany,
    clear,
  } = useEnrollmentDraft();

  const location = useLocation();

  const [exams, setExams] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState("");
  const [availableStudents, setAvailableStudents] = useState([]);
  const [enrolledStudents, setEnrolledStudents] = useState([]);

  const [loadingExams, setLoadingExams] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState(null);

  // Switch Exam confirmation dialog state
  const [pendingExamId, setPendingExamId] = useState(null);
  const [showConfirmSwitchExam, setShowConfirmSwitchExam] = useState(false);

  // Search & Filter state for long student lists
  const [searchQuery, setSearchQuery] = useState("");
  const [viewFilter, setViewFilter] = useState("all"); // "all" | "selected"

  // Section references for smooth jump scrolling
  const eligibleCardRef = useRef(null);
  const enrolledCardRef = useRef(null);
  const selectAllRef = useRef(null);

  // Fetch exams list on initial mount and auto-select draft's examId if exists
  useEffect(() => {
    const fetchExams = async () => {
      setLoadingExams(true);
      try {
        const res = await getExams();
        const list = res.data || [];
        setExams(list);

        if (list.length > 0) {
          const searchParams = new URLSearchParams(location.search);
          const urlExamId = searchParams.get("examId");

          // Priority 1: If an active draft exists, auto-select its bound exam
          if (
            draftExamId &&
            selectedIds.size > 0 &&
            list.some((ex) => String(ex.examId || ex.id) === String(draftExamId))
          ) {
            setSelectedExamId(String(draftExamId));
          }
          // Priority 2: URL param if provided and valid
          else if (
            urlExamId &&
            list.some((ex) => String(ex.examId || ex.id) === String(urlExamId))
          ) {
            setSelectedExamId(String(urlExamId));
          }
          // Priority 3: First exam in list
          else {
            const firstId = list[0].examId || list[0].id;
            setSelectedExamId(String(firstId));
          }
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

  // Fetch available and enrolled student rosters for selected exam
  const fetchEnrollmentData = async (examId) => {
    if (!examId) {
      setAvailableStudents([]);
      setEnrolledStudents([]);
      return;
    }

    setLoadingData(true);
    try {
      const [availRes, enrolledRes] = await Promise.all([
        getAvailableStudents(examId),
        getEnrolledStudents(examId),
      ]);

      const avail = availRes.data || [];
      const enrolled = enrolledRes.data || [];
      setAvailableStudents(avail);
      setEnrolledStudents(enrolled);

      // Stale-ID cleanup: strictly only run if this is the draft's own exam
      if (
        draftExamId &&
        String(examId) === String(draftExamId) &&
        selectedIds.size > 0
      ) {
        const validAvailIds = new Set(
          avail.map((s) => Number(s.studentId ?? s.id))
        );
        const staleIds = Array.from(selectedIds).filter(
          (id) => !validAvailIds.has(Number(id))
        );
        if (staleIds.length > 0) {
          removeMany(staleIds);
        }
      }
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

  // Exam dropdown change handler with confirmation if draft is present
  const handleExamChange = (e) => {
    const nextExamId = e.target.value;
    if (nextExamId === selectedExamId) return;

    // If an active draft exists, confirm before discarding
    if (selectedIds.size > 0) {
      setPendingExamId(nextExamId);
      setShowConfirmSwitchExam(true);
    } else {
      setSelectedExamId(nextExamId);
      setSearchQuery("");
      setViewFilter("all");
    }
  };

  const handleConfirmSwitchExam = () => {
    clear();
    setSelectedExamId(pendingExamId);
    setPendingExamId(null);
    setShowConfirmSwitchExam(false);
    setSearchQuery("");
    setViewFilter("all");
  };

  const handleCancelSwitchExam = () => {
    setPendingExamId(null);
    setShowConfirmSwitchExam(false);
  };

  // Filtered available students based on search query and All/Selected view toggle
  const filteredAvailableStudents = useMemo(() => {
    return availableStudents.filter((student) => {
      const id = Number(student.studentId ?? student.id);

      // Filter by selection toggle
      if (viewFilter === "selected" && !selectedIds.has(id)) {
        return false;
      }

      // Filter by search text (name / roll number / department)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = student.fullName?.toLowerCase().includes(query);
        const matchesRoll = student.rollNumber?.toLowerCase().includes(query);
        const matchesDept = student.department?.toLowerCase().includes(query);
        return matchesName || matchesRoll || matchesDept;
      }

      return true;
    });
  }, [availableStudents, selectedIds, viewFilter, searchQuery]);

  // Count of currently selected students among the available students
  const selectedEligibleCount = useMemo(() => {
    const availSet = new Set(
      availableStudents.map((s) => Number(s.studentId ?? s.id))
    );
    let count = 0;
    selectedIds.forEach((id) => {
      if (availSet.has(Number(id))) count++;
    });
    return count;
  }, [availableStudents, selectedIds]);

  // Visible IDs currently shown in the eligible table
  const visibleEligibleIds = useMemo(() => {
    return filteredAvailableStudents.map((s) => Number(s.studentId ?? s.id));
  }, [filteredAvailableStudents]);

  const allVisibleSelected =
    visibleEligibleIds.length > 0 &&
    visibleEligibleIds.every((id) => selectedIds.has(id));

  const someVisibleSelected =
    visibleEligibleIds.some((id) => selectedIds.has(id)) && !allVisibleSelected;

  // Manage indeterminate state on header checkbox
  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = someVisibleSelected;
    }
  }, [someVisibleSelected]);

  // "Select all" strictly affects currently visible (filtered) rows
  const handleSelectAllVisible = () => {
    if (allVisibleSelected) {
      removeMany(visibleEligibleIds);
    } else {
      addMany(visibleEligibleIds, selectedExamId);
    }
  };

  // Jump smoothly to the enrolled card
  const handleScrollToEnrolled = () => {
    enrolledCardRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Jump smoothly to the eligible card
  const handleScrollToEligible = () => {
    eligibleCardRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Enroll selected students with partial and full failure handling
  const handleEnrollSelected = async () => {
    if (!selectedExamId) {
      setAlert({ type: "error", message: "Please select an examination first." });
      return;
    }

    const availSet = new Set(
      availableStudents.map((s) => Number(s.studentId ?? s.id))
    );
    const targetStudentIds = Array.from(selectedIds).filter((id) =>
      availSet.has(Number(id))
    );

    if (targetStudentIds.length === 0) {
      setAlert({
        type: "error",
        message: "Please select at least 1 eligible student to enroll.",
      });
      return;
    }

    setSubmitting(true);
    try {
      await enrollStudents({
        examId: Number(selectedExamId),
        studentIds: targetStudentIds,
      });

      // Refetch rosters to reconcile database state
      const [availRes, enrolledRes] = await Promise.all([
        getAvailableStudents(selectedExamId),
        getEnrolledStudents(selectedExamId),
      ]);

      const updatedEnrolled = enrolledRes.data || [];
      const updatedAvailable = availRes.data || [];
      setAvailableStudents(updatedAvailable);
      setEnrolledStudents(updatedEnrolled);

      // Determine successful vs failed IDs
      const enrolledIdSet = new Set(
        updatedEnrolled.map((s) => Number(s.studentId ?? s.id))
      );
      const successfulIds = targetStudentIds.filter((id) => enrolledIdSet.has(id));
      const failedIds = targetStudentIds.filter((id) => !enrolledIdSet.has(id));

      // Remove only the successfully enrolled IDs from draft
      if (successfulIds.length > 0) {
        removeMany(successfulIds);
      }

      if (failedIds.length === 0) {
        setAlert({
          type: "success",
          message: `Successfully enrolled ${successfulIds.length} candidate(s)!`,
        });
      } else {
        setAlert({
          type: "warning",
          message: `Enrolled ${successfulIds.length} candidate(s). ${failedIds.length} candidate(s) could not be enrolled and remain selected in your draft.`,
        });
      }
    } catch (err) {
      // API call failure: check if any were partially enrolled before error
      let partialSuccessCount = 0;
      try {
        const enrolledRes = await getEnrolledStudents(selectedExamId);
        const updatedEnrolled = enrolledRes.data || [];
        const enrolledIdSet = new Set(
          updatedEnrolled.map((s) => Number(s.studentId ?? s.id))
        );
        const successfulIds = targetStudentIds.filter((id) => enrolledIdSet.has(id));
        if (successfulIds.length > 0) {
          partialSuccessCount = successfulIds.length;
          removeMany(successfulIds);
          const availRes = await getAvailableStudents(selectedExamId);
          setAvailableStudents(availRes.data || []);
          setEnrolledStudents(updatedEnrolled);
        }
      } catch {
        // Suppress secondary reconciliation errors
      }

      const apiMsg = err.response?.data?.message || "Enrollment failed.";
      if (partialSuccessCount > 0) {
        const remainingCount = targetStudentIds.length - partialSuccessCount;
        setAlert({
          type: "warning",
          message: `Partial enrollment: ${partialSuccessCount} candidate(s) enrolled. ${remainingCount} failed and remain in your draft. (${apiMsg})`,
        });
      } else {
        setAlert({
          type: "error",
          message: apiMsg,
        });
      }
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

  return (
    <div className="space-y-6">
      {/* Top Alert Notification */}
      {alert && (
        <AlertMessage
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      {/* Page Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Candidate Enrollment
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Select target examination to assign and enroll eligible student candidates
        </p>
      </div>

      {/* Target Examination Selector */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs max-w-xl">
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

      {/* Vertical Stack: Full-width Cards */}
      <div className="grid grid-cols-1 gap-6">
        {/* CARD 1: Eligible to Enroll */}
        <section
          ref={eligibleCardRef}
          aria-labelledby="eligible-students-heading"
          className="bg-white border border-slate-200 rounded-2xl shadow-xs scroll-mt-6"
        >
          {/* Sticky Card Header: Single row at 1366px */}
          <div className="sticky top-0 z-20 bg-white border-b border-slate-200 rounded-t-2xl px-5 py-3 shadow-2xs">
            <div className="flex items-center justify-between gap-4 flex-nowrap">
              {/* Left: Plain title + quiet jump link */}
              <div className="flex items-center gap-3 shrink-0 whitespace-nowrap">
                <h3
                  id="eligible-students-heading"
                  className="text-sm font-bold text-slate-900"
                >
                  Eligible to Enroll ({availableStudents.length})
                </h3>
                <button
                  type="button"
                  onClick={handleScrollToEnrolled}
                  className="text-xs text-slate-500 hover:text-blue-600 transition-colors cursor-pointer"
                >
                  Enrolled ({enrolledStudents.length}) ↓
                </button>
              </div>

              {/* Right: Search, Toggle, and Enroll button in one row */}
              <div className="flex items-center gap-2.5 flex-nowrap shrink-0 whitespace-nowrap">
                {/* Search Box (w-48, compact) */}
                <div className="relative w-48">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search name, roll..."
                    className="w-full pl-8 pr-7 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-slate-800 placeholder-slate-400"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                      title="Clear search"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* All | Selected (N) Toggle */}
                <div className="inline-flex p-0.5 rounded-lg bg-slate-100 border border-slate-200 text-xs font-medium shrink-0">
                  <button
                    type="button"
                    onClick={() => setViewFilter("all")}
                    className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                      viewFilter === "all"
                        ? "bg-white text-slate-900 font-semibold shadow-2xs"
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    All
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewFilter("selected")}
                    className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                      viewFilter === "selected"
                        ? "bg-white text-blue-600 font-semibold shadow-2xs"
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    Selected ({selectedEligibleCount})
                  </button>
                </div>

                {/* Enroll Selected Button */}
                <button
                  type="button"
                  onClick={handleEnrollSelected}
                  disabled={submitting || selectedEligibleCount === 0}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg transition-colors shadow-xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shrink-0"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>
                    {submitting
                      ? "Enrolling..."
                      : `Enroll Selected (${selectedEligibleCount})`}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Table Container: max-h-[60vh] overflow-y-auto */}
          <div className="max-h-[60vh] overflow-y-auto rounded-b-2xl">
            <table className="w-full table-fixed divide-y divide-slate-200 text-left text-sm">
              <thead className="sticky top-0 z-10 bg-[#F8FAFC] border-b border-slate-200 shadow-2xs">
                <tr>
                  <th className="w-10 px-3 py-2.5 text-center">
                    <input
                      ref={selectAllRef}
                      type="checkbox"
                      checked={allVisibleSelected}
                      onChange={handleSelectAllVisible}
                      disabled={filteredAvailableStudents.length === 0}
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer disabled:cursor-not-allowed"
                      aria-label="Select all visible eligible students"
                    />
                  </th>
                  <th className="w-12 px-3 py-2.5 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    S.No
                  </th>
                  <th className="w-32 px-3 py-2.5 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Roll No
                  </th>
                  <th className="px-3 py-2.5 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Full Name
                  </th>
                  <th className="w-40 px-3 py-2.5 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Department
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {loadingData ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-16 text-center text-slate-500">
                      <Loader size="md" />
                    </td>
                  </tr>
                ) : filteredAvailableStudents.length > 0 ? (
                  filteredAvailableStudents.map((student, idx) => {
                    const id = Number(student.studentId ?? student.id);
                    const isSelected = selectedIds.has(id);
                    return (
                      <tr
                        key={id}
                        onClick={() => toggle(id, selectedExamId)}
                        className={`transition-colors cursor-pointer select-none ${
                          isSelected ? "bg-blue-50/50" : "hover:bg-slate-50/70"
                        }`}
                      >
                        <td
                          className="w-10 px-3 py-2.5 text-center"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggle(id, selectedExamId)}
                            className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                            aria-label={`Select student ${student.fullName}`}
                          />
                        </td>
                        <td className="w-12 px-3 py-2.5 text-center font-mono text-xs text-slate-400">
                          {idx + 1}
                        </td>
                        <td className="w-32 px-3 py-2.5 whitespace-nowrap">
                          <span className="font-mono text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                            {student.rollNumber}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 font-semibold text-slate-900 truncate">
                          {student.fullName}
                        </td>
                        <td
                          className="w-40 px-3 py-2.5 text-xs text-slate-600 font-medium truncate"
                          title={student.department || ""}
                        >
                          {student.department || "-"}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-16 text-center">
                      <div className="flex flex-col items-center justify-center text-slate-400">
                        <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center mb-3 text-slate-400">
                          <Inbox className="w-6 h-6 stroke-[1.5]" />
                        </div>
                        <p className="text-sm font-semibold text-slate-700 mb-0.5">
                          {searchQuery
                            ? "No Matching Candidates"
                            : viewFilter === "selected"
                            ? "No Candidates Selected"
                            : "No Eligible Candidates"}
                        </p>
                        <p className="text-xs text-slate-400 max-w-sm">
                          {searchQuery
                            ? `No students match "${searchQuery}". Try a different keyword.`
                            : viewFilter === "selected"
                            ? "You haven't selected any candidate in this draft yet."
                            : selectedExamId
                            ? "All eligible candidates are currently enrolled in this exam."
                            : "Please select an examination above to view candidates."}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Table Summary Footer */}
          {!loadingData && availableStudents.length > 0 && (
            <div className="px-5 py-2.5 bg-[#F8FAFC] border-t border-slate-200 text-xs font-medium text-slate-500 flex items-center justify-between rounded-b-2xl">
              <div className="flex items-center gap-2">
                <span>Showing:</span>
                <span className="font-mono font-semibold text-slate-700 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                  {filteredAvailableStudents.length} of {availableStudents.length}
                </span>
                <span>eligible students</span>
              </div>
            </div>
          )}
        </section>

        {/* CARD 2: Currently Enrolled */}
        <section
          ref={enrolledCardRef}
          aria-labelledby="enrolled-students-heading"
          className="bg-white border border-slate-200 rounded-2xl shadow-xs scroll-mt-6"
        >
          {/* Sticky Card Header */}
          <div className="sticky top-0 z-20 bg-white border-b border-slate-200 rounded-t-2xl px-5 py-3 shadow-2xs">
            <div className="flex items-center justify-between gap-4">
              {/* Left: Plain title + quiet jump link */}
              <div className="flex items-center gap-3">
                <h3
                  id="enrolled-students-heading"
                  className="text-sm font-bold text-slate-900"
                >
                  Currently Enrolled ({enrolledStudents.length})
                </h3>
                <button
                  type="button"
                  onClick={handleScrollToEligible}
                  className="text-xs text-slate-500 hover:text-blue-600 transition-colors cursor-pointer"
                >
                  ↑ Eligible ({availableStudents.length})
                </button>
              </div>

              {/* Right: Plain Active Roster text badge */}
              <span className="text-xs text-slate-500 font-medium">
                Active Roster
              </span>
            </div>
          </div>

          {/* Table Container: max-h-[60vh] overflow-y-auto */}
          <div className="max-h-[60vh] overflow-y-auto rounded-b-2xl">
            <table className="w-full table-fixed divide-y divide-slate-200 text-left text-sm">
              <thead className="sticky top-0 z-10 bg-[#F8FAFC] border-b border-slate-200 shadow-2xs">
                <tr>
                  <th className="w-12 px-3 py-2.5 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    S.No
                  </th>
                  <th className="w-32 px-3 py-2.5 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Roll No
                  </th>
                  <th className="px-3 py-2.5 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Full Name
                  </th>
                  <th className="w-40 px-3 py-2.5 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Department
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {loadingData ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-16 text-center text-slate-500">
                      <Loader size="md" />
                    </td>
                  </tr>
                ) : enrolledStudents.length > 0 ? (
                  enrolledStudents.map((student, idx) => (
                    <tr
                      key={student.enrollmentId ?? student.studentId ?? student.id ?? idx}
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      <td className="w-12 px-3 py-2.5 text-center font-mono text-xs text-slate-400">
                        {idx + 1}
                      </td>
                      <td className="w-32 px-3 py-2.5 whitespace-nowrap">
                        <span className="font-mono text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                          {student.rollNumber}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 font-semibold text-slate-900 truncate">
                        {student.fullName}
                      </td>
                      <td
                        className="w-40 px-3 py-2.5 text-xs text-slate-600 font-medium truncate"
                        title={student.department || ""}
                      >
                        {student.department || "-"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-4 py-16 text-center">
                      <div className="flex flex-col items-center justify-center text-slate-400">
                        <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center mb-3 text-slate-400">
                          <Inbox className="w-6 h-6 stroke-[1.5]" />
                        </div>
                        <p className="text-sm font-semibold text-slate-700 mb-0.5">
                          No Enrolled Candidates
                        </p>
                        <p className="text-xs text-slate-400 max-w-sm">
                          {selectedExamId
                            ? "No candidate enrollments recorded yet for this session."
                            : "Select an exam above to view registered enrollments."}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Table Summary Footer */}
          {!loadingData && enrolledStudents.length > 0 && (
            <div className="px-5 py-2.5 bg-[#F8FAFC] border-t border-slate-200 text-xs font-medium text-slate-500 flex items-center justify-between rounded-b-2xl">
              <div className="flex items-center gap-2">
                <span>Total Registered:</span>
                <span className="font-mono font-semibold text-slate-700 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                  {enrolledStudents.length}
                </span>
                <span>students</span>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Switch Exam Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showConfirmSwitchExam}
        onCancel={handleCancelSwitchExam}
        onConfirm={handleConfirmSwitchExam}
        message={`Switching exam will discard your draft of ${selectedIds.size} student${
          selectedIds.size === 1 ? "" : "s"
        }.`}
        confirmLabel="Switch & Discard"
      />
    </div>
  );
}
